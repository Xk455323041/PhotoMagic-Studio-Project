# ID Photo API Contract

## 核心原则

证件照接口的入参契约已收敛为：

1. **business_type 优先**
2. **size 为辅助信息**
3. 当 `business_type` 缺失时，后端才主要依赖 `size` 做规则匹配

也就是说，调用方不应再把“尺寸”当成唯一业务语义来源。

---

## 推荐请求结构

### 1) 上传文件

`POST /api/v1/upload?type=image&purpose=id_photo`

返回：`file_id`

### 2) 创建异步证件照任务

`POST /api/v1/id-photo/tasks`

示例：

```json
{
  "file_id": "file_xxx",
  "parameters": {
    "business_type": "passport",
    "photo_type": "passport",
    "background": {
      "type": "solid",
      "color": "#FFFFFF"
    },
    "size": {
      "type": "custom",
      "width_mm": 33,
      "height_mm": 48,
      "dpi": 300
    },
    "portrait": {
      "zoom": 1,
      "beauty": {
        "enabled": false,
        "skin_smooth": 0,
        "eye_brighten": 0,
        "teeth_whiten": 0
      }
    },
    "output": {
      "format": "png",
      "layout": "single",
      "quality": 90
    }
  }
}
```

---

## 字段优先级

### business_type

推荐前端始终传递。

当前支持：

- `resume`
- `exam_registration`
- `id_card`
- `passport`
- `visa`
- `driver_license`
- `generic`

用途：表达**业务语义**，决定优先命中的规则。

### photo_type

保留字段，用于兼容旧逻辑和补充语义。

当前支持：

- `id_card`
- `passport`
- `visa`
- `driver_license`
- `custom`

### size

作为**辅助尺寸信息**，用于：

- 指定毫米尺寸
- 在缺少 `business_type` 时做兜底匹配
- 决定更具体的输出 bucket / 版式细节

当前支持：

- `大一寸`
- `小一寸`
- `大两寸`
- `小两寸`
- `标准一寸`
- `标准两寸`
- `custom`

---

## 推荐调用规范

### 护照

- `business_type=passport`
- `photo_type=passport`
- `size=33x48` 或对应尺寸类型

### 签证

- `business_type=visa`
- `photo_type=visa`
- `size` 按真实签证规格传

### 简历照

- `business_type=resume`
- `photo_type=id_card` 或 `custom`
- `size` 作为辅助尺寸

### 考试报名照

- `business_type=exam_registration`
- `photo_type=id_card` / `custom` 均可
- `size` 按报名要求传

### 身份证件照

- `business_type=id_card`
- `photo_type=id_card`
- `size` 按一寸/大一寸等需求传

---

## 当前规则层顺序

后端按以下顺序决策：

1. `business_type` 规则
2. `size` 规则
3. 默认兜底规则

并且：

- `bucket`
- `preset`

都来自同一个规则决策结果，避免出现“业务语义与尺寸 bucket 分叉”的情况。

---

## 给前端的建议

前端在 UI 上应优先收集：

1. **用途/场景**（映射到 `business_type`）
2. **尺寸**（映射到 `size`）
3. **背景色**
4. **输出格式/排版**

不要只让用户选尺寸，再让后端猜用途。

---

## 已验证的典型样例

- `business_type=passport` → `passport + passport_standard`
- `business_type=resume` → 业务规则优先覆盖尺寸语义
- `business_type=exam_registration` → 业务规则优先覆盖尺寸语义
- `business_type=id_card` + `大一寸` → `passport + id_card_standard`
