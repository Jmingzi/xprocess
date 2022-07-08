<script setup lang="ts">
import SvgType from '../svg-type/index.vue'
import { Canvas as XCanvas, Drop as XDrop } from '../container'
import { state, onMoving } from './state'
import { useLayout } from '../hooks/use-layout'
import LineActionPanel from '../operation/action-panel.vue'
import Sidebar from './sidebar.vue'
import FileOperate from '../props-tools/file-operate.vue'
import MultiSelect from '../operation/multi-select.vue'
import PropsTool from '../props-tools/index.vue'
import ResizeInfo from '../resize-info/index.vue'

const { Layout } = useLayout()
</script>

<template>
  <Layout>
    <template #header>
      <FileOperate>
        <template v-slot:list-panel>
          <slot name="list-panel" />
        </template>
      </FileOperate>
    </template>
    <template #left>
      <Sidebar />
    </template>
    <template #content>
      <XCanvas>
        <LineActionPanel />
        <MultiSelect />
        <PropsTool />
        <ResizeInfo />
        <XDrop
          v-for="item in state.nodes"
          v-bind="item"
          :key="item.id"
          @move="data => onMoving(data, item)"
        >
          <SvgType v-bind="item" />
        </XDrop>
        <XDrop
          v-for="item in state.lines"
          :key="item.id"
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
