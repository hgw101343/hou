/* Routes:
*   - ./src/pages/Authorized.tsx
*
*/

import React, { Component, Fragment } from 'react';
import { Form, Card, Button, Modal, message, Tabs } from 'antd';
import { Dispatch } from 'redux';
import router from 'umi/router';
import { FormComponentProps } from 'antd/es/form';
import { SorterResult } from 'antd/es/table';
import { connect } from 'dva';
import { StateType, TableDataItem, TablePagination, SearchParams, TableListState } from './declaration';
import { GlobalModelState } from '@/models/global';
import StandardTable, { StandardTableColumnProps } from './components/StandardTable';
import SearchComponent, { searchPropsType } from './components/searchForm';
import CommodityEdit from './commodityEdit';
import { shutDownSource, issueSource, deleteSource } from './service';
import { getSourceDetail, createSource } from './commodityEdit/service';
import styles from './index.less';

const getValue = (obj: { [x: string]: string[] }) => Object.keys(obj).map(key => obj[key]).join(',');
const { TabPane } = Tabs;
const { confirm } = Modal;

interface TableListProps extends FormComponentProps {
	dispatch: Dispatch<any>;
	loading: boolean;
	commodityList: StateType;
	identity: string;
	statuses: string;
}

@connect(
	({ commodityList, loading, global }: {
		commodityList: StateType;
		loading: {
			effects: { [key: string]: boolean }
		};
		global: GlobalModelState
	}) => ({
		commodityList,
		loading: loading.effects['commodityList/listSource'],
		identity: global.identity
	}),
)

class CommodityList extends Component<TableListProps, TableListState> {
	tableListRef: any = {};
	searchRef: any = {};

	state: TableListState = {
		selectedRows: [],
		formValues: {},
		sourceId: ''
	};

	columns: StandardTableColumnProps[] = [
		{
			title: '商品',
			dataIndex: 'sourceImg',
			width: 360,
			render: (text, record, index) => {
				return (
					<div className={`flex-start ${styles.tableShop}`} style={{ minWidth: '360px' }}>
						<img className={styles.tableImg} src={record.sourceImg} alt="" />
						<div className={`flex-column ${styles.tableShopName}`}>
							<p>{record.sourceName} </p>
							<p>ID：{record.sourceId} </p>
						</div>
					</div>
				)
			}
		},
		{
			title: '商家编码',
			dataIndex: 'storeSourceId',
			width: 120
		},
		{
			title: '销售价',
			dataIndex: 'sourcePrice',
			width: 100,
			render: (text, record) => (
				<div style={{ minWidth: '100px' }}>
					{text}
				</div>
			)
		},
		{
			title: '成本价',
			dataIndex: 'costPrice',
			width: 100,
			render: (text, record) => (
				<div style={{ minWidth: '100px' }}>
					{text}
				</div>
			)
		},
		{
			title: '库存',
			dataIndex: 'inventory',
			width: 100,
			render: (text, record) => (
				<div style={{ minWidth: '100px' }}>
					{text}
				</div>
			)
		},
		{
			title: '30天销量',
			dataIndex: 'sellAmountOf30Day',
			width: 100,
			render: (text, record) => (
				<div style={{ minWidth: '100px' }}>
					{text}
				</div>
			)
		},
		{
			title: "上架时间",
			dataIndex: "issueTime",
			render: (text, record) => (
				<div style={{ minWidth: '140px' }}>
					{text}
				</div>
			)
		},
		{
			title: "操作",
			fixed: 'right',
			width: 100,
			render: (text, record) => (
				<div>
					<a onClick={() => { this.goCommodityEdit(record.sourceId) }} style={{ marginRight: '20px' }}>编辑</a>
					<a onClick={() => { this.handleCopy(record) }}>复制</a>
				</div>
			)
		}
	];

	componentDidMount() {
		const { dispatch } = this.props;

		dispatch({
			type: 'commodityList/getSearchData',
		});

		this.init();
	}

	init = () => {

	}

	handleSelectRows = (rows: TableDataItem[]) => {
		this.setState({
			selectedRows: rows,
		});
	};

	initTableRef = (ref) => {
		this.tableListRef = ref;
	};

	clearSelect = () => {
		this.tableListRef.cleanSelectedKeys();
	}

