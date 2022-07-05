<script setup lang="ts">
import { useProcess, IProcessState } from '../../xprocess'
import { save, share, getDetail } from '../../api'
import { useRouter, useRoute } from 'vue-router'

const route = useRoute()
const { Process, initState } = useProcess({
  api: {
    save,
    share
  }
})

const getProcessDetail = async (id: string) => {
  const data = await getDetail<IProcessState>(+id)
  initState(data)
}

const { id } = route.params
if (id) {
  getProcessDetail(id as string)
}
</script>

<template>
  <Process />
</template>
