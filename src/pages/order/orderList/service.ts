import request from '@/utils/request';
import { config } from '@/utils/config'

export async function query(data: any) {
	return request({
		api: 'order/list_for_page',
		method: 'post',
		data: data
	})
}

export async function exportOrder(data: any) {
	return request({
		api: 'order/order_export',
		method: 'post',
		data: data,
		responseType: 'arrayBuffer',
		headers: {
			Accept: 'application/vnd.ms-excel,*/*'
		}
	})
}

export async function getOrder(data: any) {
	return request({
		api: 'order/getOrder',
		method: 'post',
		data: data
	})
}

// 批量订货
export async function batchOrder(data: any) {
	return request({
		api: 'order/batch_order',
		method: 'post',
		data: data
	})
}


/**
 * @description 模板
 * @param {Object} data
 */
export const order_demo = config.REQUEST_URL + '/el-manager/api/order/refund-order-demo.xls';

/**
 * @description 导入
 * @param {Object} data
 */
export const order_import_url = config.REQUEST_URL + '/el-manager/api/order/batch_refund_order';

/**
 * @description 模板
 * @param {Object} data
 */
export const reject_order_demo = config.REQUEST_URL + '/el-manager/api/order/reject-refund-order-demo.xls';

/**
 * @description 导入
 * @param {Object} data
 */
export const reject_refund_import_url = config.REQUEST_URL + '/el-manager/api/order/batch_reject_refund_order';