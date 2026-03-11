-- 重置数据库（危险操作：会删除 api 库全部数据）
drop database if exists `api`;

-- 新建库
create database `api`;

-- 切换库
use `api`;

-- ==========================================
-- 1. 创建表结构
-- ==========================================

-- 用户表
create table if not exists `api`.`user`
(
    id           bigint auto_increment comment 'id' primary key,
    userName     varchar(256)                           null comment '用户昵称',
    userAccount  varchar(256)                           not null comment '账号',
    userAvatar   varchar(1024)                          null comment '用户头像',
    gender       tinyint                                null comment '性别',
    userRole     varchar(256) default 'user'            not null comment '用户角色：user / admin',
    userPassword varchar(512)                           not null comment '密码',
    `accessKey`  varchar(512)                           not null comment 'accessKey',
    `secretKey`  varchar(512)                           not null comment 'secretKey',
    createTime   datetime     default CURRENT_TIMESTAMP not null comment '创建时间',
    updateTime   datetime     default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    isDelete     tinyint      default 0                 not null comment '是否删除',
    constraint uni_userAccount
    unique (userAccount)
    ) comment '用户';

-- 帖子信息
create table if not exists `api`.`post`
(
    `id`           bigint                                 not null auto_increment comment '主键' primary key,
    `age`          int                                    null comment '年龄',
    `gender`       tinyint                                null comment '性别（0-男, 1-女）',
    `education`    varchar(256)                           null comment '学历',
    `place`        varchar(256)                           null comment '地点',
    `job`          varchar(256)                           null comment '职业',
    `contact`      varchar(256)                           null comment '联系方式',
    `loveExp`      varchar(256)                           null comment '感情经历',
    `content`      text                                   null comment '内容（个人介绍）',
    `photo`        varchar(1024)                          null comment '照片地址',
    `reviewStatus` int          default 0                 not null comment '状态（0-待审核, 1-通过, 2-拒绝）',
    `reviewMessage` varchar(512)                          null comment '审核信息',
    `viewNum`      int          default 0                 not null comment '浏览数',
    `thumbNum`     int          default 0                 not null comment '点赞数',
    `userId`       bigint                                 not null comment '创建用户 id',
    `createTime`   datetime     default CURRENT_TIMESTAMP not null comment '创建时间',
    `updateTime`   datetime     default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    `isDelete`     tinyint      default 0                 not null comment '是否删除(0-未删, 1-已删)',
    key idx_userId (`userId`)
) comment '帖子信息';

-- 接口信息
create table if not exists `api`.`interface_info`
(
    `id`             bigint                                 not null auto_increment comment '主键' primary key,
    `name`           varchar(256)                           not null comment '名称',
    `description`    varchar(256)                           null comment '描述',
    `url`            varchar(512)                           not null comment '接口地址',
    `requestParams`  text                                   not null comment '请求参数',
    `requestHeader`  text                                   null comment '请求头',
    `responseHeader` text                                   null comment '响应头',
    `status`         int          default 0                 not null comment '接口状态（0-关闭，1-开启）',
    `method`         varchar(256)                           not null comment '请求类型',
    `userId`         bigint                                 not null comment '创建人',
    `createTime`     datetime     default CURRENT_TIMESTAMP not null comment '创建时间',
    `updateTime`     datetime     default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    `isDelete`       tinyint      default 0                 not null comment '是否删除(0-未删, 1-已删)'
    ) comment '接口信息';

-- 用户调用接口关系表
create table if not exists `api`.`user_interface_info`
(
    `id`              bigint                                 not null auto_increment comment '主键' primary key,
    `userId`          bigint                                 not null comment '调用用户 id',
    `interfaceInfoId` bigint                                 not null comment '接口 id',
    `totalNum`        int          default 0                 not null comment '总调用次数',
    `leftNum`         int          default 100               not null comment '剩余调用次数',
    `status`          int          default 0                 not null comment '0-正常，1-禁用',
    `createTime`      datetime     default CURRENT_TIMESTAMP not null comment '创建时间',
    `updateTime`      datetime     default CURRENT_TIMESTAMP not null on update CURRENT_TIMESTAMP comment '更新时间',
    `isDelete`        tinyint      default 0                 not null comment '是否删除(0-未删, 1-已删)'
) comment '用户调用接口关系';


