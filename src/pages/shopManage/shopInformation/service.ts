import request from '@/utils/request';
// 
export function query(data: any) {
	return request({
		// fullUrl: 'http://test.yingzhongshare.com/el-manage/api/post/list_for_page',
		api: 'store/getDetailByStoreId',
		method: 'post',
		data: data,
	});
}
export function updateLogo(data: any) {
	return request({
		// fullUrl: 'http://test.yingzhongshare.com/el-manage/api/post/list_for_page',
		api: 'store/updateLogo',
		method: 'post',
		data: data,
	});
}