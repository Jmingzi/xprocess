<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  movingItemHtml: string,
  x: number,
  y: number,
}>()
const movingStyle = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`
  }
})
</script>

<template>
  <div
    class="xprocess__moving-item"
    v-html="movingItemHtml"
    :style="movingStyle"
  />
</template>

<style lang="less">
@import '../../../var.less';
.xprocess {
  &__moving-item {
    position: absolute;
    z-index: @z-index-max;
  }
}
</style>
