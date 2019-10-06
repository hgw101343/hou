import { Form, Input, Icon, Button, message } from 'antd';
import React, { Component } from 'react';
import { Dispatch, AnyAction } from 'redux';
import router from 'umi/router';
import { FormComponentProps } from 'antd/es/form';
import styles from './index.less';
import { idCardRegex, validateMobile } from '@/utils/validate';
import { CommonUtils } from '@/utils/utils';
import { sendResetPassWordMsg, checkByPhoneIdCard, resetPassWord } from './service';
import Link from 'umi/link';

const FormItem = Form.Item;

interface PasswordState {
    [key: string]: any
}

class Password extends Component<FormComponentProps, PasswordState> {
    timer: NodeJS.Timeout | null = null;
    state: PasswordState = {
        passwordShow: false,
        time: 0,
        loading: false,
        useid: ''
    }

    componentWillUnmount() {
		clearInterval(this.timer as NodeJS.Timeout);
    }
    
    checkByPhone = async (rule, value, callback) => {
        if(CommonUtils.isEmptyOrNull(value)) {
            return callback();
        }
        if(!validateMobile(value)) {
            return callback('请输入正确手机号');
        }
        callback();
    }

    sendResetPassWordMsg = () => {
        this.props.form.validateFields(['phone'], (err, value) => {
            if (err) return;
            sendResetPassWordMsg(value).then((res) => {
				this.setState({
					time: 59,
				},() => {
                    this.timer = setInterval(() => {
                        if (this.state.time <= 1) {
                            clearInterval(this.timer as NodeJS.Timeout);
                            this.setState({
                                time: 0,
                            });
                        } else {
                            this.setState({
                                time: this.state.time - 1,
                            });
                        }
                    }, 1000);
                });
            })
            
        })
    }
    
    handleStep = () => {
        this.props.form.validateFields(['idCard', 'phone', 'verCode'], (err, value) => {
            if(err) return;
            this.setState({loading: true});
            checkByPhoneIdCard(value).then((res) => {
                if(res.data.useid) {
                    this.setState({
                        passwordShow: true,
                        useid: res.data.useid
                    })
                }
               
            }).finally(() => {
                this.setState({loading: false});
            })
        })
        
    };

    checkPassword = (rule, value, callback) => {
        if(CommonUtils.isEmptyOrNull(value)) {
            return callback();
        }

        let password = this.props.form.getFieldsValue(['password']).password;
        if(CommonUtils.isEmptyOrNull(password)) {
            return callback('请输入密码');
        }

        if(value !== password) {
            return callback('两次密码输入不一致');
        }

        callback();
    }

    resetPassword = () => {
        this.props.form.validateFields(['password', 'againPassword'], (err, value) => {
            if(err) return;
            this.setState({loading: true});
            let param = {
                id: this.state.useid,
                newPassword: value.password
            }
            resetPassWord(param).then((res) => {
                message.success('密码重置成功');
                router.push({
                    pathname: '/user/login'
                });
            }).finally(() => {
                this.setState({loading: false});
            })
        })
    }

    handleSubmit = () => {
        let { passwordShow } = this.state;
        if(passwordShow) {
            this.resetPassword();
        }else{
            this.handleStep();
        }
    };

    renderInput = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;
        
        const { time, loading } = this.state;
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 8 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 16 },
            },
        };

        return (
            <Form className={styles.firetStep}>
                <FormItem label="开店人身份证号">
                    {getFieldDecorator('idCard', {
                        rules: [
                            {
                                required: true,
                                message: '请输入开店人身份证号',
                            },
                            {
                                pattern: idCardRegex,
                                message: '请输入正确的身份证号',
                            },
                        ],
                    })(
                        <Input
                            size='large'
                            placeholder="请输入开店人身份证号"
                        />,
                    )}
                </FormItem>
                <FormItem label="手机号">
                    {getFieldDecorator('phone', {
                        rules: [
                            {
                                required: true,
                                message: '请输入手机号',
                            },
                            {
                                validator: this.checkByPhone
                            }
                        ],
                    })(
                        <Input
                            size='large'
                            placeholder="请输入手机号"
                        />,
                    )}
                </FormItem>
                <FormItem label="验证码">
                    {getFieldDecorator('verCode', {
                        rules: [
                            {
                                required: true,
                                message: '请输入验证码',
                            },
                        ],
                    })(
                        <Input
                            size='large'
                            placeholder="请输入验证码"
                        />,
                    )}
                    <Button className={styles.verCodeBtn} disabled={time} size='large' onClick={this.sendResetPassWordMsg}>{time ? time + 's' : '获取验证码'}</Button>
                </FormItem>
            </Form>
        )
        
    };

    renderPassword = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;
        
        const formItemLayout = {
            labelCol: {
              xs: { span: 24 },
              sm: { span: 8 },
            },
            wrapperCol: {
              xs: { span: 24 },
              sm: { span: 16 },
            },
        };

        return (
            <Form>
                <FormItem label="设置新的密码">
                    {getFieldDecorator('password', {
                        rules: [
                            {
                                required: true,
                                message: '请输入密码',
                            },
                        ],
                    })(
                        <Input
                            size='large'
                            type='password'
                            placeholder="请输入密码"
                        />,
                    )}
                </FormItem>
                <FormItem label="再次确认密码">
                    {getFieldDecorator('againPassword', {
                        rules: [
                            {
                                required: true,
                                message: '请确认密码',
                            },
                            {
                                validator: this.checkPassword
                            }
                        ],
                    })(
                        <Input
                            size='large'
                            type='password'
                            placeholder="请确认密码"
                        />,
                    )}
                </FormItem>
            </Form>
        )
    }

    render() {

        const { passwordShow, loading } = this.state;

        return (
            <div className={styles.password}>
                <div className={styles.backIcon}><Link to="/user/login"><Icon type="left" className="" /> 返回首页</Link></div>
                <div className={styles.content}>
                    <div className={styles.passwordTitle}>重置密码</div>
                    { passwordShow ? this.renderPassword() : this.renderInput()}
                </div>
                <div className={styles.buttonWrap}><Button type="primary" size='large' loading={loading} className={styles.button} onClick={this.handleSubmit}>{ passwordShow ? '确定' : '下一步'}</Button></div>
            </div>
        );
    }
}

const PasswordWithFrom = Form.create<FormComponentProps>({})(Password);

export default PasswordWithFrom;
