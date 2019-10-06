import { Model } from 'dva';
import { getValidation, applyStay, save, getSelectAddress } from './service';
import { notification } from 'antd';
import { CascaderOptionType } from 'antd/es/cascader';
import { router } from 'umi';
import transformData from './enterprise/config'
import { CommonUtils } from '@/utils/utils'

export interface labelType {
	label: string;
	value: string;
}

export interface areaType extends CascaderOptionType {
	value: string;
	label: string;
	id: number;
	children?: Array<areaType>;
}

export interface stateType {
	applyType: number | null;
	categoryList: Array<labelType>;
	areaList: Array<areaType>;
	storeData?: object;
	verCode?: number;
	phone?: number;
}

export interface modelType extends Model {
	state: stateType;
}

const defaultState: stateType = {
	applyType: null,
	categoryList: [
		{
			label: '类目',
			value: '类目',
		},
	],
	areaList: [],

};


const Model: modelType = {
	namespace: 'register',
	state: defaultState,
	subscriptions: {
		setup({ history, dispatch }) {
			history.listen(location => {
				if (/\/user\/register\/.+/.test(location.pathname)) {
					dispatch({
						type: 'authory',
						payload: {
							query: location.query,
						},
					});
				}
			});
		},
	},
	effects: {
		*authory({ payload }, { put, select }) {
			const query = payload.query
			if (query) {
				if (query.kind && query.kind === 'update') {
					const storeData = sessionStorage.getItem('storeData')
					if (storeData !== null) {
						const data = JSON.parse(storeData)
						const applyType = parseInt(data.storeInfoReq.storeType)
						yield put({
							type: 'save',
							payload: {
								applyType,
								storeData: transformData(data),
								phone: data.phone
							},
						});
						if (applyType > 20) {
							yield put({
								type: 'setSelectedArea',
								payload: {
									address: data.companyInfoReq.regAddr
								}
							})
							router.push({
								pathname: '/user/register/enterprise',
								query: {
									type: applyType
								}
							})
						} else {
							router.push({
								pathname: '/user/register/personal',
								query: {
									type: applyType
								}
							})
						}
					}
				} else if (query.type) {
					const phone = yield select(({ register }: { register: stateType }) => register.phone)
					if (phone) {
						yield put({
							type: 'save',
							payload: {
								applyType: parseInt(query.type),
							},
						});
					} else {
						router.push('/user/register');
					}
				}
			} else {
				router.push('/user/register');
			}
		},
		*getValidation({ payload }, { call, put }) {
			yield call(getValidation, payload);
			notification.info({
				message: '验证码已发送，请注意查收',
			});
		},
		*register({ payload }, { call, put }) {
			yield call(applyStay, payload);
			yield put({
				type: 'save',
				payload: {
					verCode: payload.verCode,
					phone: payload.phone
				}
			})
			router.push('/user/register/storeTypeRoute');
		},
		*applyStore({ payload }, { call, put }) {
			yield call(save, payload);
			notification.info({
				message: '创建成功，请登录',
			});
			yield put({
				type: 'save',
				payload: {
					...defaultState,
					storeData: undefined,
					verCode: undefined,
					phone: undefined
				}
			})
			router.push('/user/login');
		},
		*getAreaList({ payload }, { call, put }) {
			const data = yield call(getSelectAddress, { parentId: payload.parentId });
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
		* setSelectedArea({ payload }, { call, put, select }) {
			let result = [];
			let addressList = []
			const address = payload.address;
			const province = yield call(getSelectAddress, { parentId: 0 })
			addressList = province.data.map((item: { id: number; name: string }) => ({
				label: item.name,
				value: item.name,
				id: item.id,
				isLeaf: false,
			}));
			result = addressList;
			const provinceId = addressList.filter(item => item.value === address[0])[0].id
			const city = yield call(getSelectAddress, { parentId: provinceId });
			addressList = city.data.map((item: { id: number; name: string }) => ({
				label: item.name,
				value: item.name,
				id: item.id,
				isLeaf: false,
			}));
			result = CommonUtils.insertValueToArr(result, provinceId, 'id', 'children', addressList)
			const cityId = addressList.filter(item => item.value === address[1])[0].id
			const county = yield call(getSelectAddress, { parentId: cityId });
			addressList = county.data.map((item: { id: number; name: string }) => ({
				label: item.name,
				value: item.name,
				id: item.id,
				isLeaf: false,
			}));
			result = CommonUtils.insertValueToArr(result, cityId, 'id', 'children', addressList)
			yield put({
				type: 'save',
				payload: {
					areaList: result
				}
			})
		}
	},
	reducers: {
		save(state, { payload }) {
			return {
				...state,
				...payload,
			};
		},
	},
};

export default Model;
