<script setup lang="ts">
import SvgType from '../../core/svg/index.vue'
import { Drag as XDrag } from '../../core/container'
import { state, onDrop } from '../state'
// import iconTriangleDownFill from '../style-tool/icon/triangle_down_fill.png'
import { ref } from 'vue'

const LOCAL_ROW_NUMS = 2
const rows = ref(Math.ceil(state.localComponentList.length / LOCAL_ROW_NUMS))
</script>

<template>
  <div class="xprocess-sidebar__list">
    <p class="xprocess-sidebar__title">基础图形</p>
    <div class="xprocess-sidebar__group" v-for="(_, i) in rows">
      <XDrag
        v-for="item in state.localComponentList.slice(i * LOCAL_ROW_NUMS, (i + 1) * LOCAL_ROW_NUMS)"
        :type="item.type"
        @drop="data => onDrop(data, item)"
      >
        <SvgType v-bind="item" />
      </XDrag>
    </div>
  </div>
</template>

<style lang="less">
.xprocess-sidebar {
  &__list {
    margin: 0 -3px;
  }
  &__title {
    font-size: 12px;
    color: #666666;
    margin: 0 0 0 5px;
  }
  &__group {
    display: flex;
    align-items: center;
    & > div {
      width: 40px;
      height: 40px;
      align-items: center;
      &:not(:last-of-type) {
      }
      svg {
        cursor: pointer !important;
      }
    }
  }
}
</style>
