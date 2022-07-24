<script setup lang="ts">
import { inject } from 'vue'
import SvgType from '../core/svg/index.vue'
import { Canvas as XCanvas, Drop as XDrop } from '../core/container'
import { state, onMoving } from './state'
import { useLayout } from './use-layout'
import LineActionPanel from '../core/operator/action-panel.vue'
import Sidebar from './component/sidebar.vue'
import FileOperate from './component/file-operate.vue'
import MultiSelect from '../core/operator/multi-select.vue'
import CircleSelect from '../core/operator/multi-select-circle.vue'
import PropsTool from '../core/style-tool/index.vue'
import ResizeInfo from '../core/operator/resize-info.vue'
import Operation from '../core/operator/node.vue'
import Reference from '../core/operator/reference-line.vue'
import { IConfig } from '..'

const { Layout } = useLayout()
const config = inject<IConfig>('config')
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
        <template v-if="!config.isReadonly()">
          <Reference />
          <LineActionPanel />
          <MultiSelect />
          <PropsTool />
          <ResizeInfo />
          <CircleSelect />
          <Operation />
        </template>
        <XDrop
          v-for="item in state.nodes"
          v-bind="item"
          :key="item.id"
          @move="config.isReadonly() ? null : data => onMoving(data, item)"
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
