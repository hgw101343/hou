/**
 * Routes:
 *   - ./src/pages/Authorized.tsx
 *
 */

import { Button, Card, Row, Spin, Col, Popconfirm, notification, Icon } from 'antd';
import React, { Component } from 'react';

import { Dispatch } from 'redux';
import { connect } from 'dva';
import { StateType, listType, goodsType } from './model';
import { GlobalModelState } from '@/models/global';
import styles from './style.less';

import SearchComponent, { searchPropsType } from './components/search';
import TableList, { TableListPropsType, rowConfigType } from './components/tableList';
import { contextColumn, goodsColumn, formatRefundStatus } from './tableConfig';
import SyncModal, { SyncModalPropsType } from './components/syncModal';
import router from 'umi/router';
import moment from 'moment';

interface orderListProps {
	orderList: StateType;
	dispatch: Dispatch<any>;
	loading: boolean;
	identity: string;
	syncModalLoading: boolean;
}

interface orderListState {}

@connect(
	({
		orderList,
		loading,
		global,
	}: {
		orderList: StateType;
		loading: {
			models: { [key: string]: boolean };
			effects: { [key: string]: boolean | undefined };
		};
		global: GlobalModelState;
	}) => ({
		orderList,
		loading: loading.models.orderList,
		identity: global.identity,
		syncModalLoading: loading.effects['orderList/getSyncOrder'],
	}),
)
class OrderList extends Component<orderListProps, orderListState> {
	componentDidMount() {
		this.props.dispatch({
			type: 'orderList/getSearchData',
			payload: {},
		});
	}

	componentWillUnmount() {
		this.props.dispatch({
			type: 'orderList/selectedRows',
			payload: {
				selectedRowKeys: [],
				showSelect: false,
			},
		});
	}

