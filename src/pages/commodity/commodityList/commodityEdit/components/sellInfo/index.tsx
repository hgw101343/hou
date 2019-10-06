/* Routes:
*   - ./src/pages/Authorized.tsx
*/
import React, { Component } from 'react';
import { Form, Input, Icon, Button, Select, Modal, Radio, Table, message, InputNumber } from 'antd';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { EditStateType, CommoditySellInfoState, SkuTableColumnProps } from '../declaration';
import UploadImg from '@/components/UploadImg';
import { connect } from 'dva';
import { GlobalModelState } from '@/models/global';
import styles from './index.less';
import { listSkuProperties } from '../../service';
import { CommonUtils } from '@/utils/utils';
const shortid = require('shortid');

const { Option } = Select;
const FormItem = Form.Item;

interface CommoditySellInfoProps extends FormComponentProps {
	dispatch: Dispatch<any>;
	commodityEdit: EditStateType;
	identity: string;
}

class CommoditySellInfo extends Component<CommoditySellInfoProps, CommoditySellInfoState> {
	state: CommoditySellInfoState = {
		replaceTemp: [],
		skuParams: [],
		skuIdList: [],
		storeSkuOptions: [],
		saveSkuOptions: [],
		detailColumn: [],
		inventorySubtractType: 1
	};

	columns: SkuTableColumnProps = [
		{
			title: '规格图片',
			dataIndex: 'skuImg',
			width: '104px',
			align: 'center',
			render: (text, row, index) => {
				return(
						<div className="flex-center">
							<UploadImg limit={1} maxSize={1024 * 512} fileList={text ? [{uid: index, url: text}] : []} onChange={(fileList) => {this.handleSkuImgChange(fileList,index)}}/>
						</div>
					)
			}
		},
		{
			title: '起购数量',
			dataIndex: 'minBuyAmount',
			width: 96,
			align: 'center',
			render: (text, row, index) => {
				return <InputNumber placeholder="输入" value={text} onChange={(event) => {this.handleSkuInputNumberChange(event, 'minBuyAmount', index)}} min={1} max={9999} disabled={row.combinationAmount > 1}/>
			}
		},
		{
			title: "库存",
			dataIndex: "inventory",
			width: 96,
			align: 'center',
			render: (text, row, index) => {
				return <InputNumber placeholder="输入" value={text} onChange={(event) => {this.handleSkuInputNumberChange(event, 'inventory', index)}}  min={0} max={10000000}/>
			}
		},
		{
			title: "成本价",
			dataIndex: "costPrice",
			width: 96,
			align: 'center',
			render: (text, row, index) => {
				return <InputNumber placeholder="输入"  value={text} onChange={(event) => {this.handleSkuInputNumberChange(event, 'costPrice', index, 'toFixed')}} min={0} max={10000000}/>
			}
		},
		{
			title: "销售价",
			dataIndex: "sourcePrice",
			width: 96,
			align: 'center',
			render: (text, row, index) => {
				return <InputNumber placeholder="输入" value={text} onChange={(event) => {this.handleSkuInputNumberChange(event, 'sourcePrice', index, 'toFixed')}} min={0} max={10000000}/>
			}
		},
		{
			title: "规格编码",
			dataIndex: "storeSkuId",
			width: 120,
			align: 'center',
			render: (text, row, index) => {
				return <Input value={text} placeholder="输入" onChange={(event) => {this.handleSkuInputChange(event, 'storeSkuId', index)}} maxLength={100}/>
			}
		},
		{
			title: "组合数量",
			dataIndex: "combinationAmount",
			width: 96,
			align: 'center',
			render: (text, row, index) => {
				let { skuParams } = this.state;
				return <InputNumber placeholder="输入" value={skuParams[index]['combinationAmount']} onChange={(event) => {this.handleSkuInputNumberChange(event, 'combinationAmount', index)}} min={1} max={9999} disabled={row.minBuyAmount > 1}/>
			}
		}
	]

	componentDidMount = () => {

	}

