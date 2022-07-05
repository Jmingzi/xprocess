<script setup lang="ts">
import SvgType from '../svg-type/index.vue'
import { Drag as XDrag } from '../container'
import { state, onDrop } from './state'
import iconTriangleDownFill from '../props-tools/icon/triangle_down_fill.png'
</script>

<template>
  <div class="xprocess-sidebar__title">
    <img :src="iconTriangleDownFill" width="10" alt="">
    图形列表
  </div>
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
.xprocess-sidebar {
  &__title {
    line-height: 30px;
    font-size: 13px;
    background: #f7f8f9;
    border-bottom: 1px #eee solid;
    padding-left: 10px;
  }
  &__list {
    display: flex;
    flex-wrap: wrap;
    padding: 15px;
    transform: scale(0.5);
    transform-origin: left top;
    width: 200%;
    & > div {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 90px;
      height: 80px;
      margin-top: 20px;
    }
    & > div:not(:nth-of-type(2n)) {
      //margin: 0 20px 20px 0
    }
  }
}
</style>
