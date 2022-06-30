<script setup lang="ts">
import iconTriangleDownFill from '../props-tools/icon/triangle_down_fill.png'
import ItemList from './sidebar-item-list.vue'
</script>

<template>
  <div class="xprocess-sidebar__title">
    <img :src="iconTriangleDownFill" width="10" alt="">
    图形列表
  </div>
  <ItemList />
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
}
</style>
