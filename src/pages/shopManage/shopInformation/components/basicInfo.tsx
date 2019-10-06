import React, { Component } from 'react';
import styles from '../index.less'
import {Button,message} from 'antd'
import UploadImg from '@/components/UploadImg/index'
interface propstype{
    allData:any,
    dispatch:any
}
interface stateType{}
// onChange={(fileList) => {this.handleImgChange(fileList)}}
class basicInfo extends Component<propstype,stateType>{
    constructor(props){
        super(props);
    }
    uploadImg: any = React.createRef();
    state = {
        sourceImgArr:[]
    }
    handleImgChange = (fileList:any) => {
		this.setState({
			sourceImgArr: fileList
        })
    }
    saveLogo = () =>{
        console.log('logo',this.state.sourceImgArr.length);
        if(this.state.sourceImgArr.length > 0){
            this.props.dispatch({
                type:'shopinfo/saveLogo',
                payload:{id:this.props.allData.storeInfoResp.id,
                    logoUrl:this.state.sourceImgArr[0].url
                }
            })
            message.success('更换LOGO成功');
        }
        else{
            message.error('请上传图片');
        }
    }
    componentDidMount(){
        setTimeout(() =>{
            const logo = {
                status:"done",
                percent:100,
                uid:1,
                url:this.props.allData.storeInfoResp.logoUrl
            }
            var isok = logo.url?true:false;
            if(isok){
                this.uploadImg.current.setFileList([logo])
            }
        },500)
    }
    render(){
        return (<div className={styles.basicInfo}>
            <div><p className={styles.title}>店铺ID：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.id:''}</p></div>
            <div><p className={styles.title}>店铺名称：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.name:''}</p></div>
            <div><p className={styles.title}>店铺类型：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.storeType:''}</p></div>
            <div><p className={styles.title}>主营类目：</p><p>{this.props.allData.storeInfoResp?this.props.allData.storeInfoResp.mainSalesId:''}</p></div>
            <div><p className={styles.title}>店铺logo：</p>
            <div className={styles.imglogo}><UploadImg ref={this.uploadImg} 
            limit={1} multiple={false} maxSiz9e={1024 * 1024} onChange={(fileList:any) => {this.handleImgChange(fileList)}}/>
            </div></div>
            <div><Button onClick={this.saveLogo}>保存</Button></div>
        </div>)
    }
}

export default basicInfo