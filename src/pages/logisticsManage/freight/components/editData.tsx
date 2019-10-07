import React from 'react';
import styles from '../index.less';
import { Table, Input, InputNumber, Popconfirm, Form, Button, Modal, Icon, message } from 'antd';
import { FormProps, FormComponentProps } from 'antd/es/form';
import { StateType } from '@/pages/order/orderList/model';
import { CommonUtils, distinct } from '@/utils/utils';
import { formatArea } from './changeAdress';
import AddAdress from './adddress';
const EditableContext = React.createContext<any>({});
interface propsType {

	inputType: string;
	editing: any;
	dataIndex: any;
	title: any;
	record: any;
	index: any;
	getFieldDecorator: any;
	// 当前点击
	currentOn: any;
	// 选择地址的弹窗
	selectAddressModel: boolean;
	// addressTree : any;//树的数据
}
interface stateType { }
class EditableCell extends React.Component<propsType, stateType> {
	getInput = () => {
		if (this.props.inputType === 'number') {
			return <InputNumber />;
		}
		return <Input />;
	};

	renderCell = ({ getFieldDecorator }: { getFieldDecorator: any }) => {
		console.log('shenem', getFieldDecorator);
		const {
			editing,
			dataIndex,
			title,
			inputType,
			record,
			index,
			children,
			...restProps
		} = this.props;
		return (
			<td {...restProps}>
				{editing ? (
					<Form.Item style={{ margin: 0 }}>
						{getFieldDecorator(dataIndex, {
							rules: [
								{
									required: true,
									message: `Please Input ${title}!`,
								},
							],
							initialValue: record[dataIndex],
						})(this.getInput())}
					</Form.Item>
				) : (
						children
					)}
			</td>
		);
	};

