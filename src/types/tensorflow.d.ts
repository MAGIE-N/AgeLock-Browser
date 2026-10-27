/// <reference types="react" />

import * as React from 'react';

declare module '@tensorflow/tfjs' {
  export interface Tensor {
    data(): Promise<Float32Array>;
    print(): void;
  }

  export function tensor(values: number | number[] | number[][]): Tensor;
  export function tensor1d(values: number[]): Tensor;
  export function tensor2d(values: number[][], shape?: [number, number]): Tensor;
  export function tensor3d(values: number[][][], shape?: [number, number, number]): Tensor;
  export function tensor4d(values: number[][][][], shape?: [number, number, number, number]): Tensor;

  export function dispose(t: Tensor): void;
  export function tidy<T>(fn: () => T): T;
  
  export const version: string;
  export const browser: any;
  export const io: any;
  export const layers: any;
  export const train: any;
  export const util: any;
  export const scalar: any;
}

declare module '@tensorflow-models/toxicity' {
  export interface ToxicityModel {
    classify(texts: string[]): Promise<ToxicityPrediction[]>;
  }
  
  export interface ToxicityClassifier {
    classify(text: string[]): Promise<ToxicityPrediction[]>;
  }

  export interface ToxicityPrediction {
    label: string;
    results: {
      match: boolean;
      probabilities: number[];
    }[];
  }

  export interface Prediction {
    score: number;
    match: boolean;
    label: string;
  }

  export function load(threshold: number, labels?: string[]): Promise<ToxicityModel>;
}

declare module 'nsfwjs' {
  export interface NSFWPrediction {
    className: string;
    probability: number;
  }

  export interface NSFWClassifier {
    classify(image: HTMLImageElement | ImageData | HTMLCanvasElement | HTMLVideoElement | Uint8Array): Promise<NSFWPrediction[]>;
  }

  export function load(modelPath?: string): Promise<NSFWClassifier>;
}
