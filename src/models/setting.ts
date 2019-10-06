import { Reducer } from 'redux';
import { message } from 'antd';
import defaultSettings, { DefaultSettings } from '../../config/defaultSettings';
import themeColorClient from '../components/SettingDrawer/themeColorClient';

export interface SettingStateType {
  layoutSetting: DefaultSettings;
  settingCollapse: boolean;
}

export interface SettingModelType {
  namespace: 'settings';
  state: SettingStateType;
  reducers: {
    getSetting: Reducer<SettingStateType>;
    changeSetting: Reducer<SettingStateType>;
    collapseSetting: Reducer<SettingStateType>;
  };
}

const updateTheme = (newPrimaryColor?: string) => {
  if (newPrimaryColor) {
    const timeOut = 0;
    const hideMessage = message.loading('正在切换主题！', timeOut);
    themeColorClient.changeColor(newPrimaryColor).finally(() => hideMessage());
  }
};

const updateColorWeak: (colorWeak: boolean) => void = colorWeak => {
  const root = document.getElementById('root');
  if (root) {
    root.className = colorWeak ? 'colorWeak' : '';
  }
};

const SettingModel: SettingModelType = {
  namespace: 'settings',
  state: {
    layoutSetting: defaultSettings,
    settingCollapse: false
  },
  reducers: {
    getSetting(state = { layoutSetting: defaultSettings, settingCollapse: false }) {
      const setting: Partial<DefaultSettings> = {};
      const urlParams = new URL(window.location.href);
      Object.keys(state.layoutSetting).forEach(key => {
        if (urlParams.searchParams.has(key)) {
          const value = urlParams.searchParams.get(key);
          setting[key] = value === '1' ? true : value;
        }
      });
      const { primaryColor, colorWeak } = setting;

      if (primaryColor && state.layoutSetting.primaryColor !== primaryColor) {
        updateTheme(primaryColor);
      }
      updateColorWeak(!!colorWeak);
      return {
        ...state,
        ...setting,
      };
    },
    changeSetting(state = { layoutSetting: defaultSettings, settingCollapse: false }, { payload }) {
      const urlParams = new URL(window.location.href);
      Object.keys(defaultSettings).forEach(key => {
        if (urlParams.searchParams.has(key)) {
          urlParams.searchParams.delete(key);
        }
      });
      Object.keys(payload).forEach(key => {
        if (key === 'collapse') {
          return;
        }
        let value = payload[key];
        if (value === true) {
          value = 1;
        }
        if (defaultSettings[key] !== value) {
          urlParams.searchParams.set(key, value);
        }
      });
      const { primaryColor, colorWeak, contentWidth } = payload;
      if (primaryColor && state.layoutSetting.primaryColor !== primaryColor) {
        updateTheme(primaryColor);
      }
      if (state.layoutSetting.contentWidth !== contentWidth && window.dispatchEvent) {
        window.dispatchEvent(new Event('resize'));
      }
      updateColorWeak(!!colorWeak);
      window.history.replaceState(null, 'setting', urlParams.href);
      return {
        ...state,
        layoutSetting: payload
      };
    },
    collapseSetting(state, { payload }) {
      return {
        ...state,
        ...payload
      }
    }
  },
};
export default SettingModel;
