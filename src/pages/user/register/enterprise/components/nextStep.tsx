import React, { useState, useEffect, ChangeEvent } from 'react';
import BlockPlane from '@/components/BlockPlane';
import {
	Form,
	Input,
	Cascader,
	Button,
	Radio,
	Checkbox,
	notification,
	Icon,
	DatePicker,
	Select,
	Popover,
	Modal,
} from 'antd';
import UploadImg from '@/components/UploadImg';
import { FormComponentProps, FormProps } from 'antd/es/form/Form';
import { FormItemProps } from 'antd/es/form/FormItem';
import { CascaderOptionType } from 'antd/es/cascader';
import { getSelectAddress } from '@/pages/logisticsManage/address/service';
import styles from '../../index.less';
import { nameNotice } from '../../personal/config';
import { IDAuthByUrl } from '../../service'
import moment from 'moment'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
const Option = Select.Option;

function formatLayout(label: number): FormProps {
	return {
		labelCol: {
			span: 2 + label,
		},
		wrapperCol: {
			span: 22 - label,
		},
	};
}

const Upload = (extension?: React.ReactNode, callback?: Function) => (
	<UploadImg
		limit={1}
		accept=".jpg,.png"
		name="files"
		uploadUrl="/yingzhong_store_service/external/upload/uploadfile"
		placeholder={extension}
		callback={callback}
	>
		{extension ? <span>上传文件</span> : <div>上传文件</div>}
	</UploadImg>
);

const PopoverContext = (
	<ul className={styles.PopoverContext}>
		<li>·【商号】是您公司名的关键字，用于区别其他公司</li>
		<li>
			· 公司名一般由四部分组成，如：连云港<span>（行政区划）</span>丰特<span>（商号）</span>
			服饰<span>（行业特点）</span>有限公司<span>（组织形似）</span>
		</li>
		<li>· 您的商号不应该含有：行政区划、行业特点以及组织形式等名词</li>
	</ul>
);

interface modalType {
	show: boolean;
	content: Array<string>;
	title: string;
}

const modalDefaultData = {
	show: false,
	content: [''],
	title: '',
};

const Reg = /(趣专享特许|趣专享授权|特约经营|特约经销|总经销|总代理|厂家认证|官方店铺|旗舰|专卖|专营|官方|直营|官|官方认证|官方授权|特许经营|特许经销)/;

export interface NextStepPropsType {
	storeType: number | null;
	categoryList: Array<{ label: string; value: string }>;
	goBack: Function;
	nextStepData: any | undefined;
	firstStepData: {
		brandInfoReqList: Array<{ name: string, type: number }>
	},
	submit: Function;
}

interface propsType extends FormComponentProps, NextStepPropsType { }

