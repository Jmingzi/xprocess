<script lang="ts" setup>
import Filename from './filename.vue'
import iconZhankai from '../icon/zhankai.png'
import { inject, Ref, watch } from 'vue'
import { IConfig } from '../../index'
import { getStateRaw, state as editorState } from '../state'

const config = inject<IConfig>('config')
</script>

<template>
  <transition name="list">
    <div
      v-if="editorState.showListPanel"
      class="file-list-panel"
      @click.stop=""
    >
      <slot name="list-panel" />
    </div>
  </transition>

  <Filename />

  <div v-if="!config.isReadonly()" class="file-operate">
    <div
      class="file-operate__item"
      title="展开文件列表"
      @click.stop="editorState.showListPanel = !editorState.showListPanel"
    >
      <img
        class="file-list-panel-icon"
        :class="{
          active: editorState.showListPanel
        }"
        :src="iconZhankai"
      >
    </div>
  </div>
  <div class="file-operate">
    <template v-for="item in config.fileOperators ?? []">
      <div
        v-if="item.condition ? item.condition() : true"
        class="file-operate__item"
        :title="item.title"
        @click="item.action(getStateRaw())"
      >
        <img :src="item.icon">
      </div>
    </template>
  </div>
</template>

<style lang="less">
@import '../../var';
.file-operate {
  position: relative;
  display: flex;
  align-items: center;
  font-size: 12px;
  box-shadow: @shadow-tools;
  background-color: #fff;
  //margin-right: 20px;
  padding: 4px;
  z-index: @z-index-max;
  pointer-events: all;
  border-radius: 4px;
  &:not(&:last-of-type) {
    margin-right: 10px;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    //border: 1px #aaaaaa solid;
    border-radius: 2px;
    cursor: pointer;
    padding: 6px;
    &:hover {
      background-color: @hover-bg;
    }
    img {
      width: 17px;
    }
  }
}
.file-list-panel {
  position: absolute;
  height: 500px;
  width: 400px;
  background-color: #ffffff;
  box-shadow: @shadow-tools;
  border: 1px @border-color solid;
  border-radius: 4px;
  bottom: -510px;
  right: 0;
  pointer-events: all;
  &-icon {
    transition: transform 0.3s;
    &.active {
      transform: rotate(-180deg);
    }
  }
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease-in-out;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
