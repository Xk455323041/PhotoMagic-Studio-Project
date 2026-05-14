# PhotoMagic Backend Docs Index

本目录当前与证件照接入最相关的文档如下。

## 推荐阅读顺序

### 1. 前端快速接入
- `ID_PHOTO_FRONTEND_ONE_PAGER.md`
- 适合前端、H5、小程序、第三方调用方快速接入
- 包含：
  - 上传 → 创建任务 → 轮询结果
  - 最小请求示例
  - business_type / size 传参建议
  - 常见场景模板
  - 默认值建议

### 2. 接口契约说明
- `ID_PHOTO_API_CONTRACT.md`
- 适合后端协作、接口设计、联调确认
- 包含：
  - 字段职责
  - 规则优先级
  - business_type 优先、size 辅助的契约定义
  - 推荐调用规范

### 3. VeLMagicX 接入说明
- `VELMAGICX_SDK_SETUP.md`
- 适合排障、环境配置、SDK 接入核对

---

## 文档职责划分

### ID_PHOTO_FRONTEND_ONE_PAGER.md
面向“怎么接”。

你应该在这些场景优先看它：
- 前端开始接接口
- 产品/前端想知道字段怎么传
- 想快速复制一个可跑的请求模板

### ID_PHOTO_API_CONTRACT.md
面向“为什么这么设计”。

你应该在这些场景优先看它：
- 联调时确认 business_type / photo_type / size 的职责
- 需要知道后端规则优先级
- 需要确认业务类型是否优先于尺寸规则

---

## 当前契约结论

后端证件照入参已收敛为：

1. `business_type` 表达用途/场景
2. `size` 表达尺寸规格
3. 后端先看用途，再看尺寸

因此：
- 前端应优先采集用途，再采集尺寸
- 不应只让用户选尺寸，再让后端猜业务语义

---

## 推荐给前端的最小资料包

如果只给前端 2 个文件，建议给：

1. `ID_PHOTO_FRONTEND_ONE_PAGER.md`
2. `mock/id-photo-request-examples.ts`

这样前端可以：
- 看一页版说明
- 直接抄 TS 示例和 mock payload

---

## 相关实现位置

- 规则配置：`src/config/idPhotoRules.ts`
- 参数类型：`src/types/index.ts`
- 任务接口：`src/routes/id-photo-tasks.ts`
- 证件照代理服务：`src/services/idPhotoProxyService.ts`
