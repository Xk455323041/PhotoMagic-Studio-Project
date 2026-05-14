import { IDPhotoParams } from '../types';

export type FallbackPreset = 'id_card_standard' | 'passport_standard' | 'tight_headshot' | 'loose_headshot';
export type VeImagexSizeBucket = '1inch' | '2inch' | 'passport';

export interface SizeMappingDecision {
  bucket: VeImagexSizeBucket;
  preset: FallbackPreset;
  reason: string;
}

export interface SizeRule {
  match: (params: IDPhotoParams, normalizedSize: { width: number; height: number } | null) => boolean;
  bucket: VeImagexSizeBucket;
  preset: FallbackPreset;
  reason: string;
}

export const ID_PHOTO_BUSINESS_RULES: SizeRule[] = [
  { match: (params) => params.business_type === 'passport', bucket: 'passport', preset: 'passport_standard', reason: 'business_type=passport' },
  { match: (params) => params.business_type === 'visa', bucket: 'passport', preset: 'passport_standard', reason: 'business_type=visa' },
  { match: (params) => params.business_type === 'driver_license', bucket: '2inch', preset: 'tight_headshot', reason: 'business_type=driver_license' },
  { match: (params) => params.business_type === 'resume', bucket: 'passport', preset: 'tight_headshot', reason: 'business_type=resume' },
  { match: (params) => params.business_type === 'exam_registration', bucket: '1inch', preset: 'loose_headshot', reason: 'business_type=exam_registration' },
  { match: (params) => params.business_type === 'id_card', bucket: 'passport', preset: 'id_card_standard', reason: 'business_type=id_card' },
];

export const ID_PHOTO_SIZE_RULES: SizeRule[] = [
  { match: (params) => params.photo_type === 'passport', bucket: 'passport', preset: 'passport_standard', reason: 'photo_type=passport' },
  { match: (params) => params.photo_type === 'visa', bucket: 'passport', preset: 'passport_standard', reason: 'photo_type=visa' },
  { match: (params) => params.photo_type === 'driver_license', bucket: '2inch', preset: 'tight_headshot', reason: 'photo_type=driver_license' },
  { match: (params) => ['passport', '护照', '护照照片'].includes(params.size?.type || ''), bucket: 'passport', preset: 'passport_standard', reason: 'size.type=passport-like' },
  { match: (params) => params.size?.type === '大一寸', bucket: 'passport', preset: 'id_card_standard', reason: 'size.type=大一寸' },
  { match: (params) => ['标准两寸', '大两寸', '小两寸', '2inch'].includes(params.size?.type || ''), bucket: '2inch', preset: 'tight_headshot', reason: 'size.type=2inch-like' },
  { match: (params) => ['标准一寸', '小一寸', '1inch'].includes(params.size?.type || ''), bucket: '1inch', preset: 'loose_headshot', reason: 'size.type=1inch-like' },
  { match: (_params, normalizedSize) => !!normalizedSize && Math.abs(normalizedSize.width - 33) <= 1 && Math.abs(normalizedSize.height - 48) <= 1, bucket: 'passport', preset: 'id_card_standard', reason: 'custom_size≈33x48' },
  { match: (_params, normalizedSize) => !!normalizedSize && Math.abs(normalizedSize.width - 35) <= 1 && Math.abs(normalizedSize.height - 49) <= 1, bucket: '2inch', preset: 'tight_headshot', reason: 'custom_size≈35x49' },
  { match: (_params, normalizedSize) => !!normalizedSize && Math.abs(normalizedSize.width - 35) <= 1 && Math.abs(normalizedSize.height - 45) <= 1, bucket: '2inch', preset: 'tight_headshot', reason: 'custom_size≈35x45' },
  { match: (_params, normalizedSize) => !!normalizedSize && Math.abs(normalizedSize.width - 25) <= 1 && Math.abs(normalizedSize.height - 35) <= 1, bucket: '1inch', preset: 'loose_headshot', reason: 'custom_size≈25x35' },
  { match: (_params, normalizedSize) => !!normalizedSize && Math.abs(normalizedSize.width - 22) <= 1 && Math.abs(normalizedSize.height - 32) <= 1, bucket: '1inch', preset: 'loose_headshot', reason: 'custom_size≈22x32' },
  { match: (_params, normalizedSize) => !!normalizedSize && normalizedSize.width >= 34 && normalizedSize.height >= 45, bucket: '2inch', preset: 'tight_headshot', reason: 'custom_size_large' },
  { match: (_params, normalizedSize) => !!normalizedSize && normalizedSize.width <= 25 && normalizedSize.height <= 35, bucket: '1inch', preset: 'loose_headshot', reason: 'custom_size_small' },
  { match: (params) => params.photo_type === 'custom', bucket: 'passport', preset: 'passport_standard', reason: 'photo_type=custom default' },
];
