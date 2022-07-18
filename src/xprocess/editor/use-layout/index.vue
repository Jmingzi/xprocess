<script setup lang="ts">
import { ref, reactive, provide, inject, Ref } from 'vue'
import logo from './logo.png'
import { CANVAS_PADDING, CANVAS_MARGIN_LEFT, CANVAS_MARGIN_TOP } from '../../constant'
import { IConfig } from '../../index'

const config = inject<Ref<IConfig>>('config')

const el = ref()
const state = reactive({
  scrollLeft: CANVAS_PADDING - CANVAS_MARGIN_LEFT,
  scrollTop: CANVAS_PADDING - CANVAS_MARGIN_TOP
})
const handleScroll = () => {
  const box = el.value!
  state.scrollTop = box.scrollTop
  state.scrollLeft = box.scrollLeft
}
const setScroll = (top = state.scrollTop, left = state.scrollLeft) => {
  const box = el.value
  if (box) {
    box.scrollTop = top
    box.scrollLeft = left
  }
}
provide('layout', state)
provide('layoutSetScroll', setScroll)
</script>

<template>
  <div class="xprocess__header">
    <div class="xprocess__header-title" @click="config.api.addNew">
      <img :src="logo" align="center" width="35">
      <span>XProcess</span>
    </div>
    <div class="file-operate-panel">
      <slot name="header" />
    </div>
  </div>
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
</template>

<style lang="less">
@import '../../var.less';
.xprocess {
  &__header {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: @header-height;
    padding: 0 20px;
    z-index: @z-index-max;
    pointer-events: none;
    &-title {
      display: flex;
      align-items: center;
      font-weight: 200;
      font-size: 30px;
      pointer-events: all;
      cursor: pointer;
      span {
        margin-left: 15px;
      }
    }
    .file-operate-panel {
      position: relative;
      display: flex;
      align-items: center;
    }
  }
  &__sidebar {
    position: fixed;
    left: 20px;
    box-shadow: @shadow-tools;
    top: 50%;
    transform: translateY(-50%);
    padding: 10px;
    border-radius: 4px;
    z-index: @z-index-max;
    background-color: #fff;
    border: 1px @border-color solid;
  }
  &__content {
    height: 100vh;
    overflow: auto;
  }
}
</style>
