import { Reducer } from 'redux';
import { Effect } from 'dva';
import {
	query,
	getAllAddress,
	save,
	update_template,
	delete_template,
	delete_delivery,
	update_delivery,
	add_delivery,
} from './service';
import { PaginationConfig } from 'antd/es/pagination';
import { notification, message } from 'antd';
export interface goodsType {
	goodsImg: string;
	goodsTitle: string;
	goodsId: string;
	price: number;
	number: number;
	rejectStatus: string;
}
export interface listType {
	orderId: string;
	createTime: string;
	goods: goodsType[];
	consignee: string;
	phone: string;
	orderPrice: number;
	orderType: number;
	orderStatus: number;
}
export interface StateType {
	list: listType[];
	AllAddress: Array<any>;
	pagination: PaginationConfig;
	deleteModal: boolean;
	selectAddressModel: boolean;
	delDelivery: boolean;
	isEdit: boolean;
}

export interface ModelType {
	namespace: string;
	state: StateType;
	effects: {
		getFreight: Effect;
		savetemplate: Effect;
		deleteTemplate: Effect;
	};
	reducers: {
		save1: Reducer<StateType>;
	};
}
const Model: ModelType = {
	namespace: 'freight',
	state: {
		list: [],
		AllAddress: [],
		pagination: {
			pageNo: 1,
			pageSize: 50,
			pageTotal: 11,
			storeId: 1,
		},
		// 删除弹窗
		deleteModal: false,
		// 选择地区弹窗
		selectAddressModel: false,
		// 编辑页面
		isEdit: false,
		delDelivery: false,
	},
	effects: {
		*getFreight({ }, { select, call, put }) {
			const pagination = yield select(({ freight }: any) => freight.pagination);
			console.log('运费模板', pagination);
			const data = yield call(query, pagination);
			console.log('我是运费模板', data);
			// 获取所有地址
			const data2 = yield call(getAllAddress, {});
			console.log('获取所有地址', data2);
			console.log('亮了', data.data.totalDatas);
			yield put({
				type: 'save1',
				payload: {
					AllAddress: data2.data,
					list: data.data.totalDatas.map((item: any) => {
						return {
							deliveryDetailList: item.deliveryDetailList,
							templateId: item.templateId,
							templateName: item.templateName,
							updateTime: item.updateTime,
							storeId: item.storeId,
						};
					}),
					pageNo: data.data.pageNo,
					pageSize: data.data.pageSize,
					totalCount: data.data.totalCount,
				},
			});
		},
		*saveTemplate({ payload }, { call, put }) {
			const data = yield call(save, payload);
			console.log('保存模板参数', data, payload);
			message.success('保存成功');
		},
		*deleteDelivery({ payload }, { call, put }) {
			console.log(payload, '参数');
			const data = yield call(delete_delivery, payload);
			notification.open({
				message: '删除成功',
			});
			yield put({
				type: 'getFreight',
				payload: {},
			});
		},
		*addDelivery({ payload }, { call, put }) {
			console.log(payload);
			const data = yield call(add_delivery, payload);
			console.log('添加状态', data);
		},
		*updateDelivery({ payload }, { call, put }) {
			console.log(payload, '参数');
			const data = yield call(update_delivery, payload);
			// console.log(data, payload, '更新');
			// message.success('更新成功');
		},
		*deleteTemplate({ payload }, { call, put, select }) {
			console.log('怎么');
			console.log(payload, '参数');
			const data = yield call(delete_template, payload);
			console.log(data, 'yuqing');
			yield put({
				type: 'save1',
				payload: {
					deleteModal: false,
				},
			});
			notification.open({
				message: '删除成功',
			});
		},
	},
	reducers: {
		// 讲数据保存到仓库
		save1(state, { payload }) {
			console.log('保存', payload);
			return {
				...state,
				...payload,
			};
		},
	},
};
export default Model;
