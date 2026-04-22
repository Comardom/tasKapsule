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
          <span>&copy; {{props.year}} {{props.owner}}所有</span>
          <span class="separator"> | </span>
          <span>联系邮箱：
            <a class="record-link" :href="`mailto:${props.email}`">{{ props.email }}</a>
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
   border-block-start: 1px solid var(--theme-border-button);
  /* 清除默认 margin，防止撑开高度 */
  /* 只留向下的间距 */
  margin-block: 0 1.25rem;
  inline-size: 100%;
}

.footer-content {
  text-align: center;
  font-size: 0.875rem;
  color: var(--theme-color);
  opacity: 0.9;

}

.copyright {
  /* 逻辑属性：下方外边距 */
  margin-block-end: 0.5rem;
}

.record-links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.record-link {
  color: var(--theme-color);
  text-decoration: none;
  /*transition: color 0.3s;*/
}

.record-link:hover {
  color: var(--theme-link);
  text-decoration: underline;
  text-underline-offset: 0.25rem;
}

.separator {
  color: var(--theme-border-button);
}

@media (width <= 768px) {
  .footer-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .copyright {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .record-links {
    flex-direction: column;
    gap: 0.5rem;
  }

  .separator {
    display: none;
  }
}
</style>