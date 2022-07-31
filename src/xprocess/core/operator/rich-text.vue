<script lang="ts" setup>
import { ref, onMounted, computed, nextTick, watchEffect, watch, inject, CSSProperties } from 'vue'
import { state as editorState, isNodeLine } from '../../editor/state'
import { setCurrentLine } from './state'

const refEl = ref()
const textWidth = ref(0)
const textHeight = ref(0)
const initialContent = ref('')
const nodeId = inject<number>('nodeId', 0)
const node = computed(() =>
  isNodeLine(nodeId)
    ? editorState.lines.find(x => x.id === nodeId)
    : editorState.nodes.find(x => x.id === nodeId))
const fontPosition = computed(() => {
  if (!node.value) {
    return [0, 0]
  }
  if (node.value?.font?.fontPositionOfLine) {
    return node.value.font.fontPositionOfLine
  }
  const width = Math.abs(node.value.end[0] - node.value.start[0])
  const height = Math.abs(node.value.end[1] - node.value.start[1])
  return [width / 2, height / 2]
})

const style = computed(() => {
  if (!node.value?.font) {
    return
  }
  const { horizontalAlign, fontSize, color, bold, italics, underline } = node.value?.font
  const edit = node.value?.fontEditable
  const result: Partial<CSSProperties> = {
    fontSize: `${fontSize}px`,
    // 线条需要可点击
    // 图形需要在编辑态可点击
    pointerEvents: isNodeLine(nodeId) ? undefined : edit ? undefined : 'none',
    userSelect: edit ? undefined : 'none',
    textAlign: horizontalAlign,
    color,
    fontWeight: bold ? 'bold' : undefined,
    fontStyle: italics ? 'italics' : undefined,
    textDecoration: underline ? 'underline' : undefined,
    left: `${fontPosition.value[0] - textWidth.value / 2}px`,
    top: `${fontPosition.value[1] - textHeight.value / 2}px`,
    backgroundColor: isNodeLine(nodeId) ? '#ffffff' : undefined
  }
  return result
})

onMounted(() => {
  calcHeight()
})

const calcHeight = () => {
  const { width, height } = refEl.value.getBoundingClientRect()
  textWidth.value = width
  textHeight.value = height
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const text = target.innerHTML
  nextTick(() => {
    textWidth.value = target.offsetWidth
    textHeight.value = target.offsetHeight
    /**
     * 此处不做受控文本
     */
    if (node.value?.font) {
      node.value.font.content = text
    }
  })
}

const handleBlur = () => {
  if (node.value) {
    node.value.fontEditable = false
    if (!node.value.font.content) {
      node.value.font.fontPositionOfLine = undefined
    }
  }
}

const onClick = () => {
  setCurrentLine(nodeId)
}

const onDoubleClick = () => {
  node.value!.fontEditable = true
}

watch(() => node.value, node => {
  if (node) {
    /**
     * 此处不做受控文本
     * 仅仅是节点变化时初始化下内容
     */
    initialContent.value = (node?.font?.content ?? '')
      .split('\n')
      .map((item, i) => i === 0 ? item : `<div>${item}</div>`)
      .join('')
  }
}, { immediate: true })

watchEffect(() => {
  if (node.value?.start && node.value?.end && node.value?.font.fontSize) {
    calcHeight()
  }
}, { flush: 'post' })

watchEffect(() => {
  if (node.value?.fontEditable) {
    calcHeight()
    refEl.value.focus()
    // 光标移动到最后
    const range = window.getSelection()!
    range.selectAllChildren(refEl.value)
    range.collapseToEnd()
  }
}, { flush: 'post' })
</script>

<template>
  <div
    class="xprocess__text"
    ref="refEl"
    :contenteditable="node?.fontEditable"
    :style="style"
    @keyup.stop=""
    @keydown.stop=""
    @input="handleInput"
    @blur="handleBlur"
    @click.stop="onClick"
    @dblclick.stop="onDoubleClick"
    v-html="initialContent"
  >
  </div>
</template>

<style lang="less">
@import '../../var';
.xprocess__text {
  position: absolute;
  min-width: 20px;
  line-height: 1.5;
  border-radius: 2px;
  padding: 0 5px;
  width: fit-content;
  height: fit-content;
  // 适配 safari
  -webkit-user-select: text;
  // 线条垂直时的宽度撑开
  white-space: nowrap;
  &:focus {
    outline: 2px @focus-color solid;
  }
}
</style>

