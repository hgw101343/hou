import { Reducer } from 'redux';
import { Effect } from 'dva';
import { PaginationConfig } from 'antd/es/pagination';
import {
	query,
	save,
	updateById,
	deleteById,
	setDefaultReceive,
	setDefaultSend,
	getSelectAddress,
} from './service';
import { CascaderOptionType } from 'antd/es/cascader';
import route from 'mock/route';
import router from 'umi/router';

export interface listType {
	defaultSendAddress: boolean;
	defaultReceiveAddress: boolean;
	contact: string;
	area: string;
	street: string;
	phone: string;
	telephone: string;
	updateTime: string;
	remark: string;
	type: number;
	id: number;
}

export const defaultColumn: Array<string> = [
	'contact',
	'area',
	'street',
	'phone',
	'updateTime',
	'remark',
	'type',
];

export interface areaType extends CascaderOptionType {
	value: string;
	label: string;
	id: number;
	children?: Array<areaType>;
}

export interface StateType {
	list: Array<listType>;
	columnItems: Array<string>;
	pagination: PaginationConfig;
	storeId: number;
	tableShowModal: boolean;
	modal: boolean;
	areaList: Array<areaType>;
	detailTitle: string;
	detailData: listType | null;
	submit: Function;
}

export interface ModelType {
	namespace: string;
	state: StateType;
	effects: {
		getPaginationData: Effect;
		query: Effect;
		updateDefaultAddress: Effect;
		deleteAddress: Effect;
		changePage: Effect;
		getAreaList: Effect;
		addAddress: Effect;
		updateAddress: Effect;
	};
	reducers: {
		save: Reducer<StateType>;
		savePagination: Reducer<StateType>;
	};
}

const defaultState: StateType = {
	list: [],
	columnItems: defaultColumn,
	pagination: {
		current: 1,
		pageSize: 50,
	},
	storeId: 1,
	tableShowModal: false,
	modal: false,
	areaList: [],
	detailTitle: '',
	detailData: null,
	submit: () => {},
};

const Model: ModelType = {
	namespace: 'addressManage',
	state: defaultState,
	effects: {
		*getPaginationData({}, { select, put }) {
			const addressManage = yield select(
				({ addressManage }: { addressManage: StateType }) => addressManage,
			);
			yield put({
				type: 'query',
				payload: {
					pageNo: addressManage.pagination.current,
					pageSize: addressManage.pagination.pageSize,
					storeId: addressManage.storeId,
				},
			});
		},
		*query({ payload }, { call, put }) {
			const data = yield call(query, payload);
			yield put({
				type: 'save',
				payload: {
					list: data.data.totalDatas,
				},
			});
			yield put({
				type: 'savePagination',
				payload: {
					current: data.data.pageNo,
					total: data.data.totalCount,
				},
			});
		},
		*changePage({ payload }, { put }) {
			yield put({
				type: 'savePagination',
				payload: payload,
			});
			yield put({
				type: 'getSearchData',
				payload: {},
			});
		},
		*updateDefaultAddress({ payload }, { call, put }) {
			if (payload.key === 'defaultSendAddress') {
				yield call(setDefaultSend, { id: payload.id });
			} else {
				yield call(setDefaultReceive, { id: payload.id });
			}
		},
		*deleteAddress({ payload }, { call, put, select }) {
			// const list: listType[] = yield select(({ addressManage }: { addressManage: StateType }) => addressManage.list);
			yield call(deleteById, { id: payload.id });
			yield put({
				type: 'save',
				payload: {
					modal: false,
				},
			});
			yield put({
				type: 'getPaginationData',
				payload: {},
			});

			// if (list.filter(item => item.id === payload.id).every(item => item.defaultReceiveAddress || item.defaultSendAddress)) {
			//   const item = list.find(item => item.defaultSendAddress || item.defaultReceiveAddress)
			//   if (item) {
			//     const defaultId = list[list.indexOf(item) + 1] ? list[list.indexOf(item) + 1].id : undefined
			//     if (defaultId) {
			//       if (item.defaultReceiveAddress && item.defaultSendAddress) {
			//         yield call(setDefaultReceive, { id: defaultId })
			//         yield call(setDefaultSend, { id: defaultId })
			//       } else if (item.defaultReceiveAddress) {
			//         yield call(setDefaultReceive, { id: defaultId })
			//       } else {
			//         yield call(setDefaultSend, { id: defaultId })
			//       }
			//     }
			//     yield put({
			//       type: 'getPaginationData',
			//       payload: {}
			//     })
			//     yield put({
			//       type: 'save',
			//       payload: {
			//         modal: false
			//       }
			//     })
			//   }
			// } else {
			//   yield put({
			//     type: 'getPaginationData',
			//     payload: {}
			//   })
			//   yield put({
			//     type: 'save',
			//     payload: {
			//       modal: false
			//     }
			//   })
			// }
		},
		*getAreaList({ payload }, { call, put }) {
			const data = yield call(getSelectAddress, { parentId: payload.id });
			yield put({
				type: 'save',
				payload: {
					areaList: data.data.map((item: { id: number; name: string }) => ({
						label: item.name,
						value: item.name,
						id: item.id,
						isLeaf: false,
					})),
				},
			});
		},
		*addAddress({ payload }, { call }) {
			yield call(save, { storeId: 1, ...payload });
			router.push('/logisticsManage/address');
		},
		*updateAddress({ payload }, { call }) {
			yield call(updateById, payload);
			router.push('/logisticsManage/address');
		},
	},
	reducers: {
		save(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
		savePagination(state = defaultState, { payload }) {
			const pagination = Object.assign({}, state.pagination, payload);
			return {
				...state,
				pagination,
			};
		},
	},
};

export default Model;
