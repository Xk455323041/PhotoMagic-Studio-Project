# 色彩系统 - PhotoMagic Studio

## 🎨 主色调

### 品牌蓝色 (Primary Blue)
用于主要按钮、重要操作、品牌标识

| 名称 | HEX | RGB | 使用场景 |
|------|-----|-----|----------|
| Blue 50 | `#eff6ff` | rgb(239, 246, 255) | 背景、悬停状态 |
| Blue 100 | `#dbeafe` | rgb(219, 234, 254) | 次要背景 |
| Blue 200 | `#bfdbfe` | rgb(191, 219, 254) | 边框、分隔线 |
| Blue 500 | `#3b82f6` | rgb(59, 130, 246) | **主色调** - 主要按钮、重要链接 |
| Blue 600 | `#2563eb` | rgb(37, 99, 235) | 按钮悬停、激活状态 |
| Blue 700 | `#1d4ed8` | rgb(29, 78, 216) | 按钮按下状态 |

### 功能色 (Functional Colors)
用于状态反馈、警告、成功提示

#### 成功色 (Success Green)
```css
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-500: #10b981;  /* 主要成功色 */
--success-600: #059669;
```

#### 警告色 (Warning Orange)
```css
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-500: #f59e0b;  /* 主要警告色 */
--warning-600: #d97706;
```

#### 错误色 (Error Red)
```css
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-500: #ef4444;    /* 主要错误色 */
--error-600: #dc2626;
```

#### 信息色 (Info Blue)
```css
--info-50: #f0f9ff;
--info-100: #e0f2fe;
--info-500: #06b6d4;     /* 主要信息色 */
--info-600: #0891b2;
```

## 🌈 中性色

用于文本、背景、边框等通用元素

| 名称 | HEX | RGB | 使用场景 |
|------|-----|-----|----------|
| Gray 50 | `#f9fafb` | rgb(249, 250, 251) | 页面背景 |
| Gray 100 | `#f3f4f6` | rgb(243, 244, 246) | 卡片背景、输入框背景 |
| Gray 200 | `#e5e7eb` | rgb(229, 231, 235) | 边框、分隔线 |
| Gray 300 | `#d1d5db` | rgb(209, 213, 219) | 禁用状态边框 |
| Gray 400 | `#9ca3af` | rgb(156, 163, 175) | 次要文本、占位符 |
| Gray 500 | `#6b7280` | rgb(107, 114, 128) | 正文文本 |
| Gray 600 | `#4b5563` | rgb(75, 85, 99) | 标题文本 |
| Gray 700 | `#374151` | rgb(55, 65, 81) | 重要标题 |
| Gray 800 | `#1f2937` | rgb(31, 41, 55) | 主要标题 |
| Gray 900 | `#111827` | rgb(17, 24, 39) | 强调标题 |

## 🎭 语义色

### 背景色
```css
/* 页面背景 */
--bg-primary: var(--gray-50);
--bg-secondary: var(--gray-100);
--bg-tertiary: var(--gray-200);

/* 卡片背景 */
--card-bg: white;
--card-bg-hover: var(--gray-50);

/* 模态框背景 */
--modal-bg: rgba(0, 0, 0, 0.5);
```

### 文本色
```css
/* 主要文本 */
--text-primary: var(--gray-900);
--text-secondary: var(--gray-600);
--text-tertiary: var(--gray-400);

/* 链接文本 */
--link-primary: var(--blue-600);
--link-hover: var(--blue-700);

/* 禁用文本 */
--text-disabled: var(--gray-400);
```

### 边框色
```css
/* 常规边框 */
--border-primary: var(--gray-200);
--border-secondary: var(--gray-300);

/* 聚焦边框 */
--border-focus: var(--blue-500);

/* 错误边框 */
--border-error: var(--error-500);
```

## 🎪 功能模块色彩

### 1. 背景移除功能
```css
--bg-removal-primary: var(--blue-500);
--bg-removal-secondary: var(--blue-100);
--bg-removal-icon: #4f46e5; /* 靛蓝色 */
```

