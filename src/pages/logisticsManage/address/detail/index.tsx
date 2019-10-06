/**
 * Routes:
 *   - ./src/pages/Authorized.tsx
 *
 */

import React, { useEffect, useState } from 'react';
import { Form, Card, Input, Row, Button, Checkbox, Cascader, notification } from 'antd';
import { connect } from 'dva';
import { FormComponentProps, FormProps } from 'antd/es/form';
import { StateType, areaType } from '../model';
import { Dispatch } from 'redux';
import styles from './index.less';
import { CheckboxChangeEvent } from 'antd/es/checkbox/Checkbox';
import { CascaderOptionType } from 'antd/es/cascader';
import router from 'umi/router';
import { getSelectAddress } from '../service';
import { mobileReg } from '@/utils/validate';

const FormItem = Form.Item;
const InputArea = Input.TextArea;

interface queryLocation extends Location {
	query: string;
}

interface checkPropsType {
	value?: boolean;
	onChange?: (e: CheckboxChangeEvent) => void;
}

class CheckboxWrap extends React.Component<checkPropsType> {
	render() {
		return (
			<Checkbox checked={this.props.value} onChange={this.props.onChange}>
				{this.props.children}
			</Checkbox>
		);
	}
}

function formatLayout(label: number): FormProps {
	return {
		labelCol: {
			span: 7 - label,
		},
		wrapperCol: {
			span: 17,
		},
	};
}

export interface addressDetailType {
	addressManage: StateType;
	dispatch: Dispatch;
	location: queryLocation;
}

interface propsType extends addressDetailType, FormComponentProps {}

