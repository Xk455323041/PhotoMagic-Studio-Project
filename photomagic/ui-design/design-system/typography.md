# 字体系统 - PhotoMagic Studio

## 📝 字体选择

### 英文字体
- **主要字体**: `Inter` (现代、清晰、可读性好)
- **备用字体**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### 中文字体
- **主要字体**: `PingFang SC` (苹果系统)
- **备用字体**: `Hiragino Sans GB` (苹果备用), `Microsoft YaHei` (Windows), `sans-serif`

## 🎯 字体大小层级

### 桌面端字体大小
| 层级 | 字体大小 | 行高 | 字重 | 使用场景 |
|------|----------|------|------|----------|
| **H1** | `3rem` (48px) | `1.2` | `700` | 页面主标题 |
| **H2** | `2.25rem` (36px) | `1.3` | `600` | 区块标题 |
| **H3** | `1.875rem` (30px) | `1.4` | `600` | 功能标题 |
| **H4** | `1.5rem` (24px) | `1.5` | `600` | 卡片标题 |
| **H5** | `1.25rem` (20px) | `1.6` | `600` | 次级标题 |
| **H6** | `1.125rem` (18px) | `1.6` | `600` | 小标题 |
| **正文大** | `1.125rem` (18px) | `1.7` | `400` | 重要正文 |
| **正文** | `1rem` (16px) | `1.75` | `400` | 常规正文 |
| **正文小** | `0.875rem` (14px) | `1.8` | `400` | 辅助文本 |
| **标签** | `0.75rem` (12px) | `1.6` | `500` | 标签、徽章 |

### 移动端字体大小
| 层级 | 字体大小 | 行高 | 字重 | 使用场景 |
|------|----------|------|------|----------|
| **H1** | `2rem` (32px) | `1.2` | `700` | 页面主标题 |
| **H2** | `1.75rem` (28px) | `1.3` | `600` | 区块标题 |
| **H3** | `1.5rem` (24px) | `1.4` | `600` | 功能标题 |
| **H4** | `1.25rem` (20px) | `1.5` | `600` | 卡片标题 |
| **H5** | `1.125rem` (18px) | `1.6` | `600` | 次级标题 |
| **H6** | `1rem` (16px) | `1.6` | `600` | 小标题 |
| **正文大** | `1rem` (16px) | `1.7` | `400` | 重要正文 |
| **正文** | `0.9375rem` (15px) | `1.75` | `400` | 常规正文 |
| **正文小** | `0.8125rem` (13px) | `1.8` | `400` | 辅助文本 |
| **标签** | `0.6875rem` (11px) | `1.6` | `500` | 标签、徽章 |

## 🎨 字重系统

### 标准字重
```css
--font-weight-thin: 100;
--font-weight-extralight: 200;
--font-weight-light: 300;
--font-weight-normal: 400;   /* 常规正文 */
--font-weight-medium: 500;   /* 标签、按钮 */
--font-weight-semibold: 600; /* 标题 */
--font-weight-bold: 700;     /* 重要标题 */
--font-weight-extrabold: 800;
--font-weight-black: 900;
```

### 使用规范
| 元素类型 | 字重 | 示例 |
|----------|------|------|
| 页面主标题 | `700` | `font-weight: 700` |
| 区块标题 | `600` | `font-weight: 600` |
| 卡片标题 | `600` | `font-weight: 600` |
| 正文 | `400` | `font-weight: 400` |
| 按钮文字 | `500` | `font-weight: 500` |
| 标签文字 | `500` | `font-weight: 500` |
| 链接文字 | `500` | `font-weight: 500` |

## 📐 行高系统

### 行高比例
```css
--leading-none: 1;        /* 紧密 */
--leading-tight: 1.25;    /* 紧凑 */
--leading-snug: 1.375;    /* 适中紧凑 */
--leading-normal: 1.5;    /* 标准 */
--leading-relaxed: 1.625; /* 宽松 */
--leading-loose: 2;       /* 非常宽松 */
```

### 应用规范
| 文本类型 | 行高 | 说明 |
|----------|------|------|
| 标题 | `1.2-1.4` | 紧凑，增强标题感 |
| 正文 | `1.5-1.75` | 标准，保证可读性 |
| 长段落 | `1.75-2` | 宽松，减少阅读疲劳 |
| 代码 | `1.25-1.5` | 紧凑，便于代码阅读 |

## 🔤 字母间距

### 字母间距规范
```css
--tracking-tighter: -0.05em;
--tracking-tight: -0.025em;
--tracking-normal: 0;
--tracking-wide: 0.025em;
--tracking-wider: 0.05em;
--tracking-widest: 0.1em;
```

