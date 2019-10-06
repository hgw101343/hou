/* Routes:
*   - ./src/pages/Authorized.tsx
*/
import React, { Component } from 'react';
import { Form, Spin, Button, Modal, message } from 'antd';
import router from 'umi/router';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { EditStateType, EditState } from './declaration';
import { connect } from 'dva';
import { GlobalModelState } from '@/models/global';
import { CommonUtils } from '@/utils/utils';
import BaseInfoComponents from './components/baseInfo';
import SellInfoComponents from './components/sellInfo';
import ImgTextInfoComponents from './components/imgTextInfo';
import OtherComponents from './components/otherInfo';
import { createSource, updateSource, getSourceDetail } from './service';
import styles from './index.less';

const { confirm } = Modal;

interface EditProps extends FormComponentProps {
	dispatch: Dispatch<any>;
	CommodityEdit: EditStateType;
	identity: string;
	location: any;
}

@connect(
	({ commodityEdit ,global }: {
		commodityEdit: EditStateType;
		loading: {
			effects: { [key: string]: boolean }
		};
		global: GlobalModelState
	}) => ({
		commodityEdit,
		identity: global.identity
	}),
)

class CommodityEdit extends Component<EditProps, EditState> {
	baseInfoComponents: any;
	sellInfoComponents: any;
	imgTextInfoComponents: any;
	otherInfoComponents: any;
	sourceId: string = '';

	state: EditState = {
		loading: false,
		skuIdList: {},

	};

	componentDidMount = () => {
		this.sourceId = this.props.location.query.sourceId || '';
		this.initData();
	}

	componentWillUnmount = () => {

	}

	initData() {
		if(this.sourceId) {
			let data = { sourceId: this.sourceId };
			this.getSourceDetail(data);
		}else {
			this.initSourceData({});
		}
	}

	getSourceDetail = (data) => {
		this.setState({loading: true});
        return getSourceDetail(data).then(res => {
			let resData = CommonUtils.getDeepObj(res, 'data.responseFuture.data') || {};
			let skuIdString = res.data && res.data.skuIdString || [];
			skuIdString.forEach((item,index) =>{
				resData.skuParams[index].skuId = item;
			})
			this.initSourceData(resData);
			this.setState({loading: false});
        });
	}

	initSourceData = (resData) => {
		this.initBaseData(resData);
		this.initSellData(resData);
		this.initImgTextData(resData);
		this.initOtherData(resData);
	}

	initBaseData = (resData) => {
		let baseInfo = {
            sourceName: resData.sourceName || '',
            sellPoint: resData.sellPoint || '',
            category: [],
            attributeParams: []
		}

		if(resData.categoryAttributes) {
			resData.categoryAttributes.forEach(item => {
				let obj = {
					id: item.attributeId,
					valIds: item.attributeVals.map(child => child.valId)
				}
				baseInfo.attributeParams.push(obj);
			})
		}

		if(resData.primaryCategoryId) baseInfo.category.push(Number(resData.primaryCategoryId));
		if(resData.secondaryCategoryId) baseInfo.category.push(Number(resData.secondaryCategoryId));
		if(resData.thirdlyCategoryId) baseInfo.category.push(Number(resData.thirdlyCategoryId));

		let { dispatch } = this.props;
		dispatch({
			type: 'commodityEdit/saveSync',
			payload: {
				baseInfo
			},
			cb: () => {
				this.baseInfoComponents.initFormData();
			}
		})
	}

	initSellData = (resData) => {
		let sellInfo = {
            minBuyAmount: resData.minBuyAmount || 1,
            combinationAmount: resData.combinationAmount || 1,
            storeSourceId: resData.storeSourceId || 0,
            sourcePrice: resData.sourcePrice || 0,
            costPrice: resData.costPrice || 0,
            inventory: resData.inventory || 0,
            originPrice: resData.originPrice || 0,
            inventorySubtractType: resData.inventorySubtractType || 1,
            skuParams: resData.skuParams || []
		}

		let { dispatch } = this.props;
		dispatch({
			type: 'commodityEdit/saveSync',
			payload: {
				sellInfo
			},
			cb: () => {
				this.sellInfoComponents.initFormData();
			}
		})
	}

	initImgTextData = (resData) => {
		let sourceImgArr = [];
        let sourceImg = resData.sourceImg || '';
        if(sourceImg) {
            sourceImg.split(';').forEach((item,index) => {
                if(item) sourceImgArr.push({url: item, uid: index, status: 'done'});
            })
        }
		let imgTextInfo = {
            originSourceDesc: resData.originSourceDesc || '',
            sourceDesc: resData.sourceDesc || '',
            sourceImgArr: sourceImgArr
		}

		let { dispatch } = this.props;
		dispatch({
			type: 'commodityEdit/saveSync',
			payload: {
				imgTextInfo
			},
			cb: () => {
				this.imgTextInfoComponents.initFormData();
			}
		})
	}

