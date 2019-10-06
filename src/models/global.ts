import { Reducer } from 'redux';
import { Subscription, Effect } from 'dva';
import router from 'umi/router'

import { MenuDataItem } from '@ant-design/pro-layout'

import { queryMenu } from '../services/user'
import { CommonUtils } from '@/utils/utils'

export interface GlobalModelState {
  collapsed: boolean;
  menu: MenuDataItem[];
  identity: 'self' | 'other'
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalModelState;
  effects: {
    getMenu: Effect;
  };
  reducers: {
    save: Reducer,
    changeLayoutCollapsed: Reducer
  };
  subscriptions: { setup: Subscription };
}

interface menuApiType {
  children?: menuApiType[];
  component: string;
  id: number;
  meta: {
    title: string;
    icon: string;
  };
  name: string;
  parent_id: number;
  path: string;
  perms: string;
  redirect: string;
  type: number
}

function mapMenu(list: menuApiType[], parentPath: string = ''): MenuDataItem[] {
  const data = list.map(item => {
    if (!item.children) {
      return {
        icon: item.meta.icon,
        name: item.meta.title,
        path: parentPath + item.path,
        id: item.id,
        key: item.id,
        parentId: item.parent_id,
      } as MenuDataItem
    }
    return {
      children: mapMenu(item.children, item.path),
      icon: item.meta.icon,
      name: item.meta.title,
      path: parentPath + item.path,
      id: item.id,
      key: item.id,
      parentId: item.parent_id,
    } as MenuDataItem
  })
  return data
}

const GlobalModel: GlobalModelType = {
  namespace: 'global',

  state: {
    collapsed: false,
    menu: [],
    identity: 'self'
  },

  effects: {
    *getMenu({ payload }, { put, call }) {
      try {
        const data = yield call(queryMenu)
        console.log('data', data);
        yield put({
          type: 'save',
          payload: {
            menu: mapMenu(data.data)
          }
        })
      } catch (err) {
        console.error(err)
      }
    }
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    },
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload
      }
    }
  },

  subscriptions: {
    setup({ history, dispatch }): void {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      history.listen(({ pathname, search }): void => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
        const storeData = sessionStorage.getItem('storeData');
        const token = sessionStorage.getItem('token');
        const userInfo = sessionStorage.getItem('userInfo');

        if(CommonUtils.isEmptyOrNull(token) || CommonUtils.isEmptyOrNull(userInfo)){
          dispatch({
            type: 'login/changeLoginStatus',
            payload: {
              login: false,
              token: null
            }
          })
          dispatch({
            type: 'user/save',
            payload: {
              currentUser: {}
            }
          })
        }else {
          let login = true;
          // if(CommonUtils.isEmptyOrNull(storeData) || CommonUtils.getDeepObj(JSON.parse(storeData), 'storeInfoResp.checkStatus') !== 1){
          //   router.push('/user/auditInfo');
          //   login = false;
          // }
          if(pathname === '/user/login') {
            router.push('/')
          }
          dispatch({
            type: 'login/changeLoginStatus',
            payload: {
              login: login,
              token: token
            }
          })
          dispatch({
            type: 'user/save',
            payload: {
              currentUser: JSON.parse(sessionStorage.getItem('userInfo') as string)
            }
          })
        }
      });
    },
  },
};

export default GlobalModel;