### 使用场景
| 场景 | 字母间距 | 效果 |
|------|----------|------|
| 大写标题 | `0.05em` | 增加可读性 |
| 小写正文 | `normal` | 保持自然 |
| 按钮文字 | `0.025em` | 轻微加宽 |
| 标签文字 | `normal` | 保持紧凑 |

## 🎭 字体样式

### 常规样式
```css
--font-style-normal: normal;
--font-style-italic: italic;
```

### 装饰线
```css
--text-decoration-none: none;
--text-decoration-underline: underline;
--text-decoration-line-through: line-through;
```

### 文本变换
```css
--text-transform-none: none;
--text-transform-uppercase: uppercase;
--text-transform-lowercase: lowercase;
--text-transform-capitalize: capitalize;
```

## 📱 响应式字体

### 断点设置
```css
/* 移动端优先 */
:root {
  /* 基础字体大小 */
  font-size: 16px;
}

/* 平板端 */
@media (min-width: 768px) {
  :root {
    font-size: 17px;
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  :root {
    font-size: 18px;
  }
}

/* 大桌面端 */
@media (min-width: 1280px) {
  :root {
    font-size: 19px;
  }
}
```

### 流体字体
```css
/* 流体标题 */
.fluid-heading {
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: clamp(1.2, 1.5vw, 1.3);
}

/* 流体正文 */
.fluid-body {
  font-size: clamp(1rem, 2vw, 1.125rem);
  line-height: clamp(1.5, 2vw, 1.75);
}
```

## 🎪 文本对齐

### 对齐方式
```css
--text-align-left: left;
--text-align-center: center;
--text-align-right: right;
--text-align-justify: justify;
```

### 垂直对齐
```css
--vertical-align-baseline: baseline;
--vertical-align-top: top;
--vertical-align-middle: middle;
--vertical-align-bottom: bottom;
```

## 📊 文本溢出处理

### 单行溢出
```css
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

### 多行溢出
```css
.line-clamp-2 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
```

## 🎯 可访问性要求

### 最小字体大小
- **正文**: 不小于 16px (移动端)
- **标题**: 不小于 18px (移动端)
- **标签**: 不小于 12px

### 对比度要求
- **正常文本**: 对比度 ≥ 4.5:1
- **大文本(18px+)**: 对比度 ≥ 3:1
- **非文本元素**: 对比度 ≥ 3:1

### 缩放支持
- 支持浏览器字体缩放至 200%
- 布局不破坏，内容可读

## 🎨 主题字体变量

### CSS变量定义
```css
:root {
  /* 字体家族 */
  --font-family-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-family-cn: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  
  /* 字体大小 */
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  --font-size-4xl: 2.25rem;   /* 36px */
  --font-size-5xl: 3rem;      /* 48px */
  
  /* 字重 */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  /* 行高 */
  --line-height-none: 1;
  --line-height-tight: 1.25;
  --line-height-snug: 1.375;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.625;
  --line-height-loose: 2;
  
  /* 字母间距 */
  --letter-spacing-tighter: -0.05em;
  --letter-spacing-tight: -0.025em;
  --letter-spacing-normal: 0;
  --letter-spacing-wide: 0.025em;
  --letter-spacing-wider: 0.05em;
  --letter-spacing-widest: 0.1em;
}
```

### 应用示例
```css
/* 标题样式 */
.heading-1 {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-5xl);
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  letter-spacing: var(--letter-spacing-tight);
}

/* 正文样式 */
.body-text {
  font-family: var(--font-family-cn);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-normal);
  color: var(--color-gray-700);
}

/* 按钮文字 */
.button-text {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: var(--letter-spacing-wide);
  text-transform: uppercase;
}
```

## 📋 字体使用指南

### 1. 一致性原则
- 相同层级的文本使用相同的字体样式
- 整个网站保持统一的字体系统
- 避免随意改变字体大小和字重

### 2. 可读性原则
- 正文行高不低于 1.5
- 标题行高保持紧凑 (1.2-1.4)
- 避免过小的字体大小
- 确保足够的对比度

### 3. 响应式原则
- 使用相对单位 (rem, em)
- 实现流体字体大小
- 在不同设备上保持可读性
- 支持字体缩放

### 4. 性能原则
- 合理使用字体子集
- 预加载关键字体
- 使用字体显示策略
- 优化字体文件大小

## 🎭 字体加载策略

### 字体预加载
```html
<!-- 预加载关键字体 -->
<link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/inter-semibold.woff2" as="font" type="font/woff2" crossorigin>
```

### 字体显示策略
```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap; /* 交换策略 */
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-semibold.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
```

### 回退字体栈
```css
.font-sans {
  font-family: var(--font-family-sans);
}

.font-cn {
  font-family: var(--font-family-cn);
}

/* 回退示例 */
body {
  font-family: var(--font-family-cn), var(--font-family-sans), sans-serif;
}
```

---

*字体系统版本：v1.0*
*最后更新：2026-03-19*