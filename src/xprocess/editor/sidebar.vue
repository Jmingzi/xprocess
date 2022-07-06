<script setup lang="ts">
import SvgType from '../svg-type/index.vue'
import { Drag as XDrag } from '../container'
import { state, onDrop } from './state'
// import iconTriangleDownFill from '../props-tools/icon/triangle_down_fill.png'
</script>

<template>
  <div class="xprocess-sidebar__list">
    <XDrag
      v-for="item in state.localComponentList"
      :type="item.type"
      @drop="data => onDrop(data, item)"
    >
      <SvgType v-bind="item" />
    </XDrag>
  </div>
</template>

<style lang="less">
.xprocess-sidebar__list {
  .xprocess__drag {
    &:not(:last-of-type) {
      margin-bottom: 10px;
    }
  }
}
</style>
