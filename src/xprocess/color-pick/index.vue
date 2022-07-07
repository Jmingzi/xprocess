<script lang="ts" setup>
import color from './color.json'
import { ref } from 'vue'

defineProps<{
  modelValue: string
}>()
const key = 'xprocess_color_local'
const emit = defineEmits(['update:modelValue'])
const local = localStorage.getItem(key)
const latest = ref<string[]>(local ? local.split('_') : [])
const onSelect = (color: string) => {
  const index = latest.value.findIndex(x => x === color)
  if (index > -1) {
    latest.value.splice(index, 1)
  }
  latest.value.unshift(color)
  latest.value.splice(10, latest.value.length - 10)
  emit('update:modelValue', color)
  localStorage.setItem(key, latest.value.join('_'))
}
const show = ref(false)
const left = ref(0)
const top = ref(0)

const onClick = (e: MouseEvent) => {
  const target = e.target as HTMLDivElement
  const { x, y, width, height } = target.getBoundingClientRect()
  left.value = x
  top.value = y + height + 10
  show.value = !show.value
}
</script>

<template>
  <div class="color-pick" @click.stop="onClick">
    <slot>
      <div class="color-pick__display" :style="{ backgroundColor: modelValue }" />
    </slot>
  </div>
  <teleport to="body">
    <div
      v-if="show"
      class="color-pick__panel"
      :style="{
        left: `${left}px`,
        top: `${top}px`
      }"
    >
      <div class="color-pick__transparent">
        <div class="color-pick__group-item" />
        <span>透明</span>
      </div>
      <div class="color-pick__group" v-for="(_, x) in color[0]">
        <span
          v-for="group in color"
          class="color-pick__group-item"
          :style="{ backgroundColor: group[x].color }"
          @click="onSelect(group[x].color)"
        />
      </div>
      <div class="color-pick__latest">
        <span>最近使用</span>
        <div class="color-pick__latest-list">
          <span class="empty" v-if="!latest.length">暂无</span>
          <span
            v-for="color in latest"
            class="color-pick__group-item"
            :style="{ backgroundColor: color }"
            @click="onSelect(color)"
          />
        </div>
      </div>
    </div>
  </teleport>
</template>

<style lang="less">
@import '../var';
.color-pick {
  width: 100%;
  height: 100%;
  &__display {
    width: 40px;
    height: 25px;
  }
  &__panel {
    position: fixed;
    z-index: @z-index-max;
    top: 30px;
    left: 30px;
    box-shadow: @shadow-tools;
    border: 1px @border-color solid;
    border-radius: 4px;
    padding: 10px 0;
    background-color: #fff;
  }
  &__transparent {
    display: flex;
    align-items: center;
    font-size: 14px;
    padding: 5px 10px;
    cursor: pointer;
    margin-bottom: 10px;
    &:hover {
      background-color: @hover-bg;
    }
    .color-pick__group-item {
      position: relative;
      margin-right: 10px;
      &:after {
        content: "";
        display: block;
        position: absolute;
        top: 7px;
        left: -3px;
        width: 22px;
        height: 0;
        border-bottom: 2px solid #E4495B;
        transform: rotate(-45deg);
      }
    }
  }
  &__group {
    display: flex;
    padding: 0 10px;
  }
  &__group-item {
    width: 18px;
    height: 18px;
    margin: 2px;
    border-radius: 3px;
    cursor: pointer;
    transition: transform 0.1s;
    border: 1px @border-color solid;
    &:hover {
      transform: scale(1.3);
    }
  }
  &__latest {
    padding: 0 10px;
    font-size: 14px;
    margin-bottom: 10px;
    & > span {
      display: block;
      padding: 10px 0;
    }
    &-list {
      display: flex;
    }
    .empty {
      color: #999;
    }
  }
}
</style>
