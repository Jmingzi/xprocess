<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onCopy } from '../../assets/util'
import { Message } from '../../xprocess/component/message'
const props = defineProps<{ id: string }>()
const ok = ref(false)
const shareLink = computed(() => `${location.protocol}//${location.host}${location.pathname}#/share/${props.id}`)
const handleCopy = async () => {
  ok.value = false
  await onCopy(shareLink.value)
  Message.success('复制成功')
  setTimeout(() => {
    ok.value = true
  })
}
</script>

<template>
  <div class="share-modal-content">
    <p>分享成功！分享链接请点击：</p>
    <div class="share-modal-content__input">
      <input type="text" :value="shareLink" readonly>
      <span @click="handleCopy">
        复制{{ ok ? '成功' : '链接' }}
      </span>
    </div>
  </div>
</template>

<style lang="less">
@import '../../xprocess/var';
.share-modal-content {
  padding-bottom: 30px;
  &__input {
    display: flex;
    span {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 0 10px;
      background-color: @main-color;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
    }
  }
  input {
    //width: 100%;
    display: block;
    flex-grow: 1;
    font: inherit;
    padding: 5px;
    border: 1px @border-color solid;
    background-color: @hover-bg;
    color: #898989;
    &:focus {
      outline: none;
    }
  }
}
</style>