<script lang="ts" setup>
import iconSave from './icon-system/save.png'
import iconShare from './icon-system/share.png'
import iconAdd from './icon-system/add.png'
// import iconLock from './icon-system/lock.png'
// import iconUnlock from './icon-system/unlock.png'
import Filename from './filename.vue'
import iconZhankai from './icon-system/zhankai.png'
import { ref, inject, watchEffect, Ref, onMounted } from 'vue'
import { IConfig } from '../'
import { Message } from '../message'
import { getStateRaw } from '../editor/state'

const config = inject<Ref<IConfig>>('config')
const showListPanel = ref(false)
const lock = ref(false)
const onLock = () => {
  lock.value = true
}
const onUnlock = () => {
  lock.value = false
}
const onShare = () => {
  config?.value.api.share(getStateRaw())
}
const onSave = async () => {
  const isEdit = !!config?.value.paramsId
  await config?.value.api.save(getStateRaw())
  if (!isEdit) {
    showListPanel.value = true
  }
}
const onAdd = () => {
  Message.info('新建文件，画布已重置')
  showListPanel.value = false
  config?.value.api.addNew()
}
watchEffect(() => {
  if (showListPanel.value) {
    config?.value.api.list()
  }
})
onMounted(() => {
  if (!config?.value.paramsId) {
    showListPanel.value = true
  }
})
document.body.addEventListener('click', () => {
  showListPanel.value = false
})
</script>

<template>
  <transition name="list">
    <div
      v-if="showListPanel"
      class="file-list-panel"
      @click.stop=""
    >
      <slot name="list-panel" />
    </div>
  </transition>

  <Filename />

  <div class="file-operate">
    <div
      class="file-operate__item"
      title="展开文件列表"
      @click.stop="showListPanel = !showListPanel"
    >
      <img
        class="file-list-panel-icon"
        :class="{
          active: showListPanel
        }"
        :src="iconZhankai"
      >
    </div>
  </div>
  <div class="file-operate">
<!--    <span>已保存 14:22</span>-->
<!--    <div-->
<!--      v-if="lock"-->
<!--      class="file-operate__item"-->
<!--      title="分享加密"-->
<!--      @click="onUnlock"-->
<!--    >-->
<!--      <img :src="iconLock">-->
<!--      <span>分享加密</span>-->
<!--    </div>-->
<!--    <div-->
<!--      v-else-->
<!--      class="file-operate__item"-->
<!--      title="分享公开"-->
<!--      @click="onLock"-->
<!--    >-->
<!--      <img :src="iconUnlock">-->
<!--      <span>分享公开</span>-->
<!--    </div>-->
<!--    <div class="file-operate__item" title="分享文件" @click="onShare">-->
<!--      <img :src="iconShare">-->
<!--    </div>-->
    <div class="file-operate__item" title="保存文件" @click="onSave">
      <img :src="iconSave">
    </div>
    <div
      v-if="config?.paramsId"
      class="file-operate__item"
      title="新建流程"
      @click="onAdd"
    >
      <img :src="iconAdd">
    </div>
  </div>
</template>

<style lang="less">
@import '../var';
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
  bottom: -10px;
  transform: translateY(100%);
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
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(-50%);
}
</style>
