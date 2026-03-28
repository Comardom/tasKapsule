<script setup lang="ts">
interface Props {
  year: string;             // 年份
  owner: string;            // 版权所有人
  email: string;            // 邮箱
  icpNumber: string;        // ICP 备案号
  policeNumber: string;     // 公安备案号
  policeLink: string;       // 公安备案查询详情页链接
}
const props = withDefaults(defineProps<Props>(), {
  year: '2026',
  owner: '笃聿Comardom',
  email: 'Comardom@outlook.com',
  icpNumber: '辽ICP备2025060502号-1',
  policeNumber: '辽公网安备21021702000756号',
  policeLink: 'https://www.beian.gov.cn/portal/registerSystemInfo?recordcode=21021702000756'
});
const BEIAN_LINKS = {
  icp: 'https://beian.miit.gov.cn',
  police: props.policeLink
} as const;
</script>

<template>
<footer class="site-footer">
      <hr class="footer-divider">

      <div class="footer-content">
        <p class="copyright">
          <span class="record-link">&copy; {{props.year}} {{props.owner}}所有</span>
          <span class="separator"> | </span>
          <span class="record-link">
            联系邮箱：<a :href="`mailto:${props.email}`">{{ props.email }}</a>
          </span>
        </p>

        <div class="record-links">
          <a
              :href="BEIAN_LINKS.icp"
              target="_blank"
              rel="noopener noreferrer"
              class="record-link"
          >
            {{ props.icpNumber }}
          </a>
          <span class="separator"> | </span>
          <a
              :href="BEIAN_LINKS.police"
              target="_blank"
              rel="noopener noreferrer"
              class="record-link"
          >
            {{ props.policeNumber }}
          </a>
        </div>
      </div>
    </footer>
</template>

<style scoped>
.site-footer {
  padding: 0 0 24px 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* 确保 Footer 不会被 main 压缩，也不会因为自身内容多而变形 */
}

.footer-divider {
  border: none;
  border-top: 1px solid #ddd;
  /* 清除默认 margin，防止撑开高度 */
  /* 只留向下的间距 */
  margin: 0 0 20px;
}

.footer-content {
  text-align: center;
  font-size: 14px;
  color: #666;

}

.copyright {
  margin-bottom: 8px;
}

.record-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.record-link {
  color: #666;
  text-decoration: none;
  transition: color 0.3s;
}

.record-link:hover {
  color: #1890ff;
  text-decoration: underline;
}

.separator {
  color: #ccc;
}

@media (max-width: 768px) {
  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .copyright {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .record-links {
    flex-direction: column;
    gap: 8px;
  }

  .separator {
    display: none;
  }
}
</style>