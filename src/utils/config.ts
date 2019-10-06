export interface configType {
    REQUEST_URL: string | undefined;
    SECURITY_REQ_URL: string | undefined;
    HOME_NAME: string;
    PROJECT_NAME: string;
    SERVICE: string;
    WITH_OUT_COOKIE: Array<string>;
}

export const config: configType = {
    REQUEST_URL: PROCESS_ENV.APP_API_BASE,
    SECURITY_REQ_URL: (PROCESS_ENV.APP_API_SECURITY_URL ? PROCESS_ENV.APP_API_SECURITY_URL : PROCESS_ENV.APP_API_BASE) + PROCESS_ENV.APP_API_SECURITY,
    HOME_NAME: 'home',
    PROJECT_NAME: '/elbusiness-manager',
    SERVICE: '/elbusiness-manager',
    WITH_OUT_COOKIE: ['sidebarStatus'],
}

