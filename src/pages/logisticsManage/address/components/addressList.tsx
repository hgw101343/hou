import React, { useState, useEffect } from 'react';
import { Table, Radio, Button, Modal, Icon, Tag } from 'antd';
import { listType } from '../model';
import { ColumnProps, TableProps } from 'antd/es/table/interface';
import styles from '../index.less';
import { PaginationConfig } from 'antd/es/pagination';

interface columnDefaultType extends ColumnProps<listType> {
	key: string;
}

export interface addressListType {
	columnItems: Array<string>;
	list: Array<listType>;
	pagination: PaginationConfig;
	handleRadioUpdate: Function;
	handleDelete: Function;
	modal: boolean;
	setModal: Function;
	changeAddress: Function;
}

const AddressList = (props: addressListType) => {
	const {
		columnItems,
		list,
		pagination,
		handleRadioUpdate,
		handleDelete,
		modal,
		setModal,
		changeAddress,
	} = props;

	const [selectId, setSelectId] = useState();

	useEffect(() => {
		if (!modal) {
			setSelectId(undefined);
		}
	}, [modal]);

	const columnDefault: Array<columnDefaultType> = [
		{
			title: '发货地址',
			key: 'defaultSendAddress',
			render: (text, record) => {
				return (
					<Radio
						checked={record.defaultSendAddress}
						onChange={() => handleRadioUpdate(record.id, 'defaultSendAddress')}
					>
						默认
					</Radio>
				);
			},
		},
		{
			title: '退货地址',
			key: 'defaultReceiveAddress',
			render: (text, record) => {
				return (
					<Radio
						checked={record.defaultReceiveAddress}
						onChange={() => handleRadioUpdate(record.id, 'defaultReceiveAddress')}
					>
						默认
					</Radio>
				);
			},
		},
		{
			title: '联系人',
			key: 'contact',
			dataIndex: 'contact',
		},
		{
			title: '所在地区',
			key: 'area',
			render: (text, record) => {
				return <span>{record.area.split('-').join('')}</span>;
			},
		},
		{
			title: '街道地址',
			key: 'street',
			dataIndex: 'street',
		},
		{
			title: '地址类型',
			key: 'type',
			render: (text, record) => {
				const defaultAddress = (
					<Tag color="blue" style={{ marginLeft: '8px' }}>
						默认
					</Tag>
				);
				switch (record.type) {
					case 2:
						return (
							<div>发货地址{record.defaultSendAddress ? defaultAddress : null}</div>
						);
					case 1:
						return (
							<div>
								退货地址{record.defaultReceiveAddress ? defaultAddress : null}
							</div>
						);
					case 3:
						return (
							<div>
								<div>
									发货地址{record.defaultSendAddress ? defaultAddress : null}
								</div>
								<div>
									退货地址{record.defaultReceiveAddress ? defaultAddress : null}
								</div>
							</div>
						);
					default:
						break;
				}
			},
		},
		{
			title: '联系方式',
			key: 'phone',
			render: (text, record) => {
				return (
					<div>
						<div>{record.phone}</div>
						<div>{record.telephone}</div>
					</div>
				);
			},
		},
		{
			title: '最后编辑时间',
			key: 'updateTime',
			dataIndex: 'updateTime',
		},
		{
			title: '备注',
			key: 'remark',
			dataIndex: 'remark',
		},
	];

	function showDeleteModal(id: number) {
		setModal(true);
		setSelectId(id);
	}

	const column = columnDefault.filter(item => columnItems.includes(item.key));

	column.push({
		title: '操作',
		key: 'operation',
		render: (text, record) => {
			return (
				<div className="flex-between">
					<a onClick={() => changeAddress(record)}>修改</a>
					<a onClick={() => showDeleteModal(record.id)}>删除</a>
				</div>
			);
		},
	});

	const paginationProps: PaginationConfig = {
		showTotal: total => {
			if (pagination === false) {
				return undefined;
			} else {
				let page: string;
				if (pagination.pageSize) {
					page =
						'第 ' +
						pagination.current +
						'/' +
						Math.ceil(total / pagination.pageSize) +
						' 页';
				} else {
					page = '';
				}
				return (
					<span>
						共 {total} 条记录 {page}
					</span>
				);
			}
		},
		showQuickJumper: true,
		showSizeChanger: true,
		pageSizeOptions: ['50', '100', '200', '300', '500'],
		...pagination,
	};
	const tableProps: TableProps<listType> = {
		dataSource: list,
		columns: column,
		rowKey: record => record.id.toString(),
		className: styles.tableStyle,
		pagination: paginationProps,
	};

	return (
		<>
			<Table {...tableProps} />
			<Modal
				visible={modal}
				onOk={() => handleDelete(selectId)}
				onCancel={() => setModal(false)}
				title={<span className={styles.modalTitle}>提示</span>}
				width="540px"
			>
				<div className={styles.errorContext}>
					<Icon
						className={styles.errorIcon}
						type="close-circle"
						theme="twoTone"
						twoToneColor="#F5222D"
					/>
					<span>该条地址将被删除，是否继续？</span>
				</div>
			</Modal>
		</>
	);
};

export default AddressList;
