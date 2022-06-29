<script setup lang="ts">
import SvgType from '../svg-type/index.vue'
import { Drag as XDrag, Canvas as XCanvas, Drop as XDrop } from '../container'
import { state, onDrop, onMoving } from './state'
import { useLayout } from '../../hooks/use-layout'
import LineActionPanel from '../operation/action-panel.vue'
import { lineUpActionPanelData, handleCreateToNode } from '../operation/state'
import TextPropsTools from '../props-tools/text-tool.vue'
import SvgPropsTools from '../props-tools/svg-tool.vue'

const { Layout } = useLayout()
</script>

<template>
  <Layout>
    <template #tools>
      <TextPropsTools />
      <SvgPropsTools />
    </template>
    <template #left>
      <XDrag
        v-for="item in state.localComponentList"
        @drop="data => onDrop(data, item)"
      >
        <SvgType v-bind="item" />
      </XDrag>
    </template>
    <template #content>
      <XCanvas>
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
        <LineActionPanel
          v-if="!!lineUpActionPanelData"
          :position="lineUpActionPanelData"
          @click="handleCreateToNode"
        />
      </XCanvas>
    </template>
  </Layout>
</template>

<style lang="less">
.xprocess-content {
}
</style>
