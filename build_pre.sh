#!/bin/sh
echo $1
node -v

deployOfficialServer=prerelease
user=xmiles
host='106.14.162.219'
passFile='pass_219.passwd'

echo deployOfficialServer: ${deployOfficialServer}
echo user: ${user}
echo host: ${host}
echo passFile: ${passFile}

echo '前端代码转译'
npm run build:pre
if [ $? -ne 0 ]; then
    echo '前端代码转译 失败'
    exit 1
else
    echo '前端代码转译 成功'
fi

echo '压缩需要部署的目录及文件'
tar -czf frontend_qu_service.tar.gz app/ dist/ config/ public/ src/ tests/ .prettierignore .prettierrc.js .stylelintrc.js package.json package-lock.json jest-puppeteer.config.js jest.config.js jsconfig.json tsconfig.json start.config.js

if [ $? -ne 0 ]; then
    echo '压缩需要部署的目录及文件 失败'
    exit 1
else
    echo '压缩需要部署的目录及文件 成功'
fi

echo '上传文件'
sshpass -f ${passFile} scp ./frontend_qu_service.tar.gz ${user}@${host}:/data/node/frontend_qu_service_13363/

if [ $? -ne 0 ]; then
    echo '上传文件 失败'
    exit 1
else
    echo '上传文件 成功'
fi

echo "部署预发布"
gradle -q deployPre --info -P isOfficial="${deployOfficialServer}"