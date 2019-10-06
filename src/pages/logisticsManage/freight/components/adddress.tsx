import React, { Component } from 'react';
import { Tree, Icon, Button, message } from 'antd';
import styles from '../index.less';
import { CommonUtils } from '@/utils/utils';
import { contextColumn } from '@/pages/order/orderList/tableConfig';
const { TreeNode } = Tree;

interface propsType {
	AllAddress: {};
	EditableFormTableProps: any;
	changeState: Function;
	dispatch: Function;
	allTemplate: any;
	onCurrent: Array<string>;
	editingKey: number | string; //记录当前编辑的key值
	getMes: any; //子传父回调
	currentOn: any; //记录当前被选中的字段,
	addTemplate: Function; //添加模板
	addressTree: any;
	treeUp: any;
	isaddTemplate: boolean;
}
interface stateType {
	[key: string]: any;
}
export default class AddAdress extends Component<propsType, stateType> {
	constructor(props) {
		super(props);
		// this.treeUp = this.treeUp.bind(this);
	}
	state = {
		treeData: [],
		expandedKeys: ['0', '1', '2', '3', '4', '5', '6', '7'],
		autoExpandParent: true,
		// 保存选中，会变
		checkedKeys: [],
		// 保存之前选中的key固定
		saveKey: [],
		// 保存当前选中
		currentCheck: [],
		disabledArr: [],
		saveDisabledArr: [],
		//  当前父级版选中
		halfChecked: [],
	};
	init = () => {
		let selectArray: Array<string> = []; //记录所有选中的
		let currentSelect: Array<string> = []; //记录当前选中
		let selectFather: Array<string> = [];
		console.log('kankan', this.props.allTemplate);
		this.props.allTemplate.forEach((item, index) => {
			console.log('lookme', item['deliveryAreaId']);
			for (let it in item['deliveryAreaId']) {
				selectFather.push(`${it}`);
				item['deliveryAreaId'][it].forEach(item2 => {
					selectArray.push(`${item2}`);
				});
			}
		});
		this.setState({
			saveKey: [...selectArray, ...selectFather],
		});
		console.log(selectArray, currentSelect, 'see');
		// 编辑状态
		if (this.props.editingKey || this.props.editingKey === 0) {
			let obj = this.props.onCurrent.deliveryAreaId;
			console.log('obj111', obj);
			for (let it in obj) {
				obj[it].forEach(item2 => {
					currentSelect.push(`${item2}`);
				});
			}
			console.log('current', currentSelect, selectArray);
			const arr = [...selectArray, ...currentSelect, ...selectFather];
			this.setState({
				checkedKeys: CommonUtils.distinct(arr),
				currentCheck: [...currentSelect, ...selectFather],
			}, () => {
				console.log('1', this.state.checkedKeys, arr);
			});
		} else {
			// 新增状态
			console.log('新增状态', this.props, selectArray);
			console.log('why?', this.state.saveKey, this.state.checkedKeys);
			this.setState({
				currentCheck: [],
			});
		}
	};
	componentDidMount() {
		// 处理数据
		console.log('thisprops', this.props.onCurrent, this.props);
		this.init();
	}
	onExpand = (expandedKeys, { expanded, node }) => {
		var expandedKeys = expandedKeys;
		console.log('onExpand', expandedKeys, expanded, node);
		if (this.state.expandedKeys.length > 7) {
			this.state.expandedKeys = this.state.expandedKeys.slice(0, -1);
			this.state.expandedKeys.push(expandedKeys[expandedKeys.length - 1]);
		}
		this.setState({
			expandedKeys: this.state.expandedKeys,
		});
		console.log('ee', this.state.expandedKeys);
	};

