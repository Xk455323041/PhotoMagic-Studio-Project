# 间距系统 - PhotoMagic Studio

## 📏 基础间距单位

### 基准单位
- **基础单位**: `4px` (0.25rem)
- **设计原则**: 所有间距都是4px的倍数
- **响应式**: 使用相对单位 (rem)，支持缩放

### 间距比例
```css
/* 间距比例 (4px倍数) */
--space-0: 0;      /* 0px */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
--space-20: 5rem;    /* 80px */
--space-24: 6rem;    /* 96px */
--space-32: 8rem;    /* 128px */
--space-40: 10rem;   /* 160px */
--space-48: 12rem;   /* 192px */
--space-56: 14rem;   /* 224px */
--space-64: 16rem;   /* 256px */
```

## 🎯 间距应用场景

### 1. 内边距 (Padding)
| 场景 | 大小 | 使用示例 |
|------|------|----------|
| **按钮内边距** | `--space-2` `--space-3` | 小按钮: 8px 12px |
| **卡片内边距** | `--space-4` `--space-6` | 内容卡片: 16px 24px |
| **容器内边距** | `--space-6` `--space-8` | 页面容器: 24px 32px |
| **模态框内边距** | `--space-8` `--space-12` | 对话框: 32px 48px |

### 2. 外边距 (Margin)
| 场景 | 大小 | 使用示例 |
|------|------|----------|
| **元素间距** | `--space-2` `--space-3` | 图标和文字: 8px 12px |
| **区块间距** | `--space-4` `--space-6` | 功能区块: 16px 24px |
| **页面区块** | `--space-8` `--space-12` | 主要区块: 32px 48px |
| **大区块间距** | `--space-16` `--space-24` | 页面分段: 64px 96px |

### 3. 间隙 (Gap)
| 场景 | 大小 | 使用示例 |
|------|------|----------|
| **网格间隙** | `--space-4` `--space-6` | 卡片网格: 16px 24px |
| **Flex间隙** | `--space-2` `--space-3` | 按钮组: 8px 12px |
| **表单间隙** | `--space-3` `--space-4` | 表单字段: 12px 16px |
| **列表间隙** | `--space-2` `--space-3` | 项目列表: 8px 12px |

## 📐 组件间距规范

### 按钮组件
```css
/* 小按钮 */
.btn-sm {
  padding: var(--space-2) var(--space-3);
  margin: 0 var(--space-1);
}

/* 中按钮 */
.btn-md {
  padding: var(--space-3) var(--space-4);
  margin: 0 var(--space-2);
}

/* 大按钮 */
.btn-lg {
  padding: var(--space-4) var(--space-6);
  margin: 0 var(--space-3);
}
```

### 卡片组件
```css
/* 基础卡片 */
.card {
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

/* 紧凑卡片 */
.card-compact {
  padding: var(--space-4);
  margin-bottom: var(--space-4);
}

/* 宽松卡片 */
.card-relaxed {
  padding: var(--space-8);
  margin-bottom: var(--space-8);
}
```

### 表单组件
```css
/* 输入框 */
.input {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
}

/* 标签 */
.label {
  margin-bottom: var(--space-2);
}

/* 表单组 */
.form-group {
  margin-bottom: var(--space-6);
}
```

### 导航组件
```css
/* 导航项 */
.nav-item {
  padding: var(--space-2) var(--space-4);
  margin: 0 var(--space-1);
}

/* 导航栏 */
.navbar {
  padding: var(--space-4) var(--space-6);
}

/* 页脚 */
.footer {
  padding: var(--space-8) var(--space-6);
  margin-top: var(--space-12);
}
```

## 📱 响应式间距

### 断点系统
```css
/* 移动端优先 */
:root {
  --container-padding: var(--space-4);
  --section-spacing: var(--space-8);
  --card-spacing: var(--space-6);
}

/* 平板端 */
@media (min-width: 768px) {
  :root {
    --container-padding: var(--space-6);
    --section-spacing: var(--space-12);
    --card-spacing: var(--space-8);
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  :root {
    --container-padding: var(--space-8);
    --section-spacing: var(--space-16);
    --card-spacing: var(--space-10);
  }
}
```

