import React from 'react';
import { connect } from 'dva';
import {
	Spin, Icon,
} from 'antd';
import { Dispatch } from 'redux'
import styles from '../index.less';
import { stateType as EnterpriseApplyModelStateType } from '../model';
import FirstStep, { FirstStepPropsType } from './components/firstStep';
import NextStep, { NextStepPropsType } from './components/nextStep';

export interface EnterprisePropsType {
	register: EnterpriseApplyModelStateType;
	loading: boolean;
	dispatch: Dispatch;
}

interface stateType {
	step: number;
	firstStepData?: any;
	nextStepData?: any;
	modal: {
		show: boolean;
		title: string;
		sample: string;
	}
}

const defaultModal = {
	show: false,
	title: '',
	sample: ''
}

@connect(
	({
		register,
		loading,
	}: {
		register: EnterpriseApplyModelStateType;
		loading: {
			models: { [key: string]: boolean };
			effects: { [key: string]: boolean | undefined };
		};
	}) => ({
		register,
		loading: loading.models.register,
	}),
)
class Enterprise extends React.Component<EnterprisePropsType, stateType> {
	state: stateType = {
		step: 1,
		modal: defaultModal
	};

	componentDidMount() {
		const {
			dispatch,
			register: {
				storeData
			}
		} = this.props
		if (!storeData) {
			dispatch({
				type: 'register/getAreaList',
				payload: {
					parentId: 0,
				}
			})
		}
	}

	setStep = (step: number, data?: any) => {
		if (step === 2) {
			this.setState({
				step: step,
				firstStepData: data
			});
		} else {
			this.setState({
				step: step,
				nextStepData: data
			});
		}

	};

	createStore = (nextStepData: any) => {
		const applyType = this.props.register.applyType;
		const { companyInfoReq, brandInfoReqList } = this.state.firstStepData;
		const { storeInfoReq } = nextStepData;
		const data = {
			phone: this.props.register.phone,
			brandInfoReqList: applyType !== 24 ? [
				...brandInfoReqList.map(item => {
					const param = {
						...item,
						regCerUrl: item.regCerUrl.map(item => item.url).join(''),
						cerExpiredDate: item.cerExpiredDate.format('YYYY/MM/DD') + ' 00:00:00',
					}
					if (applyType === 22) {
						param.type = 2
					}
					if (param.type === 2) {
						param.brandAuthCerUrl = item.brandAuthCerUrl[0].url;
						param.authExpiredDate = item.authExpiredDate.format('YYYY/MM/DD') + ' 00:00:00'
						if (param.registrantType === 2) {
							param.holderIdenUrl = item.holderIdenUrl.map(item => item.url).join('')
						}
					}
					return param
				}),
			] : undefined,
			companyInfoReq: {
				...companyInfoReq,
				businessLicenseUrl: companyInfoReq.businessLicenseUrl[0].url,
				businessExpiredDate: companyInfoReq.businessExpiredDate.format('YYYY/MM/DD') + ' 00:00:00',
				userLiceCerUrl: companyInfoReq.userLiceCerUrl[0].url,
				regAddr: companyInfoReq.regAddr.join('/')
			},
			storeInfoReq: {
				...storeInfoReq,
				cardNoUrlZ: storeInfoReq.cardNoUrlZ[0].url,
				cardNoUrlF: storeInfoReq.cardNoUrlF[0].url,
				idCardExpireDate: storeInfoReq.idCardExpireDate.format('YYYY/MM/DD') + ' 00:00:00',
				name: applyType !== 24 ? storeInfoReq.name.join('-') : storeInfoReq.name,
				logoUrl: storeInfoReq.logoUrl ? storeInfoReq.logoUrl[0].url : undefined,
				storeType: applyType,
			}
		}
		if (!companyInfoReq.threeInOne) {
			data.companyInfoReq = {
				...data.companyInfoReq,
				orgCodeExpiredDate: companyInfoReq.orgCodeExpiredDate.format('YYYY/MM/DD') + ' 00:00:00',
				orgCodeCerUrl: companyInfoReq.orgCodeCerUrl[0].url,
				taxRegCerUrl: companyInfoReq.taxRegCerUrl[0].url,
			}
		}
		if (storeInfoReq.isSameToComCorp === 2) {
			data.storeInfoReq = {
				...data.storeInfoReq,
				corpCardNoZUrl: storeInfoReq.corpCardNoZUrl[0].url,
				corpCardNoFUrl: storeInfoReq.corpCardNoFUrl[0].url
			}
		}
		console.log(data)
		this.props.dispatch({
			type: 'register/applyStore',
			payload: data
		})
	}

	render() {
		const {
			loading,
			register: {
				applyType,
				categoryList,
				areaList,
				storeData
			},
		} = this.props;

		const firstStepProps: FirstStepPropsType = {
			storeType: applyType,
			addressOption: areaList,
			firstStepData: this.state.firstStepData || storeData,
			goNext: (value: any) => {
				this.setStep(2, value);
			},
			setSample: (sample: string, title: string) => {
				this.setState({
					modal: {
						show: true,
						title,
						sample,
					}
				})
			}
		};
		const nextStepProps: NextStepPropsType = {
			storeType: applyType,
			categoryList,
			firstStepData: this.state.firstStepData,
			goBack: (value: any) => {
				this.setStep(1, value);
			},
			nextStepData: this.state.nextStepData || storeData,
			submit: this.createStore
		};

		return (
			<div className={styles.container}>
				<Spin spinning={loading === true}>
					{this.state.step === 1 ? (
						<FirstStep {...firstStepProps} />
					) : (
							<NextStep {...nextStepProps} />
						)}
				</Spin>
				{
					this.state.modal.show ?
						<div className={styles.modalMask} onClick={() => this.setState({ modal: defaultModal })}>
							<div className={styles.modalTitle}>{this.state.modal.title}<Icon className={styles.icon} type="close" /></div>
							<div className={styles.modalContent}>
								<img src={this.state.modal.sample} alt="" />
							</div>
						</div> : null
				}
			</div>
		);
	}
}

export default Enterprise;
