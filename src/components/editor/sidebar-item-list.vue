<script setup lang="ts">
import SvgType from '../svg-type/index.vue'
import { Drag as XDrag } from '../container'
import { state, onDrop } from './state'
</script>

<template>
  <div class="xprocess-sidebar__list">
    <XDrag
      v-for="item in state.localComponentList"
      @drop="data => onDrop(data, item)"
    >
      <SvgType v-bind="item" />
    </XDrag>
  </div>
</template>

<style lang="less">
.xprocess-sidebar {
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
    }
    & > div:not(:nth-of-type(2n)) {
      //margin: 0 20px 20px 0
    }
  }
}
</style>
