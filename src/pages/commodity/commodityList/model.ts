import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import * as api from './service';
import { CommonUtils } from '@/utils/utils';
import { StateType } from './declaration';

export type Effect = (
    action: AnyAction,
    effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
    namespace: string;
    state: StateType;
    effects: {
        getSearchData: Effect;
        listSource: Effect;
        savePagination: Effect;
        getPageTotal: Effect;
    };
    reducers: {
        save: Reducer;
    };
}

const Model: ModelType = {
    namespace: 'commodityList',

    state: {
        tableData: [],
        statuses: '0',
        searchData: {
            category: [],
            sourceId: '', // 商品ID
            sourceName: '', //商品名称
            minSellAmount: '',
            maxSellAmount: '',
            minSourcePrice: '',
            maxSourcePrice: '',
            dateTime: []
        },
        pagination: {
            current: 1,
            pageSize: 50,
            total: 0
        },
    },

    effects: {
        * getSearchData({ }, { select, put }) {
            const searchData = yield select(({ commodityList  }: { commodityList : StateType }) => commodityList.searchData);
            const pagination = yield select(({ commodityList }: { commodityList: StateType }) => commodityList.pagination);
            let statuses = yield select(({ commodityList }: { commodityList: StateType }) => commodityList.statuses);
            let sTime = '';
            let eTime = '';
			if(statuses == '0'){ // 已上架
				sTime = 'startIssueTime';
                eTime = 'endIssueTime';
                statuses = [0];
			}else if(statuses == '2'){ // 待上架
				sTime = 'startCreateTime';
                eTime = 'endCreateTime';
                statuses = [1, 2];
            }

            let params = CommonUtils.formatParams(searchData, sTime, eTime) as any;
            params.statuses = statuses;

            if(params.category) {
                let category = params.category;
                if(category[0]) params.primaryCategoryId = category[0];
                if(category[1]) params.secondaryCategoryId = category[1];
                if(category[2]) params.thirdlyCategoryId = category[2];
            }

            yield put({
                type: 'listSource',
                payload: {
                    ...params,
                    pageNum: pagination.current,
                    pageSize: pagination.pageSize
                }
            })

            yield put({
                type: 'getPageTotal',
                payload: {
                    ...params,
                    pageNum: pagination.current,
                    pageSize: pagination.pageSize
                }
            })
        },

        *listSource({ payload }, { call, put }) {
            const response = yield call(api.listSource, {param: payload});
            yield put({
                type: 'save',
                payload: {
                    tableData: response.data.data
                }
            });
        },

        *savePagination({ payload }, { select, put }) {
            let pagination = yield select(({ commodityList }: { commodityList: StateType }) => commodityList.pagination);
            if(payload.current) pagination.current = payload.current;
            if(payload.pageSize) pagination.pageSize = payload.pageSize;

            yield put({
                type: 'save',
                payload: {
                    pagination
                }
            });

            yield put({
                type: 'getSearchData',
                payload: {}
            })
        },

        *getPageTotal({ payload }, { select, call, put }) {
            const response = yield call(api.countSource, {param: payload});
            let pagination = yield select(({ commodityList }: { commodityList: StateType }) => commodityList.pagination);
            pagination.total = response.data.data;
            yield put({
                type: 'save',
                payload: {
                    pagination
                }
            });
        }
    },

    reducers: {
        save(state, { payload }) {
            return {
                ...state,
                ...payload
            }
        },
    },
};

export default Model;
