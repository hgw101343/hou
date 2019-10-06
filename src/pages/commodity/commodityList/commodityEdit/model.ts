import { AnyAction, Reducer } from 'redux';
import { EffectsCommandMap } from 'dva';
import * as api from '../service';
import { CommonUtils } from '@/utils/utils';
import { EditStateType } from './declaration';

export type Effect = (
    action: AnyAction,
    effects: EffectsCommandMap & { select: <T>(func: (state: StateType) => T) => T },
) => void;

export interface ModelType {
    namespace: string;
    state: EditStateType;
    effects: {
        saveSync: Effect
    };
    reducers: {
        save: Reducer;
    };
}

const Model: ModelType = {
    namespace: 'commodityEdit',

    state: {
		sourceId: '',
        baseInfo: {
            sourceName: '',
            sellPoint: '',
            category: [],
            attributeParams: []
        },
        sellInfo: {
            minBuyAmount: 1,
            combinationAmount: 1,
            storeSourceId: '',
            sourcePrice: '',
            costPrice: '',
            inventory: '',
            originPrice: '',
            inventorySubtractType: 1,
            skuParams: []
        },
        imgTextInfo: {
            originSourceDesc: '',
            sourceDesc: '',
            sourceImgArr: []
        },
        otherInfo: {
            postFeeType: 3,
            postFeeTemplateId: '',
            issue: true
        }

    },

    effects: {
        *saveSync({payload, cb}, { put }) {
            yield put({
                type: 'save',
                payload: payload
            });
            cb && cb();
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