	componentWillUnmount = () => {

	}

	init = () => {

	}

	initFormData = () => {
		this.listSkuProperties(() => {
			const { sellInfo } = this.props.commodityEdit;
			const replaceTemp = [];
			const skuIdList = {};

			sellInfo.skuParams = sellInfo.skuParams.sort((a, b) => {
				a = a.properties[0].vid;
				b = b.properties[0].vid;
				if (a < b) {
					return -1;
				}
				if (a > b) {
					return 1;
				}
			});
			sellInfo.skuParams.forEach((item, index) => {
				item.properties.forEach(child => {
					let skuObj = this.state.saveSkuOptions.find(o => o.label == child.k);
					let value = '';
					if(skuObj) {
						value = skuObj.value;
					}else{
						return message.error(`无法查找规格名：${child.k}`, 5000);
					}
					let index = replaceTemp.findIndex(i => {return i.k == value});
					if(index > -1 ) {
						let childIndex = replaceTemp[index].properties.findIndex(c => c.label == child.vid);
						if(childIndex == -1) replaceTemp[index].properties.push({label: child.vid, v: child.v});
					}else{
						let obj =  {
							k: value,
							properties: [{label: child.vid, v: child.v}]
						}
						replaceTemp.push(obj);
					}
				})
				skuIdList[item.storeSkuId] = item.skuId; // 映射关系
				item.key = index;
			})

			const { setFieldsValue } = this.props.form;
			setFieldsValue({
				combinationAmount: sellInfo.combinationAmount,
				costPrice: sellInfo.costPrice,
				inventory: sellInfo.inventory,
				minBuyAmount: sellInfo.minBuyAmount,
				originPrice: sellInfo.originPrice,
				sourcePrice: sellInfo.sourcePrice,
				storeSourceId: sellInfo.storeSourceId
			});

			this.setState({
				skuIdList,
				replaceTemp,
				skuParams: sellInfo.skuParams,
				inventorySubtractType: sellInfo.inventorySubtractType
			},() => {
				this.handleSelectChange();
			})

		});
	}

	getFormData = () => {
		const { getFieldsValue } = this.props.form;
        return new Promise((reslove, reject) => {
				let formData = getFieldsValue();
				let commonMsg = '请输入商品明细-';
				let validateKey = [
					{
						key: 'combinationAmount',
						msg: `${commonMsg}组合数量`
					},
					{
						key: 'storeSourceId',
						msg: `${commonMsg}商家编码`
					},
					{
						key: 'sourcePrice',
						msg: `${commonMsg}销售价`
					},
					{
						key: 'costPrice',
						msg: `${commonMsg}成本价`
					},
					{
						key: 'inventory',
						msg: `${commonMsg}库存`
					},
				];

				let formDataKeyArr = Object.keys(formData);
				for(let i=0; i<formDataKeyArr.length; i++) {
					let item = formDataKeyArr[i];
					let validateObj = validateKey.find(child => item == child.key);
					if(validateObj && CommonUtils.isEmptyOrNull(formData[item])) {
						message.warning(validateObj.msg);
						return reject(false)
					}
				}

				const { skuParams, inventorySubtractType} = this.state;
				let commonSkuMsg = '请输入规格明细-';
				let validateSkuKey = [
					{
						key: 'combinationAmount',
						msg: `${commonSkuMsg}组合数量`
					},
					{
						key: 'storeSkuId',
						msg: `${commonSkuMsg}产品编码`
					},
					{
						key: 'sourcePrice',
						msg: `${commonSkuMsg}销售价`
					},
					{
						key: 'costPrice',
						msg: `${commonSkuMsg}成本价`
					},
					{
						key: 'inventory',
						msg: `${commonSkuMsg}库存`
					},
				];

				for(let i=0; i<skuParams.length; i++) {
					let item = skuParams[i];
					let key = CommonUtils.judgeObjSomeNull(item, 'skuImg');
					if(key) {
						let msg = validateSkuKey.find(child => key == child.key).msg;
						message.warning(msg);
						return reject(false)
					}
				}

                reslove({
					...formData,
					inventorySubtractType,
					skuParams
                })

        })
	}

