<script lang="ts" setup>
import { ref, onMounted, computed, getCurrentInstance, nextTick, watchEffect, watch, inject, CSSProperties } from 'vue'
import { state as editorState, isNodeLine } from '../../editor/state'

const vm = getCurrentInstance()
const refEl = ref()
const textHeight = ref(0)
const initialContent = ref('')
const nodeId = inject<number>('nodeId', 0)
const node = computed(() =>
  isNodeLine(nodeId)
    ? editorState.lines.find(x => x.id === nodeId)
    : editorState.nodes.find(x => x.id === nodeId))
const parentHeight = ref(0)
const style = computed(() => {
  if (!node.value?.font) {
    return
  }
  const { horizontalAlign, fontSize, color, bold, italics, underline } = node.value?.font
  const edit = node.value?.fontEditable
  const result: Partial<CSSProperties> = {
    fontSize: `${fontSize}px`,
    pointerEvents: edit ? undefined : 'none',
    userSelect: edit ? undefined : 'none',
    textAlign: horizontalAlign,
    color,
    fontWeight: bold ? 'bold' : undefined,
    fontStyle: italics ? 'italics' : undefined,
    textDecoration: underline ? 'underline' : undefined
  }
  if (textHeight.value === 0) {
    // 未渲染
    return result
  }
  const delta = parentHeight.value - textHeight.value
  const px = `${delta / 2}px`
  return Object.assign(result, {
    top: px,
    bottom: px
  })
})

onMounted(() => {
  calcHeight()
})

const calcHeight = () => {
  textHeight.value = refEl.value.getBoundingClientRect().height
  // console.log('文本高度', refEl.value, textHeight.value)
}

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  const text = target.innerHTML
  nextTick(() => {
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
  }
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
  if (node.value?.start && node.value?.end && node.value?.font?.fontSize) {
    parentHeight.value = vm?.parent?.vnode.el?.getBoundingClientRect()?.height ?? 0
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
    :class="{
      line: isNodeLine(nodeId)
    }"
    :contenteditable="node?.fontEditable"
    :style="style"
    @keyup.stop=""
    @keydown.stop=""
    ref="refEl"
    @input="handleInput"
    @blur="handleBlur"
    v-html="initialContent"
  >
  </div>
</template>

<style lang="less">
.xprocess__text {
  position: absolute;
  left: 10px;
  right: 10px;
  line-height: 1.5;
  border-radius: 2px;
  height: fit-content;
  // 适配 safari
  -webkit-user-select: text;
  &:focus {
    outline: 2px #F4DDB0 solid;
  }
  &.line {
    width: fit-content;
    min-width: 20px;
    max-width: 80%;
    background-color: #fff;
    left: 50%;
    transform: translateX(-50%);
    padding: 0 5px;
  }
}
</style>

