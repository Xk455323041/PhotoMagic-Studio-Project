export type IDPhotoBusinessType =
  | 'resume'
  | 'exam_registration'
  | 'id_card'
  | 'passport'
  | 'visa'
  | 'driver_license'
  | 'generic';

export type IDPhotoType =
  | 'id_card'
  | 'passport'
  | 'visa'
  | 'driver_license'
  | 'custom';

export type IDPhotoSizeType =
  | '大一寸'
  | '小一寸'
  | '大两寸'
  | '小两寸'
  | '标准一寸'
  | '标准两寸'
  | 'custom';

export interface IDPhotoTaskRequestPayload {
  file_id: string;
  parameters: {
    business_type?: IDPhotoBusinessType;
    photo_type?: IDPhotoType;
    background?: {
      type: 'solid' | 'gradient' | 'custom_image';
      color?: string;
    };
    size?: {
      type: IDPhotoSizeType;
      width_mm?: number;
      height_mm?: number;
      dpi?: 150 | 300 | 600;
    };
    portrait?: {
      zoom?: number;
      beauty?: {
        enabled: boolean;
        skin_smooth: number;
        eye_brighten: number;
        teeth_whiten: number;
      };
    };
    output?: {
      format: 'jpg' | 'png';
      layout: 'single' | '4x6' | '8x10';
      quality: number;
    };
  };
}

export const defaultIDPhotoParameters: IDPhotoTaskRequestPayload['parameters'] = {
  background: {
    type: 'solid',
    color: '#FFFFFF',
  },
  portrait: {
    zoom: 1,
    beauty: {
      enabled: false,
      skin_smooth: 0,
      eye_brighten: 0,
      teeth_whiten: 0,
    },
  },
  output: {
    format: 'png',
    layout: 'single',
    quality: 90,
  },
};

export const passportExamplePayload: IDPhotoTaskRequestPayload = {
  file_id: 'file_xxx',
  parameters: {
    ...defaultIDPhotoParameters,
    business_type: 'passport',
    photo_type: 'passport',
    size: {
      type: 'custom',
      width_mm: 33,
      height_mm: 48,
      dpi: 300,
    },
  },
};

export const visaExamplePayload: IDPhotoTaskRequestPayload = {
  file_id: 'file_xxx',
  parameters: {
    ...defaultIDPhotoParameters,
    business_type: 'visa',
    photo_type: 'visa',
    size: {
      type: 'custom',
      width_mm: 33,
      height_mm: 48,
      dpi: 300,
    },
  },
};

export const resumeExamplePayload: IDPhotoTaskRequestPayload = {
  file_id: 'file_xxx',
  parameters: {
    ...defaultIDPhotoParameters,
    business_type: 'resume',
    photo_type: 'id_card',
    size: {
      type: '标准一寸',
      width_mm: 25,
      height_mm: 35,
      dpi: 300,
    },
  },
};

export const examRegistrationExamplePayload: IDPhotoTaskRequestPayload = {
  file_id: 'file_xxx',
  parameters: {
    ...defaultIDPhotoParameters,
    business_type: 'exam_registration',
    photo_type: 'custom',
    size: {
      type: '大一寸',
      width_mm: 33,
      height_mm: 48,
      dpi: 300,
    },
  },
};

export const idCardExamplePayload: IDPhotoTaskRequestPayload = {
  file_id: 'file_xxx',
  parameters: {
    ...defaultIDPhotoParameters,
    business_type: 'id_card',
    photo_type: 'id_card',
    size: {
      type: '大一寸',
      width_mm: 33,
      height_mm: 48,
      dpi: 300,
    },
  },
};