	formatterToFixed = (value: number | string, num: number = 2) => {
		if (value === '') return value;
		if(typeof value == 'string') {
			value = value.replace(/[^\d\.]/g, '');
			let subIndex = value.indexOf('.');
			if(subIndex > -1 && subIndex !== value.length - 1) {
				let substr = value.slice(0, subIndex);
				let secIndex = value.slice(subIndex + 1).indexOf('.');
				if(secIndex > -1) {
					let secStr = value.slice(subIndex + 1, secIndex + subIndex + 1);
					if(secStr) {
						substr += `.${secStr}`;
					}
				}else{
					substr += value.slice(subIndex);
				}
				value = substr;
			}
		}
		return Number(value).toFixed(num);
	}

	formatterNum = (value: number | string) => {
		if (value === '') return value;
		if(typeof value == 'string') value = value.replace(/[^\d]/gi,'').replace('[\.]/gi', '');
		return parseInt(Number(value));
	}

	handleSkuImgChange = (fileList, index) => {
		let { skuParams } = this.state;
		skuParams[index].skuImg = fileList.length > 0 ? fileList[0].url : '';
		this.setState({
			skuParams: skuParams
		})
	}

	listSkuProperties = (cb) => {
		return listSkuProperties().then(res => {
			let arr = res.data.data || [];
			arr = arr.map(item => {
				return {
					label: item.name,
					value: item.id
				}
			})
			arr.unshift({
				label: "默认",
				value: 2696
			})
			this.setState({
				storeSkuOptions: CommonUtils.deepCopy(arr),
				saveSkuOptions: CommonUtils.deepCopy(arr)
			}, () => {
				cb && cb();
			})
		})
	}

	handleCombination = () => {
		const { form: { getFieldValue, setFieldsValue } } = this.props;
		const combinationAmount = getFieldValue('combinationAmount');
		if (combinationAmount > 1) {
			setFieldsValue({ minBuyAmount: 1 });
		}
		if (!combinationAmount) {
			setFieldsValue({ combinationAmount: 1 })
		}
	}

	handlePurchase = () => {
		const { form: { getFieldValue, setFieldsValue } } = this.props;
		const minBuyAmount = getFieldValue('minBuyAmount');
		if (minBuyAmount > 1) {
			setFieldsValue({ combinationAmount: 1 });
		}
		if (!minBuyAmount) {
			setFieldsValue({ minBuyAmount: 1 })
		}
	}

	// 规格变化
	handleSelectChange = () => {
		let { replaceTemp, saveSkuOptions } = this.state;
		let valArr = [];
        let storeSkuOptions = [];
        let skuOptions = CommonUtils.deepCopy(saveSkuOptions);
        replaceTemp.forEach(item => {
            if(item.k) {
                valArr.push(item.k)
            }
		})
        skuOptions.forEach(item => {
            if(valArr.includes(item.value)) {
                item.disabled = true;
            }
            storeSkuOptions.push(item);
        })

		this.setState({
			storeSkuOptions
		})
		this.formatResult();

	}

	// 添加规格值变化
	handleInputChange = (event, index) => {
		let { replaceTemp } = this.state;
		replaceTemp[index].inputVal = event.target.value;
		this.setState({
			replaceTemp
		})
	}

	// 添加规格值
	handleAddSize = (index) => {
		let { replaceTemp } = this.state;
		let inputVal = replaceTemp[index].inputVal;
		if(!replaceTemp[index].k) {
			return message.warning('请先选择规格名');
		}
		if(CommonUtils.isEmptyOrNull(inputVal)) {
			return message.warning('请先输入新增的规格值');
		}

		for(let i=0; i<replaceTemp.length; i++) {
			if(replaceTemp[i].properties.findIndex(item => item.v == inputVal) > -1) {
				return message.warning('规格值不允许重复');
			}
		}

		let properties = replaceTemp[index].properties;
		let label = properties.length > 0 ?  properties[properties.length - 1].label + 1 : 1000 * (index + 1) + properties.length; //每次+1，保证不同
		let obj = {label: label, v: replaceTemp[index].inputVal};
		properties.push(obj);
		replaceTemp[index].inputVal = '';
		this.setState({
			replaceTemp
		},() => {
			this.formatResult();
		})
	}

