<script setup lang="ts">
import { computed } from 'vue'
import { circleSelect } from './state'

const style = computed(() => {
  if (!circleSelect.value?.end[0] || !circleSelect.value?.start[0]) {
    return
  }

  const { start, end } = circleSelect.value
  let left = start[0]
  let top = start[1]
  let width = Math.abs(start[0] - end[0])
  let height = Math.abs(start[1] - end[1])

  return {
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px'
  }
})
</script>

<template>
  <div
    v-if="style"
    class="circle-select"
    :style="style"
  />
</template>

<style lang="less">
@import '../var';
.circle-select {
  position: absolute;
  z-index: @z-index-max;
  border: 1px @main-color solid;
}
</style>
