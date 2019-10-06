import React, { Component } from 'react';
import styles from '../index.less';
import {Modal} from 'antd'

interface propstype{
    allData:any
}
interface stateType{
    previewVisible:boolean,
    previewImage:string
}
class agentInfo extends Component<propstype,stateType>{
    constructor(props){
        super(props);
        this.state = {
            previewVisible:false,
            previewImage : '', //预览图片链接
        }
    }
    // 点击空白处
    handleCancel =() =>{
        this.setState({
            previewVisible:false
        });
    }
    previewImg = (ev:any) =>{
        console.log('ev',ev.target)
        this.setState({
            previewVisible:true,
            previewImage:ev.target.src
        });
    }
    render(){
        return (<div className={styles.agentInfo}>
            <div className={styles.agentInfoHead}>
                <div><p className={styles.title}>开店人姓名：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.account:''}</p></div>
                <div><p className={styles.title}>开店人身份证号：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.idCardNum:''}</p></div>
                <div><p className={styles.title}>开店人身份证有效期：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.IdCardExpireDate:''}</p></div>
                <div><p className={styles.title}>开店人身份证照：</p>
                <div className={styles.imgbox}>
                    <img src={this.props.allData.storeInfoResp.cardNoUrlZ} alt=""  onClick = {(ev) => {this.previewImg(ev)}
                    }/>
                    <img src={this.props.allData.storeInfoResp.cardNoUrlF} alt=""   onClick = {(ev) => {this.previewImg(ev)}
                    }/>
                </div>
                </div>
                <div><p className={styles.title}>企业法人姓名：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.IdCardExpireDate:''}</p></div>
                <div><p className={styles.title}>企业法人身份证号：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.corpIdCardNum:''}</p></div>
                <div><p className={styles.title}>企业法人身份证有效期：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.corpCardTime:''}</p></div>
                <div><p className={styles.title}>企业法人身份证照：</p>
                    <div className={styles.imgbox}>
                        <img src={this.props.allData.storeInfoResp.corpCardNoZUrl} alt=""   onClick = {(ev) => {this.previewImg(ev)}
                    }/>
                        <img src={this.props.allData.storeInfoResp.corpCardNoFUrl} alt=""   onClick = {(ev) => {this.previewImg(ev)}
                    }/>
                    </div>
                </div>
            </div>
            <div className={styles.agentInfoMain}>
                <div><p className={styles.title}>企业名称：</p><p>{this.props.allData.storeCompanyInfoResp?this.props.allData.storeCompanyInfoResp.name:''}</p></div>
                <div><p className={styles.title}>企业注册地址：</p><p>{this.props.allData.storeCompanyInfoResp?this.props.allData.storeCompanyInfoResp.regAddrFull:''}</p></div>
                <div><p className={styles.title}>企业法人身份证件照：</p></div>
                <div><p className={styles.title}>营业执照注册号：</p><p>{this.props.allData.storeCompanyInfoResp?this.props.allData.storeCompanyInfoResp.reputationNo:''}</p></div>
                <div><p className={styles.title}>营业期限：</p><p>{this.props.allData.storeCompanyInfoResp?this.props.allData.storeCompanyInfoResp.businessExpiredDate:''}</p></div>
                <div><p className={styles.title}>组织机构代码：</p><p>{this.props.allData.storeCompanyInfoResp?this.props.allData.storeCompanyInfoResp.orgCode:''}</p></div>
                <div><p className={styles.title}>纳税人识别码：</p><p>{this.props.allData.storeCompanyInfoResp?this.props.allData.storeCompanyInfoResp.taxIdCode:''}</p></div>
                <div><p className={styles.title}>组织机构代码证：</p><div className={styles.imgbox}><img src={this.props.allData.storeCompanyInfoResp.orgCodeCerUrl}   onClick = {(ev) => {this.previewImg(ev)}
                    }/></div></div>
                <div><p className={styles.title}>税务登记证明：</p><div className={styles.imgbox}><img src={this.props.allData.storeCompanyInfoResp.taxRegCerUrl} alt=""   onClick = {(ev) => {this.previewImg(ev)}
                    }/></div></div>
                <div><p className={styles.title}>开户许可证和基本账户存款凭证：</p><div className={styles.imgbox}><img src={this.props.allData.storeCompanyInfoResp.userLiceCerUrl} alt=""   onClick = {(ev) => {this.previewImg(ev)}
                    }/></div></div>
            </div>
            <Modal visible={this.state.previewVisible} footer={null} onCancel={this.handleCancel}>
                <img alt="example" style={{ width: '100%' }} src={this.state.previewImage} />
            </Modal>
        </div>)
    }
}

export default agentInfo