const addressDetail: React.FC<propsType> = (props: propsType) => {
	const {
		addressManage: { areaList, detailTitle, detailData, submit },
		dispatch,
		location: { query },
		form: { getFieldDecorator, resetFields, getFieldsValue, validateFields, setFieldsValue },
	} = props;

	const [addressType, setAddressType] = useState<Array<string>>([]);
	const [options, setOptions] = useState<Array<CascaderOptionType>>([]);
	const [defaultAddress, setDefaultAddress] = useState<Array<string>>([]);
	const [phoneToast, setPhoneToast] = useState<string | undefined>(undefined);
	const [addressStatus, setAddressStatus] = useState<string | undefined>(undefined);

	useEffect(() => {
		dispatch({
			type: 'addressManage/getAreaList',
			payload: {
				id: 0,
			},
		});
		return () => {
			dispatch({
				type: 'addressManage/save',
				payload: {
					detailData: null,
				},
			});
		};
	}, []);

	useEffect(() => {
		if (detailData) {
			const arr = [];
			if (detailData.type[0]) {
				arr.push('receiveAddress');
			}
			if (detailData.type[1]) {
				arr.push('sendAddress');
			}
			setAddressType(arr);
			setFieldsValue(detailData);
		}
	}, [detailData]);

	useEffect(() => {
		setOptions(areaList);
	}, [areaList]);

	function hanleCheckedType(e: CheckboxChangeEvent, key: string) {
		const types = Object.assign([], addressType);
		if (e.target.checked) {
			types.push(key);
			setAddressType(types);
		} else {
			setAddressType(types.filter(item => item !== key));
		}
		if (types.length === 0) {
			setAddressStatus('error');
		} else {
			setAddressStatus(undefined);
		}
	}

	function hanleDefaultCheckedType(e: CheckboxChangeEvent, key: string) {
		const types = Object.assign([], defaultAddress);
		if (e.target.checked) {
			types.push(key);
			setDefaultAddress(types);
		} else {
			setDefaultAddress(types.filter(item => item !== key));
		}
	}

	function handleLoadData(selectedOptions: CascaderOptionType[] | undefined) {
		const targetOption = selectedOptions ? selectedOptions[selectedOptions.length - 1] : {};
		targetOption.loading = true;
		try {
			getSelectAddress({ parentId: targetOption.id }).then(res => {
				const data = res.data.map((item: { id: number; name: string }) => ({
					label: item.name,
					value: item.name,
					id: item.id,
					isLeaf: selectedOptions ? selectedOptions.length >= 2 : true,
				}));
				targetOption.children = data;
				targetOption.loading = false;
				setOptions([...options]);
			});
		} catch (err) {
			notification.error({
				message: JSON.stringify(err),
			});
		}
	}

	function handleSubmit() {
		validateFields((err, value) => {
			if (err) return;
			if (!value.phone && !value.telephone.every(item => !!item)) {
				setPhoneToast('error');
				return;
			} else {
				setPhoneToast(undefined);
			}
			if (!value.type.some(item => item)) {
				setAddressStatus('error');
				return;
			} else {
				setAddressStatus(undefined);
			}
			const data = {
				...value,
			};
			if (value.telephone) {
				data.telephone = value.telephone.join('-');
			}
			data.area = value.area.join('-');
			if (defaultAddress.filter(item => !!item).length) {
				defaultAddress.forEach(item => {
					data[item] = true;
				});
			}
			if (query.from === 'edit' && detailData) {
				data['id'] = detailData.id;
			}
			data.type = addressType.length + (addressType.includes('sendAddress') ? 1 : 0);
			data['defaultReceiveAddress'] = data.defaultReceiveAddress
				? data.defaultReceiveAddress
				: false;
			data['defaultSendAddress'] = data.defaultSendAddress ? data.defaultSendAddress : false;
			console.log(value);
			submit(data);
		});
	}

	function handlePhoneChang(value: string) {
		if (value) {
			setPhoneToast(undefined);
		}
	}

	if (query.from === 'edit' && !detailData) {
		router.push('/logisticsManage/address');
	}

	return (
		<Card>
			<div className={styles.title}>{detailTitle}</div>
			<div className={styles.layout}>
				<Form layout="inline" {...formatLayout(1)}>
					<Row>
						<FormItem label="联系人">
							{getFieldDecorator('contact', {
								rules: [
									{
										required: true,
										message: '联系人不能为空',
									},
								],
							})(<Input placeholder="请输入联系人" allowClear />)}
						</FormItem>
					</Row>
					<Row>
						<FormItem label="所在地区">
							{getFieldDecorator('area', {
								rules: [
									{
										required: true,
										message: '请选择地区',
									},
								],
							})(
								<Cascader
									options={options}
									loadData={handleLoadData}
									placeholder="请选择省市区"
									allowClear
									changeOnSelect
								/>,
							)}
						</FormItem>
					</Row>
					<Row>
						<FormItem
							label="街道地址"
							className={styles.steet}
							labelCol={{ span: 3 }}
							wrapperCol={{ span: 18 }}
						>
							{getFieldDecorator('street', {
								rules: [
									{
										required: true,
										message: '请填写地区',
									},
								],
							})(<Input placeholder="请输入街道地址" allowClear />)}
						</FormItem>
					</Row>
					<Row>
						<FormItem label="手机号码" validateStatus={phoneToast}>
							{getFieldDecorator('phone', {
								rules: [
									{
										pattern: mobileReg,
										message: '请输入正确的手机号码',
									},
								],
							})(
								<Input
									placeholder="请输入手机号码"
									onChange={e => handlePhoneChang(e.target.value)}
									allowClear
								/>,
							)}
						</FormItem>
						<FormItem
							label={
								<span
									className={styles.toast}
									style={{ color: phoneToast === 'error' ? 'red' : 'inherit' }}
								>
									注：电话号码与手机号码至少选一项
								</span>
							}
							labelCol={{ span: 17 }}
							colon={false}
						></FormItem>
					</Row>
					<Row>
						<FormItem label="电话号码" validateStatus={phoneToast}>
							{getFieldDecorator('telephone[0]', {
								rules: [
									{
										pattern: /[0-9]+/,
										message: '请输入数字',
									},
								],
							})(
								<Input
									placeholder="请输入"
									style={{ width: '64px' }}
									onChange={e => handlePhoneChang(e.target.value)}
								/>,
							)}
							<span className={styles.prefix}></span>
							{getFieldDecorator('telephone[1]', {
								rules: [
									{
										pattern: /[0-9]+/,
										message: '请输入数字',
									},
								],
							})(<Input placeholder="请输入" style={{ width: '72px' }} />)}
							<span className={styles.prefix}></span>
							{getFieldDecorator('telephone[2]', {
								rules: [
									{
										pattern: /[0-9]+/,
										message: '请输入数字',
									},
								],
							})(<Input placeholder="请输入" style={{ width: '72px' }} />)}
						</FormItem>
					</Row>
					<Row>
						<FormItem
							label="备注"
							className={styles.steet}
							labelCol={{ span: 3 }}
							wrapperCol={{ span: 18 }}
						>
							{getFieldDecorator('remark', {})(
								<InputArea autosize={{ minRows: 4 }} />,
							)}
						</FormItem>
					</Row>
					<Row>
						<FormItem label="地址类型" validateStatus={addressStatus}>
							<div>
								{getFieldDecorator('type[0]', {
									rules: [
										{
											required: addressType.length === 0,
											message: '地址类型必选一个',
										},
									],
								})(
									<CheckboxWrap
										onChange={e => hanleCheckedType(e, 'receiveAddress')}
									>
										退货地址
									</CheckboxWrap>,
								)}
								{addressType.includes('receiveAddress') ? (
									<div style={{ marginLeft: '24px' }}>
										{getFieldDecorator('defaultReceiveAddress', {
											initialValue: detailData
												? detailData.defaultReceiveAddress
												: false,
										})(<CheckboxWrap>设为默认退货地址</CheckboxWrap>)}
									</div>
								) : null}
							</div>
							<div>
								{getFieldDecorator('type[1]', {
									rules: [
										{
											required: addressType.length === 0,
											message: '地址类型必选一个',
										},
									],
								})(
									<CheckboxWrap
										onChange={e => hanleCheckedType(e, 'sendAddress')}
									>
										发货地址
									</CheckboxWrap>,
								)}
								{addressType.includes('sendAddress') ? (
									<div style={{ marginLeft: '24px' }}>
										{getFieldDecorator('defaultSendAddress', {
											initialValue: detailData
												? detailData.defaultSendAddress
												: false,
										})(<CheckboxWrap>设为默认发货地址</CheckboxWrap>)}
									</div>
								) : null}
							</div>
						</FormItem>
					</Row>
				</Form>
			</div>
			<div className={styles.footerBtn}>
				<Button size="large" type="primary" onClick={handleSubmit}>
					保存
				</Button>
				<Button size="large" onClick={() => router.goBack()}>
					返回
				</Button>
			</div>
		</Card>
	);
};

function mapStateFromProps({ addressManage }: { addressManage: StateType }) {
	return {
		addressManage,
	};
}

export default Form.create()(connect(mapStateFromProps)(addressDetail));
