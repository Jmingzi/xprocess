<script setup lang="ts">

</script>

<template>
  <div class="xprocess__header"></div>
  <div class="xprocess__header-next">
    <div class="xprocess__sidebar">
      <slot name="left" />
    </div>
    <div class="xprocess__content">
      <slot name="content" />
    </div>
  </div>
</template>

<style lang="less">
.xprocess {
  &__header {
    height: 60px;
    border: 1px #eee solid;
  }
  &__header-next {
    display: flex;
    height: calc(100vh - 60px);
  }
  &__sidebar {
    width: 200px;
    border: 1px #eee solid;
  }
  &__content {
    flex: 1;
    border: 1px #eee solid;
    background-color: #f7f8f9;
  }
}
</style>