	// 规格选项变化
	handleSelectValueChange = (val, index) => {
		let { replaceTemp } = this.state;
		replaceTemp[index].k = val;
		replaceTemp[index].properties = [];
		replaceTemp[index].inputVal = '';
		this.setState({
			replaceTemp
		},() =>{
			this.handleSelectChange();
		})
	}

	// 添加规格
	handleAddList = () => {
		let { replaceTemp } = this.state;

		let obj = {
			k: "",
			properties: [],
			keyId: shortid.generate()
		}
		replaceTemp.push(obj);

		this.setState({
			replaceTemp
		})
	}

	// 删除规格
	handleCloseList = (index) => {
		let { replaceTemp } = this.state;
		replaceTemp.splice(index, 1);

		this.setState({
			replaceTemp
		},() =>{
			this.handleSelectChange();
		})
	}

	// 删除规格值
	handleCloseSize = (index, childIndex) => {
		let { replaceTemp, skuParams } = this.state;
		let k = replaceTemp[index].k;
		let value = replaceTemp[index].properties[childIndex].v;
		replaceTemp[index].properties.splice(childIndex, 1);

		this.setState({
			replaceTemp,
			skuParams: skuParams.filter(item => item[k] !== value)
		},() => {
			this.formatResult();
		})
	}

	// 二维数组排列组合
	doExchange(arr) { //  [[{"颜色": 1},{"颜色": 2}],[{"尺寸": 1},{"尺寸": 2}],[{"高度": 1}, {"高度": 2}]]
		let results = [];
		let result = [];

		function doExchange(arr, index){
			for (let i = 0; i<arr[index].length; i++) {
				result[index] = arr[index][i];
				if (index < arr.length - 1) {
					doExchange(arr, index + 1);
				} else {
					let obj = {
						storeSkuId: '',
						sourcePrice: '',
						costPrice: '',
						inventory: '',
						combinationAmount: 1,
						minBuyAmount: 1,
						skuImg: ''
					}
					result.forEach(item => {
						obj = Object.assign({},obj,item)
					})
					results.push(obj)
				}
			}
		}
		if(arr.length > 0) {
			doExchange(arr, 0); //最后的放在第一位
		}
		return results;
	}

