<script setup lang="ts">

</script>

<template>
  <div
      :class="{
        'capsule': true,
        'small': 1,
        'big': 0,
        'common':true,
      }"
  >
    <slot />
  </div>
</template>

<style scoped>
.capsule{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.small{
  block-size: 8dvb;
  inline-size: 12dvi;
  border-radius: 4dvb;/* 高度的一半，形成跑道形状 */
}
.big{
  block-size: 12dvb;
  inline-size: 16dvi;
  border-radius: 6dvb;/* 高度的一半，形成跑道形状 */
}
.common{
  background-color: #628CED;
}
.common :slotted(span){
  color:#fff;
}
</style>