<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { onCopy } from '../assets/util'
import { getUser } from '../assets/user-connect'
import { fileImgSave, fileImgGet } from '../assets/api'
import { Message } from '../xprocess/component/message'
import { toCanvas } from 'html-to-image'
import AV from 'leancloud-storage'
import { RouteLocationNormalizedLoaded } from 'vue-router'

const props = defineProps<{
  name: string
  url: string
  route: RouteLocationNormalizedLoaded,
  edgeRect: { left: number, top: number, bottom: number, right: number }
}>()
const shareLink = computed(() => `${location.protocol}//${location.host}${location.pathname}#${props.url}`)
const imgLink = computed(() =>
    `${location.protocol}//${location.host}${location.pathname}xprocess/img/${getUser().id}/${props.route.params.id}`.replace(':3000', import.meta.env.DEV ? ':9527' : '')
)
const filename = computed(() => `${props.name}.png`)
const fileImgGenData = ref(null)

const handleCopy = async (url: string) => {
  await onCopy(url)
  Message.success('复制成功')
}
const handleOpen = () => {
  window.open(shareLink.value)
}

const genLoading = ref(false)
const handleGenImage = async () => {
  if (genLoading.value) {
    return
  }
  genLoading.value = true
  const el = document.querySelector('.xprocess-canvas') as HTMLElement
  const canvas = await toCanvas(el, {
    // quality: 0.9,
    // style: {
    //   border: '1px #eeeee solid',
    //   borderRadius: '10px'
    // }
  })

  // 裁剪边角
  const newCanvas = document.createElement('canvas')
  const newCtx = newCanvas.getContext('2d')!
  const { left, top, bottom, right } = props.edgeRect
  const width = right - left
  const height = bottom - top
  const scale = canvas.width / el.offsetWidth
  const padding = 100

  // 得到图片的真实大小
  const canvasImageWidth = width * scale + padding * 2
  const canvasImageHeight = height * scale + padding * 2
  // 根据屏幕像素比缩放
  newCanvas.width = canvasImageWidth / devicePixelRatio
  newCanvas.height = canvasImageHeight / devicePixelRatio
  newCtx.drawImage(
      canvas,
      left * scale - padding,
      top * scale - padding,
      canvasImageWidth,
      canvasImageHeight,
      0,
      0,
      newCanvas.width,
      newCanvas.height
  )
  // 添加水印
  newCtx.fillStyle = '#999999'
  newCtx.font = `${14 * scale / devicePixelRatio}px system`
  newCtx.fillText(`${props.name} - @${getUser().name} 绘制于 XProcess`, padding / devicePixelRatio, padding / devicePixelRatio - 10)
  newCtx.strokeStyle = '#eeeeee'
  newCtx.strokeRect(0, 0, newCanvas.width, newCanvas.height)
  newCtx.lineJoin = 'round'
  const base64 = newCanvas.toDataURL('image/png')

  // const img = document.createElement('img')
  // img.src = base64
  // document.body.appendChild(img)

  const currentUser = AV.User.current()
  if (!currentUser) {
    await AV.User.logIn('jmingzi', 'ck.123456')
  }
  const avFile = await (new AV.File(filename.value, { base64: base64.split(',')[1] })).save({ keepFileName: true })
  const avUrl = avFile.toJSON().url
  fileImgGenData.value = await fileImgSave(props.route.params.id as string, avUrl)

  Message.success('生成链接成功')
  genLoading.value = false
}

watch(() => props.route.params.id, async (id) => {
  fileImgGenData.value = await fileImgGet(id as string)
}, { immediate: true })
</script>

<template>
  <div class="share-modal-content">
    <p>分享网页链接：</p>
    <div class="share-modal-content__input">
      <input type="text" :value="shareLink" readonly>
      <span @click="handleOpen">查看分享</span>
      <span @click="handleCopy(`Hi，${getUser().name}分享给你【${name}】，请注意查收~ ${shareLink}`)">复制分享</span>
    </div>
    <p style="margin-top: 50px;">分享图片链接：</p>
    <div class="share-modal-content__input">
      <input type="text" :value="fileImgGenData ? imgLink : '还未生成链接～'" readonly>
      <span @click="handleGenImage">{{ genLoading ? '生成中...' : fileImgGenData ? '重新生成' : '生成链接'  }}</span>
      <span v-if="fileImgGenData" @click="handleCopy(imgLink)">复制链接</span>
    </div>
  </div>
</template>

<style lang="less">
@import '../xprocess/var';
.share-modal-content {
  padding-bottom: 30px;
  &__input {
    display: flex;
    span {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      padding: 0 10px;
      background-color: @main-color;
      color: #fff;
      font-size: 12px;
      cursor: pointer;
      &:hover {
        background-color: rgba(@main-color, 0.7);
      }
      & + span {
        // border-left: 2px #fff solid;
        background-color: #ffffff;
        border: 1px @main-color solid;
        color: @main-color;
        &:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }
      }
    }
  }
  input {
    //width: 100%;
    display: block;
    flex-grow: 1;
    font: inherit;
    padding: 5px;
    border: 1px @border-color solid;
    background-color: @hover-bg;
    color: #898989;
    &:focus {
      outline: none;
    }
  }
}
</style>