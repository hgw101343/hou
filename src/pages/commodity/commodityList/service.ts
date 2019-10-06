import request from '@/utils/request';

import { SearchParams, CategoryParams } from './declaration';

function formatData (data: any) {
    let obj = {
        "sourceType": 5,
        "productType": 1
    }
    return Object.assign(obj, data)
}

// 获取商品列表接口
export function listSource(data: SearchParams) {
    return request({
        api: 'goodsManagerController/listSource',
        method: 'post',
        data: formatData(data)
    })
}

// 查询商品的总数接口
export function countSource(data: SearchParams) {
    return request({
        api: 'goodsManagerController/countSource',
        method: 'post',
        data: formatData(data)
    })
}

// 下架商品接口
export function shutDownSource(data: {sourceId:string[]}) {
    return request({
        api: 'goodsManagerController/shutDownSource',
        method: 'post',
        data: formatData(data)
    })
}

// 上架商品接口
export function issueSource(data: {sourceId:string[]}) {
    return request({
        api: 'goodsManagerController/issueSource',
        method: 'post',
        data: formatData(data)
    })
}

// 删除商品接口
export function deleteSource(data: {sourceId:string[]}) {
    return request({
        api: 'goodsManagerController/deleteSource',
        method: 'post',
        data: formatData(data)
    })
}


// 查询类目全部
export function listAllCategoryOf(data: {}) {
    return request({
        api: 'goodsManagerController/listAllCategoryOf',
        method: 'post',
        data: data
    })
}

// 查询根类目
export function listRootCategory(data: {}) {
    return request({
        api: 'goodsManagerController/listRootCategory',
        method: 'post',
        data: data
    })
}

// 查询子类目
export function listSubCategory(data: CategoryParams) {
    return request({
        api: 'goodsManagerController/listSubCategory',
        method: 'post',
        data: data
    })
}
