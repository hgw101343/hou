// 测试环境变量
export default {
	define: {
		'PROCESS_ENV': {
			APP_API_BASE: "http://test.quzhuanxiang.com",
			APP_API_BASE_URL: "http://test.quzhuanxiang.com",
			APP_API_SECURITY: '/el-security',
			APP_API_SECURITY_URL: 'http://test.quzhuanxiang.com',
			APP_API_SUBSYSTEMID: 1,
			NODE_ENV: "test"
		}
	}
}
