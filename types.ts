export interface ProcessedImageResult {
  dataUrl: string;
  width: number;
  height: number;
}

export enum PreviewMode {
  LIGHT = 'LIGHT',
  DIM = 'DIM',
  DARK = 'DARK'
}

export enum GenerationMode {
  INTERLACED = 'INTERLACED', // Checkerboard
  SCANLINES = 'SCANLINES',   // Horizontal Lines
  BLENDED = 'BLENDED'        // Alpha Composite
}

export interface ProcessOptions {
  width: number;
  height: number;
  brightness: number;
  mode: GenerationMode;
  normalize: boolean; // Forces Light >= Dark constraint
}