import { Form, Input, Icon, Button } from 'antd';
import React, { Component } from 'react';
import { Dispatch, AnyAction } from 'redux';
import { FormComponentProps } from 'antd/es/form';
import { FormItemProps } from 'antd/es/form/FormItem';
import { connect } from 'dva';
import styles from '../login/style.less';
import { stateType } from './model';
import { mobileReg } from '@/utils/validate';
import { checkByPhone } from './service';

const FormItem = Form.Item;

interface RegisterProps extends FormComponentProps {
	dispatch: Dispatch<AnyAction>;
	register: stateType;
	submitting: boolean;
}

interface RegisterState {
	timeId: NodeJS.Timeout | undefined;
	time: number;
	validate: FormItemProps;
	isEffectionPhone: boolean;
}

interface userFormProps extends FormComponentProps {
	phone: string;
	verCode: string;
}

@connect(
	({
		register,
		loading,
	}: {
		register: stateType;
		loading: {
			models: { [key: string]: boolean };
		};
	}) => ({
		register,
		submitting: loading.models.register,
	}),
)
class Register extends Component<RegisterProps, RegisterState> {
	state = {
		timeId: undefined,
		time: 0,
		validate: {},
		isEffectionPhone: false,
	};

	handleSubmit = () => {
		this.props.form.validateFields((err, result) => {
			if (!err) {
				const { dispatch } = this.props;
				dispatch({
					type: 'register/register',
					payload: {
						...result,
					},
				});
			}
		});
	};

	sendValidation = () => {
		this.props.form.validateFields(['phone'], (err, value) => {
			if (err) return;
			if (this.state.isEffectionPhone) {
				this.props.dispatch({
					type: 'register/getValidation',
					payload: value,
				});
				const id = setInterval(() => {
					if (this.state.time <= 1) {
						clearInterval(this.state.timeId);
						this.setState({
							timeId: undefined,
							time: 0,
						});
					} else {
						this.setState({
							time: this.state.time - 1,
						});
					}
				}, 1000);
				this.setState({
					timeId: id,
					time: 59,
				});
			} else {
				this.setState({
					validate: {
						validateStatus: 'error',
						help: '请填写有效手机号',
					},
				});
				setTimeout(() => {
					this.setState({
						validate: {},
					});
				}, 3000);
			}
		});
	};

	handlePhoneChange = (e: any) => {
		if (mobileReg.test(e.target.value)) {
			checkByPhone({ phone: e.target.value })
				.then(res => {
					this.setState({
						validate: {},
						isEffectionPhone: true,
					});
				})
				.catch(err => {
					this.setState({
						validate: {
							validateStatus: 'error',
							help: err,
						},
						isEffectionPhone: false,
					});
					setTimeout(() => {
						this.setState({
							validate: {},
						});
					}, 3000);
				});
		}
	};

	componentWillUnmount() {
		if (this.state.timeId) {
			clearInterval(this.state.timeId);
		}
	}

	render() {
		const {
			form: { getFieldDecorator },
		} = this.props;

		const { time, timeId, validate } = this.state;
		return (
			<div className={styles.content}>
				<div className={styles.main}>
					<div className={styles.loginTitle}>商家注册</div>
					<Form>
						<FormItem {...validate}>
							{getFieldDecorator('phone', {
								rules: [
									{
										required: true,
										message: '请输入手机号或账户名',
									},
									{
										pattern: mobileReg,
										message: '请输入正确的手机号',
									},
								],
							})(
								<Input
									prefix={<Icon type="user" />}
									placeholder="请输入手机号"
									onChange={this.handlePhoneChange}
								/>,
							)}
						</FormItem>
						<FormItem>
							{getFieldDecorator('verCode', {
								rules: [
									{
										required: true,
										message: '请输入验证码',
									},
								],
							})(
								<Input
									prefix={<Icon type="user" />}
									placeholder="请输入验证码"
									style={{ width: '190px', marginRight: '8px' }}
								/>,
							)}
							<Button onClick={this.sendValidation} disabled={!!timeId}>
								获取验证码{!!timeId ? time : ''}
							</Button>
						</FormItem>
					</Form>
					<button className={styles.loginSumit} onClick={() => this.handleSubmit()}>
						申请入驻
					</button>
				</div>
			</div>
		);
	}
}

const RegisterWithFrom = Form.create<userFormProps>({})(Register);

export default RegisterWithFrom;
