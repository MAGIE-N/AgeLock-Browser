declare module '@tensorflow/tfjs' {
    export type Tensor2D = any;
    export type Tensor = any;
    export function tensor2d(data: number[][]): Tensor2D;
    export function tensor(data: number[][]): Tensor;
}

declare module '@tensorflow-models/distilbert' {
    export function load(): Promise<any>;
    export interface Model {
        classify(text: string): Promise<{
            score: number;
            probability: number;
            label: string;
        }[]>;
    }
}

declare module 'nsfwjs' {
    export function load(): Promise<any>;
    export interface Model {
        classify(image: HTMLImageElement | HTMLCanvasElement): Promise<{
            probability: number;
            label: string;
        }[]>;
    }
}

declare module 'shap' {
    export class KernelExplainer {
        constructor(
            model: (x: number[]) => Promise<any>,
            data: any
        );
        shapValues(data: any): Promise<number[][]>;
    }
}