### 流体间距
```css
/* 流体容器间距 */
.container-fluid {
  padding: clamp(var(--space-4), 5vw, var(--space-8));
}

/* 流体区块间距 */
.section-fluid {
  margin-bottom: clamp(var(--space-8), 10vw, var(--space-16));
}

/* 流体网格间隙 */
.grid-fluid {
  gap: clamp(var(--space-4), 3vw, var(--space-8));
}
```

## 🎨 视觉层次间距

### 1. 亲密性原则
```css
/* 相关元素紧密 */
.related-items {
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

/* 不相关元素分离 */
.unrelated-sections {
  margin-bottom: var(--space-12);
}
```

### 2. 视觉权重
```css
/* 重要元素更多间距 */
.important-section {
  padding: var(--space-8);
  margin-bottom: var(--space-12);
}

/* 次要元素较少间距 */
.secondary-section {
  padding: var(--space-4);
  margin-bottom: var(--space-6);
}
```

### 3. 阅读节奏
```css
/* 正文段落 */
.paragraph {
  margin-bottom: var(--space-4);
  line-height: 1.75;
}

/* 标题间距 */
.heading {
  margin-top: var(--space-8);
  margin-bottom: var(--space-4);
}

/* 列表项 */
.list-item {
  margin-bottom: var(--space-2);
}
```

## 📊 间距使用示例

### 页面布局示例
```css
/* 页面容器 */
.page-container {
  padding: var(--space-6);
  max-width: 1200px;
  margin: 0 auto;
}

/* 英雄区域 */
.hero-section {
  padding: var(--space-12) var(--space-6);
  margin-bottom: var(--space-12);
}

/* 功能卡片网格 */
.feature-grid {
  display: grid;
  gap: var(--space-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  margin-bottom: var(--space-12);
}

/* 卡片内部 */
.feature-card {
  padding: var(--space-6);
}

/* 卡片标题 */
.feature-card h3 {
  margin-bottom: var(--space-3);
}

/* 卡片描述 */
.feature-card p {
  margin-bottom: var(--space-4);
}

/* 卡片按钮 */
.feature-card .btn {
  margin-top: var(--space-4);
}
```

### 表单布局示例
```css
/* 表单容器 */
.form-container {
  padding: var(--space-8);
  max-width: 600px;
  margin: 0 auto;
}

/* 表单标题 */
.form-title {
  margin-bottom: var(--space-6);
}

/* 表单组 */
.form-group {
  margin-bottom: var(--space-6);
}

/* 标签 */
.form-label {
  display: block;
  margin-bottom: var(--space-2);
}

/* 输入框 */
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-2);
}

/* 错误信息 */
.form-error {
  margin-top: var(--space-1);
  margin-bottom: var(--space-3);
}

/* 表单操作 */
.form-actions {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-8);
}
```

## 🎯 间距最佳实践

### 1. 一致性原则
- 相同类型的组件使用相同的间距
- 整个网站保持统一的间距系统
- 避免随意改变间距值

### 2. 可读性原则
- 确保足够的行高和段落间距
- 避免过于拥挤的布局
- 使用空白创造视觉呼吸空间

### 3. 响应式原则
- 在大屏幕上使用更大的间距
- 在小屏幕上保持足够的触摸目标
- 使用流体间距适应不同设备

### 4. 性能原则
- 使用CSS变量管理间距
- 避免过多的嵌套间距
- 使用CSS Grid/Flex gap属性

## 🔧 间距工具类

### 边距工具类
```css
/* 外边距 */
.m-0 { margin: 0; }
.m-1 { margin: var(--space-1); }
.m-2 { margin: var(--space-2); }
.m-4 { margin: var(--space-4); }

/* 上下外边距 */
.my-0 { margin-top: 0; margin-bottom: 0; }
.my-2 { margin-top: var(--space-2); margin-bottom: var(--space-2); }
.my-4 { margin-top: var(--space-4); margin-bottom: var(--space-4); }

/* 左右外边距 */
.mx-0 { margin-left: 0; margin-right: 0; }
.mx-2 { margin-left: var(--space-2); margin-right: var(--space-2); }
.mx-4 { margin-left: var(--space-4); margin-right: var(--space-4); }
```

