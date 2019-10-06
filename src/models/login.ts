import { Reducer } from 'redux';
import { routerRedux } from 'dva/router';
import { Effect } from 'dva';
import { stringify } from 'querystring';
import router from 'umi/router'
import { CommonUtils } from '@/utils/utils';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/login';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { logout, getDetailByStoreId } from '@/services/login'

export interface StateType {
  login: boolean,
  token: string | null,
  loginType: boolean,
}

export interface LoginModelType {
  namespace: string;
  state: StateType;
  effects: {
    login: Effect;
    getCaptcha: Effect;
    logout: Effect;
  };
  reducers: {
    changeLoginStatus: Reducer<StateType>;
  };
}

const Model: LoginModelType = {
  namespace: 'login',

  state: {
    login: false,
    token: null,
    loginType: false,
  },

  effects: {
    *login({ payload }, { call, put }) {
      try{
        const data = yield call(fakeAccountLogin, payload);
        yield put({
          type: 'changeLoginStatus',
          payload: {
            token: data.data.access_token,
            login: true,
          },
        });
        yield put({
          type: 'user/save',
          payload: {
            currentUser: {
              name: data.data.name,
              group: data.data.username,
              userid: data.data.id,
            }
          }
        })
        sessionStorage.setItem('token', data.data.access_token)
        sessionStorage.setItem('userInfo', JSON.stringify({name: data.data.name,group: data.data.username,userid: data.data.id,}));
        
        // 检测审核状态 
        const storeData = yield call(getDetailByStoreId, {});
        sessionStorage.setItem('storeData', JSON.stringify(storeData.data.data));
        const checkStatus = CommonUtils.getDeepObj(storeData, 'data.data.storeInfoResp.checkStatus');

        // if(checkStatus !== 1){
        //   router.push('/user/auditInfo');
        // }else{
          router.push('/');
        // }
        
      }catch(err){

      }      
    },


    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },
    
    *logout(_, { put, call }) {
      try {
        const data = yield call(logout);
        sessionStorage.clear()
        yield put({
          type: 'changeLoginStatus',
          payload: {
            token: null,
            login: false,
          },
        });
        yield put({
          type: 'user/save',
          payload: {
            currentUser: {}
          }
        })
        const { redirect } = getPageQuery();
        console.log(redirect)
        // redirect
        if (window.location.pathname !== '/user/login' && !redirect) {
          yield put(
            routerRedux.replace({
              pathname: '/user/login',
              search: stringify({
                redirect: window.location.href,
              }),
            }),
          );
        }
      }catch{
        
      }      
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        ...payload
      };
    },
  },
};

export default Model;
