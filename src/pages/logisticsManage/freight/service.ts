import request from '@/utils/request';

// 分页查询
export function query(data: any) {
	return request({
		// fullUrl: 'http://test.yingzhongshare.com/el-manage/api/post/list_for_page',
		api: 'post/list_for_page',
		method: 'post',
		data: data,
	});
}

// 获取所有省市（无参）
export function getAllAddress(data: any) {
	return request({
		// fullUrl: 'http://test.yingzhongshare.com/el-manage/api/post/getAllAddress',
		api: 'post/getAllAddress',
		method: 'post',
		data: data,
	});
}
// 保存模板
export function save(data: any) {
	return request({
		api: 'post/save',
		method: 'post',
		data: data,
	});
}

// 修改模板
export function update_template(data: any) {
	return request({
		api: 'post/update_template',
		method: 'post',
		data: data,
	});
}

// 删除模板
export function delete_template(data: any) {
	return request({
		api: 'post/delete_template',
		method: 'post',
		data: data,
	});
}

// 删除配送区间
export function delete_delivery(data: any) {
	return request({
		api: 'post/delete_delivery',
		method: 'post',
		data: data,
	});
}

// 更新配送区间
export function update_delivery(data: any) {
	return request({
		api: 'post/update_delivery',
		method: 'post',
		data: data,
	});
}

// 新增配送区间
export function add_delivery(data: any) {
	return request({
		api: 'post/add_delivery',
		method: 'post',
		data: data,
	});
}
