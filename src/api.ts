import axios from 'axios'
import { State } from './xprocess/editor/state'
import { Message } from './xprocess/component/message'

export type ApiResult<T = any> = { success: boolean, data: T }

export async function save (editorStateRaw: State, fileId?: string) {
  if (!editorStateRaw.nodes.length) {
    Message.error('请添加内容再保存')
    return
  }
  if (!editorStateRaw.filename.trim()) {
    Message.error('请输入文件名')
    return
  }
  const res = await axios.post<ApiResult<{ id: number }>>('/xprocess/save', {
    id: fileId ? +fileId : undefined,
    nodes: editorStateRaw.nodes,
    lines: editorStateRaw.lines,
    filename: editorStateRaw.filename
  })
  const { data: { success, data } } = res
  if (success) {
    return data.id
  } else {
    // @ts-ignore
    Message.error(data)
  }
}

export async function share (editorStateRaw: State) {

}

export async function getDetail<T = any> (id: number) {
  const res = await axios.get<ApiResult<T>>('/xprocess/detail', { params: { id } })
  return res.data.data
}

export async function deleteById (id: number) {
  await axios.post('/xprocess/delete', { id })
}

export async function getUserList<T = any> () {
  const res = await axios.get<ApiResult<T>>('/xprocess/list')
  // if (res.data.success) {
  //   state.list = res.data
  // }
  return res.data.data
}
