<script setup lang="ts">
const emit = defineEmits(['updateText'])
defineProps<{
  text: string
  tip: string
}>()
const onInput = (e: Event) => {
  emit('updateText', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="signup-modal-content">
    <p>{{ tip || 'Hello，第一次使用，需要输入一个昵称，以便保存您即将产生的信息' }}:</p>
    <input
      type="text"
      :value="text"
      maxlength="10"
      placeholder="请输入"
      @input="onInput"
    >
  </div>
</template>

<style lang="less">
.signup-modal-content {
  padding-bottom: 20px;
  input {
    width: 100%;
    font: inherit;
    height: 30px;
    border: 1px #eee solid;
    padding: 0 10px;
    border-radius: 4px;
    &:focus {
      outline: none;
    }
  }
}
</style>