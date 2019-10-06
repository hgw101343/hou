/**
 * request 网络请求工具
 * 更详细的 api 文档: https://github.com/umijs/umi-request
 */
import { extend } from 'umi-request';
import { notification } from 'antd';
import { CommonUtils } from './utils';
import router from 'umi/router';
import { config } from './config';

const codeMessage = {
	200: '服务器成功返回请求的数据。',
	201: '新建或修改数据成功。',
	202: '一个请求已经进入后台排队（异步任务）。',
	204: '删除数据成功。',
	400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
	401: '用户没有权限（令牌、用户名、密码错误）。',
	403: '用户得到授权，但是访问是被禁止的。',
	404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
	406: '请求的格式不可得。',
	410: '请求的资源被永久删除，且不会再得到的。',
	422: '当创建一个对象时，发生一个验证错误。',
	500: '服务器发生错误，请检查服务器。',
	502: '网关错误。',
	503: '服务不可用，服务器暂时过载或维护。',
	504: '网关超时。',
};

/**
 * 异常处理程序
 */
const errorHandler = (error: { response: Response }): Response => {
	const { response } = error;
	if (response && response.status) {
		const errorText = codeMessage[response.status] || response.statusText;
		const { status, url } = response;

		notification.error({
			message: `请求错误 ${status}: ${url}`,
			description: errorText,
		});
	} else if (!response) {
		notification.error({
			description: '您的网络发生异常，无法连接服务器',
			message: '网络异常',
		});
	}
	console.log('error', error);
	return response;
};

/**
 * 配置request请求时的默认参数
 */
const service = extend({
	// errorHandler, // 默认错误处理
});

service.interceptors.request.use((url, options) => {
	return {
		url,
		options,
	};
});

service.interceptors.response.use((respones, options) => {
	return new Promise((resolve, reject) => {
		if (respones.ok) {
			const contentType = respones.headers.get('Content-Type');
			if (contentType && contentType.includes('application/json')) {
				respones.json().then(res => {
					if (CommonUtils.isEmptyOrNull(res.result)) {
						resolve(res);
					} else if (res.result.status == -401) {
						notification.error({
							message: 'error',
							description: res.result.msg,
						});
						reject(res.result.msg);
					} else if (res.result.status == -402) {
						notification.error({
							message: '授权失败',
							description: res.result.msg,
						});
						reject(res.result.msg);
						sessionStorage.clear(); // 删除sessionStorage会触发重新登录
						router.replace('/user/login');
					} else if (res.result.status == 0) {
						notification.error({
							message: 'error',
							description: res.result.msg,
						});
						reject(res.result.msg);
					} else if (res.data && res.data.code == 1 && res.data.msg) {
						notification.error({
							message: 'error',
							description: res.data.msg,
						});
						reject(res.data.msg);
					} else {
						resolve(res);
					}
				});
			} else if (contentType === 'application/vnd.ms-excel') {
				resolve(respones);
			}
		} else {
			notification.error({
				description: '您的网络发生异常，无法连接服务器',
				message: '网络异常',
			});
			reject();
		}
	});
});

/**
 * 格式化ulr
 *  fullUrl: url,           //选填，完整的链接，与service、api、funid互斥
    service: service,   //选填
    api: api,           //选填，接口中api/后面的字符串，与funid互斥
    funid: funid,       //选填，接口中funid=后面的数字，与api互斥
 */
function urlFormat(cfg: any) {
	let url;
	if (cfg.fullUrl) {
		url = cfg.fullUrl;
	} else {
		cfg.service = cfg.service || config.SERVICE;
		url = config.REQUEST_URL + cfg.service;
		if (cfg.api) {
			url += '/api/' + cfg.api;
		} else if (cfg.funid) {
			url += '/common?funid=' + cfg.funid + '&rd=' + Date.now();
		} else {
			throw new Error('api||funid is null');
		}
	}
	return url;
}

function dataFormat(cfg: any) {
	let data;
	const breadCrumb = sessionStorage.getItem('breadCrumb') || '';

	let formMethodArr = ['application/x-www-form-urlencoded', 'multipart/form-data'];
	if (
		formMethodArr.includes(CommonUtils.getDeepObj(cfg, 'headers.Content-Type')) ||
		cfg.requestType == 'form'
	) {
		// 如果是form格式
		if (breadCrumb) cfg.data.append('breadcrumb_data', breadCrumb);
		data = cfg.data;
	} else {
		cfg.data = cfg.data ? cfg.data : {};
		if (breadCrumb) cfg.data.breadcrumb_data = breadCrumb;
		if (cfg.noFormat) {
			data = cfg.data;
		} else {
			data = {
				shandle: 0,
				handle: 0,
				data: cfg.data,
			};
		}
	}
	return data;
}

const request = (cfg: any) => {
	let url = urlFormat(cfg);
	let token = sessionStorage.getItem('token');
	cfg.data = dataFormat(cfg);
	if (!CommonUtils.isEmptyOrNull(token)) {
		if (cfg.headers) {
			cfg.headers.token = `${token}`;
		} else {
			cfg.headers = {
				token,
			};
		}
	}

	return service(url, cfg);
};
export default request;