### 内边距工具类
```css
/* 内边距 */
.p-0 { padding: 0; }
.p-1 { padding: var(--space-1); }
.p-2 { padding: var(--space-2); }
.p-4 { padding: var(--space-4); }

/* 上下内边距 */
.py-0 { padding-top: 0; padding-bottom: 0; }
.py-2 { padding-top: var(--space-2); padding-bottom: var(--space-2); }
.py-4 { padding-top: var(--space-4); padding-bottom: var(--space-4); }

/* 左右内边距 */
.px-0 { padding-left: 0; padding-right: 0; }
.px-2 { padding-left: var(--space-2); padding-right: var(--space-2); }
.px-4 { padding-left: var(--space-4); padding-right: var(--space-4); }
```

### 间隙工具类
```css
/* 网格间隙 */
.gap-0 { gap: 0; }
.gap-2 { gap: var(--space-2); }
.gap-4 { gap: var(--space-4); }
.gap-6 { gap: var(--space-6); }

/* 行间隙 */
.row-gap-0 { row-gap: 0; }
.row-gap-2 { row-gap: var(--space-2); }
.row-gap-4 { row-gap: var(--space-4); }

/* 列间隙 */
.column-gap-0 { column-gap: 0; }
.column-gap-2 { column-gap: var(--space-2); }
.column-gap-4 { column-gap: var(--space-4); }
```

## 📱 移动端间距优化

### 触摸目标大小
```css
/* 最小触摸目标 */
.touch-target {
  min-height: 44px;
  min-width: 44px;
  padding: var(--space-2) var(--space-3);
}

/* 按钮触摸目标 */
.btn-touch {
  padding: var(--space-3) var(--space-4);
  margin: var(--space-1);
}

/* 链接触摸目标 */
.link-touch {
  padding: var(--space-2) var(--space-1);
  display: inline-block;
}
```

### 移动端安全区域
```css
/* 考虑安全区域 */
.safe-area {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}

/* 移动端容器 */
.mobile-container {
  padding: var(--space-4) max(var(--space-4), env(safe-area-inset-left));
}
```

## 🎨 间距CSS变量

### 完整间距变量
```css
:root {
  /* 基础间距单位 */
  --space-unit: 0.25rem; /* 4px */
  
  /* 间距比例 */
  --space-0: 0;
  --space-1: calc(1 * var(--space-unit));  /* 4px */
  --space-2: calc(2 * var(--space-unit));  /* 8px */
  --space-3: calc(3 * var(--space-unit));  /* 12px */
  --space-4: calc(4 * var(--space-unit));  /* 16px */
  --space-5: calc(5 * var(--space-unit));  /* 20px */
  --space-6: calc(6 * var(--space-unit));  /* 24px */
  --space-8: calc(8 * var(--space-unit));  /* 32px */
  --space-10: calc(10 * var(--space-unit)); /* 40px */
  --space-12: calc(12 * var(--space-unit)); /* 48px */
  --space-16: calc(16 * var(--space-unit)); /* 64px */
  --space-20: calc(20 * var(--space-unit)); /* 80px */
  --space-24: calc(24 * var(--space-unit)); /* 96px */
  --space-32: calc(32 * var(--space-unit)); /* 128px */
  --space-40: calc(40 * var(--space-unit)); /* 160px */
  --space-48: calc(48 * var(--space-unit)); /* 192px */
  --space-56: calc(56 * var(--space-unit)); /* 224px */
  --space-64: calc(64 * var(--space-unit)); /* 256px */
  
  /* 响应式间距 */
  --container-padding: var(--space-4);
  --section-spacing: var(--space-8);
  --card-spacing: var(--space-6);
  
  @media (min-width: 768px) {
    --container-padding: var(--space-6);
    --section-spacing: var(--space-12);
    --card-spacing: var(--space-8);
  }
  
  @media (min-width: 1024px) {
    --container-padding: var(--space-8);
    --section-spacing: var(--space-16);
    --card-spacing: var(--space-10);
  }
}
```

### 使用示例
```css
/* 使用间距变量 */
.container {
  padding: var(--container-padding);
}

.section {
  margin-bottom: var(--section-spacing);
}

.card {
  padding: var(--card-spacing);
  margin-bottom: var(--card-spacing);
}

/* 组合使用 */
.component {
  padding: var(--space-6);
  margin: var(--space-4) 0;
  gap: var(--space-4);
}
```

---

*间距系统版本：v1.0*
*最后更新：2026-03-19*