	handleStandardTableChange = (
		pagination: Partial<TablePagination>,
		filtersArg: Record<keyof TableDataItem, string[]>,
		sorter: SorterResult<TableDataItem>
	) => {
		const { dispatch } = this.props;
		const { formValues } = this.state;

		const filters = Object.keys(filtersArg).reduce((obj, key) => {
			const newObj = { ...obj };
			newObj[key] = getValue(filtersArg[key]);
			return newObj;
		}, {});

		const params: Partial<SearchParams> = {
			current: pagination.current,
			pageSize: pagination.pageSize,
			...formValues,
			...filters,
		};

		dispatch({
			type: 'commodityList/savePagination',
			payload: params,
		});
	};

	handleTabChange = (statuses) => {
		this.clearSelect();
		const { dispatch } = this.props;
		dispatch({
			type: 'commodityList/save',
			payload: {
				statuses
			}
		})
		if (statuses == '0') {
			let issueTimeColumns = {
				title: "上架时间",
				dataIndex: "issueTime",
				render: (text, record) => (
					<div style={{ width: '140px' }}>
						{text}
					</div>
				)
			}
			this.columns.splice(6, 1, issueTimeColumns);
		} else {
			let createTimeColumns = {
				title: "创建时间",
				dataIndex: "createTime",
				render: (text, record) => (
					<div style={{ width: '140px' }}>
						{text}
					</div>
				)
			}
			this.columns.splice(6, 1, createTimeColumns);
		}
		this.searchRef.handleReset();
	}

	handleStatuses = () => {
		let { selectedRows } = this.state;
		const { commodityList: {
			statuses
		}, dispatch } = this.props;

		if (selectedRows.length == 0) {
			return message.warning('请先选择商品');
		}

		let sourceIdArr: any = [];
		selectedRows.forEach((item: any) => {
			sourceIdArr.push(item.sourceId)
		})

		let text: string = statuses == '2' ? '上架' : '下架';
		let _this = this;
		confirm({
			title: "提示",
			content: `是否确认${text}选中的 ${sourceIdArr.length} 个商品`,
			cancelText: '取消',
			okText: text,
			onOk() {
				return new Promise((resolve, reject) => {
					if (statuses == '2') {
						issueSource({ sourceId: sourceIdArr }).then(() => {
							message.success(`${text}成功`);
							dispatch({
								type: 'commodityList/getSearchData',
								payload: {}
							})
							_this.clearSelect();
							resolve()
						});
					} else {
						shutDownSource({ sourceId: sourceIdArr }).then(() => {
							message.success(`${text}成功`);
							dispatch({
								type: 'commodityList/getSearchData',
								payload: {}
							})
							_this.clearSelect();
							resolve()
						});
					}

				})
			},
			onCancel() { },
		});
	}

	handleDelete = () => {
		let { selectedRows } = this.state;
		const { dispatch } = this.props;

		if (selectedRows.length == 0) {
			return message.warning('请先选择商品');
		}

		let sourceIdArr: any = [];
		selectedRows.forEach((item: any) => {
			sourceIdArr.push(item.sourceId)
		})

		let _this = this;
		confirm({
			title: "提示",
			content: `是否确认删除选中的 ${sourceIdArr.length} 个商品`,
			cancelText: '取消',
			okText: '删除',
			onOk() {
				return new Promise((resolve, reject) => {
					deleteSource({ sourceId: sourceIdArr }).then(() => {
						message.success(`删除成功`);
						dispatch({
							type: 'commodityList/getSearchData',
							payload: {}
						})
						_this.clearSelect();
						resolve()
					});
				})
			},
			onCancel() { },
		})
	}

	handleCopy = (row) => {
		let _this = this;
		confirm({
			title: "提示",
			content: `是否复制该商品到仓库中？`,
			cancelText: '取消',
			okText: '复制',
			onOk() {
				return new Promise((resolve) => {
					_this.handleCopyData(row, resolve);
				})
			},
			onCancel() { },
		})
	}

