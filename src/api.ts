import axios from 'axios'
import { State } from './xprocess/editor/state'

export type ApiResult<T = any> = { success: boolean, data: T }

export async function save (editorStateRaw: State, fileId?: string) {
  const res = await axios.post<ApiResult<{ id: number }>>('/xprocess/save', {
    id: fileId ? +fileId : undefined,
    nodes: editorStateRaw.nodes,
    lines: editorStateRaw.lines,
    filename: editorStateRaw.filename
  })
  const { data: { success, data } } = res
  if (success) {
    return data.id
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
