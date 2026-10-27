import * as tf from '@tensorflow/tfjs';
import * as toxicity from '@tensorflow-models/toxicity';
import * as nsfwjs from 'nsfwjs';
import axios from 'axios';

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

// Type assertion for TensorFlow.js namespace
const tfNamespace = tf as any as {
    tensor: (data: number[][]) => any;
    tensor2d: (data: number[][]) => any;
};

// Helper functions for TensorFlow.js
const createTensor = (data: number[]): any => {
    return tfNamespace.tensor([data]);
};

const getTensorValues = async (tensor: any): Promise<number[]> => {
    return (await tensor.data()) as number[];
};

// Helper function to create mock tensor for SHAP
const createMockTensor = (data: number[]): number[][] => {
    return [[data[0]]];
};

interface Prediction {
    score: number | number[];
    probability: number | number[];
    label: string;
}

interface FilterResult {
    blocked: boolean;
    reason: string;
    explanation?: {
        prediction: Prediction;
        shapValues: number | number[];
    };
    whitelistMatch?: boolean;
}

interface AgeRangeConfig {
    textThreshold: number;
    imageThreshold: number;
    whitelist: string[];
    allowedDomains: string[];
}

const AGE_RANGE_CONFIGS: Record<string, AgeRangeConfig> = {
    '5-12': {
        textThreshold: 0.95, // More conservative for younger users
        imageThreshold: 0.98,
        whitelist: [
            'kids.nationalgeographic.com',
            'pbskids.org',
            'scholastic.com',
            'timeforkids.com',
            'nationalgeographic.org'
        ],
        allowedDomains: [
            'google.com',
            'wikipedia.org',
            'youtube.com',
            'nationalgeographic.com',
            'scholastic.com'
        ]
    },
    '13-17': {
        textThreshold: 0.92,
        imageThreshold: 0.95,
        whitelist: [
            'youtube.com',
            'twitter.com',
            'instagram.com',
            'facebook.com',
            'reddit.com'
        ],
        allowedDomains: [
            'google.com',
            'wikipedia.org',
            'youtube.com',
            'twitter.com',
            'instagram.com'
        ]
    },
    '18+': {
        textThreshold: 0.85,
        imageThreshold: 0.90,
        whitelist: [],
        allowedDomains: []
    }
};

class ContentFilterService {
    private textModel: any;
    private imageModel: any;
    private ageRange: string | null = null;
    private config: AgeRangeConfig | null = null;
    private toxicityModel: {
        classify(inputs: string | string[]): Promise<toxicity.ToxicityPrediction[]>;
    } | null = null;

    constructor() {
        this.initializeModels();
    }

    private async initializeModels() {
        try {
            // Load the NSFW model for images
            this.imageModel = await nsfwjs.load();
            
            // Load the Toxicity model for text
            const threshold = 0.85; // Default threshold
            this.toxicityModel = await toxicity.load(threshold, [
                'toxicity',
                'severe_toxicity',
                'identity_attack',
                'insult',
                'threat',
                'sexual_explicit',
                'flirtation'
            ]);
            
            console.log('Content filtering models loaded successfully');
        } catch (error) {
            console.error('Error initializing models:', error);
            throw error;
        }
    }

    public setAgeRange(ageRange: string) {
        this.ageRange = ageRange;
        this.config = AGE_RANGE_CONFIGS[ageRange] || null;
    }

    private isWhitelisted(url: string): boolean {
        if (!this.config) return false;
        return this.config.whitelist.some(whitelisted => url.includes(whitelisted));
    }

    private isAllowedDomain(url: string): boolean {
        if (!this.config) return false;
        const domain = new URL(url).hostname;
        return this.config.allowedDomains.some(allowed => domain.includes(allowed));
    }

