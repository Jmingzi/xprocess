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
    <div v-for="item in editorState.localComponentList">
      <SvgType
        v-bind="item"
        @click="emit('click', item)"
      />
    </div>
  </div>
</template>

<style lang="less">
.xprocess__over-panel {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  width: 400px;
  padding: 15px;
  transform: scale(0.5);
  transform-origin: left top;
  background-color: #fff;
  border: 2px #aaa solid;
  border-radius: 5px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, .15);
  & > div {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100px;
    height: 80px;
  }
}
</style>
