## 通用接口

一个基于express、sequelize、TypeScript的通用接口。

## 注意事项
- 在models/index.ts中定义model关系时，不要取关联别名(as)，通用接口会找不到model上的分配方法（目前还在想更合适通用的方式来解决）

## env文件
该项目的环境配置采用`dotenv`来读取管理，具体如下：
```
ENV=DEV
# app
PORT=3000 # 项目端口
# database
DB_HOST=localhost # 数据库地址
DB_PORT=3306 # 数据库端口
DB_USER=****** # 数据库用户
DB_PASSWORD=****** # 用户密码
DB_NAME=common-interface-db-name # 数据库名称
# auth
TOKEN_SECRET=****** # token加密的盐
# SMTP
SMTP_HOST=****** # 邮件服务的host：smtp.gmail.com、smtp.qq.com
SMTP_PORT=465 # 邮件端口
SMTP_SECURE=true # 安全模式
SMTP_USER_NAME='Bokey Studio' # 邮件用户名
SMTP_USER=****** # 邮件邮箱
SMTP_PASS=****** # 邮件许可
# OSS
OSS_REGION=oss-cn-shenzhen # oss地区
OSS_ENDPOINT=oss-cn-shenzhen.aliyuncs.com # oss节点
OSS_BUCKET=****** # bucket名称
OSS_ACCESS_KEY_ID=****** # key id
OSS_ACCESS_KEY_SECRET=****** # key密钥
# cros whitelist 
CORS_WHITE_LIST=["http://localhost:3000",'http://127.0.0.1:5500'] # 跨域白名单 若不需要，可以在app.ts配置
```
> 上面是在src目录下的`.env`、`.beta.env`、`.pro.env`文件的格式