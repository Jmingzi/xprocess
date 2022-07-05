<script setup lang="ts">
import { useLayout } from '../xprocess/hooks/use-layout'
import { State, initState } from '../xprocess/editor/state'
import { reactive } from 'vue'
import { getUserList, deleteById } from '../api'
import { useRouter } from 'vue-router'

const router = useRouter()
const { Layout } = useLayout()

type Item = { id: number } & State
const state = reactive<{
  list: Item[]
}>({
  list: []
})
const getList = async () => {
  const data = await getUserList<{ [id: string]: Item }>()
  state.list = Object.values(data)
}

const onAdd = () => {
  initState({
    filename: '未命名文件',
    nodes: [],
    lines: []
  })
  router.push('/editor')
}

const onEdit = (item: Item) => {
  // initState(item)
  router.push(`/editor/${item.id}`)
}

const onDelete = async (item: Item) => {
  await deleteById(item.id)
  await getList()
}

getList()
</script>

<template>
  <Layout>
    <template #content>
      <div>
        <button @click="onAdd">添加</button>
      </div>
      <ul>
        <li v-for="item in state.list">
          <span>{{ item.filename }}</span>
          <button @click="onEdit(item)">编辑</button>
          <button @click="onDelete(item)">删除</button>
        </li>
      </ul>
    </template>
  </Layout>
</template>
