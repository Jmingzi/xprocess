<script setup lang="ts">
import { useProcess, IProcessState } from '../xprocess'
import { save, share, getDetail, getUserList, deleteById } from '../api'
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, watch } from 'vue'
import iconLiuc from './icon/liucheng.png'
// import iconEdit from './icon/edit.png'
import iconDelete from './icon/delete.png'

const route = useRoute()
const router = useRouter()

type Item = { id: number } & IProcessState
const state = reactive<{
  list: Item[]
}>({
  list: []
})
const getList = async () => {
  const data = await getUserList<{ [id: string]: Item }>()
  state.list = Object.values(data).reverse()
}

const onAdd = () => {
  router.replace('/editor')
}

const config = ref({
  paramsId: route.params.id as string,
  api: {
    save,
    share,
    list: getList,
    addNew: onAdd
  }
})
const { Process, initState, canvasHasData, Message } = useProcess(config)

const onEdit = (item: Item) => {
  if (String(item.id) === route.params.id) {
    return
  }
  if (canvasHasData.value) {
    // const value = confirm('该操作会覆盖现有画布的元素且不可恢复，确定这样做吗？')
    // if (!value){
    //   return
    // }
  }
  Message.info(`画布切换至【${item.filename}】`)
  initState(item)
  router.push(`/editor/${item.id}`)
}

const onDelete = async (item: Item) => {
  await deleteById(item.id)
  await getList()
  if (route.params.id && Number(route.params.id) === item.id) {
    onAdd()
  }
}

const getProcessDetail = async (id: string) => {
  const data = await getDetail<IProcessState>(+id)
  initState(data)
}

watch(() => route.params.id, (id) => {
  if (id) {
    getProcessDetail(id as string)
  } else {
    // 初始化创建
    initState({
      filename: '未命名文件',
      nodes: [],
      lines: []
    })
  }
  config.value.paramsId = id as string
}, { immediate: true })

const formatTime = (id: number) => {
  const d = new Date(id)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes()}`
}
</script>

<template>
  <Process>
    <template v-slot:list-panel>
      <div class="my-list">
        <div class="my-list__title">
          <img :src="iconLiuc" width="20" alt="">
          <span>我创建的流程图</span>
        </div>
        <div class="my-list__content">
          <ul>
            <li
              v-for="item in state.list"
              @click="onEdit(item)"
              :class="{
                active: +route.params.id === item.id
              }"
            >
              <span>{{ item.filename }}</span>
              <span class="my-list__operate">
                <span class="my-list__time">{{ formatTime(item.id) }}</span>
<!--                <img title="编辑" :src="iconEdit">-->
                <img title="删除" :src="iconDelete" @click.stop="onDelete(item)">
              </span>
            </li>
          </ul>
        </div>
      </div>
    </template>
  </Process>
</template>

<style lang="less">
@import '../xprocess/var';
@title-height: 50px;
.my-list {
  position: relative;
  height: 100%;
  font-size: 14px;
  color: #363636;
  &__title {
    display: flex;
    align-items: center;
    height: @title-height;
    padding: 0 15px;
    background-color: #f7f8f9;
    border-bottom: 1px @border-color solid;
    img {
      margin-right: 10px;
    }
  }
  &__content {
    height: calc(100% - @title-height);
    overflow: auto;
    ::marker {
      color: #aaaaaa;
    }
    ul {
      padding: 0;
      margin: 0;
    }
    li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 20px;
      border-bottom: 1px dashed @border-color;
      &:hover {
        background-color: @hover-bg;
        cursor: pointer;
      }
      &.active {
        background-color: rgba(@main-color, 0.1);
      }
    }
    img {
      width: 17px;
      cursor: pointer;
      margin-left: 7px;
      margin-top: 3px;
    }
  }
  &__time {
    font-size: 12px;
    color: #999999;
  }
  &__operate {
    //float: right;
    display: flex;
    align-items: center;
  }
}
</style>
