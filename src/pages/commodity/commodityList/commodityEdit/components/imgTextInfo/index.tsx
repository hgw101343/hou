/* Routes:
*   - ./src/pages/Authorized.tsx
*/
import React, { Component } from 'react';
import { Form, Card, Button, Modal, message, Tabs } from 'antd';
import { Dispatch } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { EditStateType, CommodityImgTextInfoState } from '../declaration';
import UploadImg from '@/components/UploadImg';
import Editor from '@/components/Editor';
import { connect } from 'dva';
import { GlobalModelState } from '@/models/global';
import styles from './index.less';
import { CommonUtils } from '@/utils/utils';

const { confirm } = Modal;

interface CommodityImgTextInfoProps extends FormComponentProps {
	dispatch: Dispatch<any>;
	commodityEdit: EditStateType;
	identity: string;
}

class CommodityImgTextInfo extends Component<CommodityImgTextInfoProps, CommodityImgTextInfoState> {
	editorInstance: any = React.createRef();
	uploadImg: any = React.createRef();

	state: CommodityImgTextInfoState = {
		sourceImgArr: []
	};

	componentDidMount = () => {

	}

	initFormData = () => {
		const { imgTextInfo } = this.props.commodityEdit;
		this.setState({
			sourceImgArr: imgTextInfo.sourceImgArr
		})
		this.uploadImg.current.setFileList(imgTextInfo.sourceImgArr);
		this.editorInstance.current.setValue(imgTextInfo.originSourceDesc);
	}

	getFormData = () => {
		const { sourceImgArr } = this.state;
		const originSourceDesc = this.editorInstance.current.getValue();
        return new Promise((reslove, reject) => {
            if(sourceImgArr.length == 0) {
				message.warning('请上传商品图片');
				return reject(false)
			}

			if(CommonUtils.isEmptyOrNull(originSourceDesc) || originSourceDesc == "<p></p>") {
				message.warning('请录入商品描述');
				return reject(false)
			}

			if(originSourceDesc.length > 25000) {
				message.warning('商品描述超过最大字符限制');
				return reject(false)
			}

			reslove({
				originSourceDesc,
				sourceImgArr
			})
        })
	}

	handleImgChange = (fileList) => {
		this.setState({
			sourceImgArr: fileList
		})
	}

	render() {
        const {
			commodityEdit: {
				imgTextInfo
			},
			dispatch
		} = this.props;

		return (
			<div className={styles.commodityImgTextInfo}>
				<p className={styles.title}>图文描述</p>
				<div className={styles.imgTextInfo}>
					<div className={`flex-start ${styles.imgTextInfoShop}`}>
						<p className={`${styles.formTitle} ${styles.requireTitle}` }>商品图片：</p>
						<div className={styles.imgTextInfoShopList}>
							<UploadImg ref={this.uploadImg} limit={15} multiple={true} maxSize={1024 * 1024} onChange={(fileList) => {this.handleImgChange(fileList)}}/>
						</div>
					</div>
					<div className={`flex-start ${styles.imgTextInfoDec}`}>
						<p className={`${styles.formTitle} ${styles.requireTitle}`}>商品描述：</p>
						<div className={`${styles.imgTextInfoDecDetail}`}>
							<Editor ref={this.editorInstance}/>
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

export default connect(mapStateToProps)(Form.create<CommodityImgTextInfoProps>()(CommodityImgTextInfo));