	handleCopyData = (row, resolve) => {
		getSourceDetail({ sourceId: row.sourceId }).then(res => {
			let data = res.data.responseFuture.data;
			data.skuParams.forEach(item => {
				delete item.skuId
			})

			let attributeParams = [];
			if(data.categoryAttributes) {
				data.categoryAttributes.forEach(item => {
					let obj = {
						id: item.attributeId,
						valIds: item.attributeVals.map(child => child.valId)
					}
					attributeParams.push(obj);
				})
			}

			let param = {
				sourceName: data.sourceName,
				sourceImg: data.sourceImg,
				sellPoint: data.sellPoint,
				primaryCategoryId: data.primaryCategoryId,
				secondaryCategoryId: data.secondaryCategoryId,
				thirdlyCategoryId: data.thirdlyCategoryId,
				attributeParams: attributeParams,
				minBuyAmount: data.minBuyAmount,
				combinationAmount: data.combinationAmount,
				storeSourceId: data.storeSourceId,
				sourcePrice: data.sourcePrice,
				costPrice: data.costPrice,
				inventory: data.inventory,
				originPrice: data.originPrice,
				inventorySubtractType: data.inventorySubtractType,
				skuParams: data.skuParams,
				originSourceDesc: data.originSourceDesc,
				sourceDesc: data.sourceDesc,
				postFee: data.postFee,
				postFeeType: data.postFeeType,
				postFeeTemplateId: data.postFeeTemplateId,
				issue: false,
				sourceRange: 0,
				storeId: 1
			};

			let reqData = {
				"param": param
			}

			createSource(reqData).then(res => {
				if (res && res.data.code === 0) {
					message.success("复制成功, 已放入待上架仓库");
					let { dispatch } = this.props;
					dispatch({
						type: 'commodityList/getSearchData',
					});
				} else {
					message.error("复制失败");
				}
			}).finally(() => {
				resolve();
			})
		});
	}

	goCommodityEdit = (sourceId = '') => {
		let host = location.host;
		let protocol = location.protocol + '//';
		let base = '/qu_elfront_service';
		let url = `${protocol}${host}${base}/commodity/commodityList/commodityEdit`;
		if(sourceId) {
			url = `${url}?sourceId=${sourceId}`
		}
        window.open(url, '_blank');
	}

	render() {
		const {
			commodityList: {
				searchData,
				tableData,
				statuses,
				pagination
			},
			loading,
			dispatch,
			identity,
			children
		} = this.props;

		const { selectedRows } = this.state;

		const searchProps: searchPropsType = {
			statuses,
			searchData,
			identity,
			handleSearch(searchData: SearchParams) {
				dispatch({
					type: 'commodityList/save',
					payload: {
						searchData
					}
				})
				dispatch({
					type: 'commodityList/savePagination',
					payload: {
						current: 1
					}
				})
			},
			handleFormReset() {
				dispatch({
					type: 'commodityList/save',
					payload: {
						searchData: {}
					}
				})

				dispatch({
					type: 'commodityList/savePagination',
					payload: {
						current: 1
					}
				})
			}
		}

		const data = {
			tableData,
			pagination
		}

		return (
			<Fragment>
				<div className={styles.commodityList}
				>
					<div className={styles.tab}>
						<Tabs defaultActiveKey={statuses} onChange={this.handleTabChange}>
							<TabPane tab="已上架" key="0">
							</TabPane>
							<TabPane tab="待上架" key="2">
							</TabPane>
						</Tabs>
					</div>

					<Card bordered={false}>
						<SearchComponent {...searchProps} wrappedComponentRef={ref => this.searchRef = ref} />
					</Card>

					<Card bordered={false}>
						<div className={styles.tableList}>
							<div className={styles.tableListOperator}>
								<span>
									<Button type="primary" onClick={() => { this.goCommodityEdit('') }}>发布商品</Button>
									<Button onClick={this.handleStatuses}>批量{statuses == '0' ? '下架' : '上架'}</Button>
									{statuses == '2' && <Button onClick={this.handleDelete}>批量删除</Button>}
								</span>
							</div>

							<StandardTable
								onRef={this.initTableRef}
								rowKey='id'
								selectedRows={selectedRows}
								loading={loading}
								data={data}
								columns={this.columns}
								onSelectRow={this.handleSelectRows}
								onChange={this.handleStandardTableChange}
							/>
						</div>
					</Card>
				</div>
			</Fragment>
		);
	}
}

export default Form.create<TableListProps>()(CommodityList);
