<script setup lang="ts">
import SvgType from '../svg-type/index.vue'
import { Canvas as XCanvas, Drop as XDrop } from '../container'
import { state, onMoving } from './state'
import { useLayout } from '../../hooks/use-layout'
import LineActionPanel from '../operation/action-panel.vue'
import TextPropsTools from '../props-tools/text-tool.vue'
import SvgPropsTools from '../props-tools/svg-tool.vue'
import Sidebar from './sidebar.vue'
import Filename from '../props-tools/filename.vue'
import FileOperate from '../props-tools/file-operate.vue'
import MultiSelect from '../operation/multi-select.vue'

const { Layout } = useLayout()
</script>

<template>
  <Layout>
    <template #tools>
      <Filename />
      <TextPropsTools />
      <SvgPropsTools />
    </template>
    <template #tools-right>
      <FileOperate />
    </template>
    <template #left>
      <Sidebar />
    </template>
    <template #content>
      <XCanvas>
        <LineActionPanel />
        <MultiSelect />
        <XDrop
          v-for="item in state.nodes"
          v-bind="item"
          @move="data => onMoving(data, item)"
        >
          <SvgType v-bind="item" />
        </XDrop>
        <XDrop
          v-for="item in state.lines"
          v-bind="item"
          type="line"
        >
          <SvgType v-bind="item" type="line" />
        </XDrop>
      </XCanvas>
    </template>
  </Layout>
</template>

<style lang="less">
.xprocess-content {
}
</style>
