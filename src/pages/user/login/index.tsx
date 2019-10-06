import { Form, Input, Icon } from 'antd';
import React, { Component } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { connect } from 'dva';
import { StateType } from '@/models/login';
import styles from './style.less';
import { LoginParamsType } from '@/services/login';
import { ConnectState } from '@/models/connect';
import { getmd5 } from '@/utils/utils';
import Link from 'umi/link';

const FormItem = Form.Item;

interface LoginProps extends FormComponentProps {
	dispatch: Dispatch<AnyAction>;
	userLogin: StateType;
	submitting: boolean;
}
interface LoginState {
	type: string;
	autoLogin: boolean;
}

interface userFormProps extends FormComponentProps {
	username: string;
	password: string;
}

@connect(({ login, loading }: ConnectState) => ({
	userLogin: login,
	submitting: loading.effects['login/login'],
}))
class Login extends Component<LoginProps, LoginState> {
	handleSubmit = () => {
		this.props.form.validateFields((err, result: LoginParamsType) => {
			if (!err) {
				const { dispatch } = this.props;
				dispatch({
					type: 'login/login',
					payload: {
						...result,
						// password: getmd5(result.password)
						password: result.password,
					},
				});
			}
		});
	};

	render() {
		const {
			form: { getFieldDecorator },
		} = this.props;

		return (
			<div className={styles.content}>
				<div className={styles.main}>
					<div className={styles.loginTitle}>账户登录</div>
					<Form>
						<FormItem>
							{getFieldDecorator('username', {
								rules: [
									{
										required: true,
										message: '请输入手机号或账户名',
									},
								],
							})(
								<Input
									prefix={<Icon type="user" />}
									size='large'
									placeholder="请输入手机号/账号"
								/>,
							)}
						</FormItem>
						<FormItem>
							{getFieldDecorator('password', {
								rules: [
									{
										required: true,
										message: '请输入密码',
									},
								],
							})(
								<Input
									type="password"
									prefix={<Icon type="user" />}
									size='large'
									placeholder="请输入密码"
								/>,
							)}
						</FormItem>
					</Form>
					<button className={styles.loginSumit} size='large' onClick={() => this.handleSubmit()}>
						登录
					</button>
					<div className={styles.loginFooter}>
						<Link to="/user/register">
							<a>没有账号？立即申请入驻</a>
						</Link>
						<Link to="/user/password">
							<a className={styles.forgetPassword}>忘记密码</a>
						</Link>
					</div>
				</div>
			</div>
		);
	}
}

const LoginWithFrom = Form.create<userFormProps>({})(Login);

export default LoginWithFrom;
