import React, { Component } from 'react';
import { connect } from 'dva';
import { Dispatch } from 'redux';
import styles from './index.less';
import { StateType } from './model';
import { expandedRowRender } from './components/childTable';
import { EditableFormTable, propsType2 } from './components/editData';
import { Radio, Button, Icon, Table, Modal, Input } from 'antd';
// 表头数据    表体数据在仓库中获取
const columns = [
	{ title: '模板名称', dataIndex: 'templateName', key: 'name' },
	{ title: '最后编辑时间', dataIndex: 'updateTime', key: 'age' },
	{
		title: '操作',
		dataIndex: '',
		key: 'x',
		render: () => (
			<div className={styles.edits}>
				<a>复制模板</a>
				<a>修改</a>
				<a>删除</a>
			</div>
		),
	},
];
interface propsType {
	dispatch: Dispatch<any>;
	freight: StateType;
}
interface stateType {
	// 获取所有地址
	allAddress: Array<any>,
	// 是否是添加模板中添加 
	isaddTemplate: boolean,
	// 编辑的条数
	editNum: number | string;
	upRow: boolean;
	currentOn: object;
	freightRulesShow: boolean;
	// isEdit: boolean;
	addAdressShow: boolean;
	delModal: boolean;
	delTemplateId: number | string;
	delTemplateName: string;
	allTemplate: any;
	setName: boolean;
	//  复制模板名称
	setTemplateName: string;

}
@connect(
	({
		loading,
		freight,
	}: {
		loading: {
			models: { [key: string]: boolean };
		};
		freight: StateType;
	}) => ({
		loading: loading.models.freight,
		freight,
	}),
)
class Freight extends Component<propsType, stateType> {
	// 执行异步接口
	constructor(props: any) {
		super(props);
		this.state = {
			allAddress: [],
			isaddTemplate: false,

			setName: false,
			// newTemplateName: '',
			// 是否展开行
			upRow: true,
			// 传参当前参数
			currentOn: {},
			//  弹窗运费模板是否显示
			freightRulesShow: false,
			// 记录是否编辑状态
			// isEdit: false,
			// 记录弹窗新增运费模板
			// addAdressShow:false,
			allTemplate: '', //记录全部值
			type: 1,
			// 监听删除
			delModal: false,
			delTemplateId: '',
			delTemplateName: '',
			// 记录编辑值
			editNum: '',
		};
	}
	init = () => {
		this.props.dispatch({
			type: 'freight/getFreight',
			payload: {},
		});
		this.props.dispatch({
			type: 'freight/save1',
			payload: {
				isEdit: false,
			},
		});
		this.setState({
			allAddress: this.props.freight.AllAddress,
			isaddTemplate: false
		});
		console.log('初始化');
	};
	// 监听点击监听图标方向
	CustomExpandIcon = (props: any) => {
		let text;
		if (props.expanded) {
			text = false;
		} else {
			text = true;
		}
		return (
			<Icon
				type="right"
				className={styles.iconArrows}
				style={{ transform: text ? 'rotate(0deg)' : 'rotate(90deg)' }}
			/>
		);
	};
	//  单击每一行
	onRow = (record: any, index: any) => {
		return {
			onClick: (event: any) => {
				console.log('你点击了', record, this.props.freight.list[index]);
				if (event.target.innerText == '修改') {
					this.setState({
						editNum: index,
					});
					this.props.dispatch({
						type: 'freight/save1',
						payload: {
							isEdit: true,
						},
					});
				} else if (event.target.innerText == '删除') {
					console.log('删除');
					this.setState({
						delTemplateId: record.templateId,
						delTemplateName: record.templateName,
					});
					this.props.dispatch({
						type: 'freight/save1',
						payload: { deleteModal: true },
					});
				} else if (event.target.innerText == '复制模板') {
					this.setState({
						setName: true,
						currentOn: this.props.freight.list[index],
					});
				} else {
					this.setState({
						upRow: !this.state.upRow,
					});
				}
			},
		};
	};
	expandedRow = (record, index, indent, expanded) => {
		return expandedRowRender({
			deliveryDetailList: this.props.freight,
			currentOn: this.props.freight.list[index],
		});
	};
	// 计费规则说明
	freightRules = () => {
		this.setState({
			freightRulesShow: true,
		});
	};
	freightRulesKnow = () => {
		// 点击弹窗运费计费规则知道了按钮
		this.setState({
			freightRulesShow: false,
		});
	};
	// 添加模板
	addTemplate = () => {
		this.props.dispatch({
			type: 'freight/save1',
			payload: {
				isEdit: true,
			},
		});
		this.setState({
			isaddTemplate: true,
			editNum: ''
		});
	};
	// 监听按钮
	hideDel = () => {
		this.setState({
			delModal: false,
		});
	};
	confirmDel = () => {
		console.log('确定删除', this.props.freight.deleteModal);
		this.props.dispatch({
			type: 'freight/deleteTemplate',
			payload: { id: this.state.delTemplateId },
		});
		setTimeout(() => {
			this.props.dispatch({
				type: 'freight/getFreight',
				payload: {},
			});
		}, 300);
		this.init();
	};
	componentDidMount() {
		// console.log('222',this.props.freight.delDelivery)
		this.init();
		setTimeout(() => {
			console.log('yuqing', this.props.freight.list);
		}, 599);
	}
	//输入模板名字的弹窗
	setNamecal = () => {
		this.setState({
			setName: false,
		});
	};
	setNameOk = () => {
		console.log('复制模板', this.state.currentOn);
		this.state.currentOn.deliveryDetailList.forEach(item => {
			item.deliveryAreaMap = item.deliveryArea;
		});
		const arr = this.state.currentOn.deliveryDetailList;
		console.log('数组', arr);
		const params = {
			name: this.refs.setTemplateName.state.value,
			storeId: this.state.currentOn.storeId,
			DeliveryReqList: arr,
		};
		console.log(params, '复制模板参数');
		this.props.dispatch({
			type: 'freight/saveTemplate',
			payload: params,
		});
		this.init();
		this.setState({
			setName: false,
		});
	};
	render() {
		console.log('look', this.props.freight.isEdit);
		return (
			<div className={styles.bigbox}>
				{this.props.freight.isEdit ? null : (<div className={styles.freight}>
					<div className={styles.freightTop}>
						<p>
							<strong>店铺计费方式</strong>
							<a onClick={this.freightRules}>店铺计费规则说明</a>
						</p>
						<Radio.Group name="radiogroup" defaultValue={0}>
							<Radio className={styles.addShop} value={0}>
								添加商品加运费
								<Icon type="question-circle" />
							</Radio>
						</Radio.Group>
						<Button type="primary" className={styles.addbtn} onClick={this.addTemplate}>
							新增运费模板
						</Button>
					</div>
					<div className={styles.freightMain}>
						<p>配送运费明细</p>
						<div className={styles.tableHead}>
							<span>模板名称</span>
							<span>最后编辑时间</span>
						</div>
						<Table
							columns={columns}
							dataSource={this.props.freight.list}
							expandedRowRender={this.expandedRow}
							expandRowByClick={true}
							expandIcon={this.CustomExpandIcon}
							showHeader={false}
							onRow={this.onRow}
						/>
					</div>
					<Modal
						width={840}
						visible={this.state.freightRulesShow}
						maskClosable={true}
						centered={true}
						footer={null}
						closable={false}
						bodyStyle={{
							width: '840px',
							padding: '32px 30px 72px 30px',
						}}
					>
						<div className={styles.freightRules}>
							<h3>店铺计费规则说明：</h3>
							<p>目前仅支持商家选择并默认使用【按商品累加运费】</p>
							<h3>按商品累加运费：</h3>
							<p>规则：分别计算出商品使用模板的运费，再进行累加。</p>
							<p>
								1）不同或相同的商品，设置同一运费模板：按该模板设置的规则计算；不足续件的数目的时候，仍然按照续件的数目进行计算。
								例如商品A，B都是用模板M（首1件10元，续2件5元），如果购买商品A和B，各一件，则一共购买两件，运费=10+5=15元。
							</p>
							<p>
								2）不同的商品，设置不同的运费模板：分别计算每个运费模板规则应收运费，再累加计算合计运费；
								例如：
								例如商品A使用用模板M（首1件10元，续1件5元），商品B使用模板N（首2件12元，续1件5元），如果购买商品A和B，各2件，则运费=模板M的运费+模板N的运费=（10+5）+（12）=27元。
							</p>
							<div className={styles.freightRulesFoot}>
								<Button type="primary" onClick={this.freightRulesKnow}>
									知道了
								</Button>
							</div>
						</div>
					</Modal>
					{/* 输入复制的模板名字的弹窗 */}
					<Modal
						title="请输入复制模板名字的弹窗"
						visible={this.state.setName}
						onOk={this.setNameOk}
						onCancel={this.setNamecal}
					>
						<Input ref="setTemplateName" />
					</Modal>
					{/* 确认删除模板弹窗 */}
					<Modal
						title="提示"
						visible={this.props.freight.deleteModal}
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
							是否删除运费模板:{this.state.delTemplateName}
						</p>
					</Modal>
				</div>)}
				{/* 编辑项 */}
				{this.props.freight.isEdit ? (
					<div className={styles.editData}>
						<EditableFormTable
							AllAddress={this.props.freight.AllAddress}
							selectAddressModel={this.props.freight.selectAddressModel}
							dispatch={this.props.dispatch}
							// 是否删除区间的弹窗
							delDelivery={this.props.freight.delDelivery}
							// 首页所有条目
							allList={this.props.freight.list}
							// 当前点击
							currentOn={this.props.freight.list[this.state.editNum]}
							// 打开选择地址
							selectAddressModel={this.props.freight.selectAddressModel}

							isaddTemplate={this.state.isaddTemplate}
						/>
					</div>
				) : null}
			</div>
		);
	}
}

export default Freight;
