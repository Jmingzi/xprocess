<script lang="ts" setup>
import { withDefaults } from 'vue'

withDefaults(defineProps<{
  value: string
}>(), {
  value: '#333333'
})

defineEmits(['change'])
</script>

<template>
  <div class="xcolor">
    <input type="color" :value="value" @change="e => $emit('change', e, e.target.value)">
    <slot />
    <div class="xcolor__bar" :style="{ backgroundColor: value }" />
  </div>
</template>

<style lang="less">
.xcolor {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  img {
    width: 20px;
  }
  input {
    position: absolute;
    display: block;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    opacity: 0;
    z-index: 1;
    height: initial!important;
  }

  &__bar {
    width: 20px;
    height: 2px;
  }
}
</style>
