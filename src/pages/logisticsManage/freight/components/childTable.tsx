import React, { Component } from 'react';
import { Table } from 'antd';
import { formatArea } from './changeAdress';
// 嵌套 子表格
export const expandedRowRender = (props: any) => {
	const columns = [
		{ title: '可配送区域', dataIndex: 'deliveryArea', key: 'date' },
		{ title: '首件（个）', dataIndex: 'firstNum', key: 'name' },
		{
			title: '运费（元）',
			dataIndex: 'firstFee',
			key: 'state',
		},
		{ title: '续件（个）', dataIndex: 'secondNum', key: 'upgradeNum' },
		{
			title: '续费（元）',
			dataIndex: 'secondFee',
			key: 'operation',
		},
	];
	// // 转换后的地址
	console.log('遍历', props);
	let upAdress: string = '';
	const data: any = [];
	// 遍历地址栏每一条数据
	props.currentOn.deliveryDetailList.forEach((item2: any) => {
		upAdress = formatArea(item2.deliveryArea, props.deliveryDetailList.AllAddress);
		data.push({
			deliveryArea: upAdress,
			firstNum: item2.firstNum,
			firstFee: item2.firstFee,
			secondNum: item2.secondNum,
			secondFee: item2.secondFee,
			templateId: item2.templateId,
		});
	});
	return <Table columns={columns} dataSource={data} pagination={false} />;
};