	// 组装数据 （表格数据）
	formatResult() {
		let columnArr = CommonUtils.deepCopy(this.columns);
		let exArr = []; // [[{"颜色": 1},{"颜色": 2}],[{"尺寸": 1},{"尺寸": 2}],[{"高度": 1}, {"高度": 2}]]
		let { saveSkuOptions, skuParams } = this.state;
		let replaceTemp = CommonUtils.deepCopy(this.state.replaceTemp);
		replaceTemp.reverse().forEach((item,index) => {
			// 此处k代表规格名的value, v代表规格名下的值
			if(item.k) {
				let label = saveSkuOptions.find(o => o.value == item.k).label;
				if(columnArr.findIndex(i => i.value == label) == -1 && item.properties.length > 0) {
					let columnTemp = {
						title: label,
						dataIndex: label,
						width: 96,
						align: 'center',
						className: styles.skuColumn,
						render: (value, row, columnIndex) => {
							const obj = {
							  children: value,
							  props: {},
							};
							const skuParamsReal = this.state.skuParams;
							if(index == replaceTemp.length - 1) {
								if(columnIndex == 0 || columnIndex > 0 && value != skuParamsReal[columnIndex - 1][label]) {
									obj.props.rowSpan = skuParamsReal.filter(item => item[label] == value).length;
								}
								if(columnIndex > 0 && value == skuParamsReal[columnIndex - 1][label]) {
									obj.props.rowSpan = 0;
								}

							}
							return obj;
						}
					};
					columnArr.push(columnTemp);
				}
				let vArr = [];
				item.properties.forEach((v,i) => {
					if(v.v) {
						let vObj = {
							[label]: v.v,
						}
						vArr.push(vObj);
					}
				})
				if(vArr.length > 0) {
					exArr.push(vArr);
				}
			}
		})

		let result = this.doExchange(exArr);
		let skuParamsExp = CommonUtils.deepCopy(skuParams);

		// 组装数据
		let key = ["storeSkuId","sourcePrice","costPrice","inventory", "combinationAmount", "minBuyAmount", "skuImg"];
		result.forEach(item => {
			Object.keys(item).forEach(k => {
				if(!key.includes(k)) {
					let kid = saveSkuOptions.find(o => o.label == k).value; // 获取规格名下拉值，此处k为下拉的label
					let tempObj = replaceTemp.find(o => o.k == kid).properties; // 根据下拉值找到对应的分组数据
					let vid = tempObj.find(o => o.v == item[k]).label; // 找到分组下面规格值对应值一样的vid;
					let kv = {k: k, kid: kid, v: item[k], vid: vid};
					if(!item.properties) {
						item.properties = [kv];
					}else{
						item.properties.push(kv);
					}
				}
			})
		})

		//绑定之前的输入
		result.forEach((item,index) => {
			item.key = index;
			let saveObj = skuParamsExp.find(i => {
				let count = 0;
				for(let x=0; x<i.properties.length; x++) {
					if(item.properties.findIndex(y => y.vid == i.properties[x].vid) > -1) {
						++count;
					}else{
						break;
					};
				}

				return (count == i.properties.length && count != 0);
			})
			if(saveObj) {
				item.storeSkuId = saveObj.storeSkuId;
				item.sourcePrice =  saveObj.sourcePrice;
				item.costPrice =  saveObj.costPrice;
				item.inventory =  saveObj.inventory;
				item.combinationAmount = saveObj.combinationAmount || 1;
				item.minBuyAmount = saveObj.minBuyAmount || 1;
				item.skuImg =  saveObj.skuImg || '';
			}
		})

		let resultSort = [];

		// 调整表格数据顺序合并
		if(replaceTemp.length > 0) {
			let replaceTempFirst = replaceTemp[replaceTemp.length - 1];
			let skulabel = saveSkuOptions.find(o => o.value == replaceTempFirst.k).label;
			replaceTempFirst.properties.forEach(item =>{
				resultSort.push(...result.filter(child => child[skulabel] == item.v));
			})
		}

		this.setState({
			detailColumn: columnArr.reverse(),
			skuParams: resultSort.length > 0 ? resultSort : result
		},() => {
			this.handleInput();
			console.log('skuParams', this.state.skuParams);
		})

	}

	// 输入值变化
	handleInput = () => {
		// 统计编码明细中的值
		let { skuParams } = this.state;
		if (skuParams.length > 0) {
			let sourcePrice = undefined;
			let costPrice = undefined;
			let inventory = 0;
			skuParams.forEach(item => {
				if(item.sourcePrice || item.sourcePrice === '0' || item.sourcePrice === 0) {
					sourcePrice = sourcePrice === undefined  ? item.sourcePrice : Math.min(item.sourcePrice, sourcePrice)
				}
				if(item.costPrice || item.sourcePrice === '0' || item.sourcePrice === 0) {
					costPrice = costPrice === undefined ? item.costPrice : Math.min(item.costPrice, costPrice)
				}
				if(item.inventory || item.sourcePrice === '0' || item.sourcePrice === 0){
					inventory += Number(item.inventory);
				}
			})
			const { setFieldsValue } = this.props.form;
			setFieldsValue({
				sourcePrice: sourcePrice || 0,
				costPrice: costPrice || 0,
				inventory: inventory || 0,
			})
		}
	}

