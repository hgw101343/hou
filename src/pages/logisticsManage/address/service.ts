import request from '@/utils/request';

export async function query(data: any) {
  return request({
    api: 'address/list_for_page',
    method: 'post',
    data: data,
  })
}

export async function save(data: any) {
  return request({
    api: 'address/save',
    method: 'post',
    data: data
  })
}


export function updateById(data: any) {
  return request({
    api: 'address/updateById',
    method: 'post',
    data: data
  })
}

export function deleteById(data: any) {
  return request({
    api: 'address/deleteById',
    method: 'post',
    data: data
  })
}

export function setDefaultSend(data: any) {
  return request({
    api: 'address/set_default_send',
    method: 'post',
    data: data
  })
}

export function setDefaultReceive(data: any) {
  return request({
    api: 'address/set_default_receive',
    method: 'post',
    data: data
  })
}

export function getSelectAddress(data: any) {
  return request({
    api: 'address/getSelectAddress',
    method: 'post',
    data: data
  })
}