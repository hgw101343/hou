import { MenuDataItem, getMenuData } from '@ant-design/pro-layout';
import DocumentTitle from 'react-document-title';
import Link from 'umi/link';
import React from 'react';
import { connect } from 'dva';

import { ConnectProps, ConnectState } from '@/models/connect';
import styles from './UserLayout.less';
import FooterLayout from './footerLayout';
import loginLogo from '../assets/img/loginLogo.png';
import * as H from 'history';

export interface UserLayoutProps extends ConnectProps {
	breadcrumbNameMap: { [path: string]: MenuDataItem };
	location: H.Location;
}

const loginHeader = (
	<div className={styles.header}>
		<div className={styles.title}>
			<img src={loginLogo} alt="logo" />
			<span>商家管理后台</span>
		</div>
	</div>
);

const registerHeader = (
	<div className={styles.registerHeader}>
		<div className={styles.title}>
			<img src="/qu_elfront_service/logo.ico" alt="logo" />
			<span>趣专享商家后台</span>
		</div>
	</div>
);

const UserLayout: React.FunctionComponent<UserLayoutProps> = props => {
	const { children } = props;
	const pathName = location.pathname;
	const headerShow = /\/user\/(login|register|password)$/.test(pathName);
	const footerShow = /\/user\/(login|register)$/.test(location.pathname);

	return (
		<DocumentTitle title="登录">
			<div className={styles.container}>
				{headerShow ? loginHeader : null}
				{children}
				{footerShow ? <FooterLayout /> : null}
			</div>
		</DocumentTitle>
	);
};

export default connect(({ settings }: ConnectState) => ({
	...settings,
}))(UserLayout);