	initOtherData = (resData) => {
        let otherInfo = {
            postFeeType: 3,
            postFeeTemplateId: resData.postFeeTemplateId || '',
            issue: resData.sourceStatus == 0
		}

		let { dispatch } = this.props;
		dispatch({
			type: 'commodityEdit/saveSync',
			payload: {
				otherInfo
			},
			cb: () => {
				this.otherInfoComponents.initFormData();
			}
		})
	}

	handelSure = async () => {
		const baseInfoForm = await this.baseInfoComponents.getFormData();
		if(!baseInfoForm) return;

		const sellInfoForm = await this.sellInfoComponents.getFormData();
		if(!sellInfoForm) return;

		const imgTextInfoForm = await this.imgTextInfoComponents.getFormData();
		if(!imgTextInfoForm) return;

		const otherInfoForm = await this.otherInfoComponents.getFormData();
		if(!otherInfoForm) return;

		const baseInfoComponentsForm = CommonUtils.deepCopy(baseInfoForm);
		const sellInfoComponentsForm = CommonUtils.deepCopy(sellInfoForm);
		const imgTextInfoComponentsForm = CommonUtils.deepCopy(imgTextInfoForm);
		const otherInfoComponentsForm = CommonUtils.deepCopy(otherInfoForm);

		this.handlePostForm({...sellInfoComponentsForm, ...baseInfoComponentsForm, ...imgTextInfoComponentsForm, ...otherInfoComponentsForm});
	}

	handlePostForm = (param) => {
		if(param.category[0]) param.primaryCategoryId = param.category[0];
		if(param.category[1]) param.secondaryCategoryId = param.category[1];
		if(param.category[2]) param.thirdlyCategoryId = param.category[2];

		let sourceImg = '';
		param.sourceImgArr.forEach(item => {
			sourceImg = `${sourceImg}${item.url};`;
		})
		param.sourceImg = sourceImg;
		param.sourceDesc = param.originSourceDesc;
		param.storeId = 1;
		param.postFee = 10;
		param.sourceRange = 1;
		//建立映射关系
		let { skuIdList } = this.state;
		if(Object.keys(skuIdList).length > 0) {
			param.skuParams.forEach(item => {
				if(skuIdList[item.storeSkuId]) {
					item.skuId = skuIdList[item.storeSkuId]
				}
			})
		}

		delete param.sourceImgArr;

		let data = {
			"param": param
		}

		if(this.sourceId) {
			data.param.sourceId = this.sourceId;
			this.handleUpdate(data);
		}else{
			this.handleCreate(data);
		}
	}

	handleUpdate = (data) => {
		this.setState({loading: true})
		updateSource(data).then(res => {
			if(res.data.code === 0) {
				this.goList();
				message.success("更新成功");
			}else{
				message.error("更新失败");
			}
		}).finally(() => {
			this.setState({loading: false})
		})
	}

	handleCreate = (data) => {
		this.setState({loading: true})
		createSource(data).then(res => {
			if(res.data.code === 0) {
				this.goList();
				message.success("创建成功");
			}else{
				message.error("创建失败");
			}
		}).finally(() => {
			this.setState({loading: false})
		})
	}

	goList = () => {
		router.push({
			pathname: '/commodity/commodityList'
		});
	}

	handleClose = () => {
		router.push({
			pathname: '/commodity/commodityList'
		});
	}

	render() {
		const { loading } = this.state;
		return (
			<Spin spinning={loading} size='large'>
				<div className={styles.commodityEdit}>
					<BaseInfoComponents wrappedComponentRef={(ref: any) => this.baseInfoComponents = ref}></BaseInfoComponents>
					<SellInfoComponents wrappedComponentRef={ref => this.sellInfoComponents = ref}></SellInfoComponents>
					<ImgTextInfoComponents wrappedComponentRef={ref => this.imgTextInfoComponents = ref}></ImgTextInfoComponents>
					<OtherComponents wrappedComponentRef={ref => this.otherInfoComponents = ref}></OtherComponents>
					<div className={`${styles.commodityEditBtn} flex-center`}>
						<Button size={'large'} onClick={this.handleClose}>关闭</Button>
						<Button type="primary" size={'large'} loading={loading} onClick={this.handelSure}>确定</Button>
					</div>
				</div>
			</Spin>
		)
	}
}

export default Form.create<EditProps>()(CommodityEdit);
