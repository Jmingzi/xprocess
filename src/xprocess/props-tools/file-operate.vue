<script lang="ts" setup>
import iconSave from './icon-system/save.png'
import iconShare from './icon-system/share.png'
// import iconLock from './icon-system/lock.png'
// import iconUnlock from './icon-system/unlock.png'
import { ref, inject } from 'vue'
import { IConfig } from '../'
import { getStateRaw } from '../editor/state'
const config = inject<IConfig>('config')

const lock = ref(false)
const onLock = () => {
  lock.value = true
}
const onUnlock = () => {
  lock.value = false
}
const onShare = () => {
  config && config.api.share(getStateRaw())
}
const onSave = () => {
  config && config.api.save(getStateRaw())
}
</script>

<template>
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
    <div class="file-operate__item" title="分享文件" @click="onShare">
      <img :src="iconShare">
      <span>分享</span>
    </div>
    <div class="file-operate__item" title="保存文件" @click="onSave">
      <img :src="iconSave">
      <span>保存</span>
    </div>
  </div>
</template>

<style lang="less">
.file-operate {
  display: flex;
  align-items: center;
  font-size: 12px;
  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    // width: 25px;
    height: 22px;
    border: 1px #aaaaaa solid;
    border-radius: 2px;
    cursor: pointer;
    padding: 0 5px;
    margin-left: 10px;
    &:hover {
      //border-color: #aaaaaa;
      box-shadow: 0 0 5px rgba(0, 0, 0, .2) inset;
    }
    img {
      width: 15px;
      margin-right: 3px;
    }
  }
}
</style>
