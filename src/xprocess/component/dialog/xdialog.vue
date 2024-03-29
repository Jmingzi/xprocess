<script setup lang="ts">
import iconInfo from '../message/icon/info.png'
import { withDefaults, Ref } from 'vue'

withDefaults(defineProps<{
  title?: string
  message?: string
  show?: Ref<boolean>
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm?: () => void
}>(), {
  title: '提示',
  onCancel () {},
  onConfirm () {}
})

const emit = defineEmits(['close', 'clickOnLayer'])
</script>

<template>
  <teleport to="body">
    <div class="xdialog" @click.stop="emit('clickOnLayer')">
      <transition name="dialog">
        <div v-if="show.value" class="xdialog__content" @click.stop="">
          <div class="xdialog__header">
            <img :src="iconInfo" alt="" width="16">
            <span>{{ title }}</span>
          </div>
          <div class="xdialog__body">
            <slot>
              {{ message }}
            </slot>
          </div>
          <div v-if="cancelText || confirmText" class="xdialog__footer">
            <div v-if="cancelText" class="xdialog__button" @click="onCancel">{{ cancelText }}</div>
            <div v-if="confirmText" class="xdialog__button xdialog__button--primary" @click="onConfirm">{{ confirmText }}</div>
          </div>
        </div>
      </transition>
    </div>
  </teleport>
</template>

<style lang="less">
@import '../../var';
.xdialog {
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: @z-index-max;

  &__content {
    position: absolute;
    background-color: #ffffff;
    width: 400px;
    // height: 200px;
    left: 50%;
    transform: translateX(-50%);
    top: 30%;
    box-shadow: @shadow-tools;
    border-radius: 5px;
    font-size: 14px;
  }

  &__header {
    display: flex;
    align-items: center;
    height: 50px;
    padding: 0 20px;
    color: #666;
    border-bottom: 1px solid rgba(@border-color, 0.5);
    span {
      margin-left: 5px;
    }
  }

  &__body {
    padding: 20px;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: end;
    height: 40px;
    padding: 10px 20px 30px 0;
  }

  &__button {
    padding: 5px 16px;
    font-size: 12px;
    border-radius: 4px;
    border: 1px solid @border-color;
    cursor: pointer;
    & + div {
      margin-left: 10px;
    }
    &:hover {
      background-color: @hover-bg;
    }

    &--primary {
      background-color: @main-color;
      border-color: @main-color;
      color: #fff;
      &:hover {
        background-color: rgba(@main-color, 0.9);
      }
    }
  }
}

.dialog-enter-active,
.dialog-leave-active {
  transition: all 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-30%);
}
</style>