<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDrag, IEventHandler } from '../../hooks/use-drag'
import { useCanvas } from './canvas/use-canvas'

const elRef = ref<HTMLElement | null>(null)
const emits = defineEmits(['drop'])
const { registerCallback, onMouseDown: handleMouseDown } = useDrag()
const { isStartInCanvas, inCanvas } = useCanvas()

const handler: IEventHandler = (data, e, wrapper) => {
  emits('drop', data, wrapper)
}
const onMouseDown = (e: MouseEvent) => {
  isStartInCanvas.value = inCanvas(e)
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
