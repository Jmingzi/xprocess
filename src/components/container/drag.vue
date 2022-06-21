<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDrag, IEventHandler } from '../../hooks/use-drag'

const elRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['drop'])
const { registerCallback, onMouseDown: handleMouseDown } = useDrag()

const handler: IEventHandler = (data, e, wrapper) => {
  emits('drop', data, wrapper)
}
const onMouseDown = (e: MouseEvent) => {
  handleMouseDown(
    e,
    el => el === elRef.value,
    el => el.querySelector('svg')!.outerHTML
  )
}
onMounted(() => {
  registerCallback('mouseup', {
    handler,
    draggedWrapperEl: elRef.value!
  })
})
</script>

<template>
  <div
    :ref="v => elRef = v"
    class="xprocess__drag"
    @mousedown="onMouseDown"
  >
    <slot />
  </div>
</template>

<style lang="less">
.xprocess__drag {
  display: flex;
}
</style>
