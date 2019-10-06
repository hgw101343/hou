import React, { useState, useEffect } from 'react';
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
	Divider,
} from 'antd';
import UploadImg from '@/components/UploadImg';
import { FormComponentProps, FormProps } from 'antd/es/form/Form';
import { CascaderOptionType } from 'antd/es/cascader';
import { getSelectAddress } from '@/pages/logisticsManage/address/service';
import { areaType } from '@/pages/logisticsManage/address/model';
import styles from '../../index.less';
import { config } from '@/utils/config'

const FormItem = Form.Item;
const RadioGroup = Radio.Group;

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

const Upload = (limit: number, extension?: React.ReactNode) => (
	<UploadImg
		limit={limit}
		accept=".jpg,.pdf"
		name="files"
		showLoading={false}
		uploadUrl="/yingzhong_store_service/external/upload/uploadfile"
		listType="text"
	>
		<Button>
			<Icon type="upload" />
			<span>上传文件</span>
		</Button>
		{extension}
	</UploadImg>
);

export interface FirstStepPropsType {
	addressOption: Array<areaType>;
	storeType: number | null;
	goNext: Function;
	firstStepData: any | undefined;
	setSample: Function;
}

interface propsType extends FormComponentProps, FirstStepPropsType { }

const FirstStep = (props: propsType) => {
	const [options, setOptions] = useState<Array<CascaderOptionType>>([]);

	const {
		addressOption,
		storeType,
		goNext,
		firstStepData,
		setSample,
		form: { getFieldDecorator, getFieldValue, validateFieldsAndScroll, setFieldsValue },
	} = props;
	useEffect(() => {
		if (firstStepData) {
			setFieldsValue(firstStepData, () => {
				if (storeType !== 22) {
					if (firstStepData.brandInfoReqList) {
						firstStepData.brandInfoReqList.map((item: any, index: number) => {
							if (item.type === 2) {
								setFieldsValue({
									['brandInfoReqList[' + index + '].brandAuthCerUrl']: item.brandAuthCerUrl,
									['brandInfoReqList[' + index + '].authExpiredDate']: item.authExpiredDate,
									['brandInfoReqList[' + index + '].registrantType']: item.registrantType,
								}, () => {
									firstStepData.brandInfoReqList.map((item: any, index: number) => {
										if (item.holderIdenUrl && !getFieldValue('brandInfoReqList[' + index + '].holderIdenUrl')) {
											setFieldsValue({ ['brandInfoReqList[' + index + '].holderIdenUrl']: item.holderIdenUrl })
										}
									})
								})
							}
						})
					}
				} else {
					firstStepData.brandInfoReqList.map((item: any, index: number) => {
						if (item.holderIdenUrl && !getFieldValue('brandInfoReqList[' + index + '].holderIdenUrl')) {
							setFieldsValue({ ['brandInfoReqList[' + index + '].holderIdenUrl']: item.holderIdenUrl })
						}
					})
				}
				if (!firstStepData.companyInfoReq.threeInOne) {
					setFieldsValue({
						['companyInfoReq.orgCode']: firstStepData.companyInfoReq.orgCode,
						['companyInfoReq.taxIdCode']: firstStepData.companyInfoReq.taxIdCode,
						['companyInfoReq.orgCodeExpiredDate']: firstStepData.companyInfoReq.orgCodeExpiredDate,
						['companyInfoReq.orgCodeCerUrl']: firstStepData.companyInfoReq.orgCodeCerUrl,
						['companyInfoReq.taxRegCerUrl']: firstStepData.companyInfoReq.taxRegCerUrl,
					})
				}
			})
		}
	}, [])
	useEffect(() => {
		setOptions(addressOption);
	}, [addressOption]);

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

	function nextStep() {
		validateFieldsAndScroll((err, value) => {
			if (err) return;
			goNext(value);
		});
	}

	const renderList = storeType === 23 ? [0, 1] : [0];
	const BrandBlock = storeType !== 24 ? renderList.map(item => {
		return (
			<>
				{item !== 0 ? <Divider /> : null}
				<Form {...formatLayout(1)} key={item}>
					<FormItem label="品牌类型">
						{storeType === 22 ? (
							<span>授权品牌</span>
						) : (
								<>
									{getFieldDecorator('brandInfoReqList[' + item + '].type', {
										initialValue: 1,
										rules: [
											{
												required: true,
												message: '请选择品牌类型',
											},
										],
									})(
										<RadioGroup>
											<Radio key="1" value={1}>
												自有品牌
										</Radio>
											<Radio key="2" value={2}>
												授权品牌
										</Radio>
										</RadioGroup>,
									)}
									<div className={styles.formItemControlWrapperDiv}>
										自有品牌即品牌下面的商标，其权利人是您的开店公司或者开店公司的法定代表人；若不是，则是授权品牌。
								</div>
								</>
							)}
					</FormItem>
					<FormItem label="品牌名称">
						{getFieldDecorator('brandInfoReqList[' + item + '].name', {
							rules: [
								{
									required: true,
									message: '请输入品牌名称',
								},
							],
						})(<Input style={{ width: '288px' }} placeholder="请输入品牌名称" />)}
					</FormItem>
					{storeType === 22 ||
						getFieldValue('brandInfoReqList[' + item + '].type') === 2 ? (
							<>
								<FormItem
									label={storeType === 21 ? "品牌独占授权书" : "品牌授权书"}
									help={getFieldValue('brandInfoReqList[' + item + '].brandAuthCerUrl') ? undefined : '只支持 .jpg .pdf'}
								>
									{getFieldDecorator(
										'brandInfoReqList[' + item + '].brandAuthCerUrl',
										{
											rules: [
												{
													required: true,
													message: '请上传品牌授权书',
												},
											],
											valuePropName: 'fileList',
										},
									)(Upload(1))}
									{storeType === 21 ? (
										<div className={styles.formItemControlWrapperDiv}>
											点击下载<a style={{ marginLeft: '0' }} download href={config.REQUEST_URL + config.SERVICE + "/api/store/authorizationTemplate.docx"}>授权模版</a>
											，按照授权模版填写，加盖品牌方授权公司及开店公司红色公章后上传
									</div>
									) : null}
								</FormItem>
								<FormItem label="授权有效期：">
									{getFieldDecorator(
										'brandInfoReqList[' + item + '].authExpiredDate',
										{
											rules: [
												{
													required: true,
													message: '请选择授权有效期',
												},
											],
										},
									)(<DatePicker style={{ width: '288px' }} format="YYYY/MM/DD" />)}
								</FormItem>
							</>
						) : null}
					<FormItem label="品牌注册商标" required={true}>
						<div className={styles.trademark}>
							<Form {...formatLayout(2)} hideRequiredMark>
								{storeType === 22 ||
									getFieldValue('brandInfoReqList[' + item + '].type') === 2 ? (
										<FormItem label="商标注册人类型">
											{getFieldDecorator(
												'brandInfoReqList[' + item + '].registrantType',
												{
													initialValue: 1,
													rules: [
														{
															required: true,
															message: '请选择商标注册人类型',
														},
													],
												},
											)(
												<RadioGroup>
													<Radio key="1" value={1}>
														非自然人（公司）
												</Radio>
													<Radio key="2" value={2}>
														自然人（个人）
												</Radio>
												</RadioGroup>,
											)}
										</FormItem>
									) : null}
								<FormItem
									label="商标注册号"
									help={getFieldValue('brandInfoReqList[' + item + '].regNo') ? undefined : '只支持 .jpg .pdf'}
								>
									{getFieldDecorator('brandInfoReqList[' + item + '].regNo', {
										rules: [
											{
												required: true,
												message: '请输入商标注册号',
											},
										],
									})(
										<Input
											style={{ width: '288px' }}
											placeholder="请输入商标注册号"
										/>,
									)}
								</FormItem>
								<FormItem label="商标注册证明">
									{getFieldDecorator('brandInfoReqList[' + item + '].regCerUrl', {
										rules: [
											{
												required: true,
												message: '请上传商标注册证明',
											},
										],
										valuePropName: 'fileList',
									})(Upload(2))}
								</FormItem>
								<FormItem label=" " colon={false}>
									<div className={styles.formItemControlWrapperDiv}>
										1.
										请上传《商标注册证》或申请日起已满6个月的《注册申请受理通知书》
									</div>
									<div className={styles.formItemControlWrapperDiv}>
										2.
										上传的《商标注册证》或《商标受理通知书》的申请人或注册人必须为开店公司
									</div>
									<div className={styles.formItemControlWrapperDiv}>
										3.
										变更中的商标请同时上传《变更受理通知书》和《注册申请受理通知书》
									</div>
									<div className={styles.formItemControlWrapperDiv}>
										4.转入/已转让的商标需上传《转让受理通知书》或者《转让证明》
									</div>
									<div className={styles.formItemControlWrapperDiv}>
										5
										《商标注册证》续证完成，而原《商标注册证》已经过期，需同时上传《核准续证注册证明》
									</div>
								</FormItem>
								<FormItem label="证明有效期">
									{getFieldDecorator(
										'brandInfoReqList[' + item + '].cerExpiredDate',
										{
											rules: [
												{
													required: true,
													message: '请选择证明有效期',
												},
											],
										},
									)(<DatePicker style={{ width: '288px' }} format="YYYY/MM/DD" />)}
								</FormItem>
								{(storeType === 22 ||
									getFieldValue('brandInfoReqList[' + item + '].type') === 2) &&
									getFieldValue('brandInfoReqList[' + item + '].registrantType') ===
									2 ? (
										<FormItem label="持有人身份证明" help={getFieldValue('brandInfoReqList[' + item + '].holderIdenUrl') ? undefined : '只支持 .jpg .pdf'}>
											{getFieldDecorator(
												'brandInfoReqList[' + item + '].holderIdenUrl',
												{
													rules: [
														{
															required: true,
															message: '请上传持有人身份证明',
														},
													],
													valuePropName: 'fileList',
												},
											)(Upload(2))}
										</FormItem>
									) : null}
							</Form>
						</div>
					</FormItem>
				</Form>
			</>
		);
	}) : null

	return (
		<div>
			<BlockPlane title="企业信息">
				<Form {...formatLayout(1)}>
					<FormItem label="企业名称">
						{getFieldDecorator('companyInfoReq.name', {
							initialValue: '',
							rules: [
								{
									required: true,
									message: '请输入企业名称',
								},
								{
									max: 20,
									message: '企业名称不得超过20个字！',
								},
							],
						})(
							<Input
								suffix={getFieldValue('companyInfoReq.name').length + '/20'}
								style={{ width: '360px' }}
								placeholder="请输入"
							/>,
						)}
					</FormItem>
					<FormItem label="企业注册地址" className={styles.IDCardForm}>
						<Form layout="inline">
							<FormItem label="" colon={false}>
								{getFieldDecorator('companyInfoReq.regAddr', {
									rules: [
										{
											required: true,
											message: '省/市/区',
										},
									],
								})(
									<Cascader
										options={options}
										loadData={handleLoadData}
										placeholder="请选择省市区"
										allowClear
										changeOnSelect
										style={{ width: '178px' }}
									/>,
								)}
							</FormItem>
							<FormItem label="" colon={false}>
								{getFieldDecorator('companyInfoReq.regAddrFull', {
									rules: [
										{
											required: true,
											message: '请输入具体地址',
										},
									],
								})(
									<Input
										placeholder="请输入具体地址"
										style={{ width: '178px' }}
									/>,
								)}
							</FormItem>
						</Form>
					</FormItem>
					<FormItem label="营业执照" help={getFieldValue('companyInfoReq.businessLicenseUrl') ? undefined : '只支持 .jpg .pdf'}>
						{getFieldDecorator('companyInfoReq.businessLicenseUrl', {
							rules: [
								{
									required: true,
									message: '请上传营业执照',
								},
							],
							valuePropName: 'fileList',
						})(Upload(1))}
					</FormItem>
					<FormItem label="是否三证合一">
						{getFieldDecorator('companyInfoReq.threeInOne', {
							initialValue: true,
							rules: [
								{
									required: true,
									message: '请选择是否三证合一',
								},
							],
						})(
							<RadioGroup>
								<Radio key="1" value={true}>
									是
								</Radio>
								<Radio key="2" value={false}>
									否
								</Radio>
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
								<a onClick={() => setSample('https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1569777186286&di=f8c8dedbe6ca2faf7a412a4c3a5a7cee&imgtype=0&src=http%3A%2F%2Fimg.mp.itc.cn%2Fq_70%2Cc_zoom%2Cw_640%2Fupload%2F20161221%2F9a0de9462959453e893de45d75e45670_th.jpg', '营业执照期限示例')}>查看示例</a>
							</FormItem>
						)}
					<FormItem label="营业期限">
						{getFieldDecorator('companyInfoReq.businessExpiredDate', {
							rules: [
								{
									required: true,
									message: '请选择营业期限',
								},
							],
						})(<DatePicker style={{ width: '288px' }} format="YYYY/MM/DD" />)}
						{getFieldDecorator('companyInfoReq.isPermanent', {
							valuePropName: 'checked',
							initialValue: false
						})(<Checkbox style={{ marginLeft: '24px' }}>长期</Checkbox>)}
						<a style={{ marginLeft: '24px' }}>查看示例</a>
					</FormItem>
					{!getFieldValue('companyInfoReq.threeInOne') ? (
						<>
							<FormItem label="组织机构代码">
								{getFieldDecorator('companyInfoReq.orgCode', {
									rules: [
										{
											required: true,
											message: '请输入组织机构代码',
										},
									],
								})(
									<Input
										placeholder="请输入组织机构代码"
										style={{ width: '288px' }}
									/>,
								)}
								<a>查看示例</a>
							</FormItem>
							<FormItem label="纳税人识别码">
								{getFieldDecorator('companyInfoReq.taxIdCode', {
									rules: [
										{
											required: true,
											message: '请输入纳税人识别码',
										},
									],
								})(
									<Input
										placeholder="请输入纳税人识别码"
										style={{ width: '288px' }}
									/>,
								)}
								<a>查看示例</a>
							</FormItem>
							<FormItem label="组织机构代码有效期">
								{getFieldDecorator('companyInfoReq.orgCodeExpiredDate', {
									rules: [
										{
											required: true,
											message: '请选择组织机构代码有效期',
										},
									],
								})(<DatePicker style={{ width: '288px' }} format="YYYY/MM/DD" />)}
								<a style={{ marginLeft: '24px' }}>查看示例</a>
							</FormItem>
							<FormItem label="组织机构代码证" help={getFieldValue('companyInfoReq.orgCodeCerUrl') ? undefined : '只支持 .jpg .pdf'}>
								{getFieldDecorator('companyInfoReq.orgCodeCerUrl', {
									rules: [
										{
											required: true,
											message: '请上传组织机构代码证',
										},
									],
									valuePropName: 'fileList',
								})(Upload(1, <a>查看示例</a>))}
							</FormItem>
							<FormItem label="税务登记证明" help={getFieldValue('companyInfoReq.taxRegCerUrl') ? undefined : '只支持 .jpg .pdf'}>
								{getFieldDecorator('companyInfoReq.taxRegCerUrl', {
									rules: [
										{
											required: true,
											message: '请上传税务登记证明',
										},
									],
									valuePropName: 'fileList',
								})(Upload(1, <a>查看示例</a>))}
							</FormItem>
						</>
					) : null}
					<FormItem label="开户许可证和基本账户存款凭证" help={getFieldValue('companyInfoReq.userLiceCerUrl') ? undefined : '只支持 .jpg .pdf'}>
						{getFieldDecorator('companyInfoReq.userLiceCerUrl', {
							rules: [
								{
									required: true,
									message: '请上传开户许可证和基本账户存款凭证',
								},
							],
							valuePropName: 'fileList',
						})(Upload(1))}
					</FormItem>
					<FormItem label=" " colon={false}>
						<div className={styles.formItemControlWrapperDiv}>
							<span>若所在地未取消开户许可证核发，请上传开户许可证</span>
							<a>查看《开户许可证》范例</a>
						</div>
						<div className={styles.formItemControlWrapperDiv}>
							<span>
								若所在地取消开户许可证核发，请上传开户银行盖章的基本存款账户凭证
							</span>
							<a>查看《开户许可证》范例</a>
						</div>
						<div className={styles.formItemControlWrapperDiv}>
							<a style={{ marginLeft: '0' }}>
								查看《开立银行结算账户清单和申请书》范例
							</a>
						</div>
					</FormItem>
				</Form>
			</BlockPlane>
			{storeType !== 24 ? <BlockPlane title="品牌信息">{BrandBlock}</BlockPlane> : null}
			<div className={styles.stepBtn}>
				<Button type="primary" onClick={nextStep}>
					下一步
				</Button>
			</div>
		</div>
	);
};

export default Form.create<propsType>()(FirstStep);