	// sku输入值变化
	handleSkuInputNumberChange = (value, key, index, formatType) => {
		let { skuParams } = this.state;
		if(formatType == 'toFixed') {
			value = this.formatterToFixed(value);
		}else {
			value = this.formatterNum(value);
		}
		skuParams[index][key] = value;
		this.setState({
			skuParams
		})
	}

	handleSkuInputChange = (event, key, index) => {
		let { skuParams } = this.state;
		let value =  event.target.value;
		if(key == 'storeSkuId') {
			let count = 0;
			for(let i=0; i<skuParams.length; i++) {
				if(value == skuParams[i].storeSkuId && value !== '') {
					++count;
					if(count >= 2) {
						skuParams[index].storeSkuId = '';
						this.setState({
							skuParams
						})
						return message.warning('产品规格ID不允许重复');
					}
				}
			}
		}

		skuParams[index][key] = value;
		this.setState({
			skuParams
		})
	}

	handleInventoryChoose = (e) => {
		this.setState({
			inventorySubtractType: e.target.value
		})
	}

	render() {
		const {
			commodityEdit: {
				sellInfo
			},
			form: {
				getFieldDecorator,
				setFieldsValue,
				getFieldValue
			},
			dispatch
		} = this.props;

		const { storeSkuOptions, replaceTemp, skuParams, detailColumn, inventorySubtractType } = this.state;
		const minBuyAmount = getFieldValue('minBuyAmount');
		const combinationAmount = getFieldValue('combinationAmount');
		return (
			<div className={styles.commoditySellInfo}>
				<p className={styles.title}>销售信息</p>
				<div className={styles.sellInfo}>
					<div className={`flex-start ${styles.shopDetail}`}>
						<p className={styles.formTitle}>商品明细：</p>
						<div className={styles.shopDetailInfo}>
							<Form className={`flex-start`}>
								<div className={styles.shopDetailInfoItem}>
									<p><span>*</span> 组合数量&nbsp;&nbsp;<Icon type="question-circle" theme='filled' /></p>
									<FormItem>
										{getFieldDecorator('combinationAmount', {
											initialValue: 1,
											getValueFromEvent: (value) => { return this.formatterNum(value) }
										})(<InputNumber min={1} max={9999} disabled={minBuyAmount > 1} placeholder="请输入" onBlur={this.handleCombination} />)}
									</FormItem>
								</div>
								<div className={styles.shopDetailInfoItem}>
									<p><span>*</span> 商家编码</p>
									{getFieldDecorator('storeSourceId', {
										initialValue: ''
									})(<Input placeholder="请输入" maxLength={100} />)}
								</div>
								<div className={styles.shopDetailInfoItem}>
									<p><span>*</span> 销售价</p>
									<FormItem>
										{getFieldDecorator('sourcePrice', {
											initialValue: '',
											getValueFromEvent: (value) => { return this.formatterToFixed(value) }
										})(<InputNumber placeholder="请输入" min={0} max={10000000} />)}
									</FormItem>
								</div>
								<div className={styles.shopDetailInfoItem}>
									<p><span>*</span> 成本价</p>
									<FormItem>
										{getFieldDecorator('costPrice', {
											initialValue: '',
											getValueFromEvent: (value) => { return this.formatterToFixed(value) }
										})(<InputNumber placeholder="请输入" min={0} max={10000000} />)}
									</FormItem>
								</div>
								<div className={styles.shopDetailInfoItem}>
									<p><span>*</span> 库存</p>
									<FormItem>
										{getFieldDecorator('inventory', {
											initialValue: '',
											getValueFromEvent: (value) => { return this.formatterNum(value) }
										})(<InputNumber placeholder="请输入" min={0} max={10000000} />)}
									</FormItem>
								</div>
								<div className={styles.shopDetailInfoItem}>
									<p>划线价</p>
									<FormItem>
										{getFieldDecorator('originPrice', {
											initialValue: '',
											getValueFromEvent: (value) => { return this.formatterToFixed(value) }
										})(<InputNumber placeholder="请输入" min={0} max={10000000} />)}
									</FormItem>
								</div>
								<div className={styles.shopDetailInfoItem}>
									<p>起购数量&nbsp;&nbsp;<Icon type="question-circle" theme='filled' /></p>
									<FormItem>
										{getFieldDecorator('minBuyAmount', {
											initialValue: 1,
											getValueFromEvent: (value) => { return this.formatterNum(value) }
										})(<InputNumber min={1} max={9999} disabled={combinationAmount > 1} placeholder="请输入" onBlur={this.handlePurchase} />)}
									</FormItem>
								</div>
							</Form>
							<div className={styles.lineBorder}></div>
						</div>
					</div>

					<div className={`flex-start ${styles.shopSpecifications}`}>
						<p className={styles.formTitle}>商品规格：</p>
						<div className={styles.shopSpecificationsInfo}>
							{replaceTemp.length > 0 &&
								<p>最多添加三个商品规格，第一个商品规格可添加规格图片</p>
							}

							<Form className={styles.shopSpecificationsInfoList}>
								{replaceTemp.map((item, index) => {
									return (
										<div key={item.keyId}>
											<div className={`flex-between ${styles.shopSpecificationsInfoListHeader}`}>
												<FormItem>
													<Select style={{ width: '240px' }} placeholder="请添加" value={item.k} allowClear onSelect={(val) => {this.handleSelectValueChange(val, index)}}>
														{storeSkuOptions.map((child) => { return <Option disabled={child.disabled} key={child.value} value={child.value}>{child.label}</Option> })}
													</Select>
												</FormItem>
												<a onClick={() => { this.handleCloseList(index) }}>删除规格</a>
											</div>
											<div className={styles.shopSpecificationsInfoListContent}>
												{item.properties && item.properties.length > 0 &&
													<ul className={`flex-start`}>
														{item.properties.map((child, childIndex) => {
															return (
																<li key={childIndex}>
																	<p className='beyond-ellipsis' title={child.v}>{child.v}</p>
																	<div onClick={() => {this.handleCloseSize(index, childIndex)}}><Icon type="close-circle" theme='filled' /></div>
																</li>
															)
														})}
													</ul>
												}
												<div className='flex-start'>
													<FormItem>
														<Input value={item.inputVal} onChange={(event) => {this.handleInputChange(event,index)}} placeholder="请输入规格值名称" allowClear style={{ width: '160px', marginRight: '16px' }} maxLength={100} />
													</FormItem>
													<a onClick={() => {this.handleAddSize(index)}}>添加规格值</a>
												</div>
											</div>
										</div>
									)
								})}
							</Form>

							{replaceTemp.length < 3 && <Button icon="plus" className={styles.shopSpecificationsInfoBtn} onClick={this.handleAddList}>添加规格</Button>}
						</div>
					</div>

					{
						skuParams.length > 0 &&
						<div className={`flex-start ${styles.shopSkuDetail}`}>
							<p className={styles.formTitle}>规格明细：</p>
							<div><Table columns={detailColumn} rowKey= {'key'} pagination={false} dataSource={skuParams}/></div>
						</div>
					}

					<div className={`flex-start ${styles.shopInventory}`}>
						<p className={styles.formTitle}>库存计算：</p>
						<div>
							<Radio.Group onChange={this.handleInventoryChoose} value={inventorySubtractType}>
								<Radio value={1}>付款减库存</Radio>
								<Radio value={2}>拍下减库存</Radio>
							</Radio.Group>
						</div>
					</div>
				</div>
			</div>
		)
	}
}

const mapStateToProps = ({ commodityEdit, global }: {
	commodityEdit: EditStateType;
	global: GlobalModelState;
}) => ({
	commodityEdit,
	identity: global.identity,
})

export default connect(mapStateToProps)(Form.create<CommoditySellInfoProps>()(CommoditySellInfo));


