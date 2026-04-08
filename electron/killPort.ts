// execSync: 同步执行 Shell 命令，常用于需要立即获取返回结果的操作（如检查端口
import { execSync } from 'child_process';


// 杀死占用特定端口的进程
export function killPort(port: number) {
  try {
      //先尝试查看端口对应的pid（cmd是一段shell命令）
    // const cmd = process.platform === 'win32'
    //   ? `netstat -ano | findstr :${port}`
    //   : `lsof -i :${port} -t`;
    const isWin = process.platform === 'win32';
    const cmd = isWin
      ? `netstat -ano | findstr :${port}`
      : `lsof -i :${port} -t`;

    //运行cmd这段shell命令，把结果变成字符串然后去掉头尾的空格
    // const pid = execSync(cmd).toString().trim();
    const output = execSync(cmd).toString().trim();
    if (!output) return;

    const pids = new Set<string>();
    output.split('\n').forEach(line => {
      const parts = line.trim().split(/\s+/); // 按空格切割
        if (isWin) {
        // Windows netstat 输出最后一位是 PID
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      } else {
        // Linux lsof -t 直接输出 PID
        if (parts[0] && /^\d+$/.test(parts[0])) pids.add(parts[0]);
      }
    });

    pids.forEach(pid => {
      try {
        const killCmd = isWin ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`;
        execSync(killCmd);
        console.log(`[Main] 已清理端口 ${port} 的占用进程: ${pid}`);
      } catch (e) { /* 忽略无法杀掉的进程 */ }
    });
    // if (pid) {
    //     // 如果是 Linux 且 lsof 返回了多个 PID，pid 字符串会包含换行符
    //   const pids = pid.split('\n');
    //   pids.forEach(p => {
    //       const killCmd = process.platform === 'win32'
    //         ? `taskkill /F /PID ${p}`
    //         : `kill -9 ${p}`;
    //       execSync(killCmd);
    //       console.log(`已清理端口 ${port} 的占用进程: ${p}`);
    //   });
    // }
  } catch (e) {
    // 报错通常意味着端口没被占用，正常忽略
  }
}