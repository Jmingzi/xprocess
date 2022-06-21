<script setup lang="ts">
import SvgType from '../svg-type/index.vue'
import { Drag as XDrag, Canvas as XCanvas, Drop as XDrop } from '../container'
import { state, onDrop, onMoving } from './state'
import { useLayout } from '../../hooks/use-layout'

const { Layout } = useLayout()
</script>

<template>
  <Layout>
    <template #left>
      <XDrag
        v-for="item in state.localComponentList"
        @drop="data => onDrop(data, item)"
      >
        <SvgType
          v-bind="item"
          :width="100"
          :height="50"
        />
      </XDrag>
    </template>
    <template #content>
      <XCanvas>
        <XDrop
          v-for="item in state.result"
          :type="item.type"
          :node-id="item.id"
          :position="item.position"
          @move="data => onMoving(data, item)"
        >
          <SvgType v-bind="item" />
        </XDrop>
      </XCanvas>
    </template>
  </Layout>
</template>

<style lang="less">
.xprocess-canvas {
  width: 800px;
  height: 400px;
  background-color: #fff;
}
</style>
