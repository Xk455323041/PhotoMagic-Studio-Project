import sharp from 'sharp';
import logger from '../config/logger';

/**
 * 图片处理工具类
 */
export class ImageUtils {
  /**
   * 获取图片尺寸
   */
  static async getDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    const metadata = await sharp(buffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('无法获取图片尺寸');
    }
    return { width: metadata.width, height: metadata.height };
  }

  /**
   * 调整图片尺寸
   */
  static async resize(
    buffer: Buffer,
    width: number,
    height?: number,
    options: sharp.ResizeOptions = {}
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, options)
      .toBuffer();
  }

  /**
   * 转换图片格式
   */
  static async convertFormat(
    buffer: Buffer,
    format: 'jpg' | 'png' | 'webp',
    quality: number = 90
  ): Promise<Buffer> {
    let image = sharp(buffer);
    
    switch (format) {
      case 'jpg':
        return image.jpeg({ quality }).toBuffer();
      case 'png':
        return image.png({ quality }).toBuffer();
      case 'webp':
        return image.webp({ quality }).toBuffer();
      default:
        throw new Error(`不支持的格式: ${format}`);
    }
  }

  /**
   * 压缩图片
   */
  static async compress(
    buffer: Buffer,
    maxSizeKB: number = 1024,
    quality: number = 90
  ): Promise<Buffer> {
    let currentQuality = quality;
    let compressedBuffer = buffer;

    while (currentQuality > 10) {
      const compressed = await sharp(buffer)
        .jpeg({ quality: currentQuality } as any)
        .toBuffer();
      
      if (compressed.length / 1024 <= maxSizeKB) {
        compressedBuffer = compressed;
        break;
      }
      
      currentQuality -= 10;
    }

    return compressedBuffer;
  }

  /**
   * 创建对比图
   */
  static async createComparison(
    originalBuffer: Buffer,
    processedBuffer: Buffer,
    mode: 'side-by-side' | 'slider' = 'side-by-side'
  ): Promise<Buffer> {
    const originalMeta = await sharp(originalBuffer).metadata();
    const processedMeta = await sharp(processedBuffer).metadata();
    
    if (!originalMeta.width || !originalMeta.height || !processedMeta.width || !processedMeta.height) {
      throw new Error('无法获取图片尺寸');
    }

    if (mode === 'side-by-side') {
      const maxHeight = Math.max(originalMeta.height, processedMeta.height);
      
      // 调整两张图片到相同高度
      const resizedOriginal = await sharp(originalBuffer)
        .resize(null, maxHeight, { fit: 'contain' })
        .toBuffer();
      
      const resizedProcessed = await sharp(processedBuffer)
        .resize(null, maxHeight, { fit: 'contain' })
        .toBuffer();
      
      const resizedOriginalMeta = await sharp(resizedOriginal).metadata();
      const resizedProcessedMeta = await sharp(resizedProcessed).metadata();
      
      if (!resizedOriginalMeta.width || !resizedProcessedMeta.width) {
        throw new Error('无法获取调整后的图片尺寸');
      }

      // 创建对比画布
      const canvasWidth = resizedOriginalMeta.width + resizedProcessedMeta.width + 20; // 20px间距
      const canvasHeight = maxHeight;

      return sharp({
        create: {
          width: canvasWidth,
          height: canvasHeight,
          channels: 3,
          background: '#f0f0f0'
        }
      })
      .composite([
        { input: resizedOriginal, left: 0, top: 0 },
        { input: resizedProcessed, left: resizedOriginalMeta.width + 20, top: 0 }
      ])
      .jpeg({ quality: 90 } as any)
      .toBuffer();
    }

    // TODO: 实现滑块对比图
    return processedBuffer;
  }

  /**
   * 添加水印
   */
  static async addWatermark(
    imageBuffer: Buffer,
    watermarkText: string,
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right',
    opacity: number = 0.5
  ): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('无法获取图片尺寸');
    }

    // 创建水印SVG
    const svg = `
      <svg width="${metadata.width}" height="${metadata.height}">
        <text 
          x="${position.includes('right') ? metadata.width - 20 : 20}" 
          y="${position.includes('bottom') ? metadata.height - 20 : 40}" 
          font-size="24" 
          font-family="Arial, sans-serif" 
          fill="white" 
          opacity="${opacity}"
          text-anchor="${position.includes('right') ? 'end' : 'start'}"
        >
          ${watermarkText}
        </text>
      </svg>
    `;

    return sharp(imageBuffer)
      .composite([
        {
          input: Buffer.from(svg),
          top: 0,
          left: 0,
        }
      ])
      .toBuffer();
  }

  /**
   * 自动调整亮度和对比度
   */
  static async autoAdjust(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .normalize() // 自动调整对比度
      .modulate({ brightness: 1.1 }) // 轻微提升亮度
      .toBuffer();
  }

  /**
   * 检查图片是否为黑白照片
   */
  static async isBlackAndWhite(buffer: Buffer): Promise<boolean> {
    const { data, info } = await sharp(buffer)
      .raw()
      .toBuffer({ resolveWithObject: true });

    if (info.channels < 3) {
      return true; // 灰度图
    }

    // 采样多个点检查色彩差异
    const sampleStep = Math.max(1, Math.floor(info.width * info.height / 1000)); // 采样1000个点
    let totalDiff = 0;
    let sampleCount = 0;

    for (let i = 0; i < data.length; i += 3 * sampleStep) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // 计算RGB差异
      const diff = Math.abs(r - g) + Math.abs(g - b) + Math.abs(b - r);
      totalDiff += diff;
      sampleCount++;
    }

    const avgDiff = totalDiff / sampleCount;
    return avgDiff < 20; // 差异小于20认为是黑白照片
  }
}
