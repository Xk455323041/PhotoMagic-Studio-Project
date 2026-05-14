# ID Photo Frontend Integration One-Pager

## 一句话原则

前端接入时请按这个顺序传参：

1. **business_type**：表达用途/场景
2. **size**：表达尺寸规格
3. **background / output**：表达生成要求

> 不要只传尺寸，再让后端猜用途。

---

## 接入流程

### Step 1: 上传原图

**接口**

`POST /api/v1/upload?type=image&purpose=id_photo`

**表单字段**

- `file`: 原始图片文件

**返回示例**

```json
{
  "success": true,
  "data": {
    "file_id": "file_xxx",
    "url": "/temp/file_xxx.png",
    "expires_at": "2026-05-15T12:00:00.000Z"
  }
}
```

拿到 `file_id` 后，进入下一步。

---

### Step 2: 创建证件照任务

**接口**

`POST /api/v1/id-photo/tasks`

**最小推荐请求**

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

**返回示例**

```json
{
  "success": true,
  "data": {
    "task_id": "task_xxx",
    "status": "pending",
    "file_id": "file_xxx",
    "created_at": "2026-05-15T00:00:00.000Z"
  }
}
```

---

### Step 3: 轮询任务结果

**接口**

`GET /api/v1/id-photo/tasks/:taskId`

**完成示例**

```json
{
  "success": true,
  "data": {
    "task_id": "task_xxx",
    "status": "completed",
    "result": {
      "result_id": "result_xxx",
      "url": "/temp/result_xxx.png",
      "layout_url": null,
      "expires_at": "2026-05-16T00:00:00.000Z",
      "processing_time": 6.2,
      "metadata": {
        "processingTime": 6.2,
        "resultSize": 12345,
        "format": "png"
      }
    }
  }
}
```

前端直接使用：
- `result.url`
- `result.layout_url`（如果有排版图）

---

## 前端字段怎么传

### 1. business_type（优先）

这个字段最重要，用来表达**用途/场景**。

当前推荐值：

- `id_card`：身份证件照
- `passport`：护照照
- `visa`：签证照
- `driver_license`：驾照/驾驶证
- `resume`：简历照 / 职业形象照
- `exam_registration`：考试报名照
- `generic`：通用证件照

### 2. photo_type（兼容/辅助）

当前推荐值：

- `id_card`
- `passport`
- `visa`
- `driver_license`
- `custom`

建议：
- 有明确用途时，`photo_type` 与 `business_type` 保持一致或接近
- 无明确用途时，可传 `custom`

### 3. size（辅助）

用来表达物理尺寸，不是第一语义来源。

当前支持：

- `大一寸`
- `小一寸`
- `标准一寸`
- `大两寸`
- `小两寸`
- `标准两寸`
- `custom`

如果传 `custom`，请同时传：
- `width_mm`
- `height_mm`
- 建议 `dpi=300`

---

## 最推荐的前端表单结构

前端 UI 推荐按下面顺序组织：

1. **用途**（映射到 `business_type`）
   - 护照照
   - 签证照
   - 简历照
   - 考试报名照
   - 身份证件照

2. **尺寸**（映射到 `size`）
   - 标准一寸
   - 大一寸
   - 标准两寸
   - 自定义尺寸

3. **背景色**
   - 白
   - 蓝
   - 红

4. **输出**
   - PNG / JPG
   - single / 4x6

---

## 前端常用请求模板

### 护照照

```json
{
  "business_type": "passport",
  "photo_type": "passport",
  "size": {
    "type": "custom",
    "width_mm": 33,
    "height_mm": 48,
    "dpi": 300
  }
}
```

### 签证照

```json
{
  "business_type": "visa",
  "photo_type": "visa",
  "size": {
    "type": "custom",
    "width_mm": 33,
    "height_mm": 48,
    "dpi": 300
  }
}
```

### 简历照

```json
{
  "business_type": "resume",
  "photo_type": "id_card",
  "size": {
    "type": "标准一寸",
    "width_mm": 25,
    "height_mm": 35,
    "dpi": 300
  }
}
```

### 考试报名照

```json
{
  "business_type": "exam_registration",
  "photo_type": "custom",
  "size": {
    "type": "大一寸",
    "width_mm": 33,
    "height_mm": 48,
    "dpi": 300
  }
}
```

### 身份证件照

```json
{
  "business_type": "id_card",
  "photo_type": "id_card",
  "size": {
    "type": "大一寸",
    "width_mm": 33,
    "height_mm": 48,
    "dpi": 300
  }
}
```

---

## 规则优先级（前端需要知道）

后端按这个顺序决策：

1. `business_type`
2. `size`
3. 默认兜底

所以：
- 如果 `business_type` 和 `size` 语义冲突，**以后端业务规则优先**
- `size` 更多是“物理规格辅助信息”

---

## 前端接入建议

### 推荐
- 必传 `business_type`
- 尽量传标准化 `size`
- `dpi` 默认 300
- `background.color` 默认 `#FFFFFF`
- `output.format` 默认 `png`
- `output.layout` 默认 `single`

### 不推荐
- 只传尺寸，不传用途
- 让用户自己理解一寸/两寸背后的业务语义
- 同时传互相冲突的用途但不做 UI 限制

---

## 最简前端默认值

如果前端要快速接入，可直接默认：

```json
{
  "background": {
    "type": "solid",
    "color": "#FFFFFF"
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
```

---

## 文档位置

更完整版本见：
- `photomagic/backend/ID_PHOTO_API_CONTRACT.md`
