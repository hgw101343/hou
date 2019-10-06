import { Form, Input, Icon, Button } from 'antd';
import React, { Component } from 'react';
import Avatar from '@/components/GlobalHeader/AvatarDropdown';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { FormComponentProps } from 'antd/es/form';
import styles from './index.less';
import Link from 'umi/link';
import loginLogo from '../../../assets/img/loginLogo.png';
const FormItem = Form.Item;

interface AuditState {
    [key: string]: any
}

class AuditInfo extends Component<FormComponentProps, AuditState> {
    state: AuditState = {
        storeInfoResp: {}
    }

    componentDidMount() {
        this.init();
    }

    init = () => {
        let data = sessionStorage.getItem('storeData');
        let userInfo = sessionStorage.getItem('userInfo');
        console.log(data, userInfo);
        if(data) {
            data = JSON.parse(data);
            this.setState({
                storeInfoResp: data.storeInfoResp
            })
        }else{
            router.push({
                pathname: '/user/login',
            })
        }
    }

    renderWait = () => {
        return (
            <div>
                <p>店铺资料已提交，等待审核中，小趣将会在5个工作日内完成审核，审核结果将会以短信的方式通知您，你也可以直接通过账号密码登录系统查看哦！如提交资料有误可修改重新提交。</p>
                <Link to="/user/register/storeTypeRoute?kind=update">
					<a>修改入驻资料</a>
				</Link>
            </div>
        )
    }

    renderBack = () => {
        let { storeInfoResp } = this.state;
        return (
            <div>
                <p>店铺审核不通过，原因：{storeInfoResp.turnDownReason}</p>
                <Link to="/user/register/storeTypeRoute?kind=update">
					<a>重新提交入驻</a>
				</Link>
            </div>
        )
    }

    render() {
        let { storeInfoResp } = this.state;
        return (
            <div className={styles.audioInfo}>
                <div className={`flex-between ${styles.header}`}>
                    <div className={styles.title}>
                        <img src={loginLogo} alt="logo" />
                        <span>商家管理后台</span>
                    </div>
                    <Avatar menu={true}/>
                </div>
                <div className={styles.content}>
                    {storeInfoResp.checkStatus == 2 ? this.renderBack() : this.renderWait()}
                </div>
                
            </div>
        )
    }
}

const AuditInfoFrom = Form.create<FormComponentProps>({})(AuditInfo);

export default AuditInfoFrom;
