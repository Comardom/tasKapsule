export class TimeManager {
    private date: Date;
    private timeZone: string = 'Asia/Shanghai';

    constructor(timeZone?: string) {
        this.date = new Date();
        this.timeZone = timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // 获取格式化后的各个部分
    getFormatted() {

        const options: Intl.DateTimeFormatOptions = {
            timeZone: this.timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        };

        const parts = new Intl.DateTimeFormat('zh-CN', options).formatToParts(this.date);
        const rawResult: Record<string, string> = {};
        parts.forEach(part => {
            if (part.type !== 'literal') {
                rawResult[part.type] = part.value;
            }
        });

        const resultToInt:Record<string, number> = {};
        for (let resultKey in rawResult) {
            if (rawResult[resultKey] != undefined && Object.prototype.hasOwnProperty.call(rawResult, resultKey)) {
                resultToInt[resultKey] = Number(rawResult[resultKey]);
            }
        }

        return {
            year: resultToInt.year || 1970 ,
            month: (resultToInt.month || 0) - 1, // 转回0-11
            day: resultToInt.day || 0,
            hour: resultToInt.hour || 0,
            minute: resultToInt.minute || 0,
            second: resultToInt.second || 0,
            timeZone: this.timeZone
        };
    }

    // 获取星期几（0=周日）
    get当天曜日() {
        const formatted = this.getFormatted();
        const tempDate = new Date(formatted.year, formatted.month, formatted.day);
        return tempDate.getDay();
    }

    // 获取指定年月日的星期几
    get曜日ByYMD(year: number, month: number, day: number): number {
        const date = new Date(year, month, day);
        return date.getDay(); // 0=周日, 1=周一, ..., 6=周六
    }


    // 获取指定年月的天数
    get此月天数ByYM(year: number, month: number): number {
        return new Date(year, month + 1, 0).getDate();
    }

    // 获取当月第一天是星期几
    get月初曜日(): number {
        const { year, month } = this.getFormatted();
        return this.get曜日ByYMD(year, month, 1);
    }

    get月末曜日(): number {
        const { year, month } = this.getFormatted();
        return this.get曜日ByYMD(year, month+1, 0);
    }


    get当月天数(): number {
        const formatted = this.getFormatted();
        // 下个月的第 0 天 = 这个月的最后一天
        return new Date(formatted.year, formatted.month + 1, 0).getDate();
    }

    get上月天数(): number {
        const formatted = this.getFormatted();
        // 这个月的第 0 天 = 上月的最后一天
        return new Date(formatted.year, formatted.month, 0).getDate();
    }


    // 更新时间
    update() {
        this.date = new Date();
        return this.getFormatted();
    }

    // 切换时区
    setTimeZone(timeZone: string) {
        this.timeZone = timeZone;
        return this.getFormatted();
    }
}