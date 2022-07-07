<script lang="ts" setup>
import { withDefaults } from 'vue'
import ColorPick from '../color-pick/index.vue'

withDefaults(defineProps<{
  value: string
}>(), {
  value: '#333333'
})

defineEmits(['change'])
</script>

<template>
  <ColorPick :model-value="value" @update:modelValue="v => $emit('change', { target: { value: v } }, v)">
    <div class="xcolor">
      <slot />
      <div class="xcolor__bar" :style="{ backgroundColor: value }" />
    </div>
  </ColorPick>
</template>

<style lang="less">
.xcolor {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  //width: 100%;
  height: 100%;
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
    width: 15px;
    height: 2px;
    margin-top: 2px;
  }
}
</style>
