let config = {
    "apps":[
        {
            "name"        : "frontend_qu_service_" + process.env.START_PORT,
            "script"      : "./app/index.js",  // 实际启动脚本
            "cwd"         : "./",  // "当前工作路径"
            "node_args"   : "--harmony", // node运行模式
            "max_memory_restart": "1400M",
            "instances"   : "2",
            "exec_mode"   : "cluster",
            "watch": false,
            "wait_ready"  : true,
            "error_file" : "./app/logs/pm2_errors.log",  // 错误日志路径
            "out_file"   : "./app/logs/pm2_out.log",  // 普通日志路径
            "log_date_format":"YYYY-MM-DD HH:mm Z", //日期格式
            "env": {
                "NODE_ENV": "production",
                "PORT":     process.env.START_PORT,
                "SERV_ENV": "production"
            },
            "env_test": {
                "NODE_ENV": "test",
                "PORT"    : process.env.START_PORT,
                "SERV_ENV": "test"
            },
            "env_pre": {
                "NODE_ENV": "pre",
                "PORT"    : process.env.START_PORT,
                "SERV_ENV": "pre"
            }
        }
    ]
}

module.exports = config;
