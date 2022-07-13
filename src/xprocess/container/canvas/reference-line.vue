<script setup lang="ts">
import { state as editorState } from '../../editor/state'
</script>

<template>
  <div class="reference-line">
    <template v-for="item in editorState.referenceLines">
      <div
        v-if="item.type === 'col'"
        class="reference-line__col"
        :style="{
          left: item.left + 'px',
          height: item.height + 'px',
          top: item.heightTop + 'px'
        }"
      />
      <div
        v-else
        class="reference-line__row"
        :style="{
          top: item.top + 'px',
          width: item.width + 'px',
          left: item.widthLeft + 'px'
        }"
      />
    </template>
  </div>
</template>

<style lang="less">
.reference-line {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  & > div {
    position: absolute;
  }
  &__col {
    height: 100%;
    width: 1px;
    //left: 20px;
    top: 0;
    border-left: 1px solid #3b8ff6;
  }
  &__row {
    width: 100%;
    height: 1px;
    //top: 50px;
    left: 0;
    border-top: 1px solid #3b8ff6;
  }
}
</style>
