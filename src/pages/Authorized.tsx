import React from 'react';
import Redirect from 'umi/redirect';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';
import ErrorBoundary from './ErrorBoundary'
import { StateType as loginStateType } from '../models/login'
import { GlobalModelState } from '../models/global';
import { MenuDataItem } from '@ant-design/pro-layout'
import thirdPageRoute from './thirdPageConfig';

interface AuthComponentProps extends ConnectProps {
  login: loginStateType;
  global: GlobalModelState
}

function authoryPath(menu: MenuDataItem[], pathname: string): boolean {
  if (pathname === '' || pathname === '/') {
    return true
  }
  if (thirdPageRoute.some(item => item.path === pathname)) {
    return true
  }
  const flag = menu.some(item => item.path === pathname)
  if (!flag) {
    return menu.some(item => {
      if (item.children) {
        return authoryPath(item.children, pathname);
      } else {
        return false
      }
    })
  }
  return flag
}

const AuthComponent: React.FC<AuthComponentProps> = ({
  children,
  location,
  login,
  global
}) => {

  if (!login.login) {
    return (
      <Redirect to='/user/login' />
    )
  }
  if (location && location.pathname) {
    const menu = global.menu;
    if (!authoryPath(menu, location.pathname)) {
      if (menu.length) {
        return <Redirect to='/404' />
      }
      return (
        <Redirect to='/' />
      )
    }
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};

export default connect(({ login, global }: ConnectState) => ({
  login: login,
  global: global
}))(AuthComponent);
