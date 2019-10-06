import request from '@/utils/request';
import { config } from '@/utils/config.ts';

/**
 * 获取短信验证码
 * @param data 
 */
export async function sendResetPassWordMsg(data) {
	return request({
		api: 'user/sendResetPassWordMsg',
		service: '/elbusiness-manager/external',
		method: 'POST',
		data: data,
	});
}

/**
 * 校验手机号码是否已存在接口
 * @param data 
 * "phone": "15812345670" 
 */
export async function checkByPhone(data) {
	return request({
		api: 'user/checkByPhone',
		service: '/elbusiness-manager/external',
		method: 'POST',
		data: data,
	});
}

/**
 * 重置密码检查接口
 * @param data 
 * "verCode": "123456",  //验证码
 * "phone": "15812345678",   //手机号码
 * "idCard":"1212"    //身份证号码
 */
export async function checkByPhoneIdCard(data) {
	return request({
		api: 'user/checkByPhoneIdCard',
		service: '/elbusiness-manager/external',
		method: 'POST',
		data: data,
	});
}

/**
 * 重置密码接口
 * @param data
 * "id": "12", //用户id
 * "newPassword":"123456"   //新密码 
 */
export async function resetPassWord(data) {
	return request({
		api: 'user/resetPassWord',
		service: '/elbusiness-manager/external',
		method: 'POST',
		data: data,
	});
}