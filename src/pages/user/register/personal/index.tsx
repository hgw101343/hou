import React, { ChangeEvent } from 'react';
import { connect } from 'dva';
import { Dispatch } from 'redux'
import { Form, Input, Button, Icon, Select, Checkbox, Radio, DatePicker, Modal, Spin } from 'antd';
import { FormComponentProps, FormProps } from 'antd/es/form';
import { FormItemProps } from 'antd/es/form/FormItem';
import styles from '../index.less';
import { stateType as personalApplyModelStateType } from '../model';
import { nameNotice } from './config';
import UploadImg from '@/components/UploadImg';
import BlockPlane from '@/components/BlockPlane';
import { IDAuthByUrl } from '../service';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

const Reg = /(趣专享特许|趣专享授权|特约经营|特约经销|总经销|总代理|厂家认证|官方店铺|旗舰|专卖|专营|官方|直营|官|官方认证|官方授权|特许经营|特许经销)/;

const modalDefaultData = {
	show: false,
	content: [''],
	title: '',
};

function formatLayout(label: number): FormProps {
	return {
		labelCol: {
			span: 2 + label,
		},
		wrapperCol: {
			span: 12 - label,
		},
	};
}

export interface PersonalPropsType {
	register: personalApplyModelStateType;
	loading: boolean;
	dispatch: Dispatch;
}

interface stateType {
	name: string;
	validateName: FormItemProps;
	validateIDCard: Array<FormItemProps>;
	agree: boolean;
	modalData: {
		show: boolean;
		content: Array<string>;
		title: string;
	};
}

interface propsType extends FormComponentProps, PersonalPropsType { }

@connect(
	({
		register,
		loading,
	}: {
		register: personalApplyModelStateType;
		loading: {
			models: { [key: string]: boolean };
			effects: { [key: string]: boolean | undefined };
		};
	}) => ({
		register,
		loading: loading.models.register,
	}),
)
class Personal extends React.Component<propsType, stateType> {
	state = {
		name: '',
		validateName: {},
		modalData: modalDefaultData,
		agree: false,
		validateIDCard: [{}, {}],
	};

	componentDidMount() {
		const {
			register: {
				storeData
			},
			form: {
				setFieldsValue
			}
		} = this.props
		if (storeData) {
			setFieldsValue(storeData)
		}
	}

