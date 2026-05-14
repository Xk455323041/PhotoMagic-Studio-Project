# PhotoMagic VeLMagicX SDK 接入说明

## 当前状态

已完成后端代码改造：

1. 保留并使用现有 VeLMagicX / veImageX 配置：
   - `VELMAGICX_ACCESS_KEY_ID`
   - `VELMAGICX_SECRET_ACCESS_KEY`
   - `VELMAGICX_SERVICE_ID`
   - `VELMAGICX_REGION`
   - `VELMAGICX_ENDPOINT`（可留空，默认 `imagex.volcengineapi.com`）
   - `VELMAGICX_PUBLIC_DOMAIN`（当控制台 `GetServiceDomains` 暂时取不到域名时，可显式填写已开通的公网加速域名）
2. `background removal` 现已优先走 `@volcengine/openapi` 官方 SDK 的人像分割链路。
3. 若火山侧能力未开通、service 未配置完整域名、或 SDK 官方链路失败，则自动降级到本地兜底实现，避免接口直接报 `sdk-migration-required`。
4. `humanSegmentation` 与 `backgroundReplacement` 不再是硬编码未接入状态，已经纳入 VeLMagicX 适配层。

## 已确认事实

- 当前服务 `serviceId=dubwzh5r6d` 的 SDK 鉴权可通。
- 默认公网加速域名为 `dubwzh5r6d.veimagex-pub.cn-north-1.volces.com`。
- `ApplyImageUpload` 已可成功返回上传地址。
- `GetSegmentImage` 已可成功返回 `ResUri`。
- `GetResourceURL` 需要满足两个前提：
  1. `URI` 传完整存储 URI（例如 `tos-cn-i-dubwzh5r6d/8aa2f9a7c02462b0bdb021c3997e3ad0`），不能只传文件 key。
  2. `Tpl` 传真实存在的模板名，当前已验证可用模板为：`tplv-dubwzh5r6d-Image processing`。
- 当前代码已支持通过环境变量配置模板名：
  - `VELMAGICX_SOURCE_TEMPLATE=tplv-dubwzh5r6d-image`
  - `VELMAGICX_PROCESS_TEMPLATE=tplv-dubwzh5r6d-Image processing`

这意味着：
- 不是“SDK 没配上”；
- 也不是“域名没生效”；
- 而是此前卡在 `serviceId` 错误与 `GetResourceURL` 参数不完整。
- 现在官方上传 -> 分割 -> 结果图回取链路已验证打通。

## 建议你在火山控制台再确认两项

1. **AI 能力组件**
   - 已开启抠图/人像分割相关能力
2. **veImageX 服务域名**
   - 给 `serviceId=7hl6k98gaa` 配置可用的分发/访问域名
   - 否则上传后的资源虽然可能进入服务，但服务端无法稳定通过 `GetResourceURL` 取回结果图

## 后端已接入的逻辑

- 背景移除接口 `/api/v1/background-removal`
  - 先读取本地上传图片
  - 调 `velmagicxService.humanSegmentation(...)`
  - 成功则直接输出处理后的 PNG/JPG/WebP
  - 失败则记录日志并自动回退到本地算法

## 后续如果你要做到“纯官方链路”

当前已完成：

- 纠正服务 ID 为 `dubwzh5r6d`
- 显式配置公网加速域名 `dubwzh5r6d.veimagex-pub.cn-north-1.volces.com`
- 验证通过 `UploadImages -> GetSegmentImage -> GetResourceURL`
- 已确认 `GetResourceURL` 需使用真实模板名 `tplv-dubwzh5r6d-Image processing`
- 已将模板名改成环境变量配置，避免后续控制台变更时改代码

后续可以继续优化：

- 若后续新增专用抠图模板，可把当前通用模板替换为更精确模板
- 如需对“原图 URL”和“处理图 URL”做不同用途区分，可在代码中进一步显式使用 `VELMAGICX_SOURCE_TEMPLATE`
- 待端到端接口验证稳定后，再评估是否下线本地 fallback