	onCheck = (checkedKeys, halfChecked) => {
		console.log('onCheck', checkedKeys, halfChecked);
		this.setState({ checkedKeys: checkedKeys, halfChecked: halfChecked.halfCheckedKeys },
			() => {
				console.log('on', this.state.halfChecked);
			});
		console.log('why', this.state.checkedKeys, this.state.halfChecked);
	};
	// 将数组['1','1280','2','2312']转换成{1:[1280],2:[2312]}
	changeNum = checkedKeys => {
		let allArea = ['华南', '西南', '东北', '华北', '华中', '华东', '西北'];
		console.log(checkedKeys, '选择');
		const arr1 = checkedKeys.sort();
		const arr2: Array<any> = [];
		const newArr1 = arr1.filter(item => item > 100);
		let newArr = arr1.filter(item => item < 100);
		const newArrHalf = this.state.halfChecked.filter(item => item > 10 && item < 100);
		console.log(newArr, newArr1, 'ass', newArrHalf);
		// 如果城市在全选的情况下
		newArr = [...newArr, ...newArrHalf];
		if (newArr.length > 0) {
			newArr.forEach((item, index) => {
				const newArr2 = arr1.filter(item2 => {
					return item2.indexOf(item) == 0 && item2 != item;
				});
				arr2.push({
					item: newArr2,
				});
			});
		} else {
			// 如果城市单选
			arr2.push({
				item: newArr1,
			});

			console.log('单选', newArr1, arr2);
		}
		// 将arr2的键名转换成数值
		console.log('look', arr2);
		let json = arr2.concat();
		let arr3: Array<string> = []; //重新选择抛回父元素
		arr2.forEach((item1, index) => {
			if (item1['item'].length > 0) {
				let json1 = JSON.stringify(item1).replace(
					/item/,
					json[index]['item'][0].slice(0, 2),
				);
				arr3.push(JSON.parse(json1));
			}
		});
		console.log('yuqing', arr3);
		let obj = {};
		arr3.forEach(item => {
			obj = { ...obj, ...item };
		});
		console.log('arr3', obj);
		let obj1 = this.props.onCurrent;
		obj1.deliveryAreaId = obj;
		return obj;
	};
	componentWillUnmount() { }
	// 确定按钮
	resSelect = () => {
		// 判断是编辑状态
		console.log('确定', this.state.currentCheck);
		console.log('a', this.state.checkedKeys, this.state.saveKey);
		console.log(this.props.editingKey, this.props.allTemplate, this.props.currentOn);
		if (this.props.editingKey === 0 || this.props.editingKey) {
			let obj = [];
			let newSelect = [];
			if (this.state.saveKey.length <= this.state.checkedKeys.length) {
				newSelect = this.state.checkedKeys.filter(item => {
					return this.state.saveKey.indexOf(item) < 0;
				});
				console.log('现在', this.state.checkedKeys, this.state.saveKey, newSelect);
				console.log('dui', this.state.currentCheck);
				newSelect = [...newSelect, ...this.state.currentCheck];
				obj = this.changeNum(newSelect);
				console.log('obj2', obj, newSelect);
			} else {
				// 如果比保存的值减少
				console.log('shao', this.state.saveKey, this.state.checkedKeys);
				newSelect = this.state.saveKey.filter(item => {
					return this.state.checkedKeys.indexOf(item) < 0;
				});
				let arr = this.state.currentCheck.filter(item => {
					return newSelect.indexOf(item) < 0;
				});
				obj = this.changeNum(arr);
			}
			console.log('当前选中', newSelect, obj);
			console.log('编辑');
			let obj2 = this.props.allTemplate;
			obj2[this.props.editingKey].deliveryAreaId = obj;
			if (
				this.state.checkedKeys.length >
				this.state.saveKey.length - this.state.currentCheck.length
			) {
				console.log('当前不为空', obj2, this.props.editingKey);
				this.props.getMes(obj2, this.props.editingKey);
				this.props.dispatch({
					type: 'freight/save1',
					payload: { selectAddressModel: false },
				});
			} else {
				message.error('请至少插入一条地址位置区间');
				console.log('地理位置为空');
			}
		} else {
			console.log('添加');
			let newSelect = this.state.checkedKeys.filter(item => {
				return this.state.saveKey.indexOf(item) < 0;
			});
			console.log(newSelect, 'new值');
			let res = this.changeNum(newSelect);
			console.log('添加', res);
			// 如果res没值则为空
			if (Object.keys(res).length > 0) {
				this.props.addTemplate(res);
				console.log(res, 'lookup');
				this.props.dispatch({
					type: 'freight/save1',
					payload: { selectAddressModel: false },
				});
			} else {
				message.error('请至少插入一条地址位置区间');
			}
		}
	};
	// 判断子树是否要禁用
	disableC = key => {
		// 所有选中
		if (this.state.saveKey) {
			// 当前选中
			if (this.state.currentCheck) {
				if (
					this.state.saveKey.indexOf(key) > -1 &&
					this.state.currentCheck.indexOf(key) < 0
				) {
					return true;
				}
				return false;
			} else {
				if (this.state.saveKey.indexOf(key) > -1) {
					return true;
				}
				return false;
			}
		}
		return false;
	};
	// 判断父树是否禁用
	disableT = (item, key) => {
		let arr = [];
		// console.log('save',this.state.saveKey,this.state.currentCheck);
		this.state.saveKey.forEach(item => {
			if (this.state.currentCheck.indexOf(item) < 0) {
				arr.push(item);
			}
		});
		let arr2 = [];
		item.children.forEach(item1 => {
			if (arr.indexOf(item1.key) > -1) {
				arr2.push(item1.key);
			}
		});
		// console.log(arr2.length,item.children.length);
		if (arr2.length == item.children.length) {
			return true;
		}
		return false;
	};
	cancelSelect = () => {
		console.log('取消', this.props);
		this.props.dispatch({
			type: 'freight/save1',
			payload: { selectAddressModel: false },
		});
	};
	renderTreeNodes = data =>
		data.map(item => {
			if (item.children) {
				if (item.key > 10) {
					return (
						<TreeNode
							title={item.title}
							key={item.key}
							dataRef={item}
							disabled={this.disableT(item, item.key)}
						>
							{this.renderTreeNodes(item.children)}
						</TreeNode>
					);
				} else {
					return (
						<TreeNode title={item.title} key={item.key} dataRef={item}>
							{this.renderTreeNodes(item.children)}
						</TreeNode>
					);
				}
			}
			return (
				<TreeNode key={item.key} title={item.title} disabled={this.disableC(item.key)} />
			);
		});

	render() {
		return (
			<div className={styles.adddress}>
				<Tree
					checkable
					expandedKeys={this.state.expandedKeys}
					onCheck={this.onCheck}
					defaultExpandedKeys={this.props.treeUp ? this.props.treeUp : []}
					checkedKeys={{ checked: this.state.checkedKeys, halfChecked: [] }}
					onExpand={this.onExpand}
				>
					{this.renderTreeNodes(this.props.addressTree ? this.props.addressTree : [])}
				</Tree>
				<div className={styles.footerbtn}>
					<Button type="primary" onClick={this.resSelect}>
						确定
					</Button>
					<Button type="primary" onClick={this.cancelSelect}>
						取消
					</Button>
				</div>
			</div>
		);
	}
}
