import request from '@/utils/request';
import { config } from '@/utils/config.ts';

export async function getValidation(data) {
	return request({
		// fullUrl: 'http://192.168.34.214:8090/elbusiness_manager_api_war/external/api/user/sendApplyStayMsg',
		api: 'user/sendApplyStayMsg',
		service: '/elbusiness-manager/external',
		method: 'POST',
		data: data,
	});
}

export async function applyStay(data) {
	return request({
		// fullUrl: 'http://192.168.34.214:8090/elbusiness_manager_api_war/external/api/user/applyStay',
		api: 'user/applyStay',
		service: '/elbusiness-manager/external',
		method: 'POST',
		data: data,
	});
}

export async function checkByPhone(data) {
	return request({
		api: 'user/checkByPhone',
		service: '/elbusiness-manager/external',
		method: 'POST',
		data: data,
	});
}

export async function save(data) {
	return request({
		api: 'store/save',
		method: 'POST',
		data: data,
	});
}

export async function IDAuthByUrl(data) {
	return request({
		fullUrl: config.REQUEST_URL + '/yingzhong_store_service/external/idauth/IDAuthByUrl',
		method: 'POST',
		data: data,
		noFormat: true,
		requestType: 'form'
	});
}

export function getSelectAddress(data: any) {
	return request({
		api: 'address/getSelectAddress',
		method: 'post',
		data: data
	})
}