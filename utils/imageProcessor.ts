import { ProcessedImageResult, GenerationMode, ProcessOptions } from '../types';

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
};

const getLuminance = (r: number, g: number, b: number) => {
  return 0.299 * r + 0.587 * g + 0.114 * b;
};

// Helper to draw image with "object-fit: cover" behavior
const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, width: number, height: number) => {
  const scale = Math.max(width / img.width, height / img.height);
  const x = (width / 2) - (img.width / 2) * scale;
  const y = (height / 2) - (img.height / 2) * scale;
  ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
};

export const generateMagicImage = async (
  lightSrc: string,
  darkSrc: string,
  options: ProcessOptions
): Promise<ProcessedImageResult> => {
  const { width, height, mode, normalize, preserveColor } = options;
  const [lightImg, darkImg] = await Promise.all([loadImage(lightSrc), loadImage(darkSrc)]);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) throw new Error('Could not get canvas context');

  // 1. Get Light Image Data (on White)
  const lightCanvas = document.createElement('canvas');
  lightCanvas.width = width;
  lightCanvas.height = height;
  const ctxL = lightCanvas.getContext('2d');
  if (!ctxL) throw new Error('Context error');
  // Fill white first to simulate light mode background
  ctxL.fillStyle = '#FFFFFF';
  ctxL.fillRect(0, 0, width, height);
  // Use cover to prevent stretching
  drawImageCover(ctxL, lightImg, width, height);
  const lightData = ctxL.getImageData(0, 0, width, height).data;

  // 2. Get Dark Image Data (on Black)
  const darkCanvas = document.createElement('canvas');
  darkCanvas.width = width;
  darkCanvas.height = height;
  const ctxD = darkCanvas.getContext('2d');
  if (!ctxD) throw new Error('Context error');
  // Fill black first to simulate dark mode background
  ctxD.fillStyle = '#000000';
  ctxD.fillRect(0, 0, width, height);
  // Use cover to prevent stretching
  drawImageCover(ctxD, darkImg, width, height);
  const darkData = ctxD.getImageData(0, 0, width, height).data;

  // 3. Prepare Output
  const outputImgData = ctx.createImageData(width, height);
  const out = outputImgData.data;

  for (let i = 0; i < lightData.length; i += 4) {
    const x = (i / 4) % width;
    const y = Math.floor((i / 4) / width);

    // Source values
    let rL = lightData[i];
    let gL = lightData[i+1];
    let bL = lightData[i+2];

    let rD = darkData[i];
    let gD = darkData[i+1];
    let bD = darkData[i+2];

    // --- MODE: BLENDED (Color capable, requires Light >= Dark) ---
    if (mode === GenerationMode.BLENDED) {
      
      // Auto-Leveling (Constraint Enforcement)
      if (normalize) {
        rL = Math.max(rL, rD);
        gL = Math.max(gL, gD);
        bL = Math.max(bL, bD);
      }

      // Calculate Alpha
      const lumL = getLuminance(rL, gL, bL);
      const lumD = getLuminance(rD, gD, bD);
      
      let alpha = 1 - (lumL - lumD) / 255;
      
      // TWITTER FIX: Clamp Alpha strictly between 1 and 254.
      // 0 or 255 allows Twitter to compress to JPEG.
      // Partial transparency forces PNG-32.
      alpha = Math.max(0.005, Math.min(0.995, alpha)); 

      // Calculate Pixel Color
      const rOut = Math.min(255, rD / alpha);
      const gOut = Math.min(255, gD / alpha);
      const bOut = Math.min(255, bD / alpha);

      out[i] = rOut;
      out[i+1] = gOut;
      out[i+2] = bOut;
      out[i+3] = Math.floor(alpha * 255);
    } 
    
    // --- MODE: INTERLACED / SCANLINES ---
    else {
      // Determine if this pixel belongs to Light or Dark mask
      let isLightSlot = false;

      if (mode === GenerationMode.INTERLACED) {
        // Checkerboard: Prone to resize glitches
        isLightSlot = (x + y) % 2 === 0;
      } else {
        // Scanlines (Rows): Robust against horizontal resize (Mobile/Twitter App)
        isLightSlot = y % 2 === 0;
      }

      // CRITICAL TWITTER FIX:
      // We purposefully introduce a tiny epsilon to the alpha channel (1-254 range).
      // This forces the Twitter CDN to respect the Alpha channel and serve a PNG.

      if (isLightSlot) {
        // LIGHT SLOT (Intended for White Background)
        // Hidden on Black
        
        if (preserveColor) {
            // COLOR PRESERVATION MODE
            // We want perfect color on White background.
            // On Black background, it will appear as a "ghost".
            // Equation on White: C_out * A + 255 * (1 - A) = C_target
            // Solving for A min: A >= 1 - C_target / 255
            
            // 1. Calculate minimum alpha needed to support this color
            const minColorVal = Math.min(rL, gL, bL);
            let alpha = 1 - (minColorVal / 255);
            
            // 2. Clamp Alpha to avoid division by zero and satisfy PNG requirements
            // A minimum of ~0.4% opacity ensures math stability
            alpha = Math.max(0.005, alpha);
            
            // 3. Calculate Output Color
            // C_out = (C_target - 255 * (1 - A)) / A
            const factor = 255 * (1 - alpha);
            const rOut = (rL - factor) / alpha;
            const gOut = (gL - factor) / alpha;
            const bOut = (bL - factor) / alpha;

            out[i] = Math.max(0, Math.min(255, rOut));
            out[i+1] = Math.max(0, Math.min(255, gOut));
            out[i+2] = Math.max(0, Math.min(255, bOut));
            
            // 4. Twitter Fix for Alpha (1-254)
            const aByte = Math.floor(alpha * 255);
            out[i+3] = Math.max(1, Math.min(254, aByte));
        } else {
            // GRAYSCALE (PERFECT HIDING) MODE
            // Needs to be Black (0,0,0) with Alpha = (1 - LightLuminance)
            const lum = getLuminance(rL, gL, bL);
            const finalAlpha = 255 - lum;
            
            out[i] = 0;
            out[i+1] = 0;
            out[i+2] = 0;
            // Clamp to prevent JPEG conversion
            out[i+3] = Math.max(1, Math.min(254, finalAlpha)); 
        }

      } else {
        // DARK SLOT (Intended for Black Background)
        // Hidden on White
        
        if (preserveColor) {
            // COLOR PRESERVATION MODE
            // We want perfect color on Black background.
            // On White background, it will appear as a "ghost".
            // Equation on Black: C_out * A = C_target
            // Solving for A min: A >= C_target / 255
            
            // 1. Calculate minimum alpha needed to support this color
            const maxColorVal = Math.max(rD, gD, bD);
            let alpha = maxColorVal / 255;
            
            // 2. Clamp Alpha
            alpha = Math.max(0.005, alpha);

            // 3. Calculate Output Color
            // C_out = C_target / A
            const rOut = rD / alpha;
            const gOut = gD / alpha;
            const bOut = bD / alpha;

            out[i] = Math.max(0, Math.min(255, rOut));
            out[i+1] = Math.max(0, Math.min(255, gOut));
            out[i+2] = Math.max(0, Math.min(255, bOut));

            // 4. Twitter Fix for Alpha
            const aByte = Math.floor(alpha * 255);
            out[i+3] = Math.max(1, Math.min(254, aByte));
        } else {
             // GRAYSCALE (PERFECT HIDING) MODE
             // Needs to be White (255,255,255) with Alpha = DarkLuminance
             const lum = getLuminance(rD, gD, bD);
             const finalAlpha = lum;
    
             out[i] = 255;
             out[i+1] = 255;
             out[i+2] = 255;
             // Clamp to prevent JPEG conversion
             out[i+3] = Math.max(1, Math.min(254, finalAlpha));
        }
      }
    }
  }

  ctx.putImageData(outputImgData, 0, 0);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width,
    height
  };
};