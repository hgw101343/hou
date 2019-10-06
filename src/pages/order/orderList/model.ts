import { Reducer } from 'redux';
import { Effect, SubscriptionsMapObject, Model } from 'dva';
import { query, exportOrder, getOrder, batchOrder } from './service';

import { searchItemKey } from './components/search';
import { CommonUtils, download } from '@/utils/utils'
import { PaginationConfig } from 'antd/es/pagination'
import moment from 'moment'
import { notification } from 'antd'

export interface goodsType {
  goodsImg: string;
  goodsTitle: string;
  goodsId: string;
  price: number;
  number: number;
  refundDtoList?: Array<refundDtoListType>;
  sku: Array<any>;
  skuId: string;
}

export interface addressType {
  deliveryProvince: string;
  deliveryCity: string;
  deliveryDistrict: string;
  deliveryAddress: string;
  deliveryPostalCode: string;
}

export interface refundDtoListType {
  status: number;
  reason: string;
  applyTime: string;
  amount: string;
}

export interface cargoType {
  id: string,
  account: string;
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
  address: addressType;
  postFee: number;
  refundDtoList?: Array<refundDtoListType>;
  failDesc?: string;
  cargo?: cargoType;
  cargoStatus?: number;
}

export interface StateType {
  searchData: searchItemKey;
  list: listType[];
  pagination: PaginationConfig;
  syncModalShow: boolean;
  selectedRowKeys: Array<string>;
  showSelect: boolean;
  detailData?: listType;
}

export interface ModelType extends Model {
  namespace: string;
  state: StateType;
  effects: {
    getSearchData: Effect;
    queryList: Effect;
    changePage: Effect;
    exportOrders: Effect;
    getSyncOrder: Effect;
    batchOrder: Effect;
  };
  reducers: {
    save: Reducer<StateType>;
    savePagination: Reducer<StateType>;
    hideSyncModal: Reducer<StateType>;
    selectedRows: Reducer<StateType>
  };
}

const defaultState: StateType = {
  pagination: {
    current: 1,
    pageSize: 50
  },
  searchData: {
    dateTime: [moment().subtract(30, 'days'), moment()]
  },
  list: [],
  syncModalShow: false,
  selectedRowKeys: [],
  showSelect: false,
}

const Model: ModelType = {
  namespace: 'orderList',
  state: defaultState,
  subscriptions: {
    getDetailData: ({ dispatch, history }) => {
      history.listen((location) => {
        if (location.pathname === '/order/orderList/detail') {
          if (location.query.detailData) {
            dispatch({
              type: 'save',
              payload: {
                detailData: JSON.parse(location.query.detailData)
              }
            })
          }
        }
      })
    }
  },
  effects: {
    * getSearchData({ }, { select, put }) {
      const searchData = yield select(({ orderList }: { orderList: StateType }) => orderList.searchData)
      const pagination = yield select(({ orderList }: { orderList: StateType }) => orderList.pagination)
      const params = CommonUtils.formatParams(searchData, 'beginTime', 'endTime')
      yield put({
        type: 'queryList',
        payload: {
          ...params,
          pageNum: pagination.current,
          pageSize: pagination.pageSize,
        }
      })
    },
    * queryList({ payload }, { call, put }) {
      const data = yield call(query, payload);
      yield put({
        type: 'save',
        payload: {
          list: data.data.data.map(item => {
            const defaultData = {
              orderId: item.orderId,
              goods: [{
                goodsImg: item.sourceImg,
                goodsTitle: item.sourceName,
                goodsId: item.sourceId,
                price: item.sourcePrice,
                number: item.sourceNum,
                sku: item.skuProperties ? JSON.parse(item.skuProperties) : [],
                skuId: item.storeSkuId
              }],
              address: {
                deliveryProvince: item.address.deliveryProvince,
                deliveryCity: item.address.deliveryCity,
                deliveryDistrict: item.address.deliveryDistrict,
                deliveryAddress: item.address.deliveryAddress,
                deliveryPostalCode: item.address.deliveryPostalCode,
              },
              postFee: item.postFee,
              consignee: item.address.receiverName,
              phone: item.address.receiverTel,
              orderPrice: item.sourcePayPrice,
              orderType: item.orderType,
              orderStatus: item.orderStatus,
              createTime: item.orderTime,
            }
            const optionalData: Partial<listType> = {}
            if (item.failDesc) {
              optionalData.failDesc = item.failDesc;
            }
            if (item.refundDtoList) {
              optionalData.goods = defaultData.goods
              optionalData.goods[0].refundDtoList = item.refundDtoList;
            }
            if (item.cargoMallOrderId) {
              optionalData.cargo = {
                id: item.cargoMallOrderId,
                account: item.cargoAccount
              }
            }
            if (item.cargoStatus) {
              optionalData.cargoStatus = item.cargoStatus
            }
            return {
              ...defaultData,
              ...optionalData
            }
          }),
        }
      })
      yield put({
        type: 'savePagination',
        payload: {
          current: data.data.pageIndex,
          total: data.data.totalCount
        }
      })
    },
    * changePage({ payload }, { put }) {
      yield put({
        type: 'savePagination',
        payload: payload,
      })
      yield put({
        type: 'getSearchData',
        payload: {}
      })
    },
    * exportOrders({ payload }, { select, call }) {
      const searchData = yield select(({ orderList }: { orderList: StateType }) => orderList.searchData)
      const params = CommonUtils.formatParams(searchData, 'beginTime', 'endTime')
      const data = yield call(exportOrder, params);
      download(data, "订单列表-" + new Date().Format('yyyy/MM/dd HH:mm:ss') + ".xls", 'application/vnd.ms-excel');
    },
    * getSyncOrder({ payload }, { put, call }) {
      const data = yield call(getOrder, payload);
      if (data.data.includes('失败')) {
        notification.error({
          message: data.data
        })
      } else {
        notification.info({
          message: data.data
        })
        yield put({
          type: 'hideSyncModal'
        })
      }
    },
    * batchOrder({ payload }, { put, select, call }) {
      const selectKeys = yield select(({ orderList }: { orderList: StateType }) => orderList.selectedRowKeys)
      const data = yield call(batchOrder, { orderIdList: selectKeys });
      notification.info({
        message: `${selectKeys.length}条订单订货已申请处理`
      })
      yield put({
        type: 'selectedRows',
        payload: {
          selectedRowKeys: [],

        }
      })
      yield put({
        type: 'getSearchData',
        payload: {}
      })
    }
  },
  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    },
    savePagination(state = defaultState, { payload }) {
      const pagination = Object.assign({}, state.pagination, payload)
      return {
        ...state,
        pagination,
      }
    },
    hideSyncModal(state, { payload }) {
      return {
        ...state,
        ...payload,
        syncModalShow: false
      }
    },
    selectedRows(state, { payload }) {
      return {
        ...state,
        ...payload,
      }
    }
  },
};

export default Model;
