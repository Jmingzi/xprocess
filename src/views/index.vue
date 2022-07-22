<script setup lang="ts">
import { useProcess, IProcessState, IConfig } from '../xprocess'
import { save, share, getDetail, getUserList, deleteById } from '../api'
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, watch, onMounted } from 'vue'
import iconLiuc from './icon/liucheng.png'
import iconExport from './icon/export.png'
import iconDelete from './icon/delete.png'
import iconSave from './icon/save.png'
import iconShare from './icon/share.png'
import iconImport from './icon/import.png'
import iconAdd from './icon/add.png'

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
  // if (state.list.length && !route.params.id) {
  // }
}

const onAdd = () => {
  router.replace('/editor')
  Message.info('已为您重置画布!')
}

const toDetail = (id: number) => {
  router.replace(`/editor/${id}`)
}

const onImport = () => {}
const onExport = () => {}
const onShare = () => {}

const config = ref<IConfig>({
  toHome: onAdd,
  fileOperators: [
    {
      title: '导入文件',
      icon: iconImport,
      action: onImport
    },
    {
      condition: () => !!route.params.id,
      title: '分享文件',
      icon: iconShare,
      action: onShare
    },
    {
      title: '保存文件',
      icon: iconSave,
      action: async (data) => {
        const isEdit = !!route.params.id
        const dataId = await save(data)
        await getList()
        if (!isEdit && dataId) {
          openListPanel()
          toDetail(dataId)
        }
      }
    },
    {
      condition: () => !!route.params.id,
      title: '新建文件',
      icon: iconAdd,
      action: onAdd
    }
  ]
})
const {
  Process,
  initState,
  stateCanvasDataChange,
  Message,
  Dialog,
  openListPanel
} = useProcess(config)

const onEdit = (item: Item) => {
  if (String(item.id) === route.params.id) {
    return
  }
  // if (stateCanvasDataChange.value) {
  //   const value = confirm('该操作会覆盖您的更改，且不可恢复，确定这样做吗？')
  //   if (!value){
  //     return
  //   }
  // }
  Message.info(`画布切换至【${item.filename}】`)
  initState(item)
  router.push(`/editor/${item.id}`)
}

const onDelete = async (item: Item) => {
  await Dialog.confirm('删除后不可恢复，确定要删除吗？')
  await deleteById(item.id)
  await getList()
  Message.success('删除成功')
  if (route.params.id && Number(route.params.id) === item.id) {
    onAdd()
    Message.info('已为您重置画布')
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
}, { immediate: true })

onMounted(() => {
  getList()
  if (!route.params.id) {
    openListPanel()
  }
})

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
          <span>我创建的</span>
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
              <span>{{ item.filename }}.xs</span>
              <span class="my-list__operate">
                <span class="my-list__time">{{ formatTime(item.id) }}</span>
                <img title="导出" :src="iconExport" @click.stop="onExport(item)">
                <img title="删除" :src="iconDelete" @click.stop="onDelete(item)">
              </span>
            </li>
          </ul>
          <p v-if="!state.list.length" style="text-align: center;color: #666">还没有数据哦～</p>
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
    //background-color: rgba(@main-color, 0.1);
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
