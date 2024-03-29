<script setup lang="ts">
import { useProcess, IProcessState, IConfig, calEdgeFromNodes } from '../../xprocess'
import { save, getDetail, getUserList, deleteById } from '../../assets/api'
import { useRouter, useRoute } from 'vue-router'
import { reactive, ref, watch, onMounted, h, computed, watchEffect } from 'vue'
import iconLiuc from './icon/liucheng.png'
import iconExport from './icon/export.png'
import iconDelete from './icon/delete.png'
import iconSave from './icon/save.png'
import iconShare from './icon/share.png'
import iconImport from './icon/import.png'
import iconAdd from './icon/add.png'
import iconFile from './icon/file.png'
import iconTriangle from './icon/triangle_down_fill.png'
import ShareModalContent from '../../component/share-modal-content.vue'
import { selectFile, download, formatTime } from '../../assets/util'
import { switchUser, getUser, login, userConnect } from '../../assets/user-connect'

const route = useRoute()
const router = useRouter()
const isShare = computed(() => route.path.startsWith('/share'))

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
  getList()
}

const toDetail = (id: number) => {
  router.push(`/editor/${id}`)
}

const onImport = async () => {
  const file = await selectFile()
  const reader = new FileReader()
  reader.readAsText(file)
  reader.onload = async function () {
    try {
      const json = JSON.parse(this.result as string)
      // 判断文件是否存在
      if (state.list.some(x => x.id === json.id)) {
        return Message.error(`【${json.filename}】已存在您的列表了呢，导入失败～`)
      }
      delete json.id
      await save(json)
      Message.success('导入成功')
      await getList()
      openListPanel()
    } catch (e) {
      Message.error(`${file.name} 格式错误，无法识别`)
    }
  }
  reader.onerror = function () {
    Message.error(`${file.name} 格式错误，无法识别`)
  }
}

const onExport = (item: Item) => {
  // 使用 File 保存文件
  const blob = new Blob([JSON.stringify(item)], { type: 'application/json' })
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  reader.onload = function () {
    download(item.filename, this.result as string)
  }
}

const onShare = async (data: IProcessState) => {
  const shareLink = `/share/${route.params.id}?user=${encodeURIComponent(getUser().name)}&uid=${getUser().id}`
  await Dialog({
    // @ts-ignore
    content: h(ShareModalContent, {
      url: shareLink,
      name: data.filename,
      route,
      edgeRect: calEdgeFromNodes(data.nodes)
    })
  })
}

const fileOperators = [
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
    action: async (data: IProcessState) => {
      const isEdit = !!route.params.id
      const dataId = await save(data, route.params.id as string)
      Message.success('保存成功')
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

const fileOperatorsShare = [
  {
    title: '查看原文件',
    icon: iconFile,
    action: async () => {
      let user = getUser()
      if (!user) {
        user = await login()
      }
      const data = await getDetail(+route.params.id, user.id)
      if (data) {
        toDetail(+route.params.id)
        Message.success('已进入编辑模式')
      } else {
        Message.error(`您没有该文件，可以联系【${route.query.user}】导出给您～`)
      }
    }
  }
]

const config = ref<IConfig>({
  isReadonly: () => isShare.value,
  toHome: () => {
    if (getUser()) {
      onAdd()
    } else {
      location.href = `${location.protocol}//${location.host}${location.pathname}`
    }
  },
  fileOperators
})

const {
  Process,
  initState,
  layoutSetScroll,
  // stateCanvasDataChange,
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

const onSwitchUser = () => {
  switchUser()
}

const getProcessDetail = async (id: string) => {
  const data = await getDetail<IProcessState>(+id)
  initState(data)
  scrollShapeToCenter(data)
}

// 滚动元素窗口居中
const scrollShapeToCenter = (data?: IProcessState) => {
  if (!data || !data.nodes.length) {
    layoutSetScroll(0, 0, true)
    return
  }
  const screenWidth = document.body.clientWidth
  const screenHeight = document.body.clientHeight
  const { width, left, height, top } = calEdgeFromNodes(data.nodes)
  // 水平方向
  if (width + left > screenWidth) {
    // 向左滚动
    const leftSafeDistance = 120
    if (width + leftSafeDistance > screenWidth) {
      console.log('left safe distance')
      layoutSetScroll(undefined, left - leftSafeDistance, true)
    } else {
      // 左右居中
      console.log('horizontal center')
      layoutSetScroll(undefined, left - (screenWidth - width) / 2, true)
    }
  } else {
    // do nothing
  }
  // 垂直方向
  if (height + top > screenHeight) {
    // 向左滚动
    const topSafeDistance = 60
    if (height + topSafeDistance > screenHeight) {
      console.log('top safe distance')
      layoutSetScroll(top - topSafeDistance, undefined, true)
    } else {
      // 左右居中
      console.log('vertical center')
      layoutSetScroll(top - (screenHeight - height) / 2, undefined,  true)
    }
  }
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
    scrollShapeToCenter()
  }
}, { immediate: true })

watchEffect(() => {
  config.value.fileOperators = isShare.value
      ? fileOperatorsShare
      : fileOperators
  if (isShare.value) {
    Dialog.close()
  }
})

onMounted(() => {
  getList()
  if (!route.params.id) {
    openListPanel()
  }
})
</script>

<template>
  <Process>
    <template #user>
      <span v-if="getUser()?.name" @click="onSwitchUser">
        <span style="margin-right: 10px">你好，{{ getUser()?.name }}</span>
        <img :src="iconTriangle" width="8">
      </span>
      <span v-if="route.query.user" style="margin-left: 10px">—— 来自{{ route.query.user }}的分享</span>
    </template>
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
@import '../../xprocess/var';
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
