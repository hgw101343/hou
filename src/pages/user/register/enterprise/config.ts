import moment from 'moment'
import { UploadFile } from 'antd/es/upload/interface'

const transformDateKeys = {
    brandInfoReqList: ['cerExpiredDate', 'authExpiredDate'],
    companyInfoReq: ['businessExpiredDate', 'orgCodeExpiredDate'],
    storeInfoReq: ['idCardExpireDate']
};
const transformUploadKeys = [''];


function transformValue(key: string, value: string, index: number) {
    if (/Date$/.test(key)) {
        return moment(value)
    }
    if (/Url$|Url[Z|F]$/.test(key)) {
        if (key === 'holderIdenUrl' && /.+http:\/\//.test(value)) {
            return value.replace(/.+http:\/\//, ' http').split(' ').map((item, index) => {
                return {
                    uid: item + index,
                    size: 1,
                    name: item,
                    url: item
                }
            })
        }
        return [{
            uid: value + index,
            size: 1,
            name: value,
            url: value
        }]
    }
    return value
}

export default function transformData(data) {
    const transformResult = {}
    if (data.brandInfoReqList) {
        transformResult['brandInfoReqList'] = data.brandInfoReqList.map(item => {
            let index = 0;
            const result = {}
            for (let key in item) {
                result[key] = transformValue(key, item[key], index++)
            }
            return result
        })
    }
    if (data.storeInfoReq) {
        let index = 0;
        const result = {}
        for (let key in data.storeInfoReq) {
            if (key === 'name') {
                if (data.storeInfoReq.storeType > 20 && data.storeInfoReq.storeType !== 24) {
                    result[key] = data.storeInfoReq[key].split('-')
                } else {
                    result[key] = data.storeInfoReq[key]
                }
            } else {
                result[key] = transformValue(key, data.storeInfoReq[key], index++)
            }
        }
        transformResult['storeInfoReq'] = result
    }
    if (data.companyInfoReq) {
        let index = 0;
        const result = {}
        for (let key in data.companyInfoReq) {
            if (key === 'regAddr') {
                result[key] = data.companyInfoReq[key].split('/')
            } else {
                result[key] = transformValue(key, data.companyInfoReq[key], index++)
            }
        }
        transformResult['companyInfoReq'] = result
    }
    return transformResult;
}