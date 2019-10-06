import request from '@/utils/request';
import { config } from '@/utils/config';

// 上传图片接口
export function upLoadImg(url: string, data: object) {
	return request({
		fullUrl: config.REQUEST_URL + url,
		method: 'post',
		data: data,
		requestType: 'form',
	});
}
