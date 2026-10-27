declare module '@tensorflow-models/toxicity' {
  export interface ToxicityClassification {
    label: string;
    results: Array<{
      match: boolean;
      probabilities: [number, number];
    }>;
  }

  export interface ToxicityModel {
    classify: (inputs: string[]) => Promise<ToxicityClassification[]>;
  }

  export function load(threshold?: number, labels?: string[]): Promise<ToxicityModel>;
}

declare module 'nsfwjs' {
  export interface NSFWPrediction {
    className: string;
    probability: number;
  }

  export interface NSFWModel {
    classify: (image: HTMLImageElement | ImageData | HTMLCanvasElement | HTMLVideoElement) => Promise<NSFWPrediction[]>;
  }

  export function load(modelUrl?: string, options?: any): Promise<NSFWModel>;
}

declare module '@tensorflow/tfjs' {
  export interface Tensor {
    dataSync(): Float32Array;
    dispose(): void;
  }

  export function tensor(values: number[] | number[][] | number[][][], shape?: number[]): Tensor;
  export function memory(): { numTensors: number; numDataBuffers: number; numBytes: number };
  export function tidy<T>(fn: () => T): T;
  export function dispose(tensor: Tensor): void;
  export const browser: {
    fromPixels(pixels: ImageData | HTMLImageElement | HTMLCanvasElement | HTMLVideoElement): Tensor;
  };
}

declare module '@tensorflow-models/universal-sentence-encoder' {
  export interface UniversalSentenceEncoder {
    embed(sentences: string[]): Promise<Tensor>;
  }

  export function load(): Promise<UniversalSentenceEncoder>;
}