### 2. 证件照制作功能
```css
--idphoto-primary: var(--success-500);
--idphoto-secondary: var(--success-100);
--idphoto-icon: #0d9488; /* 青色 */
```

### 3. 背景替换功能
```css
--bg-replace-primary: var(--warning-500);
--bg-replace-secondary: var(--warning-100);
--bg-replace-icon: #ea580c; /* 橙色 */
```

### 4. 老照片修复功能
```css
--restoration-primary: var(--info-500);
--restoration-secondary: var(--info-100);
--restoration-icon: #7c3aed; /* 紫色 */
```

## 🎯 对比度要求

所有文本必须满足WCAG 2.1 AA标准：

| 文本类型 | 最小对比度 |
|----------|------------|
| 普通文本 | 4.5:1 |
| 大文本(18px+) | 3:1 |
| 图标/图形 | 3:1 |

### 对比度检查示例
```css
/* 通过 - 对比度 4.5:1 */
.text-primary {
  color: var(--gray-900); /* #111827 */
  background: white;      /* #ffffff */
  /* 对比度: 17.5:1 ✓ */
}

/* 通过 - 对比度 4.5:1 */
.text-secondary {
  color: var(--gray-600); /* #4b5563 */
  background: white;      /* #ffffff */
  /* 对比度: 7.3:1 ✓ */
}
```

## 🎨 渐变方案

### 品牌渐变
```css
/* 主要渐变 */
.bg-gradient-primary {
  background: linear-gradient(135deg, var(--blue-500), var(--blue-700));
}

/* 次要渐变 */
.bg-gradient-secondary {
  background: linear-gradient(135deg, var(--success-500), var(--info-500));
}

/* 卡片渐变 */
.bg-gradient-card {
  background: linear-gradient(135deg, var(--gray-50), white);
}
```

### 功能渐变
```css
/* 成功渐变 */
.bg-gradient-success {
  background: linear-gradient(135deg, var(--success-500), var(--success-700));
}

/* 警告渐变 */
.bg-gradient-warning {
  background: linear-gradient(135deg, var(--warning-500), var(--warning-700));
}

/* 错误渐变 */
.bg-gradient-error {
  background: linear-gradient(135deg, var(--error-500), var(--error-700));
}
```

## 📱 暗色模式 (未来支持)

```css
@media (prefers-color-scheme: dark) {
  :root {
    /* 背景色 */
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    
    /* 文本色 */
    --text-primary: #f1f5f9;
    --text-secondary: #cbd5e1;
    --text-tertiary: #94a3b8;
    
    /* 边框色 */
    --border-primary: #475569;
    --border-secondary: #64748b;
  }
}
```

## 🎯 使用指南

### 1. 色彩优先级
1. **主色调** (`--blue-500`) - 主要操作、品牌标识
2. **功能色** - 状态反馈、警告提示
3. **中性色** - 文本、背景、边框

### 2. 禁止使用
- 纯黑色 (`#000000`) - 使用 `--gray-900` 替代
- 纯白色 (`#ffffff`) - 在需要时使用，但避免大面积使用
- 高饱和度色彩 - 避免视觉疲劳

### 3. 一致性检查
- 相同功能使用相同色彩
- 状态变化使用色彩渐变
- 确保足够的对比度

---

## 📊 色彩变量表 (CSS变量)

```css
:root {
  /* 品牌色 */
  --color-brand-50: #eff6ff;
  --color-brand-100: #dbeafe;
  --color-brand-500: #3b82f6;
  --color-brand-600: #2563eb;
  --color-brand-700: #1d4ed8;
  
  /* 功能色 */
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #06b6d4;
  
  /* 中性色 */
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-200: #e5e7eb;
  --color-gray-300: #d1d5db;
  --color-gray-400: #9ca3af;
  --color-gray-500: #6b7280;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  
  /* 语义色 */
  --bg-primary: var(--color-gray-50);
  --text-primary: var(--color-gray-900);
  --border-primary: var(--color-gray-200);
}
```

---

*设计系统版本：v1.0*
*最后更新：2026-03-19*