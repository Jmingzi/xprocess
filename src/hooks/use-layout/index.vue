<script setup lang="ts">
import { onMounted, ref, reactive, provide } from 'vue'

const el = ref()
const state = reactive({
  scrollLeft: 1000 - 20,
  scrollTop: 1000 - 20
})
const handleScroll = () => {
  const box = el.value!
  state.scrollTop = box.scrollTop
  state.scrollLeft = box.scrollLeft
}

provide('layout', state)

onMounted(() => {
  const box = el.value!
  box.scrollTop = state.scrollTop
  box.scrollLeft = state.scrollLeft
})
</script>

<template>
  <div class="xprocess__header"></div>
  <div class="xprocess__header-tools">
    <slot name="tools" />
  </div>
  <div class="xprocess__header-next">
    <div class="xprocess__sidebar">
      <slot name="left" />
    </div>
    <div
      ref="el"
      class="xprocess__content"
      @scroll="handleScroll"
    >
      <slot name="content" />
    </div>
  </div>
</template>

<style lang="less">
.xprocess {
  @header-height: 60px;
  @header-tools-height: 35px;
  @sidebar-width: 200px;
  &__header {
    height: 60px;
    border: 1px #eee solid;
  }
  &__header-tools {
    display: flex;
    align-items: center;
    height: 35px;
    background-color: #f7f8f9;
  }
  &__header-next {
    display: flex;
    height: calc(100vh - @header-height - @header-tools-height);
  }
  &__sidebar {
    flex-shrink: 0;
    width: @sidebar-width;
    border: 1px #eee solid;
  }
  &__content {
    flex-grow: 0;
    width: calc(100% - @sidebar-width);
    height: 100%;
    overflow: auto;
  }
}
</style>
