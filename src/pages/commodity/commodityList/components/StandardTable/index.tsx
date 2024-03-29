import { Alert, Table } from 'antd';
import { ColumnProps, TableRowSelection, TableProps } from 'antd/es/table';
import React, { Component, Fragment } from 'react';

import { TableDataItem } from '../../declaration';
import styles from './index.less';

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface StandardTableProps<T> extends Omit<TableProps<T>, 'columns'> {
	columns: StandardTableColumnProps[];
	data: {
		tableData: TableDataItem[];
		pagination: StandardTableProps<TableDataItem>['pagination'];
	};
	onRef: any;
	selectedRows: TableDataItem[];
	onSelectRow: (rows: any) => void;
}

export interface StandardTableColumnProps extends ColumnProps<TableDataItem> {
	needTotal?: boolean;
	total?: number;
}

function initTotalList(columns: StandardTableColumnProps[]) {
	if (!columns) {
		return [];
	}
	const totalList: StandardTableColumnProps[] = [];
	columns.forEach(column => {
		if (column.needTotal) {
			totalList.push({ ...column, total: 0 });
		}
	});
	return totalList;
}

interface StandardTableState {
	selectedRowKeys: string[];
	needTotalList: StandardTableColumnProps[];
}

class StandardTable extends Component<StandardTableProps<TableDataItem>, StandardTableState> {
	static getDerivedStateFromProps(nextProps: StandardTableProps<TableDataItem>) {
		// clean state
		if (nextProps.selectedRows.length === 0) {
			const needTotalList = initTotalList(nextProps.columns);
			return {
				selectedRowKeys: [],
				needTotalList,
			};
		}
		return null;
	}

	constructor(props: StandardTableProps<TableDataItem>) {
		super(props);
		const { columns } = props;
		const needTotalList = initTotalList(columns);

		this.state = {
			selectedRowKeys: [],
			needTotalList,
		};
	}

	componentDidMount(){
        this.props.onRef(this)
	}
	
	handleRowSelectChange: TableRowSelection<TableDataItem>['onChange'] = (
		selectedRowKeys,
		selectedRows: TableDataItem[],
	) => {
		const currySelectedRowKeys = selectedRowKeys as string[];
		let { needTotalList } = this.state;
		needTotalList = needTotalList.map(item => ({
			...item,
			total: selectedRows.reduce((sum, val) => sum + parseFloat(val[item.dataIndex || 0]), 0),
		}));
		const { onSelectRow } = this.props;
		if (onSelectRow) {
			onSelectRow(selectedRows);
		}

		this.setState({ selectedRowKeys: currySelectedRowKeys, needTotalList });
	};

	handleTableChange: TableProps<TableDataItem>['onChange'] = (
		pagination,
		filters,
		sorter,
		...rest
	) => {
		const { onChange } = this.props;
		if (onChange) {
			onChange(pagination, filters, sorter, ...rest);
		}
	};

	cleanSelectedKeys = () => {
		if (this.handleRowSelectChange) {
			this.handleRowSelectChange([], []);
		}
	};

	render() {
		const { selectedRowKeys, needTotalList } = this.state;
		const { data, rowKey, ...rest } = this.props;
		const { tableData = [], pagination = false } = data || {};

		const paginationProps = pagination
			? {
				showSizeChanger: true,
				showQuickJumper: true,
				showTotal: total => (`共 ${total} 条记录 第 ${pagination.current}/${Math.ceil((total/pagination.pageSize))} 页`),
				...pagination,
			}
			: false;

		const rowSelection: TableRowSelection<TableDataItem> = {
			selectedRowKeys,
			onChange: this.handleRowSelectChange,
			getCheckboxProps: (record: TableDataItem) => ({
				disabled: record.disabled,
			}),
		};

		return (
			<div className={styles.standardTable}>
				<div className={styles.tableAlert}>
					<Alert
						message={
							<Fragment>
								已选择 <a style={{ fontWeight: 600 }}>{selectedRowKeys.length}</a> 项&nbsp;&nbsp;
                				{needTotalList.map((item, index) => (
									<span style={{ marginLeft: 8 }} key={item.dataIndex}>
										{item.title}总计&nbsp;
                    					<span style={{ fontWeight: 600 }}>
											{item.render
												? item.render(item.total, item as TableDataItem, index)
												: item.total}
										</span>
									</span>
								))}
								<a onClick={this.cleanSelectedKeys} style={{ marginLeft: 24 }}>清空</a>
							</Fragment>
						}
						type="info"
						showIcon
					/>
				</div>
				<Table
					rowKey={rowKey || 'key'}
					scroll={{ x: true}}
					rowSelection={rowSelection}
					dataSource={tableData}
					pagination={paginationProps}
					onChange={this.handleTableChange}
					{...rest}
				/>
			</div>
		);
	}
}

export default StandardTable;
