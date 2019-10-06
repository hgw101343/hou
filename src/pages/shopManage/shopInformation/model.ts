import { Reducer } from 'redux';
import { Effect } from 'dva';
import {query,updateLogo} from './service'
export interface StateType {
}

export interface ModelType {
	namespace: string;
	state: StateType;
	effects: {
		getShopinfo: Effect;
		saveLogo:Effect
	};
	reducers: {
		save: Reducer<StateType>;
	};
}
const Model: ModelType = {
	namespace: 'shopinfo',
	state: {
		list: {
			storeInfoResp:{},
			storeCompanyInfoResp:{},
			brandInfoRespList:{},
			storeCheckLogRespList:{}
		}
	},
	effects: {
		*getShopinfo({payload}, { select, call, put }) {
			const data = yield call(query,payload);
			console.log('data',data,payload);
			yield put({
				type:'save',
				payload:{
					list : data.data.data
				}
			})
		},
		*saveLogo({payload},{call, put}){
			console.log('保存logo参数',payload);
			const data = yield call(updateLogo,payload);
			console.log('保存logo',data);
		}
	},
	reducers: {
		// 讲数据保存到仓库
		save(state, { payload }) {
			console.log('保存', payload);
			return {
				...state,
				...payload,
			};
		},
	},
};
export default Model;