	render() {
		return <EditableContext.Consumer>{this.renderCell}</EditableContext.Consumer>;
	}
}
export interface propsType2 {
	freight: StateType;
}
interface propsType3 extends propsType2, FormComponentProps {
	deliveryDetailList: any;
	AllAddress: any;
	dispatch: any;
	templateId: number;
	templateName: string;
	selectAddress: boolean;
	deleteModal: boolean;
	currentOn: any;
	delDelivery: boolean;
	// 仓库的list
	allList: any;
	// 记录是添加模板
	isaddTemplate: boolean,
}
interface stateType2 {
	editingKey: string | number;
	selectAddress: boolean;
	columns: any;
	allTemplate: Array<any> | string;
	edittype: number;
	onCurrent: any;
	addstatus: boolean; //记录是否是添加状态
	addressTree: any;
	treeUp: Array<string>;
	// 保存回滚
	hisAllTemplate: any;
}
let upAdress: string = '';
const data: Array<any> = []; //保存用于渲染数据
class EditableTable extends React.Component<propsType3, stateType2> {
	addAdressRef: any = React.createRef();
	state = {
		editingKey: '',
		allTemplate: [],
		addstatus: false, //记录是否是添加状态状态后的保存
		onCurrent: {}, //当前值
		// 用于保存之前未修改的参数
		addressTree: '',
		hisAllTemplate: [], //保存回滚
		treeUp: ['0', '1', '2', '3', '4', '5', '6'],
		columns: [
			{
				title: '可配送区域',
				dataIndex: 'deliveryArea',
				width: '40%',
				render: text => {
					let text1 = text
					let arr = text.split(';')
					let arr1 = arr.slice(0, -1);
					let res = arr1.map(item => {
						return <p>
							{item}</p>
					})
					return res
				},
			},
			{
				title: '首件（个）',
				dataIndex: 'firstNum',
				width: '10%',
				editable: true,
			},
			{
				title: '运费（元）',
				dataIndex: 'firstFee',
				width: '10%',
				editable: true,
			},
			{
				title: '续件（个）',
				dataIndex: 'secondNum',
				width: '10%',
				editable: true,
			},
			{
				title: '续费（元）',
				dataIndex: 'secondFee',
				width: '10%',
				editable: true,
			},
			{
				title: '操作',
				dataIndex: 'operation',
				render: (text, record) => {
					const { editingKey } = this.state;
					const editable = this.isEditing(record);
					return editable ? (
						<span>
							<EditableContext.Consumer>
								{form => (
									<a
										onClick={() => this.save(form, record)}
										style={{ marginRight: 8 }}
									>
										保存
									</a>
								)}
							</EditableContext.Consumer>
							<Popconfirm
								title="确定取消当前保存吗"
								onConfirm={() => this.cancel(record.key)}
							>
								<a>取消</a>
							</Popconfirm>
						</span>
					) : (
							<div>
								<a
									disabled={editingKey !== ''}
									style={{ marginRight: '24px' }}
									onClick={() => this.edit(record.key)}
								>
									修改
							</a>
								<a
									disabled={editingKey !== ''}
									onClick={() => this.remove(record, record.key)}
								>
									删除
							</a>
							</div>
						);
				},
			},
		],
		selectAddress: false,
	};
	Tree() {
		let arr = []; //存所有数据
		let allArea = ['华南', '西南', '东北', '华北', '华中', '华东', '西北']; //存所有区
		let arr2: Array<any> = [];
		for (let i in this.props.AllAddress) {
			arr.push(this.props.AllAddress[i]); //值
		}
		console.log('数组', arr, allArea);
		arr.forEach((item, index) => {
			let child1 = [];
			let num = 0;
			for (let i in item) {
				let child2: Array<any> = [];
				child1.push({
					title: item[i][0].province,
					key: (item[i][0].id + '').slice(0, 2),
					children: child2,
				});
				item[i].forEach(item2 => {
					child2.push({
						title: item2.city,
						key: `${item2.id}`,
					});
				});
			}
			arr2.push({
				title: allArea[index],
				key: `${index}`,
				children: child1,
			});
		});
		this.setState({
			addressTree: arr2,
		});
		console.log('arr2', arr2);
	}
	componentDidMount() {
		// console.log();
		this.init();
		// 生成树的数据
		this.Tree();
		console.log('props', this.props);
		console.log('props', this.props.currentOn);
	}
	init = (args?: any, index?: any) => {
		let data: any = [];
		var index = index;
		var args = args;
		console.log('bbc');
		// 如果有传参则是自传父
		let arr = CommonUtils.deepCopy(this.state.allTemplate);
		this.setState({
			hisAllTemplate: arr,
		});
		if (args) {
			console.log('kankan', args, index);
			let address = '';
			data = this.state.allTemplate;
			console.log('参数', args[index].deliveryAreaId, this.props.AllAddress);
			address = formatArea(args[index].deliveryAreaId, this.props.AllAddress);
			console.log('address', address);
			data[this.state.editingKey].deliveryAreaId = data[
				this.state.editingKey
			].deliveryAreaMap = args[index].deliveryAreaId;
			data[this.state.editingKey].deliveryArea = address;
			this.setState({
				allTemplate: data,
			});
		} else {
			// 初始化
			console.log(this.props);
			// 如果是从新建模板打开的
			if (!this.props.currentOn) {
				console.log('aaa');
			} else {
				console.log('bbb', this.props.currentOn.deliveryDetailList);
				// 如果是编辑
				if (this.props.currentOn.deliveryDetailList) {
					this.props.currentOn.deliveryDetailList.forEach((item2, index) => {
						upAdress = formatArea(item2.deliveryArea, this.props.AllAddress);
						data.push({
							deliveryArea: upAdress,
							firstNum: item2.firstNum,
							firstFee: item2.firstFee,
							secondNum: item2.secondNum,
							secondFee: item2.secondFee,
							templateId: item2.postTemplateId,
							key: index,
							deliveryAreaMap: item2.deliveryArea,
							deliveryAreaId: item2.deliveryArea,
							id: item2.id,
							PostFeeTemplateId: item2.postTemplateId,
						});
					});
					this.setState({
						allTemplate: data,
					});
				}
			}
		}
	};
	// 新增明细
	address = () => {
		// 打开弹窗
		this.props.dispatch({
			type: 'freight/save1',
			payload: {
				selectAddressModel: true,
			},
		});
	};
	// 关闭添加地址弹窗
	isEditing = record => record.key === this.state.editingKey;
	// 取消当前保存
	cancel = () => {
		console.log(this.state.allTemplate, this.state.hisAllTemplate, 'll');
		this.setState({
			editingKey: '',
			allTemplate: Object.keys(this.state.hisAllTemplate).length
				? this.state.hisAllTemplate
				: this.state.allTemplate,
		});
	};
	// 点击删除按钮提示框出现
	remove(form, key) {
		console.log(this.props.delDelivery);
		this.props.dispatch({
			type: 'freight/save1',
			payload: { delDelivery: true },
		});
	}
	// 确认删除地理区间
	confirmDel = () => {
		console.log('look', this.state.onCurrent);
		console.log('确定删除', this.state.allTemplate);
		if (this.state.allTemplate.length > 1) {
			this.props.dispatch({
				type: 'freight/deleteDelivery',
				payload: { id: this.state.onCurrent.id },
			});
			this.props.dispatch({
				type: 'freight/save1',
				payload: { delDelivery: false },
			});
			setTimeout(() => {
				// 重新获取到值
				this.props.dispatch({
					type: 'freight/getFreight',
					payload: {},
				});
				// 宏事件延迟渲染
				setTimeout(() => {
					this.init();
				}, 300);
			}, 300);
			console.log(this.state.allTemplate, '全部');
			const remain = this.state.allTemplate.filter(item => {
				return item.id != this.state.onCurrent.id;
			});
			this.setState({
				allTemplate: remain,
			});
		} else {
			message.warning('至少保留一条数据');
		}
	};
	// 取消删除地理区间
	hideDel = () => {
		this.props.dispatch({
			type: 'freight/save1',
			payload: { delDelivery: false },
		});
	};
	// 点修改后的保存
	save(form, key) {
		console.log('改变前', this.state.allTemplate);
		form.validateFields((error, row) => {
			if (error) {
				return;
			}
			this.state.allTemplate[this.state.editingKey] = {
				...this.state.allTemplate[this.state.editingKey],
				...row,
			};
			this.setState({
				allTemplate: this.state.allTemplate,
			});
			const params = {
				DeliveryReqList: [this.state.allTemplate[this.state.editingKey]],
				id: this.state.allTemplate[this.state.editingKey].templateId,
			};
			// 如果是新增区间后的保存
			if (this.state.addstatus) {
				console.log('添加状态', params);
				console.log('添加区间后的保存');
				this.props.dispatch({
					type: 'freight/addDelivery',
					payload: params,
				});
			} else {
				// 如果是修改保存
				console.log('修改区间后的保存');
				this.props.dispatch({
					type: 'freight/updateDelivery',
					payload: params,
				});
			}
			this.props.dispatch({
				type: 'freight/getFreight',
				payload: {},
			});
			this.setState({ editingKey: '', addstatus: false });
		});
		message.success('更新成功');
	}
	onRow = (record: any, index: number) => {
		return {
			onClick: (event: any) => {
				console.log('你点击了', record, record.key);
				this.setState({
					onCurrent: record,
				});
				if (this.state.editingKey === record.key) {
					if (event.target.innerText.indexOf('：') >= 0) {
						record.deliveryAreaId = record.deliveryAreaMap;
						console.log(this.props);
						this.setState({
							selectAddress: true,
							edittype: 1,
						});
						this.props.dispatch({
							type: 'freight/save1',
							payload: {
								selectAddressModel: true,
							},
						});
					}
				}
			},
		};
	};
	edit(key) {
		console.log(key, '修改', this.state.editingKey);
		this.setState({ editingKey: key });
	}
	// 子传值父
	getMes = (v, i) => {
		console.log(v);
		this.init(v, i);
	};
	// 添加区间
	addTemplate = add => {
		console.log('添加', add, this.state.allTemplate, this.props.currentOn);
		const data = [];
		console.log('222', this.props);
		//如果是首页添加模板里的添加区间
		if (this.props.isaddTemplate) {
			console.log('sss', add, this.props.AllAddress);
			let addAdress = formatArea(add, this.props.AllAddress);
			console.log('转换格式后的', addAdress);
			data.push({
				deliveryArea: addAdress,
				firstNum: 0,
				firstFee: 0,
				secondNum: 0,
				secondFee: 0,
				key: this.state.allTemplate.length,
				deliveryAreaMap: add,
				deliveryAreaId: add,
			});
			console.log('data', data);
			this.state.allTemplate.push(...data);
			this.setState({
				allTemplate: this.state.allTemplate,
				addstatus: true,
				editingKey: this.state.allTemplate.length - 1
			}, () => {
				console.log('666', this.state.editingKey);
			});
		} else {
			// 如果是编辑模板的添加区间
			console.log('ss', add, this.props.AllAddress);
			let addAdress = formatArea(add, this.props.AllAddress);
			console.log('转换格式后的', addAdress, this.props);
			data.push({
				deliveryArea: addAdress,
				firstNum: 0,
				firstFee: 0,
				secondNum: 0,
				secondFee: 0,
				templateId: this.state.allTemplate[0].PostFeeTemplateId,
				key: this.state.allTemplate.length,
				deliveryAreaMap: add,
				deliveryAreaId: add,
				PostFeeTemplateId: this.state.allTemplate[0].PostFeeTemplateId,
			});
			this.state.allTemplate.push(...data);
			this.setState({
				allTemplate: this.state.allTemplate,
				editingKey: this.state.allTemplate.length - 1,
				addstatus: true,
			});
			console.log('999', this.state.editingKey);
		}
		this.props.dispatch({
			type: 'freight/getFreight',
			payload: {},
		});
	};
	// 保存模板
	saveTemplate = () => {
		console.log('保存模板', this.state.allTemplate);
		console.log(this.refs.templateName.state.value);
		const params = {
			name: this.refs.templateName.state.value,
			DeliveryReqList: this.state.allTemplate,
			storeId: 1,
		};
		// 如果有模板名字
		if (this.refs.templateName.state.value) {
			this.props.dispatch({
				type: 'freight/saveTemplate',
				payload: params,
			});
			setTimeout(() => {
				this.props.dispatch({
					type: 'freight/getFreight',
					payload: {},
				});
			}, 300);
			this.props.dispatch({
				type: 'freight/save1',
				payload: {
					isEdit: false
				},
			});
		} else {
			message.warning('模板名不能为空');
		}
	};
	// 返回，从编辑页面返回首页
	refresh = () => {
		this.props.dispatch({
			type: 'freight/save1',
			payload: {
				isEdit: false,
			},
		});
	};
	render() {
		const components = {
			body: {
				cell: EditableCell,
			},
		};

		const columns = this.state.columns.map(col => {
			if (!col.editable) {
				return col;
			}
			return {
				...col,
				onCell: record => ({
					record,
					inputType: col.dataIndex === 'age' ? 'number' : 'text',
					dataIndex: col.dataIndex,
					title: col.title,
					editing: this.isEditing(record),
				}),
			};
		});

		return (
			<div className={styles.editBox}>
				<div className={styles.editBoxHead}>
					<em>*</em>
					<h3>模板名称</h3>
					<Input
						placeholder={this.props.currentOn ? this.props.currentOn.templateName : ''}
						ref="templateName"
					/>
					<Button
						type="primary"
						className={styles.inputName}
						onClick={this.address}
						disabled={this.state.editingKey !== ''}
					>
						新增明细
					</Button>
				</div>
				<div className={styles.editBoxMain}>
					<h3>配送运费明细</h3>
				</div>
				<EditableContext.Provider value={this.props.form}>
					<Table
						components={components}
						onRow={this.onRow}
						dataSource={this.state.allTemplate}
						columns={columns}
						pagination={false}
					/>
				</EditableContext.Provider>
				<div className={styles.btnbox}>
					<Button
						type="primary"
						className={styles.save}
						onClick={this.saveTemplate}
						disabled={this.state.editingKey !== ''}
					>
						保存
					</Button>
					<Button type="primary" className={styles.cancel} onClick={this.refresh}>
						返回
					</Button>
				</div>
				<Modal
					title="选择配送区域"
					width={840}
					visible={this.props.selectAddressModel}
					maskClosable={true}
					centered={true}
					footer={null}
					destroyOnClose={true}
					dispatch={this.props.dispatch}
				>
					{/* 新增运费模板 */}
					{this.props.selectAddressModel ? (
						<AddAdress
							ref={this.addAdressRef}
							dispatch={this.props.dispatch}
							allTemplate={this.state.allTemplate}
							onCurrent={this.state.onCurrent}
							isaddTemplate={this.props.isaddTemplate}
							currentOn={this.props.currentOn}
							editingKey={this.state.editingKey}
							getMes={this.getMes.bind(this)}
							addTemplate={this.addTemplate.bind(this)}
							AllAddress={this.props.AllAddress}
							addressTree={this.state.addressTree}
							treeUp={this.state.treeUp}
						/>
					) : null}
				</Modal>
				{/* 是否删除配送区域模板 */}
				<Modal
					title="提示"
					visible={this.props.delDelivery}
					onOk={this.confirmDel}
					onCancel={this.hideDel}
					okText="删除"
					cancelText="取消"
				>
					<p>
						<Icon
							type="exclamation-circle"
							twoToneColor="#52c41a"
							theme="twoTone"
							style={{ fontSize: '16px' }}
						/>
						是否删除?
					</p>
				</Modal>
			</div>
		);
	}
}

export const EditableFormTable = Form.create<propsType3>()(EditableTable);
