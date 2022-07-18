<script setup lang="ts">
import { inject, computed, Ref } from 'vue'

const unit = 20
const page = inject<Ref<{ width: number, height: number }>>('page')
const col = computed(() => new Array(Math.floor(page!.value.width / unit)))
const row = computed(() => new Array(Math.floor(page!.value.height / unit)))
</script>

<template>
  <div class="grid">
    <span
      v-for="(_, i) in col"
      :style="{ left: (i + 1) * unit + 'px' }"
      class="grid__col"
      :class="{ five: (i + 1) % (unit / 4) === 0 }"
    />
    <span
      v-for="(_, i) in row"
      :style="{ top: (i + 1) * unit + 'px' }"
      class="grid__row"
      :class="{ five: (i + 1) % (unit / 4) === 0 }"
    />
  </div>
</template>

<style lang="less">
.grid {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  //z-index: 1;
  pointer-events: none;
  span {
    position: absolute;
    display: block;
    background: #f7f8f9;
    &.five {
      background-color: #eee;
    }
  }
  &__col {
    height: 100%;
    width: 1px;
  }
  &__row {
    width: 100%;
    height: 1px;
  }
}
</style>
