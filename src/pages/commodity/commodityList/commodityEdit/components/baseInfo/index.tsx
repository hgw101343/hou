/* Routes:
*   - ./src/pages/Authorized.tsx
*/
import React, { Component, Fragment } from 'react';
import { Form, Cascader, message, Spin, Modal, Select, Icon, Input } from 'antd';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { EditStateType, CommodityBaseInfoState } from '../declaration';
import { connect } from 'dva';
import { GlobalModelState } from '@/models/global';
import { CommonUtils } from '@/utils/utils';
import styles from './index.less';
import { listRootCategory, listSubCategory } from '../../../service';
import { listAttributeOf, createAttributeVal, createAttribute } from '../../service';

const { Option } = Select;
const FormItem = Form.Item;

const formItemLayout = {
	labelCol: {
		xs: { span: 24 },
		sm: { span: 7 },
	},
	wrapperCol: {
		xs: { span: 24 },
		sm: { span: 12 },
		md: { span: 10 },
	},
};

interface CommodityBaseInfoProps extends FormComponentProps {
	dispatch: Dispatch<any>;
	commodityEdit: EditStateType;
	identity: string;
}

class CommodityBaseInfo extends Component<CommodityBaseInfoProps, CommodityBaseInfoState> {
	state: CommodityBaseInfoState = {
		cascaderOption: [],
        attributeOption: [],
        cascaderLoading: false,
        attuLoading: false,
        addModal: {
            show: false,
            loading: false
        },
        addValueModal:  {
            show: false,
            loading: false
        }
	};

	componentDidMount = () => {
		this.init();
	}

    componentWillUnmount = () => {

    }

	init = () => {

	}

	initFormData = () => {
		const { sourceName, sellPoint, category, attributeParams } = this.props.commodityEdit.baseInfo;
		const { setFieldsValue } = this.props.form;
        setFieldsValue({
            category,
            sourceName,
            sellPoint
        });

		this.initCascaderOption();
		if (category.length > 0) {
			this.listAttributeOf(category[category.length - 1], attributeParams)
		}
	}

	getFormData = () => {
        const { validateFieldsAndScroll } = this.props.form;
        return new Promise((reslove, reject) => {
            validateFieldsAndScroll(['sourceName', 'sellPoint', 'category'],(errors, values) => {
                if(errors) return reject(false);
                let { sourceName, sellPoint, category } = values;
                let { attributeOption } = this.state;
				let attributeParams = [];
				attributeOption.forEach((item, index) => {
					if(item.valIds.length > 0) {
						let obj = {
							id: attributeOption[index].id,
							valIds: item.valIds
						}
						attributeParams.push(obj)
					}
				})

                reslove({
                    sourceName,
                    attributeParams,
                    sellPoint,
                    category
                })
            })
        })

	}

	// 加载一级联数据
	initCascaderOption = () => {
		listRootCategory({}).then(async (res: any) => {
			let data = res.data;
			let cascaderOption = data.map((item: any) => ({
				value: item.id,
				label: item.name,
				isLeaf: item.leaf
			}));
			this.setState({ cascaderOption }, () => {
				if (this.props.commodityEdit.baseInfo.category.length > 1) {
					this.getDefaultCascader();
				}
			})
		})
	}

	// 加载多级联数据
	getDefaultCascader = async () => {
		this.setState({cascaderLoading: true});
		const { baseInfo } = this.props.commodityEdit;
		let parentId = [];
		let arr = [];
		let category = baseInfo.category.slice(0, baseInfo.category.length - 1)
		category.forEach((item) => {
			parentId.push(item);
			let param = {
				id: item,
				parentId: [...parentId],
			}
			arr.push({
				...param,
				promise: this.getCascader(param)
			})
		});
		for (let i = 0; i < arr.length; i++) {
			await arr[i].promise()
		}
		this.setState({
			cascaderOption: [...this.state.cascaderOption],
			cascaderLoading: false
		})
	}

	// 加载子节点
	getCascader = (param: { id: number, parentId: number[] }) => {
		return () => {
			return new Promise((resolve) => {
				listSubCategory({ id: param.id }).then((res: any) => {
					let data = res.data;
					let hasSecond = data.some((item: any) => item.depth == 2);
					if (hasSecond) data = data.filter((item: any) => item.depth == 2);
					const children = data.map((item: any) => ({
						value: item.id,
						label: item.name,
						isLeaf: item.leaf
					}));
					let parentId = '';
					param.parentId.forEach((item, index) => {
						let formatIndex = '';
						if (index == 0) {
							formatIndex = this.state.cascaderOption.findIndex(child => child.value == item);
						} else {
							let parentObj = CommonUtils.getDeepObj(this.state.cascaderOption, parentId);
							let parentIndex = parentObj.children.findIndex(child => child.value == item);
							formatIndex = `.children.${parentIndex}`;
						}
						parentId += `${formatIndex}`;
					})
					let parent = CommonUtils.getDeepObj(this.state.cascaderOption, parentId);
					parent.children = children;
					resolve()
				})
			})
		}
	}

