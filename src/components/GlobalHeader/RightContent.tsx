import { Icon, Tooltip } from 'antd';
import React from 'react';
import { connect } from 'dva';
import { ConnectProps, ConnectState } from '@/models/connect';
import { AnyAction, Dispatch } from 'redux';

import Avatar from './AvatarDropdown';
import styles from './index.less';

export type SiderTheme = 'light' | 'dark';
export interface GlobalHeaderRightProps extends ConnectProps {
  theme?: SiderTheme;
  layout: 'sidemenu' | 'topmenu';
  dispatch: Dispatch<AnyAction>
}

const GlobalHeaderRight: React.SFC<GlobalHeaderRightProps> = props => {
  const { theme, layout, dispatch } = props;
  let className = styles.right;

  if (theme === 'dark' && layout === 'topmenu') {
    className = `${styles.right}  ${styles.dark}`;
  }

  const handleCollapseChange = (payload: boolean): void => {
    dispatch({
      type: 'settings/collapseSetting',
      payload: {
        settingCollapse: payload
      },
    });
  }

  return (
    <div className={className}>
      <Avatar />
      <div className={styles.action} onClick={() => handleCollapseChange(true)}>
        <Icon type="setting"></Icon>
      </div>

    </div>
  );
};

export default connect(({ settings }: ConnectState) => ({
  theme: settings.layoutSetting.navTheme,
  layout: settings.layoutSetting.layout,

}))(GlobalHeaderRight);
