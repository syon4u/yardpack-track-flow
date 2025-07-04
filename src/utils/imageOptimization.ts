import React, { useCallback } from 'react';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

export class ImageOptimizer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<{ file: File; url: string; size: number }> {
    const {
      maxWidth = 1920,
      maxHeight = 1080,
      quality = 0.8,
      format = 'webp'
    } = options;

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        try {
          const { width, height } = this.calculateDimensions(
            img.width,
            img.height,
            maxWidth,
            maxHeight
          );

          this.canvas.width = width;
          this.canvas.height = height;
          this.ctx.drawImage(img, 0, 0, width, height);
          
          this.canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to optimize image'));
                return;
              }

              const optimizedFile = new File(
                [blob],
                this.generateFileName(file.name, format),
                { type: `image/${format}` }
              );

              const url = URL.createObjectURL(blob);
              resolve({ file: optimizedFile, url, size: blob.size });
            },
            `image/${format}`,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    let width = originalWidth;
    let height = originalHeight;

    if (width > maxWidth) {
      width = maxWidth;
      height = width / aspectRatio;
    }

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return { width: Math.round(width), height: Math.round(height) };
  }

  private generateFileName(originalName: string, format: string): string {
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    return `${nameWithoutExt}_optimized.${format}`;
  }
}

export const imageOptimizer = new ImageOptimizer();

export function useImageOptimizer() {
  const optimize = useCallback(
    (file: File, options?: ImageOptimizationOptions) => 
      imageOptimizer.optimizeImage(file, options),
    []
  );

  return { optimize };
}