	handleCascaderLoadData = (selectedOptions: []) => {
		const targetOption = selectedOptions[selectedOptions.length - 1];
		targetOption.loading = true;
		listSubCategory({ id: targetOption.value }).then((res: any) => {
			let data = res.data;
			let hasSecond = data.some((item: any) => item.depth == 2);
			if (hasSecond) data = data.filter((item: any) => item.depth == 2);
			const children = data.map((item: any) => ({
				value: item.id,
				label: item.name,
				isLeaf: item.leaf
			}));
			targetOption.loading = false;
			targetOption.children = children;
			this.setState({
				cascaderOption: [...this.state.cascaderOption]
			})
		})
	}

	categoryChange = (value) => {
		this.listAttributeOf(value[value.length - 1], []);
	}

	// 获取类目属性
	listAttributeOf = (categoryId: number, attributeParams: any[]) => {
		this.setState({
            attuLoading: true
        })
		return listAttributeOf({ categoryId: categoryId }).then((res) => {
            let attributeOption = res.data.data;
            let attuLoading = false;

			if(attributeParams) {
				attributeOption.forEach(item => {
					item.valIds = []
				})

				attributeParams.forEach(item => {
					let index = attributeOption.findIndex(child => { return child.id == item.id});
					attributeOption[index].valIds = item.valIds;
				})
			}

			this.setState({ attributeOption, attuLoading });
		})
    }

    handleAddAttu = () => {
        this.setState({
            addModal: {
                show: true,
                loading: false
            }
        })
    }

    handleOk = () => {
        const { validateFields, getFieldValue, resetFields } = this.props.form;
        validateFields(['addModal'], (errors, values) => {
            if(errors) return ;

            let param = {
                storeId: 1,
                attributeId: values.addModal.attributeId,
                value: values.addModal.value,
            }
            let { addModal } = this.state;
            addModal.loading = true;
            this.setState({addModal});
            createAttributeVal({param}).then((res) => {
                let { addModal } = this.state;
                let category = getFieldValue('category');
                addModal.loading = false;
                addModal.show = false;
                this.listAttributeOf(category[category.length - 1]);
                this.setState({addModal});
                message.success('属性值新增成功');
                resetFields(['addModal']);
            }).finally(() =>{
                let { addModal } = this.state;
                addModal.loading = false;
                this.setState({addModal});
            })
        });
    }

    handleCancel = () => {
        const { resetFields } = this.props.form;
        resetFields(['addModal']);
        this.setState({
            addModal: {
                show: false,
                loading: false
            }
        })
    }

    handleAddAttuValue = () => {
        this.setState({
            addValueModal: {
                show: true,
                loading: false
            }
        })
    }

    handleAttuValueOk = () => {
        const { validateFields, getFieldValue, resetFields } = this.props.form;
        const category = getFieldValue('category');
        validateFields(['addValueModal'], (errors, values) => {
            if(errors) return ;

            let param = {
                storeId: 1,
                categoryId: category[category.length - 1],
                name: values.addValueModal.name,
            }
            let { addValueModal } = this.state;
            addValueModal.loading = true;
            this.setState({addValueModal});
            createAttribute({param}).then((res) => {
                let { addValueModal } = this.state;
                addValueModal.loading = false;
                addValueModal.show = false;
                this.listAttributeOf(category[category.length - 1]);
                this.setState({addValueModal});
                message.success('属性新增成功');
                resetFields(['addValueModal']);
            }).finally(() =>{
                let { addValueModal } = this.state;
                addValueModal.loading = false;
                this.setState({addValueModal});
            })
        });
    }

    handleAttuValueCancel = () => {
        const { resetFields } = this.props.form;
        resetFields(['addValueModal']);
        this.setState({
            addValueModal: {
                show: false,
                loading: false
            }
        })
	}

	handleAttuSelect = (val: number[], index: number) => {
		let { attributeOption } = this.state;
		attributeOption[index].valIds = val;
		this.setState({attributeOption});
	}

