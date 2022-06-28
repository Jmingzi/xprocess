<script lang="ts" setup>
import iconTriangleDownFill from './icon/triangle_down_fill.png'

defineProps<{
  active?: boolean
  select?: boolean
  input?: boolean
}>()
</script>

<template>
  <div class="xprocess__tool-item" :class="{ input, select }">
    <slot />
    <img v-if="select" :src="iconTriangleDownFill" style="width: 8px;margin-left: 3px;" alt="">
  </div>
</template>

<style lang="less">
.xprocess__tool-item {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 25px;
  width: 30px;
  @border-color: #aaaaaa;
  // padding: 0 2px;
  border: 1px transparent solid;
  &:hover {
    border-color: @border-color;
  }
  input {
    width: 100%;
    height: 80%;
    border: none;
    &:focus {
      outline: none;
    }
  }
  &.input {
    width: 40px;
  }
  &.select {
    width: 40px;
  }
}
</style>
