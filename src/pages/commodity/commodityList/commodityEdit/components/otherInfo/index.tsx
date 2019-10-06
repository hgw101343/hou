/* Routes:
*   - ./src/pages/Authorized.tsx
*/
import React, { Component } from 'react';
import { Form, Select , Button, Modal, message, Spin, Radio, Icon } from 'antd';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { EditStateType, CommodityOtherInfoState } from '../declaration';
import { all_postTemplate } from '../../service';
import { connect } from 'dva';
import { GlobalModelState } from '@/models/global';
import styles from './index.less';
import { CommonUtils } from '@/utils/utils';

const { confirm } = Modal;
const { Option } = Select;

interface CommodityOtherInfoProps extends FormComponentProps {
	dispatch: Dispatch<any>;
	commodityEdit: EditStateType;
	identity: string;
}

class CommodityOtherInfo extends Component<CommodityOtherInfoProps, CommodityOtherInfoState> {
	state: CommodityOtherInfoState = {
		postFeeTemplateOption: [],
		postFeeType: 3,
		postFeeTemplateId: '',
		issue: true,
		postFeeTemplateOptionLoading: false
	};

	componentDidMount = () => {
		this.init();
	}

	componentWillUnmount = () => {

	}

	init = () => {
		this.getPostFeeTemplateOption();
	}

	initFormData = () => {
		const { otherInfo } = this.props.commodityEdit;
		this.setState({
			postFeeType: otherInfo.postFeeType,
			postFeeTemplateId: otherInfo.postFeeTemplateId,
			issue: otherInfo.issue
		})
	}

	getFormData = () => {
		const { postFeeType, postFeeTemplateId, issue} = this.state;
        return new Promise((reslove, reject) => {
            if(CommonUtils.isEmptyOrNull(postFeeTemplateId)) {
				message.warning('请选择运费模板');
				return reject(false)
			}
			reslove({
				postFeeType,
				postFeeTemplateId,
				issue
			})
        })
	}

	handleCreateTemp = () => {
		let host = location.host;
		let protocol = location.protocol + '//';
		let base = '/qu_elfront_service';
		let url = `${protocol}${host}${base}/logisticsManage/freight`;
        window.open(url, '_blank');
	}

	handleEditTemp = () => {
		let host = location.host;
		let protocol = location.protocol + '//';
		let base = '/qu_elfront_service';
		let url = `${protocol}${host}${base}/logisticsManage/freight`;
		url = `${url}?type=update&templateId=${this.state.postFeeTemplateId}`;
        window.open(url, '_blank');
	}

	getPostFeeTemplateOption = () => {
		this.setState({
			postFeeTemplateOptionLoading: true
		})
		return all_postTemplate({storeId: 1}).then(res => {
			this.setState({
				postFeeTemplateOption: res.data,
				postFeeTemplateOptionLoading: false
			})
		})
	}

	handleSelectChange = (postFeeTemplateId) => {
		this.setState({postFeeTemplateId})
	}

	handleIssueChange = (event) => {
		this.setState({issue: event.target.value})
	}

	render() {
        const {
			commodityEdit: {
				otherInfo
			},
			dispatch
		} = this.props;

		const { postFeeTemplateId, postFeeTemplateOption, issue, postFeeTemplateOptionLoading } = this.state;
		const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />
		return (
			<div className={styles.commodityOtherInfo}>
				<p className={styles.title}>其它信息</p>
				<div className={styles.otherInfo}>
					<div className={`flex-start ${styles.otherInfoPostFee}`}>
						<p className={`${styles.formTitle} ${styles.requireTitle}`}>运费方式：</p>
						<div className={`flex-start ${styles.otherInfoPostFeeTemplate}`}>
							<Spin spinning={postFeeTemplateOptionLoading} indicator={antIcon}>
								<Select
									showSearch
									style={{ width: 240 }}
									placeholder="请选择模板"
									optionFilterProp="children"
									onChange={this.handleSelectChange}
									value={postFeeTemplateId}
								>
									{postFeeTemplateOption.map(item => {
										return <Option key={item.templateId} value={item.templateId}>{item.templateName}</Option>
									})}
								</Select>
							</Spin>
							<Button className={styles.otherInfoPostFeeTemplateBtn} icon="form" disabled={!postFeeTemplateId} onClick={() => {this.handleEditTemp()}}>编辑运费模版</Button>
							<Button className={styles.otherInfoPostFeeTemplateBtn} icon="file-add" onClick={() => {this.handleCreateTemp()}}>新建运费模版</Button>
							<Button className={styles.otherInfoPostFeeTemplateBtn} icon="sync" loading={postFeeTemplateOptionLoading} onClick={this.getPostFeeTemplateOption}>刷新运费模版</Button>
						</div>
					</div>
					<div className={`flex-start ${styles.otherInfoIssue}`}>
						<p className={`${styles.formTitle} ${styles.requireTitle}`}>上架时间：</p>
						<div className={`${styles.otherInfoIssueRadio}`}>
							<Radio.Group onChange={this.handleIssueChange} value={issue}>
								<Radio value={true} style={{marginRight: '24px'}}>立即上架</Radio>
								<Radio value={false}>暂时保存到待上架</Radio>
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

export default connect(mapStateToProps)(Form.create<CommodityOtherInfoProps>()(CommodityOtherInfo));