	render() {
		const {
			orderList: { searchData, list, pagination, syncModalShow, showSelect, selectedRowKeys },
			loading,
			dispatch,
			identity,
			syncModalLoading,
		} = this.props;

		const searchProps: searchPropsType = {
			searchData,
			identity,
			handleSearch(searchData: any) {
				dispatch({
					type: 'orderList/save',
					payload: {
						searchData,
					},
				});
				dispatch({
					type: 'orderList/savePagination',
					payload: {
						current: 1,
					},
				});
				dispatch({
					type: 'orderList/getSearchData',
					payload: {},
				});
			},
			handleResetSearch() {
				dispatch({
					type: 'orderList/save',
					payload: {
						searchData: {
							dateTime: [moment().subtract(30, 'days'), moment()],
						},
					},
				});
				dispatch({
					type: 'orderList/savePagination',
					payload: {
						current: 1,
					},
				});
				dispatch({
					type: 'orderList/getSearchData',
					payload: {},
				});
				dispatch({
					type: 'orderList/selectedRows',
					payload: {
						showSelect: false,
						selectedRowKeys: [],
					},
				});
			},
		};

		const syncModalProps = {
			show: syncModalShow,
			loading: syncModalLoading,
			submit(value: { orderId: string }) {
				dispatch({
					type: 'orderList/getSyncOrder',
					payload: value,
				});
			},
			close() {
				dispatch({
					type: 'orderList/hideSyncModal',
					payload: {},
				});
			},
		};

		const titleRender = (record: listType) => {
			return (
				<div className={styles.listTitle}>
					<div>
						<span>订单号：{record.orderId}</span>
						<span>下单时间：{record.createTime.replace(/-/gi, '/')}</span>
						{identity === 'self' && record.cargo ? (
							<>
								{record.cargo.id ? (
									<span>1688订单号：{record.cargo.id}</span>
								) : null}
								{record.cargo.account ? (
									<span>1688账号：{record.cargo.account}</span>
								) : null}
							</>
						) : null}
					</div>
					<div>
						{/* <a onClick={() => handleToDetail(record)}>查看详情</a> */}
						<a
							href={
								'/qu_elfront_service/order/orderList/detail?detailData=' +
								JSON.stringify(record)
							}
							target="_blank"
						>
							查看详情
						</a>
					</div>
				</div>
			);
		};

		const footerRender = (record: listType) => {
			return (
				<div className={styles.listFooter}>
					{record.failDesc ? (
						<div className={styles.remark}>
							<Icon
								type="exclamation-circle"
								theme="filled"
								style={{ color: '#FAAD14' }}
							/>{' '}
							<span>{record.failDesc}</span>
						</div>
					) : null}
				</div>
			);
		};

		const rowConfig: rowConfigType<listType, goodsType> = {
			title: titleRender,
			contextColumn: contextColumn(identity),
			goodsColumn: goodsColumn(identity),
			footer: footerRender,
		};

		const tableListProps: TableListPropsType<listType, goodsType> = {
			rowConfig: rowConfig,
			dataSource: list,
			pagination: {
				...pagination,
				onChange(page) {
					dispatch({
						type: 'orderList/changePage',
						payload: {
							current: page,
						},
					});
				},
				onShowSizeChange(current, size) {
					dispatch({
						type: 'orderList/changePage',
						payload: {
							pageSize: size,
							current: current,
						},
					});
				},
			},
			rowKey: record => record.orderId,
			rowSelection: {
				selectedRowKeys: selectedRowKeys,
				onChange(selectedRowKeys, selectedRows) {
					dispatch({
						type: 'orderList/selectedRows',
						payload: {
							selectedRowKeys,
						},
					});
				},
				selection: showSelect,
			},
		};

		function handleExport() {
			if (pagination.total && pagination.total > 10000) {
				notification.info({
					message: '导出订单数不能大于10000条！',
				});
			} else {
				dispatch({
					type: 'orderList/exportOrders',
					payload: {},
				});
			}
		}

		function handleSyncOrder() {
			dispatch({
				type: 'orderList/save',
				payload: {
					syncModalShow: true,
				},
			});
		}

		function handleBatchSelect(flage: boolean) {
			dispatch({
				type: 'orderList/selectedRows',
				payload: {
					showSelect: flage,
					selectedRowKeys: [],
				},
			});
		}

		function handleBatchOrder() {
			dispatch({
				type: 'orderList/batchOrder',
				payload: {},
			});
		}

		function handleToDetail(data: listType) {
			dispatch({
				type: 'orderList/save',
				payload: {
					detailData: data,
				},
			});
			router.push('/order/orderList/detail');
		}

		return (
			<div>
				<Spin spinning={loading}>
					<div className={styles.standardList}>
						<Card bordered={false}>
							<SearchComponent {...searchProps} />
						</Card>
						<Card bordered={false}>
							<Row type="flex" justify="space-between">
								<Col>
									<Button onClick={handleExport}>
										<Icon type="pic-right" />
										按搜索结果导出
									</Button>
									{identity === 'self' ? (
										<>
											{searchData.orderStatus === 20 ? (
												<Button onClick={() => handleBatchSelect(true)}>
													批量订货
												</Button>
											) : null}
											<Button onClick={handleSyncOrder}>
												<Icon type="pic-right" />
												实时同步有赞订单信息
											</Button>
										</>
									) : (
										<Button>
											<Icon type="pic-right" />
											批量发货
										</Button>
									)}
								</Col>
								<Col>
									{selectedRowKeys.length ? (
										<>
											<span style={{ marginRight: '10px' }}>
												共选择{selectedRowKeys.length}条
											</span>
											<Popconfirm
												title={`已选${selectedRowKeys.length}个订单，是否立即订货`}
												onConfirm={handleBatchOrder}
												okText="确定"
												cancelText="取消"
											>
												<Button>立即订货</Button>
											</Popconfirm>
											<Button onClick={() => handleBatchSelect(false)}>
												取消
											</Button>
										</>
									) : null}
								</Col>
							</Row>
							<Row>
								<TableList {...tableListProps} />
							</Row>
						</Card>
					</div>
				</Spin>
				<SyncModal {...syncModalProps} />
			</div>
		);
	}
}

export default OrderList;