const NextStep = (props: propsType) => {
	const [name, setName] = useState<string>('');
	const [options, setOptions] = useState<Array<CascaderOptionType>>([]);
	const [modal, setModal] = useState<modalType>(modalDefaultData);
	const [validateName, setValidateName] = useState<FormItemProps>({});
	const [agree, setAgree] = useState<boolean>(false);

	const {
		storeType,
		form: { getFieldDecorator, getFieldsValue, getFieldValue, validateFieldsAndScroll, setFields, setFieldsValue },
		firstStepData: {
			brandInfoReqList
		},
		categoryList,
		goBack,
		submit,
		nextStepData
	} = props;

	useEffect(() => {
		console.log(nextStepData)
		if (nextStepData) {
			setFieldsValue(nextStepData, () => {
				if (nextStepData.storeInfoReq.isSameToComCorp === 2) {
					setFieldsValue({
						['storeInfoReq.corpCardNoZUrl']: nextStepData.storeInfoReq.corpCardNoZUrl,
						['storeInfoReq.corpCardNoFUrl']: nextStepData.storeInfoReq.corpCardNoFUrl,
					})
				}
				if (nextStepData.storeInfoReq.cardNoUrlZ && nextStepData.storeInfoReq.cardNoUrlZ.length) {
					setFieldsValue({
						['storeInfoReq.idCardName']: nextStepData.storeInfoReq.idCardName,
						['storeInfoReq.idCardNum']: nextStepData.storeInfoReq.idCardNum,
					})
				}
				if (nextStepData.storeInfoReq.cardNoUrlF && nextStepData.storeInfoReq.cardNoUrlF.length) {
					setFieldsValue({
						['storeInfoReq.idCardExpireDate']: nextStepData.storeInfoReq.idCardExpireDate,
					})
				}
			})
		}
	}, [])

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

	function createStore() {
		validateFieldsAndScroll((err, value) => {
			if (err) return;
			submit(value);
		});
	}

	function handleStoreNameChange(e: ChangeEvent<HTMLInputElement>) {
		const value = e.target.value;
		setName(value);
		let regResult: Array<string> | null;
		if ((regResult = Reg.exec(value))) {
			setValidateName({
				help: '店铺名不出现' + regResult[0],
				validateStatus: 'error',
			});
		} else {
			setValidateName({});
		}
	}

	const validationIDCard = (fileList: any, key: string, faceOrBack: string) => {
		IDAuthByUrl({ picUrl: fileList[0].url, backOrFace: faceOrBack })
			.then(res => {
				setFields({ [key]: { value: fileList, errors: [] } })
				if (key === 'storeInfoReq.cardNoUrlZ') {
					setFieldsValue({
						['storeInfoReq.idCardName']: res.data.name,
						['storeInfoReq.idCardNum']: res.data.num
					})
				}
				if (key === 'storeInfoReq.cardNoUrlF') {
					setFieldsValue({
						['storeInfoReq.idCardExpireDate']: moment(res.data.end_date),
					})
				}
			}, err => {
				console.log(err, 'err')
				setFields({ [key]: { value: [], errors: [<span>身份证识别错误<br />请上传正确的身份证</span>] } })
			})
	};

	const categoryListOptions = categoryList.map(item => (
		<Option key={item.label} value={item.value}>
			{item.value}
		</Option>
	));

	let StoreName: React.ReactNode;

	switch (storeType) {
		case 21:
			StoreName = (
				<FormItem label="店铺名称" className={styles.IDCardForm}>
					<Form layout="inline">
						<FormItem label="" colon={false}>
							{getFieldDecorator('storeInfoReq.name[0]', {
								initialValue: brandInfoReqList[0].name,
							})(<Input disabled style={{ width: '120px' }} />)}
						</FormItem>
						<FormItem label="" colon={false}>
							{getFieldDecorator('storeInfoReq.name[1]', {
								rules: [
									{
										required: true,
										message: '请选择类目',
									},
								],
							})(
								<Select placeholder="请选择类目" style={{ width: '120px' }}>
									{categoryListOptions}
								</Select>,
							)}
						</FormItem>
						<FormItem label="" colon={false}>
							{getFieldDecorator('storeInfoReq.name[2]', {
								initialValue: brandInfoReqList[0].type === 1 ? '官方旗舰店' : '旗舰店',
							})(<Input disabled style={{ width: '120px' }} />)}
						</FormItem>
					</Form>
				</FormItem>
			);
			break;
		case 22:
			StoreName = (
				<FormItem label="店铺名称" className={styles.IDCardForm}>
					<Form layout="inline">
						<FormItem label="" colon={false}>
							{getFieldDecorator('storeInfoReq.name[0]', {
								initialValue: brandInfoReqList[0].name,
							})(<Input disabled style={{ width: '120px' }} />)}
						</FormItem>
						<Popover content={PopoverContext} trigger="focus">
							<FormItem label="" colon={false}>
								{getFieldDecorator('storeInfoReq.name[1]', {
									rules: [
										{
											required: true,
											message: '请输入企业商号',
										},
									],
								})(
									<Input
										placeholder="请输入企业商号"
										style={{ width: '120px' }}
									/>,
								)}
							</FormItem>
						</Popover>
						<FormItem label="" colon={false}>
							{getFieldDecorator('storeInfoReq.name[2]', {
								initialValue: '专卖店',
							})(<Input disabled style={{ width: '120px' }} />)}
						</FormItem>
					</Form>
				</FormItem>
			);
			break;
		case 23:
			StoreName = (
				<FormItem label="店铺名称" className={styles.IDCardForm}>
					<Form layout="inline">
						<Popover content={PopoverContext} trigger="focus">
							<FormItem label="" colon={false}>
								{getFieldDecorator('storeInfoReq.name[0]', {
									rules: [
										{
											required: true,
											message: '请输入企业商号',
										},
									],
								})(
									<Input
										placeholder="请输入企业商号"
										style={{ width: '120px' }}
									/>,
								)}
							</FormItem>
						</Popover>
						<FormItem label="" colon={false}>
							{getFieldDecorator('storeInfoReq.name[1]', {
								rules: [
									{
										required: true,
										message: '请选择类目',
									},
								],
							})(
								<Select placeholder="请选择类目" style={{ width: '120px' }}>
									{categoryListOptions}
								</Select>,
							)}
						</FormItem>
						<FormItem label="" colon={false}>
							{getFieldDecorator('storeInfoReq.name[2]', {
								initialValue: '专营店',
							})(<Input disabled style={{ width: '120px' }} />)}
						</FormItem>
					</Form>
				</FormItem>
			);
			break;
		default:
			StoreName = (
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
							onChange={handleStoreNameChange}
						/>,
					)}
					<a
						style={{ marginLeft: '24px' }}
						onClick={() =>
							setModal({
								show: true,
								title: '店铺命名注意事项',
								content: nameNotice,
							})
						}
					>
						店铺命名注意事项
					</a>
				</FormItem>
			);
	}

	return (
		<div>
			<BlockPlane title="店铺信息">
				<Form {...formatLayout(0)}>
					{StoreName}
					<FormItem label="店铺logo:">
						{getFieldDecorator('storeInfoReq.logoUrl', {
							valuePropName: 'fileList',
						})(Upload())}
						<div className={styles.help + ' ' + styles.formItemControlWrapperDiv}>
							只支持 .jpg .png
						</div>
					</FormItem>
					<FormItem label="主营类目">
						{getFieldDecorator('storeInfoReq.mainSalesId', {
							rules: [
								{
									required: true,
									message: '请选择主营类目',
								},
							],
						})(<Select style={{ width: '240px' }} placeholder="请选择主营类目">{categoryListOptions}</Select>)}
					</FormItem>
					<FormItem label="设置密码">
						{getFieldDecorator('storeInfoReq.password', {
							rules: [
								{
									required: true,
									message: '请设置密码',
								},
							],
						})(<Input style={{ width: '240px' }} placeholder="请设置密码" type="password" />)}
					</FormItem>
					<FormItem label="确认密码">
						{getFieldDecorator('confirmPassword', {
							rules: [
								{
									required: true,
									message: '请输入确认密码',
								},
								{
									pattern: new RegExp(getFieldValue('password')),
									message: '请与设置的密码保持一致',
								},
							],
						})(<Input style={{ width: '240px' }} placeholder="请与设置的密码保持一致" type="password" />)}
					</FormItem>
				</Form>
			</BlockPlane>
			<BlockPlane title="身份信息">
				<Form {...formatLayout(1)}>
					<FormItem
						label="开店人身份证件像"
						required={true}
						className={styles.IDCardForm}
					>
						<Form layout="inline">
							<FormItem
								style={{ marginRight: '24px' }}
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
									Upload(
										<div>
											<img
												src="http://iph.href.lu/84x50?text=%E8%BA%AB%E4%BB%BD%E8%AF%81%E6%AD%A3%E9%9D%A2"
												alt=""
											/>
										</div>,
										(fileList: any) => {
											validationIDCard(fileList, 'storeInfoReq.cardNoUrlZ', 'face')
										}
									),
								)}
							</FormItem>
							<FormItem help={getFieldValue('storeInfoReq.cardNoUrlF') ? undefined : '只支持 .jpg .png'}>
								{getFieldDecorator('storeInfoReq.cardNoUrlF', {
									valuePropName: 'fileList',
									rules: [
										{
											required: true,
											message: '请上传身份证背面照',
										},
									],
								})(
									Upload(
										<div>
											<img
												src="http://iph.href.lu/84x50?text=%E8%BA%AB%E4%BB%BD%E8%AF%81%E8%83%8C%E9%9D%A2"
												alt=""
											/>
										</div>,
										(fileList: any) => {
											validationIDCard(fileList, 'storeInfoReq.cardNoUrlF', 'back')
										}
									),
								)}
							</FormItem>
						</Form>
					</FormItem>
					{
						getFieldValue('storeInfoReq.cardNoUrlZ') ?
							<FormItem label=" " colon={false}>
								<div className={styles.trademark} style={{ width: '100%' }}>
									<Form  {...formatLayout(1)}>
										<FormItem label="姓名">
											{getFieldDecorator('storeInfoReq.idCardName', {
												rules: [{
													required: true,
													message: '身份证姓名未识别，请手动填写'
												}]
											})(
												<Input style={{ width: '240px' }} />
											)}
										</FormItem>
										<FormItem label="身份证件号">
											{getFieldDecorator('storeInfoReq.idCardNum', {
												rules: [
													{
														required: true,
														message: '身份证号码未识别，请手动填写'
													},
													{
														pattern: /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/,
														message: '请输入真确的身份证号码'
													}
												]
											})(
												<Input style={{ width: '240px' }} />
											)}
										</FormItem>
										<FormItem label="身份证件有效期">
											{getFieldDecorator('storeInfoReq.idCardExpireDate', {
												rules: [{
													required: true,
													message: '身份证有效期未识别，请手动选择'
												}]
											})(
												<DatePicker style={{ width: '240px' }} format="YYYY/MM/DD" />
											)}
										</FormItem>
									</Form>
								</div>
							</FormItem>
							: null
					}
					<FormItem label="企业法人和开店人是否同一人">
						{getFieldDecorator('storeInfoReq.isSameToComCorp', {
							initialValue: 1,
							rules: [
								{
									required: true,
									message: '请选择是否三证合一',
								},
							],
						})(
							<RadioGroup>
								<Radio key="1" value={1}>
									是同一人
								</Radio>
								<Radio key="2" value={2}>
									不是同一人
								</Radio>
							</RadioGroup>,
						)}
					</FormItem>
					{getFieldValue('storeInfoReq.isSameToComCorp') === 2 ? (
						<FormItem
							label="企业法人身份证像"
							required={true}
							className={styles.IDCardForm}
							help={getFieldValue('storeInfoReq.corpCardNoZUrl') ? undefined : '只支持 .jpg .png'}
						>
							<Form layout="inline">
								<FormItem style={{ marginRight: '24px' }}>
									{getFieldDecorator('storeInfoReq.corpCardNoZUrl', {
										valuePropName: 'fileList',
										rules: [
											{
												required: true,
												message: '请上传身份证正面照',
											},
										],
									})(
										Upload(
											<div>
												<img
													src="http://iph.href.lu/84x50?text=%E8%BA%AB%E4%BB%BD%E8%AF%81%E6%AD%A3%E9%9D%A2"
													alt=""
												/>
											</div>,
											(fileList: any) => {
												validationIDCard(fileList, 'storeInfoReq.corpCardNoZUrl', 'face')
											}
										),
									)}
								</FormItem>
								<FormItem help={getFieldValue('storeInfoReq.corpCardNoFUrl') ? undefined : '只支持 .jpg .png'}>
									{getFieldDecorator('storeInfoReq.corpCardNoFUrl', {
										valuePropName: 'fileList',
										rules: [
											{
												required: true,
												message: '请上传身份证背面照',
											},
										],
									})(
										Upload(
											<div>
												<img
													src="http://iph.href.lu/84x50?text=%E8%BA%AB%E4%BB%BD%E8%AF%81%E8%83%8C%E9%9D%A2"
													alt=""
												/>
											</div>,
											(fileList: any) => {
												validationIDCard(fileList, 'storeInfoReq.corpCardNoFUrl', 'back')
											}
										),
									)}
								</FormItem>
							</Form>
						</FormItem>
					) : null}
				</Form>
			</BlockPlane>
			<div className={styles.agreeDeal}>
				<Checkbox checked={agree} onChange={e => setAgree(e.target.checked)} />
				<span>我已经阅读并同意</span>
				<a>《趣专享平台服务合同协议》</a>
			</div>
			<div className={styles.bottomBox}>
				<Button type="primary" disabled={!agree} onClick={() => createStore()}>
					创建店铺
				</Button>
				<Button onClick={() => goBack(getFieldsValue())}>上一步</Button>
			</div>
			<Modal
				visible={modal.show}
				title={modal.title}
				width={618}
				className={styles.modalWrap}
				footer={
					<Button type="primary" onClick={() => setModal(modalDefaultData)}>
						确定
					</Button>
				}
				onCancel={() => setModal(modalDefaultData)}
			>
				{modal.content.map((item, index) => (
					<p key={index}>{item}</p>
				))}
			</Modal>
		</div>
	);
};

export default Form.create<propsType>()(NextStep);
