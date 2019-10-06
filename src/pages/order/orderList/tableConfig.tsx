import React from 'react'

import { listType, goodsType } from './model';
import { columnConfigType } from './components/tableList';
import { orderType, orderStatus, refundStatus, cargoStatus } from './components/config'
import { Icon } from 'antd';

export const formatStatus = (status: number): null | string => {
  const result = orderStatus.filter(item => item.value == status)[0]
  if (result) {
    return result.label
  }
  return null
}

export const formatType = (type: number): null | string => {
  const result = orderType.filter(item => item.value == type)[0]
  if (result) {
    return result.label
  }
  return null
}

export const formatRefundStatus = (status: number): null | string => {
  const result = refundStatus.filter(item => item.value == status)[0]
  if (result) {
    return result.label
  }
  return '-'
}

export const formatCargoStatus = (status: number | undefined): null | string => {
  const result = cargoStatus.filter(item => item.value == status)[0]
  if (result) {
    return result.label
  }
  return '-'
}

export const contextColumn: (identity: string) => Array<columnConfigType<listType>> = (identity) => {

  const arr: Array<columnConfigType<listType>> = [
    {
      title: '收货人/联系电话',
      key: 'consignee',
      dataIndex: 'consignee',
      descIndex: 'phone',
      width: 90,
    },
    {
      title: '订单金额',
      key: 'orderPrice',
      width: 50,
      render: (record) => {
        return <span>￥{record.orderPrice}</span>
      }
    },
    {
      title: '订单类型',
      key: 'orderType',
      width: 50,
      render: (record) => {
        const type = formatType(record.orderType)
        return (
          <span>{type ? type : '-'}</span>
        )
      }
    },
    {
      title: '订单状态',
      key: 'orderStatus',
      width: 50,
      render: (record) => {
        const status = formatStatus(record.orderStatus)
        if (record.orderStatus === 25 && status) {
          return <div>
            <Icon type="bell" style={{ color: '#F5222D' }} />
            <span>{status}</span>
          </div>
        }
        return (
          <span>{status ? status : '未知'}</span>
        )
      }
    }
  ]

  const selfItem: columnConfigType<listType> = {
    title: '1688订单状态',
    width: 100,
    key: 'cargoStatus',
    render: (record) => {
      return <span style={{ color: '#F5222D' }}>{formatCargoStatus(record.cargoStatus)}</span>
    }
  }

  const otherItem: columnConfigType<listType> = {
    title: '操作',
    key: 'operation',
    width: 50,
    render: (record) => {
      return (
        <div></div>
      )
    }
  }


  if (identity === 'self') {
    arr.splice(3, 0, selfItem)
  } else {
    arr.push(otherItem)
  }
  return arr
}

export const goodsColumn: (identity: string) => Array<columnConfigType<goodsType>> = (identity) => {

  return [
    {
      title: '商品',
      key: 'goods',
      width: 200,
      avatar: {
        titleIndex: 'goodsTitle',
        descIndex: 'goodsId',
        imgIndex: 'goodsImg',
        descPrefix: 'ID: '
      }
    },
    {
      title: '规格',
      key: 'detail',
      width: 100,
      render: (record) => {
        return <div>
          <div>{formatSku(record.sku)}</div>
          {
            identity === 'self' ?
              <div>{record.skuId}</div> : null
          }
        </div>
      }
    },
    {
      title: '价格/数量',
      key: 'price',
      width: 50,
      dataIndex: 'price',
      descIndex: 'number',
      render: (record) => {
        return <div>
          <div>￥{record.price}</div>
          <div>{record.number}</div>
        </div>
      }
    },
    {
      title: '退款状态',
      key: 'refundOrder',
      width: 80,
      render: (record) => {
        if (record.refundDtoList) {
          return record.refundDtoList.reverse().map(item => {
            return <div><a>{formatRefundStatus(item.status)}</a></div>
          })
        }
        return <span></span>
      }
    }
  ]
}

export function formatSku(skuProperties: Array<{ v: string }>) {
  let str = '';
  if (skuProperties.length == 0) {
    str = '-';
  } else {
    skuProperties.forEach(item => {
      str += item.v + '，';
    })
    str = str.slice(0, str.length - 1);
  }

  return str;
}