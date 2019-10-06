/**
 * Routes:
 *   - ./src/pages/Authorized.tsx
 *
 */

import React, { useEffect } from 'react'
import { Card, Row, Col, Tabs, List } from 'antd'
import { connect } from 'dva'
import TableCard, { TableListPropsType, columnConfigType } from '../components/tableList'
import { listType, StateType, goodsType } from "../model"
import { CommonUtils } from "@/utils/utils"
import { formatStatus, formatType } from '../tableConfig'
import styles from './index.less'
import router from 'umi/router'
import { formatSku, formatRefundStatus } from '../tableConfig'
import { GlobalModelState } from '@/models/global'

const { TabPane } = Tabs

export interface orderDetailPropsType {
	orderDetail: listType,
	identity: string
}

function formatData(obj: Object, key: string) { //格式化
	let value = CommonUtils.getDeepObj(obj, key);
	if (value === 0 || value === '0') {
		return value
	}
	return value ? value : '-';
}

const OrderDetail = (props: orderDetailPropsType) => {

	const {
		orderDetail,
		identity
	} = props

	if (orderDetail === undefined) {
		router.push('/order/orderList')
		return null;
	}
	const goodsColumn: Array<columnConfigType<goodsType>> = [
		{
			title: '商品规格',
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
			title: '',
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
			title: '价格',
			key: 'price',
			width: 30,
			dataIndex: 'price',
		},
		{
			title: '数量',
			key: 'number',
			width: 30,
			dataIndex: 'number',
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
		},
		{
			title: '发货状态',
			key: 'sendType',
			width: 30,
			dataIndex: 'sendType',
		},
	]

	const tableCardProps: TableListPropsType<listType, goodsType> = {
		dataSource: [orderDetail],
		rowSelection: {
			selection: false
		},
		rowKey: (record) => (record.orderId),
		pagination: false,
		rowConfig: {
			goodsColumn,
			title: (record) => {
				return (
					<div className={styles.listTitle}>
						<span>下单时间: {record.createTime.replace(/-/gi, '/')}</span>
					</div>
				)
			}
		}
	}

	return (
		<Card bordered={false}>
			<div className={styles.title}>订单详情</div>
			<Row type="flex" justify="space-around" align="top" gutter={24} style={{ marginBottom: '20px' }}>
				<Col span={9}>
					<Card className={styles.card}>
						<div>订单号 :  {formatData(orderDetail, 'orderId')}</div>
						<div>订单类型 :  {formatType(orderDetail.orderType)}</div>
						<div>订单状态 :  {formatStatus(orderDetail.orderStatus)}</div>
						<div>支付方式 :  {formatData(orderDetail, 'payWay')}</div>
						<div>下单时间 :  {formatData(orderDetail, 'createTime').replace(/-/gi, '/')}</div>
					</Card>
				</Col>
				<Col span={6}>
					<Card className={styles.card}>
						<div>商品总价 :  {formatData(orderDetail, 'orderPrice')}</div>
						<div>运费 :  {formatData(orderDetail, 'postFee')}</div>
						<div className={styles.price}>订单金额 :  <span>{formatData(orderDetail, 'orderPrice')}</span></div>
					</Card>
				</Col>
				<Col span={9}>
					<Card className={styles.card}>
						<div>收货人 :  {formatData(orderDetail, 'consignee')}</div>
						<div>联系电话 :  {formatData(orderDetail, 'phone')}</div>
						<div>收货地址 :&nbsp;&nbsp;
						{
								formatData(orderDetail, 'address.deliveryProvince') + '/' +
								formatData(orderDetail, 'address.deliveryCity') + '/' +
								formatData(orderDetail, 'address.deliveryDistrict')
							}
							<div>{formatData(orderDetail, 'address.deliveryAddress')}</div>
						</div>
					</Card>
				</Col>
			</Row>
			<Row style={{ marginBottom: '20px' }}>
				<TableCard {...tableCardProps} />
			</Row>
			<Row style={{ marginBottom: '20px' }}>
				<List
					bordered
					className={styles.list}
					dataSource={["订单状态", new Date().Format("yyyy/MM/dd HH:mm:ss") + ' 1688订单状态变为“已发货”', new Date().Format("yyyy/MM/dd HH:mm:ss") + ' 1688订单状态变为“代付款”']}
					renderItem={(item, index) => {
						return <List.Item>{item}</List.Item>
					}}
				/>
			</Row>
			<Row>
				{
					orderDetail.cargo ? (
						<Card bordered className={styles.tab}>
							<Tabs>
								<TabPane
									tab={`包裹1`}
								>
									{
										identity === "self" ?
											<p>1688订单号 :  {orderDetail.cargo.id}</p> : null
									}
									<p>物流公司 :  暂无</p>
									<p>物流订单 :  暂无</p>
									<p>物流状态 :  暂无</p>
								</TabPane>
							</Tabs>
						</Card>
					) : null
				}
			</Row>
		</Card>
	)
}

function mapStateFromProps({ orderList, global }: { orderList: StateType, global: GlobalModelState }) {
	return {
		orderDetail: orderList.detailData,
		identity: global.identity
	}
}

export default connect(mapStateFromProps)(OrderDetail)