	render() {
		const {
			form: {
				getFieldDecorator,
				getFieldValue
			}
		} = this.props;

		const { cascaderOption, attributeOption, cascaderLoading, attuLoading, addModal, addValueModal } = this.state;
        const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />

		return (
			<div className={styles.commodityBaseInfo}>
				<p className={styles.title}>基础信息</p>
				<div className={styles.baseInfo}>
					<Form>
						<FormItem label="商品标题">
							{getFieldDecorator('sourceName', {
								initialValue: '',
								rules: [
									{
										required: true,
										message: '请输入商品标题'
									}
								],
							})(<Input placeholder="请输入标题" style={{ width: '624px' }} maxLength={50} suffix={`${getFieldValue('sourceName').length}/50`} />)}
						</FormItem>

						<FormItem label="商品卖点">
							{getFieldDecorator('sellPoint', { initialValue: '' })(<Input style={{ width: '624px' }} placeholder="请输入" maxLength={50} suffix={`${String(getFieldValue('sellPoint')).length}/50`} />)}
						</FormItem>


						<FormItem label="类目">
							<Spin spinning={cascaderLoading} indicator={antIcon}>
								{getFieldDecorator('category', {
									initialValue: [],
									rules: [
										{
											required: true,
											message: '请选择类目'
										}
									],
								})(
									<Cascader
										style={{ width: '240px' }}
										options={cascaderOption}
										loadData={this.handleCascaderLoadData}
										onChange={this.categoryChange}
										placeholder='请选择'
									/>
								)}
							</Spin>
						</FormItem>

						<FormItem label="商品属性">
							<Fragment>
								{
									attributeOption.length > 0 ? <a className={styles.addAttuBtn} onClick={this.handleAddAttu}>没有合适的属性值？立即新增</a> :
                                    <Spin spinning={attuLoading} indicator={antIcon}>
                                        <Select style={{ width: '240px' }} placeholder="请添加"></Select>
                                    </Spin>
								}
							</Fragment>
						</FormItem>

						{
							attributeOption.length > 0 ?
								<div className={`flex-start ${styles.addAttuSelect} `}>
									{
										attributeOption.map((item, index) => {
											return (
												<FormItem label={`${item.name}`} style={{ marginRight: '72px' }} key={item.id}>
													<Select value={item.valIds} style={{ width: '240px' }} mode="multiple" placeholder="请添加" onChange={(val) => {this.handleAttuSelect(val, index)}}>
														{item.values && item.values.map((child) =>
															<Option key={child.id} value={child.id}>{child.value}</Option>
														)}
													</Select>
												</FormItem>
											)
										})
									}
								</div> : null
						}
					</Form>
				</div>

                <Modal
                    title="新增属性"
                    centered
                    visible={addModal.show}
                    okText="提交"
                    onOk={this.handleOk}
                    confirmLoading={addModal.loading}
                    onCancel={this.handleCancel}
                    wrapClassName={styles.modal}
                >
                    <div>
                        <Form>
                            <FormItem label={`属性名`}>
                                {getFieldDecorator(`addModal.attributeId`, {
                                    initialValue: '',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请选择属性名'
                                        }
                                    ]
                                })(
                                    <Select style={{ width: '240px' }} placeholder="请选择属性名">
                                        {attributeOption.map((child) =>
                                            <Option key={child.id} value={child.id}>{child.name}</Option>
                                        )}
                                    </Select>
                                )}
                                <a style={{marginLeft: '16px'}} onClick={this.handleAddAttuValue}>添加属性</a>
                            </FormItem>

                            <FormItem label={`属性值`}>
                                {getFieldDecorator(`addModal.value`, {
                                    initialValue: '',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入属性值'
                                        }
                                    ]
                                })(
                                    <Input style={{ width: '240px' }} placeholder="请输入属性值"/>
                                )}
                            </FormItem>
                        </Form>
                    </div>
                </Modal>

                <Modal
                    title="新增属性名"
                    centered
                    visible={addValueModal.show}
                    okText="提交"
                    onOk={this.handleAttuValueOk}
                    confirmLoading={addValueModal.loading}
                    onCancel={this.handleAttuValueCancel}
                    wrapClassName={styles.modal}
                >
                    <div>
                        <Form>
                            <FormItem label={`属性名`}>
                                {getFieldDecorator(`addValueModal.name`, {
                                    initialValue: '',
                                    rules: [
                                        {
                                            required: true,
                                            message: '请输入属性名'
                                        }
                                    ]
                                })(
                                    <Input style={{ width: '240px' }} placeholder="请输入属性名"/>
                                )}
                            </FormItem>
                        </Form>
                    </div>
                </Modal>
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

export default connect(mapStateToProps)(Form.create<CommodityBaseInfoProps>()(CommodityBaseInfo));
