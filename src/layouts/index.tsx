/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import ProLayout, {
	MenuDataItem,
	BasicLayoutProps as ProLayoutProps,
	SettingDrawer,
	PageHeaderWrapper,
} from '@ant-design/pro-layout';
import React, { useEffect } from 'react';
import Link from 'umi/link';
import { Dispatch } from 'redux';
import { connect } from 'dva';
import { formatMessage } from 'umi-plugin-react/locale';
import router from 'umi/router';
import Authorized from '@/utils/Authorized';
import RightContent from '@/components/GlobalHeader/RightContent';
import { ConnectState } from '@/models/connect';
import UserLayout from './UserLayout';
import { SettingStateType } from '../models/setting';
import styles from './UserLayout.less';
import thirdPageConfig from '../pages/thirdPageConfig';

export interface BasicLayoutProps extends ProLayoutProps {
	breadcrumbNameMap: {
		[path: string]: MenuDataItem;
	};
	settings: SettingStateType;
	dispatch: Dispatch;
	menuList: MenuDataItem[];
	login: boolean;
	location: Location;
	collapsed: boolean;
}
export type BasicLayoutContext = { [K in 'location']: BasicLayoutProps[K] } & {
	breadcrumbNameMap: {
		[path: string]: MenuDataItem;
	};
};

/**
 * use Authorized check all menu item
 */
const menuDataRender = (menuList: MenuDataItem[]): MenuDataItem[] =>
	menuList.map(item => {
		const localItem = {
			...item,
			children: item.children ? menuDataRender(item.children) : [],
		};
		return Authorized.check(item.authority, localItem, null) as MenuDataItem;
	});

const BasicLayout: React.FC<BasicLayoutProps> = props => {
	const { dispatch, children, settings, menuList, login, collapsed } = props;

	/**
	 * constructor
	 */
	useEffect(() => {
		if (login) {
			if (dispatch) {
				dispatch({
					type: 'global/getMenu',
				});
			}
		}
	}, [login]);
	/**
	 * init variables
	 */
	const handleMenuCollapse = (payload: boolean): void => {
		if (dispatch) {
			dispatch({
				type: 'global/changeLayoutCollapsed',
				payload,
			});
		}
	};

	const handleSettingChange = (payload: any): void => {
		dispatch({
			type: 'settings/changeSetting',
			payload,
		});
	};

	const handleCollapseChange = (payload: boolean): void => {
		dispatch({
			type: 'settings/collapseSetting',
			payload: {
				settingCollapse: payload,
			},
		});
	};

	if (!login) {
		return <UserLayout>{children}</UserLayout>;
	}

	return (
		<ProLayout
			logo="/qu_elfront_service/logo.ico"
			onCollapse={handleMenuCollapse}
			menuHeaderRender={(logo, title) => {
				return (
					<div className={styles.menuLogo}>
						{logo}
						{!collapsed ? title : null}
					</div>
				);
			}}
			onMenuHeaderClick={() => {
				router.push('/');
			}}
			menuItemRender={(menuItemProps, defaultDom) => {
				if (/^\/[a-zA-Z]+\/[a-zA-Z]+/.test(menuItemProps.path)) {
					return <Link to={menuItemProps.path}>{defaultDom}</Link>;
				}
				return defaultDom;
			}}
			breadcrumbRender={(router = []) => {
				if (
					/^\/qu_elfront_service\/[a-zA-Z]+\/[a-zA-Z]+\/[a-zA-Z]+/.test(location.pathname)
				) {
					const parentPath = router[router.length - 1]
						? router[router.length - 1].path
						: '';
					const thirdPage = thirdPageConfig
						.filter(item => item.path.includes(parentPath))
						.map(item => ({ path: item.path, breadcrumbName: item.name }));
					return [
						{
							path: '/',
							breadcrumbName: formatMessage({
								id: 'menu.home',
								defaultMessage: 'Home',
							}),
						},
						...router,
						...thirdPage,
					];
				}
				return [
					{
						path: '/',
						breadcrumbName: formatMessage({
							id: 'menu.home',
							defaultMessage: 'Home',
						}),
					},
					...router,
				];
			}}
			itemRender={(route, params, routes, paths) => {
				const first = routes.indexOf(route) === 0;
				return first ? (
					<Link to={paths.join('/')}>{route.breadcrumbName}</Link>
				) : (
					<span>{route.breadcrumbName}</span>
				);
			}}
			footerRender={false}
			menuDataRender={() => menuList}
			formatMessage={formatMessage}
			rightContentRender={rightProps => <RightContent {...rightProps} dispatch={dispatch} />}
			{...props}
			{...settings.layoutSetting}
		>
			<SettingDrawer
				settings={settings.layoutSetting}
				collapse={settings.settingCollapse}
				onSettingChange={settings => handleSettingChange(settings)}
				onCollapseChange={collapse => handleCollapseChange(collapse)}
			/>
			<PageHeaderWrapper title={false}>{children}</PageHeaderWrapper>
		</ProLayout>
	);
};

export default connect(({ global, settings, login }: ConnectState) => ({
	collapsed: global.collapsed,
	menuList: global.menu,
	settings,
	login: login.login,
}))(BasicLayout);