    private async filterText(text: string): Promise<FilterResult> {
        if (!this.textModel || !this.config) {
            throw new Error('Filter service not initialized');
        }

        // Check if text is in whitelist
        if (this.config && this.config.whitelist.some(domain => 
            text.toLowerCase().includes(domain.toLowerCase())
        )) {
            return { blocked: false, reason: '', whitelistMatch: true };
        }

        try {
            if (!this.toxicityModel) {
                await this.initializeModels();
                if (!this.toxicityModel) {
                    throw new Error('Failed to load toxicity model');
                }
            }

            // Get predictions from toxicity model
            const predictions = await this.toxicityModel.classify([text]);
            
            // Find the most severe prediction
            let maxScore = 0;
            let worstPrediction: toxicity.ToxicityPrediction | null = null;
            
            for (const prediction of predictions) {
                if (prediction.results[0].match) {
                    const score = prediction.results[0].probabilities[1];
                    if (score > maxScore) {
                        maxScore = score;
                        worstPrediction = prediction;
                    }
                }
            }

            // Check against threshold
            const threshold = this.config?.textThreshold || 0.85;
            if (worstPrediction && maxScore >= threshold) {
                return {
                    blocked: true,
                    reason: `Content may not be appropriate for this age group (${worstPrediction.label})`,
                    explanation: {
                        prediction: {
                            score: maxScore,
                            probability: maxScore,
                            label: worstPrediction.label
                        },
                        shapValues: 0
                    }
                };
            }

            return { blocked: false, reason: '' };
        } catch (error) {
            console.error('Error filtering text:', error);
            return { 
                blocked: false, 
                reason: 'Error processing content',
                explanation: {
                    prediction: {
                        score: 0,
                        probability: 0,
                        label: 'error'
                    },
                    shapValues: 0
                }
            };
        }
    }

    private async filterImage(image: HTMLImageElement | HTMLCanvasElement): Promise<FilterResult> {
        if (!this.imageModel || !this.config) {
            throw new Error('Filter service not initialized');
        }

        try {
            const predictions = await this.imageModel.classify(image);
            const prediction = predictions[0];
            const score = Array.isArray(prediction.probability) ? prediction.probability[0] : prediction.probability;
            const predictionShapValues = Array.isArray(prediction.probability) ? prediction.probability : [prediction.probability];

            const url = image instanceof HTMLImageElement ? image.src : '';
            if (this.isWhitelisted(url)) {
                return { blocked: false, reason: 'Whitelisted content', whitelistMatch: true };
            }

            if (score < this.config.imageThreshold) {
                return { blocked: false, reason: 'Content is appropriate' };
            }

            // Generate SHAP explanation using mock tensor
            try {
                // Using simplified explanation since KernelExplainer is not available
                const shapValuesArray = [0]; // Placeholder for SHAP values

                return {
                    blocked: true,
                    reason: 'Content is inappropriate for this age range',
                    explanation: {
                        prediction: { 
                            score,
                            probability: score,
                            label: prediction.label
                        },
                        shapValues: shapValuesArray[0]
                    }
                };
            } catch (shapError: any) {
                console.error('Error generating SHAP explanation:', shapError);
                return {
                    blocked: true,
                    reason: 'Content is inappropriate for this age range',
                    explanation: {
                        prediction: { 
                            score,
                            probability: score,
                            label: prediction.label
                        },
                        shapValues: predictionShapValues
                    }
                };
            }
        } catch (error: any) {
            console.error('Error filtering image:', error);
            throw new Error(error.message || 'Error during image filtering');
        }
    }

    public async filterContent(url: string, content: string | HTMLImageElement | HTMLCanvasElement): Promise<FilterResult> {
        if (!this.isAllowedDomain(url)) {
            throw new Error('Domain not allowed');
        }

        try {
            if (typeof content === 'string') {
                return await this.filterText(content);
            } else if (content instanceof HTMLImageElement) {
                return await this.filterImage(content);
            } else if (content instanceof HTMLCanvasElement) {
                return await this.filterImage(content);
            } else {
                throw new Error('Unsupported content type');
            }
        } catch (error: any) {
            console.error('Error filtering content:', error);
            throw new Error(error.message || 'Error during content filtering');
        }
    }
}

export default new ContentFilterService();
