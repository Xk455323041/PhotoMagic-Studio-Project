// 通用响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// 文件元数据
export interface FileMetadata {
  fileId: string;
  filename: string;
  size: number;
  mimeType: string;
  dimensions: {
    width: number;
    height: number;
  };
  url: string;
  expiresAt: string;
}

// 处理结果元数据
export interface ProcessingMetadata {
  processingTime: number;
  originalSize?: number;
  resultSize?: number;
  format?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

// 背景移除参数
export interface BackgroundRemovalParams {
  size?: 'auto' | 'preview' | 'full' | 'hd';
  format?: 'png' | 'jpg' | 'webp';
  bg_color?: 'transparent' | string;
  edge_smoothness?: 'low' | 'medium' | 'high' | 'auto';
  hair_detail?: boolean;
  shadow?: boolean;
}

// 证件照参数
export interface IDPhotoParams {
  photo_type?: 'id_card' | 'passport' | 'visa' | 'driver_license' | 'custom';
  /**
   * 业务语义优先级高于尺寸规则。
   * 前端/调用方应优先传 business_type，size 作为辅助尺寸信息。
   */
  business_type?: 'resume' | 'exam_registration' | 'id_card' | 'passport' | 'visa' | 'driver_license' | 'generic';
  background?: {
    type: 'solid' | 'gradient' | 'custom_image';
    color?: string;
    gradient?: {
      start: string;
      end: string;
      angle: number;
    };
    custom_image?: string;
  };
  size?: {
    /**
     * 尺寸为辅助信息。
     * 当 business_type 已提供时，后端优先按 business_type 命中规则，再使用 size 决定细节与兜底。
     */
    type: '大一寸' | '小一寸' | '大两寸' | '小两寸' | '标准一寸' | '标准两寸' | 'custom';
    width_mm?: number;
    height_mm?: number;
    dpi?: 150 | 300 | 600;
  };
  portrait?: {
    position: 'center' | { x: number; y: number };
    zoom: number;
    composition?: {
      preset?: 'id_card_standard' | 'passport_standard' | 'tight_headshot' | 'loose_headshot';
      top_margin_ratio?: number;
      bottom_margin_ratio?: number;
      side_margin_ratio?: number;
      zoom?: number;
    };
    beauty?: {
      enabled: boolean;
      skin_smooth: number;
      eye_brighten: number;
      teeth_whiten: number;
    };
  };
  output?: {
    format: 'jpg' | 'png';
    quality: number;
    layout: 'single' | '4x6' | '8x10';
  };
}

// 背景替换参数
export interface BackgroundReplacementParams {
  composition?: {
    position: { x: number; y: number };
    scale: number;
    rotation: number;
    blend_mode: 'normal' | 'multiply' | 'screen' | 'overlay';
    edge_feathering: number;
    shadow?: {
      enabled: boolean;
      opacity: number;
      blur: number;
      offset: { x: number; y: number };
    };
  };
  lighting?: {
    match_lighting: boolean;
    light_direction: number;
    intensity: number;
    temperature: number;
  };
  color?: {
    match_color: boolean;
    saturation: number;
    contrast: number;
    brightness: number;
  };
  output?: {
    format: 'jpg' | 'png' | 'webp';
    quality: number;
    resolution: number;
  };
}

// 老照片修复参数
export interface OldPhotoRestorationParams {
  restoration_type?: 'basic' | 'colorization' | 'super_resolution' | 'full';
  basic_repair?: {
    scratch_removal: boolean;
    stain_removal: boolean;
    crease_removal: boolean;
    missing_parts: boolean;
    repair_strength: number;
  };
  colorization?: {
    enabled: boolean;
    color_model: 'realistic' | 'vintage' | 'modern';
    skin_tone: 'natural' | 'warm' | 'cool';
    environment_color: boolean;
    color_intensity: number;
  };
  super_resolution?: {
    enabled: boolean;
    scale: 2 | 4 | 8;
    detail_enhancement: number;
    noise_reduction: number;
    sharpness: number;
  };
  face_enhancement?: {
    enabled: boolean;
    face_restoration: boolean;
    expression_enhancement: boolean;
    age_progression: boolean;
    enhancement_strength: number;
  };
  animation?: {
    enabled: boolean;
    animation_type: 'face_only' | 'full_scene';
    face_expressions: string[];
    background_motion: boolean;
    animation_duration: number;
    loop: boolean;
  };
  output?: {
    format: 'jpg' | 'png' | 'gif' | 'mp4';
    quality: number;
    include_original: boolean;
    create_comparison: boolean;
  };
}

// 处理结果类型
export interface ProcessingResult {
  resultId: string;
  url: string;
  expiresAt: string;
  metadata: ProcessingMetadata;
  layoutUrl?: string;
  animationUrl?: string;
  comparisonUrl?: string;
}

// 错误代码枚举
export enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  RATE_LIMITED = 'RATE_LIMITED',
  PROCESSING_TIMEOUT = 'PROCESSING_TIMEOUT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  PROCESSING_FAILED = 'PROCESSING_FAILED'
}
