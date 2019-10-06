declare module 'slash2';
declare module 'antd-theme-webpack-plugin';

declare module '*.css';
declare module '*.less';
declare module '*.scss';
declare module '*.sass';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module 'omit.js';
declare module 'react-copy-to-clipboard';
declare module 'react-fittext';
declare module '@antv/data-set';
declare module 'nzh/cn';
declare module 'webpack-theme-color-replacer';
declare module 'webpack-theme-color-replacer/client';

// google analytics interface
interface GAFieldsObject {
	eventCategory: string;
	eventAction: string;
	eventLabel?: string;
	eventValue?: number;
	nonInteraction?: boolean;
}
interface Window {
	ga: (
		command: 'send',
		hitType: 'event' | 'pageview',
		fieldsObject: GAFieldsObject | string,
	) => void;
}

declare let ga: Function;

interface Date {
	Format: (v: string) => string;
}

// preview.pro.ant.design only do not use in your production ;
// preview.pro.ant.design 专用环境变量，请不要在你的项目中使用它。
declare let ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: 'site' | undefined;

// 环境变量
interface PROCESS_ENV_IN {
	APP_API_BASE: string;
	APP_API_BASE_URL?: string;
	APP_API_SECURITY: string;
	APP_API_SECURITY_URL: string;
	APP_API_SUBSYSTEMID: number;
	NODE_ENV: string;
}

declare let PROCESS_ENV: PROCESS_ENV_IN;
