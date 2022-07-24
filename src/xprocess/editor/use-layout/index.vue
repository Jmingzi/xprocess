<script setup lang="ts">
import { ref, reactive, provide, inject, Ref, watchPostEffect } from 'vue'
import logo from './logo.png'
import { CANVAS_PADDING, CANVAS_MARGIN_LEFT, CANVAS_MARGIN_TOP } from '../../constant'
import { IConfig } from '../../index'
import iconZhankai from '../icon/zhankai.png'

const config = inject<IConfig>('config')!

const el = ref()
const elSidebar = ref()
const sidebarRect = ref()
const showSidebar = ref(true)
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

watchPostEffect(() => {
  if (elSidebar.value) {
    sidebarRect.value = elSidebar.value.getBoundingClientRect()
  }
})
</script>

<template>
  <div class="xprocess__header">
    <div class="xprocess__header-title" @click="config.toHome">
      <img :src="logo" align="center" width="35">
      <span>XProcess</span>
    </div>
    <div class="file-operate-panel">
      <slot name="header" />
    </div>
  </div>
  <div
    v-if="!config.isReadonly()"
    class="xprocess__sidebar-touch"
    @click.stop="showSidebar = !showSidebar"
    :class="{ open: showSidebar }"
    :style="{ left: showSidebar ? `${sidebarRect?.width + 10}px` : null }"
  >
    <img :src="iconZhankai" width="15">
  </div>
  <transition name="sidebar">
    <div
      v-if="!config.isReadonly() && showSidebar"
      class="xprocess__sidebar"
      ref="elSidebar"
    >
      <slot name="left" />
    </div>
  </transition>
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
  &__sidebar-touch {
    position: fixed;
    left: 20px;
    width: 30px;
    height: 50px;
    top: 50%;
    transform: translateY(-50%);
    z-index: @z-index-max;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: @shadow-tools;
    background-color: #fff;
    border-radius: 4px;
    user-select: none;
    transition: left .2s ease;
    &:hover {
      background-color: @hover-bg;
    }
    img {
      transform: rotate(180deg);
    }
    &.open {
      //left: 100px;
      img {
        transform: none;
      }
    }
  }
  &__content {
    height: 100vh;
    overflow: auto;
  }
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: all 0.2s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  opacity: 0;
  transform: translateX(-100%) translateY(-50%);
}
</style>