	createStore() {
		this.props.form.validateFields((err, value) => {
			console.log(value)
			if (err) return;
			const data = {
				phone: this.props.register.phone,
				storeInfoReq: {
					...value.storeInfoReq,
					cardNoUrlF: value.storeInfoReq.cardNoUrlF[0].url,
					cardNoUrlZ: value.storeInfoReq.cardNoUrlZ[0].url,
					storeType: this.props.register.applyType,
				}
			}

			if (this.props.register.applyType === 12) {
				data['companyInfoReq'] = {
					...value.companyInfoReq,
					businessLicenseUrl: value.companyInfoReq.businessLicenseUrl[0],
					businessExpiredDate: value.companyInfoReq.businessExpiredDate.format('YYYY/MM/DD') + ' 00:00:00'
				}
			}
			console.log(data)
			this.props.dispatch({
				type: 'register/applyStore',
				payload: data
			})
		});
	}
	handleStoreNameChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		this.setState({
			name: value,
		});
		let regResult: Array<string> | null;
		if ((regResult = Reg.exec(value))) {
			this.setState({
				validateName: {
					help: '店铺名不出现' + regResult[0],
					validateStatus: 'error',
				},
			});
		} else {
			this.setState({
				validateName: {},
			});
		}
	};

	validationIDCard = (fileList: any, key: string) => {
		IDAuthByUrl({ picUrl: fileList[0].url, backOrFace: key === 'storeInfoReq.cardNoUrlZ' ? 'face' : 'back' })
			.then(res => {
				this.props.form.setFields({ [key]: { value: fileList, errors: [] } })
			}, err => {
				console.log(err, 'err')
				this.props.form.setFields({ [key]: { value: [], errors: [<span>身份证识别错误<br />请上传正确的身份证</span>] } })
			})
	};

	render() {
		const {
			loading,
			register: { applyType, categoryList },
			form: { getFieldDecorator, getFieldValue },
		} = this.props;

		const { modalData, validateName, name, agree, validateIDCard } = this.state;
		const categoryListOption = categoryList.map(item => (
			<Option key={item.label} value={item.value}>
				{item.value}
			</Option>
		));

		return (
			<div className={styles.container}>
				<Spin spinning={loading === true}>
					<BlockPlane title="店铺信息">
						<Form {...formatLayout(0)}>
							<FormItem label="店铺名称" {...validateName}>
								{getFieldDecorator('storeInfoReq.name', {
									rules: [
										{
											required: true,
											message: '请输入店铺名称',
										},
										{
											max: 20,
											message: '店铺名称不得超过20个字！',
										},
									],
								})(
									<Input
										suffix={name.length + '/20'}
										style={{ width: '360px' }}
										onChange={e => this.handleStoreNameChange(e)}
										placeholder="请输入店铺名称"
									/>,
								)}
								<a
									style={{ marginLeft: '24px' }}
									onClick={() =>
										this.setState({
											modalData: {
												show: true,
												title: '店铺命名注意事项',
												content: nameNotice,
											},
										})
									}
								>
									店铺命名注意事项
								</a>
							</FormItem>
							<FormItem label="店铺logo" help={getFieldValue('storeInfoReq.logoUrl') ? undefined : '只支持 .jpg .png'}>
								{getFieldDecorator('storeInfoReq.logoUrl', {
									valuePropName: 'fileList',
								})(
									<UploadImg
										uploadUrl="/yingzhong_store_service/external/upload/uploadfile"
										limit={1}
										accept=".jpg,.png"
										name="files"
									>
										<div>上传文件</div>
									</UploadImg>,
								)}
							</FormItem>
							<FormItem label="主营类目">
								{getFieldDecorator('storeInfoReq.mainSalesId', {
									rules: [
										{
											required: true,
											message: '请选择主营类目',
										},
									],
								})(
									<Select style={{ width: '240px' }} placeholder="请选择主营类目">
										{categoryListOption}
									</Select>,
								)}
							</FormItem>
							<FormItem label="设置密码">
								{getFieldDecorator('storeInfoReq.password', {
									rules: [
										{
											required: true,
											message: '请设置密码',
										},
									],
								})(
									<Input
										style={{ width: '240px' }}
										placeholder="请设置密码"
										type="password"
									/>,
								)}
							</FormItem>
							<FormItem label="确认密码">
								{getFieldDecorator('confirmPassword', {
									rules: [
										{
											required: true,
											message: '请输入确认密码',
										},
										{
											pattern: new RegExp(
												getFieldValue('storeInfoReq.password'),
											),
											message: '请与设置的密码保持一致',
										},
									],
								})(
									<Input
										style={{ width: '240px' }}
										placeholder="请输入确认密码"
										type="password"
									/>,
								)}
							</FormItem>
						</Form>
					</BlockPlane>
					<BlockPlane title="开店人信息">
						<Form {...formatLayout(1)}>
							<FormItem
								label="身份证件像"
								required={true}
								className={styles.IDCardForm}
							>
								<Form layout="inline">
									<FormItem
										style={{ marginRight: '24px' }}
										{...validateIDCard[0]}
										help={getFieldValue('storeInfoReq.cardNoUrlZ') ? undefined : '只支持 .jpg .png'}
									>
										{getFieldDecorator('storeInfoReq.cardNoUrlZ', {
											valuePropName: 'fileList',
											rules: [
												{
													required: true,
													message: '请上传身份证正面照',
												},
											],
										})(
											<UploadImg
												uploadUrl="/yingzhong_store_service/external/upload/uploadfile"
												placeholder={
													<div>
														<img
															src="http://iph.href.lu/84x50?text=%E8%BA%AB%E4%BB%BD%E8%AF%81%E6%AD%A3%E9%9D%A2"
															alt=""
														/>
													</div>
												}
												limit={1}
												accept=".jpg,.png"
												name="files"
												callback={list =>
													this.validationIDCard(
														list,
														'storeInfoReq.cardNoUrlZ',
													)
												}
											>
												<span>上传文件</span>
											</UploadImg>,
										)}
									</FormItem>
									<FormItem {...validateIDCard[1]} help={getFieldValue('storeInfoReq.cardNoUrlF') ? undefined : '只支持 .jpg .png'}>
										{getFieldDecorator('storeInfoReq.cardNoUrlF', {
											valuePropName: 'fileList',
											rules: [
												{
													required: true,
													message: '请上传身份证背面照',
												},
											],
										})(
											<UploadImg
												uploadUrl="/yingzhong_store_service/external/upload/uploadfile"
												placeholder={
													<div>
														<img
															src="http://iph.href.lu/84x50?text=%E8%BA%AB%E4%BB%BD%E8%AF%81%E8%83%8C%E9%9D%A2"
															alt=""
														/>
													</div>
												}
												limit={1}
												accept=".jpg,.png"
												name="files"
												callback={list =>
													this.validationIDCard(
														list,
														'storeInfoReq.cardNoUrlF',
													)
												}
											>
												<span>上传文件</span>
											</UploadImg>,
										)}
									</FormItem>
								</Form>
							</FormItem>
						</Form>
					</BlockPlane>
					{applyType === 12 ? (
						<BlockPlane title="营业执照信息">
							<Form {...formatLayout(1)}>
								<FormItem label="营业执照" help={getFieldValue('companyInfoReq.businessLicenseUrl') ? undefined : '只支持 .jpg .pdf'}>
									{getFieldDecorator('companyInfoReq.businessLicenseUrl', {
										rules: [
											{
												required: true,
												message: '请上传营业执照',
											},
										],
										valuePropName: 'fileList'
									})(
										<UploadImg
											uploadUrl="/yingzhong_store_service/external/upload/uploadfile"
											name="files"
											showLoading={false}
											accept=".jpg,.pdf"
											limit={1}
											listType="text"
										>
											<Button className="ant-upload-text">
												<Icon type="plus" />
												上传文件
											</Button>
										</UploadImg>,
									)}
								</FormItem>
								<FormItem label="是否三证合一">
									{getFieldDecorator('companyInfoReq.threeInOne', {
										initialValue: true,
										rules: [
											{
												required: true,
											},
										],
									})(
										<RadioGroup>
											<Radio value={true}>是</Radio>
											<Radio value={false}>否</Radio>
										</RadioGroup>,
									)}
								</FormItem>
								{getFieldValue('companyInfoReq.threeInOne') ? (
									<FormItem label="统一社会信用代码">
										{getFieldDecorator('companyInfoReq.reputationNo', {
											rules: [
												{
													required: true,
													message: '请输入统一社会信用代码',
												},
												{
													pattern: /^92[0-9A-Z]{16,16}$/,
													message: "请输入92开头的18位阿拉伯数字或大写英文字母"
												}
											],
										})(
											<Input
												style={{ width: '288px' }}
												placeholder="请输入92开头的18位阿拉伯数字或大写英文字母"
											/>,
										)}
									</FormItem>
								) : (
										<FormItem label="营业执照注册号">
											{getFieldDecorator('companyInfoReq.reputationNo', {
												rules: [
													{
														required: true,
														message: '请输入营业执照注册号',
													},
												],
											})(<Input style={{ width: '288px' }} />)}
										</FormItem>
									)}
								<FormItem label="营业期限">
									{getFieldDecorator('companyInfoReq.businessExpiredDate', {
										rules: [
											{
												required: true,
												message: '请输入营业期限',
											},
										],
									})(<DatePicker style={{ width: '288px' }} format="YYYY/MM/DD" />)}
									{getFieldDecorator('companyInfoReq.isPermanent', {
										valuePropName: 'checked',
									})(<Checkbox style={{ marginLeft: '24px' }}>长期</Checkbox>)}
									<a style={{ marginLeft: '24px' }}>查看示例</a>
								</FormItem>
							</Form>
						</BlockPlane>
					) : null}

					<div className={styles.agreeDeal}>
						<Checkbox
							checked={agree}
							onChange={e => this.setState({ agree: e.target.checked })}
						/>
						<span>我已经阅读并同意</span>
						<a href="file:///D:/download/%E8%B6%A3%E4%B8%93%E4%BA%AB%E5%B9%B3%E5%8F%B0%E6%9C%8D%E5%8A%A1%E5%90%88%E5%90%8C%E5%8D%8F%E8%AE%AE%20(%E6%97%A0%E4%BF%9D%E8%AF%81%E9%87%91%E7%89%88)%20.pdf">《趣专享平台服务合同协议》</a>
					</div>
					<div className={styles.bottomBox}>
						<Button type="primary" disabled={!agree} onClick={() => this.createStore()}>
							创建店铺
						</Button>
					</div>
					<Modal
						visible={modalData.show}
						title={modalData.title}
						width={618}
						className={styles.modalWrap}
						footer={
							<Button
								type="primary"
								onClick={() => this.setState({ modalData: modalDefaultData })}
							>
								确定
							</Button>
						}
						onCancel={() => this.setState({ modalData: modalDefaultData })}
					>
						{modalData.content.map((item, index) => (
							<p key={index}>{item}</p>
						))}
					</Modal>
				</Spin>
			</div>
		);
	}
}

export default Form.create<propsType>()(Personal);