-- ==========================================
-- 2. 插入【用户表】假数据
-- 包含了1个管理员，2个普通用户
-- ==========================================
INSERT INTO `api`.`user`
(`id`, `userName`, `userAccount`, `userAvatar`, `gender`, `userRole`, `userPassword`, `accessKey`, `secretKey`, `isDelete`)
VALUES
    (1, '管理员', 'admin123', 'https://gw.alipayobjects.com/zos/rmsportal/BiazfanxmamNRoxxVxka.png', 1, 'admin', '563a6264ccf929ab703cc8600a82382c', '5e74a4f4f365f1d6a54529206dc9f6cc', '6b1dec9ca0ace75add5ea3d9d8c6a007', 0),
    (2, '用户A', 'jiazi1', 'https://api.dicebear.com/7.x/avataaars/svg?seed=A', 1, 'user', '563a6264ccf929ab703cc8600a82382c', '9bb27dc5b86e12cb4fa4f16785db6a33', 'cf148f93a70cda7fcf4501ea40b39f18', 0);



-- ==========================================
-- 3. 插入【接口信息表】真实数据（与 api-interface 当前实现一致）
-- ==========================================
DELETE FROM `api`.`interface_info`;

INSERT INTO `api`.`interface_info`
(`id`, `name`, `description`, `url`, `requestParams`, `requestHeader`, `responseHeader`, `status`, `method`, `userId`)
VALUES
    (1, '随机姓名', '随机生成一个中文姓名', 'http://localhost:8123/api/name/random',
     '',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "text/plain;charset=UTF-8"}',
     1, 'GET', 1),
    (2, '姓名查询（GET）', 'GET 方式，根据 name 返回问候', 'http://localhost:8123/api/name/get',
     '{"example": {"name": "张三"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "text/plain;charset=UTF-8"}',
     1, 'GET', 1),
    (3, '姓名查询（POST）', 'POST 方式，根据 name 返回问候（支持 JSON 或表单）', 'http://localhost:8123/api/name/post',
     '{"example": {"name": "张三"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "text/plain;charset=UTF-8"}',
     1, 'POST', 1),
    (4, '用户名称回显', 'POST 方式，传入 username 返回拼接结果', 'http://localhost:8123/api/name/user',
     '{"example": {"username": "程序员鱼皮"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "text/plain;charset=UTF-8"}',
     1, 'POST', 1),
    (5, '星座信息查询', 'GET 方式，传入 sign（如 白羊座 / aries）返回星座详情', 'http://localhost:8123/api/zodiac/info',
     '{"example": {"sign": "白羊座"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (6, '古诗词随机', '随机返回一首古诗词', 'http://localhost:8123/api/poetry/random',
     '',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (7, '古诗词搜索', '按关键字搜索古诗词', 'http://localhost:8123/api/poetry/search',
     '{"example": {"keyword": "李白"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (8, '万年历查询', '按日期查询日历信息（支持 yyyy-MM-dd）', 'http://localhost:8123/api/calendar/day',
     '{"example": {"date": "2026-03-10"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (9, '成语接龙', '输入词语，返回可接龙的成语列表', 'http://localhost:8123/api/idiom/next',
     '{"example": {"text": "海阔天空"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (10, '随机数生成器', '按区间和数量生成随机整数', 'http://localhost:8123/api/random/number',
     '',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (11, '历史上的今天', '查询指定月日的历史事件', 'http://localhost:8123/api/history/today',
     '{"example": {"month": 3, "day": 10}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (12, '笑话随机', '随机返回一条笑话', 'http://localhost:8123/api/joke/random',
     '',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (13, '笑话列表', '分页返回笑话列表', 'http://localhost:8123/api/joke/list',
     '{"example": {"page": 1, "pageSize": 5}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (14, '菜谱搜索', '按关键字搜索菜谱', 'http://localhost:8123/api/recipe/search',
     '{"example": {"keyword": "鸡"}}',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1),
    (15, '菜谱随机', '随机返回一道菜谱', 'http://localhost:8123/api/recipe/random',
     '',
     '{"Content-Type": "application/json"}',
     '{"Content-Type": "application/json"}',
     1, 'GET', 1);


-- ==========================================
-- 4. 插入【用户调用接口关系表】真实初始化数据
-- ==========================================
DELETE FROM `api`.`user_interface_info`;

INSERT INTO `api`.`user_interface_info`
(`userId`, `interfaceInfoId`, `totalNum`, `leftNum`, `status`)
SELECT u.id, i.id, 0, 100, 0
FROM `api`.`user` u
         CROSS JOIN `api`.`interface_info` i
WHERE u.isDelete = 0;
