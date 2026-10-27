declare module '@tensorflow-models/toxicity' {
    export interface ToxicityPrediction {
        label: string;
        results: Array<{
            probabilities: Float32Array;
            match: boolean;
        }>;
    }

    export function load(
        threshold?: number,
        toxicityLabels?: string[]
    ): Promise<{
        classify(inputs: string | string[]): Promise<ToxicityPrediction[]>;
    }>;
}
