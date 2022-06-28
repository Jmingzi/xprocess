<script setup lang="ts">
import { state as editorState, getDirection } from '../editor/state'
import SvgType from '../svg-type/index.vue'
import { useCanvas } from '../container/canvas/use-canvas'
import { IEventHandlerData } from '../../hooks/use-drag'
import { computed, ref, onMounted } from 'vue'

const props = defineProps<{
  position: {
    x: number,
    y: number,
    mouseData: IEventHandlerData
  }
}>()
const emit = defineEmits(['click'])
const refEl = ref<HTMLElement>()
const elRect = ref()

const { rect: canvasRect } = useCanvas()
const style = computed(() => {
  const { startX, startY, endX, endY } = props.position.mouseData
  const { isLeftTop, isLeftBottom, isRightBottom, isRightTop } = getDirection([startX, startY], [endX, endY])
  const deltaX = isLeftTop || isLeftBottom ? elRect.value?.width ?? 0 : 0
  return {
    left: `${props.position.x - canvasRect!.value!.left - deltaX}px`,
    top: `${props.position.y - canvasRect!.value!.top}px`
  }
})

onMounted(() => {
  elRect.value = refEl.value!.getBoundingClientRect()
})
</script>

<template>
  <div
    ref="refEl"
    class="xprocess__over-panel"
    :style="style"
    @click.stop=""
  >
    <SvgType
      v-for="item in editorState.localComponentList"
      v-bind="item"
      @click="emit('click', item)"
    />
  </div>
</template>

<style lang="less">
.xprocess__over-panel {
  position: absolute;
  //right: 0;
  //bottom: 0;
  //transform: translate(100%, 100%);
  padding: 10px;
  background-color: #fff;
  border: 1px #eee solid;
}
</style>
