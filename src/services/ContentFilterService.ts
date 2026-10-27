/**
 * Content Filter Service for AgeLock
 * This service handles content filtering based on age appropriateness
 */

// Type definitions for the content filtering service
export interface FilterResult {
  blocked: boolean;
  reason: string;
  explanation: string;
  shapValues?: ShapValue[];
  confidence?: number;
}

export interface ShapValue {
  feature: string;
  contribution: number;
  displayText?: string;
}

export interface AgeRangeConfig {
  textThreshold: number;
  imageThreshold: number;
  whitelist: string[];
  allowedDomains: string[];
  contentCategories: {
    [category: string]: {
      allowed: boolean;
      threshold: number;
    };
  };
}

// Configuration for different age ranges
const AGE_RANGE_CONFIGS: Record<string, AgeRangeConfig> = {
  children: {
    textThreshold: 0.7,
    imageThreshold: 0.5,
    whitelist: [
      'kids.nationalgeographic.com',
      'pbskids.org',
      'disney.com',
      'scratch.mit.edu',
      'code.org',
      'khanacademy.org',
      'brainpop.com',
      'coolmath.com',
      'funbrain.com',
      'starfall.com',
      'abcya.com',
      'seussville.com',
      'storylineonline.net',
      'highlightskids.com',
      'nasa.gov/kidsclub',
      'switchzoo.com',
      'learninggamesforkids.com',
      'factmonster.com',
      'timeforkids.com',
      'wonderopolis.org'
      // In a real implementation, this would include 100+ pre-approved sites
    ],
    allowedDomains: [],
    contentCategories: {
      'educational': { allowed: true, threshold: 0 },
      'violence': { allowed: false, threshold: 0.3 },
      'sexual': { allowed: false, threshold: 0.1 },
      'language': { allowed: false, threshold: 0.4 },
      'drugs': { allowed: false, threshold: 0.1 }
    }
  },
  teenagers: {
    textThreshold: 0.85,
    imageThreshold: 0.7,
    whitelist: [
      'khanacademy.org',
      'wikipedia.org',
      'ted.com',
      'nasa.gov',
      'nationalgeographic.com'
    ],
    allowedDomains: [],
    contentCategories: {
      'educational': { allowed: true, threshold: 0 },
      'violence': { allowed: false, threshold: 0.6 },
      'sexual': { allowed: false, threshold: 0.4 },
      'language': { allowed: false, threshold: 0.7 },
      'drugs': { allowed: false, threshold: 0.5 }
    }
  },
  adults: {
    textThreshold: 0.95,
    imageThreshold: 0.9,
    whitelist: [],
    allowedDomains: [],
    contentCategories: {
      'educational': { allowed: true, threshold: 0 },
      'violence': { allowed: true, threshold: 0.9 },
      'sexual': { allowed: true, threshold: 0.9 },
      'language': { allowed: true, threshold: 0.9 },
      'drugs': { allowed: true, threshold: 0.9 }
    }
  }
};

// Using pure mock implementations without external dependencies
// In a real implementation, we would import TensorFlow and NSFW.js

export class ContentFilterService {
  private imageModel: any;
  private toxicityModel: any;
  private config: AgeRangeConfig | null = null;
  private _ageRange: string | null = null;

  // Getter for the current age range
  public get ageRange(): string | null {
    return this._ageRange;
  }

  constructor() {
    this.initializeModels();
  }

  private async initializeModels() {
    try {
      console.log('Loading content filtering models...');
      
      // In a real implementation, we would load the actual models
      // For demonstration purposes, we're using mock implementations
      
      // Mock NSFW.js model for image classification
      this.imageModel = {
        classify: async (_image: any) => {
          // Simulate model prediction with realistic categories from NSFW.js
          return [
            { className: 'Drawing', probability: 0.01 },
            { className: 'Hentai', probability: 0.01 },
            { className: 'Neutral', probability: 0.94 },
            { className: 'Porn', probability: 0.02 },
            { className: 'Sexy', probability: 0.02 }
          ];
        }
      };
      
      // Mock DistilBERT/toxicity model for text classification
      this.toxicityModel = {
        classify: async (texts: string[]) => {
          // Simulate toxicity model with multiple categories
          return [
            {
              label: 'toxicity',
              results: texts.map(() => ({ 
                match: Math.random() > 0.9,
                probabilities: [0.9, 0.1] 
              }))
            },
            {
              label: 'severe_toxicity',
              results: texts.map(() => ({ 
                match: Math.random() > 0.95,
                probabilities: [0.95, 0.05] 
              }))
            },
            {
              label: 'identity_attack',
              results: texts.map(() => ({ 
                match: Math.random() > 0.92,
                probabilities: [0.92, 0.08] 
              }))
            },
            {
              label: 'insult',
              results: texts.map(() => ({ 
                match: Math.random() > 0.91,
                probabilities: [0.91, 0.09] 
              }))
            },
            {
              label: 'threat',
              results: texts.map(() => ({ 
                match: Math.random() > 0.97,
                probabilities: [0.97, 0.03] 
              }))
            },
            {
              label: 'sexual_explicit',
              results: texts.map(() => ({ 
                match: Math.random() > 0.93,
                probabilities: [0.93, 0.07] 
              }))
            }
          ];
        }
      };
      
      console.log('Content filtering models loaded successfully');
    } catch (error) {
      console.error('Error initializing models:', error);
      throw error;
    }
  }

  public setAgeRange(ageRange: string) {
    if (!AGE_RANGE_CONFIGS[ageRange]) {
      throw new Error(`Invalid age range: ${ageRange}`);
    }
    this._ageRange = ageRange;
    this.config = AGE_RANGE_CONFIGS[ageRange];
    console.log(`Age range set to: ${ageRange}`);
  }

  public async filterText(text: string): Promise<FilterResult> {
    if (!this.config) {
      throw new Error('Filter service not initialized');
    }

    // Check if text is in whitelist
    if (this.config.whitelist.some(domain => 
      text.toLowerCase().includes(domain.toLowerCase())
    )) {
      return { blocked: false, reason: '', explanation: '' };
    }

    try {
      // Get predictions from toxicity model
      const predictions = await this.toxicityModel.classify([text]);
      
      // Find the most severe prediction
      let maxScore = 0;
      let worstPrediction: any = null;
      let allPredictions: {label: string, score: number}[] = [];
      
      for (const prediction of predictions) {
        if (prediction.results[0].match) {
          const score = prediction.results[0].probabilities[1];
          allPredictions.push({
            label: prediction.label,
            score: score
          });
          
          if (score > maxScore) {
            maxScore = score;
            worstPrediction = prediction;
          }
        }
      }

      // Check against threshold
      const threshold = this.config?.textThreshold || 0.85;
      if (worstPrediction && maxScore >= threshold) {
        // Generate SHAP-like explanations
        const shapValues = this.generateShapExplanation(text, worstPrediction.label, allPredictions);
        
        return {
          blocked: true,
          reason: `Content may not be appropriate for ${this._ageRange || 'this age group'} (${worstPrediction.label})`,
          explanation: `Toxicity score: ${maxScore.toFixed(2)} (Threshold: ${threshold})`,
          shapValues: shapValues,
          confidence: maxScore
        };
      }

      return { blocked: false, reason: '', explanation: '' };
    } catch (error) {
      console.error('Error filtering text:', error);
      return { 
        blocked: false, 
        reason: 'Error processing content',
        explanation: 'Failed to analyze content'
      };
    }
  }
  
  /**
   * Generates SHAP-like explanations for text filtering decisions
   * In a real implementation, this would use actual SHAP values from the model
   */
  private generateShapExplanation(text: string, category: string, predictions: {label: string, score: number}[]): ShapValue[] {
    // In a real implementation, we would compute actual SHAP values
    // For this demo, we'll create simulated SHAP values
    
    // Extract key words that might have triggered the classification
    const words = text.split(/\s+/);
    const shapValues: ShapValue[] = [];
    
    // Add category-based explanations
    predictions.forEach(pred => {
      shapValues.push({
        feature: pred.label,
        contribution: pred.score,
        displayText: `Category: ${pred.label} (${(pred.score * 100).toFixed(1)}%)`
      });
    });
    
    // Add word-based explanations (simulated)
    const sensitiveWords = {
      'toxicity': ['bad', 'terrible', 'hate', 'stupid', 'idiot'],
      'identity_attack': ['racist', 'sexist', 'homophobic'],
      'insult': ['dumb', 'fool', 'loser', 'idiot'],
      'threat': ['kill', 'hurt', 'attack', 'destroy'],
      'sexual_explicit': ['sex', 'naked', 'porn', 'xxx']
    };
    
    // Check if any sensitive words are in the text
    const categoryWords = sensitiveWords[category as keyof typeof sensitiveWords] || [];
    
    words.forEach(word => {
      const lowerWord = word.toLowerCase();
      if (categoryWords.includes(lowerWord)) {
        shapValues.push({
          feature: `word:${lowerWord}`,
          contribution: 0.8,
          displayText: `Word: "${word}" is often associated with ${category}`
        });
      }
    });
    
    // Sort by contribution (highest first)
    return shapValues.sort((a, b) => b.contribution - a.contribution);
  }

  public async filterImage(imageData: string): Promise<FilterResult> {
    if (!this.config) {
      throw new Error('Filter service not initialized');
    }

    try {
      if (!this.imageModel) {
        await this.initializeModels();
        if (!this.imageModel) {
          throw new Error('Failed to load image model');
        }
      }

      // Get predictions from NSFW.js model
      const predictions = await this.imageModel.classify(imageData);
      
      // Find problematic categories
      const nsfw_categories = ['Porn', 'Sexy', 'Hentai'];
      let highestNSFWScore = 0;
      let problematicCategory = '';
      
      for (const prediction of predictions) {
        if (nsfw_categories.includes(prediction.className) && 
            prediction.probability > highestNSFWScore) {
          highestNSFWScore = prediction.probability;
          problematicCategory = prediction.className;
        }
      }

      // Check against threshold
      if (highestNSFWScore > this.config.imageThreshold) {
        // Generate explanations for the image classification
        const shapValues = this.generateImageExplanation(predictions);
        
        return {
          blocked: true,
          reason: `Image may not be appropriate for ${this._ageRange || 'this age group'}`,
          explanation: `NSFW category detected: ${problematicCategory} (Score: ${highestNSFWScore.toFixed(2)})`,
          shapValues: shapValues,
          confidence: highestNSFWScore
        };
      }

      return { blocked: false, reason: '', explanation: '' };
    } catch (error) {
      console.error('Error filtering image:', error);
      return { 
        blocked: false, 
        reason: 'Error processing image',
        explanation: 'Failed to analyze image'
      };
    }
  }
  
  /**
   * Generates explanations for image filtering decisions
   */
  private generateImageExplanation(predictions: any[]): ShapValue[] {
    // In a real implementation, we would use actual SHAP values or feature attribution
    // For this demo, we'll create explanations based on the model's predictions
    
    const shapValues: ShapValue[] = [];
    
    // Sort predictions by probability (highest first)
    const sortedPredictions = [...predictions].sort((a, b) => 
      b.probability - a.probability
    );
    
    // Convert each prediction to a SHAP-like explanation
    sortedPredictions.forEach(pred => {
      shapValues.push({
        feature: pred.className,
        contribution: pred.probability,
        displayText: `${pred.className}: ${(pred.probability * 100).toFixed(1)}% confidence`
      });
    });
    
    return shapValues;
  }

  public async checkUrl(url: string): Promise<FilterResult> {
    try {
      // Basic URL validation
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      // Parse URL
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.toLowerCase();

      // Check whitelist (pre-approved sites)
      if (this.config?.whitelist?.includes(domain)) {
        console.log(`Domain ${domain} is in the whitelist for ${this._ageRange}`);
        return { blocked: false, reason: '', explanation: '' };
      }

      // Check allowed domains
      if (this.config && this.config.allowedDomains && this.config.allowedDomains.includes(domain)) {
        console.log(`Domain ${domain} is in allowed domains for ${this._ageRange}`);
        return { blocked: false, reason: '', explanation: '' };
      }
      
      // For children (ages 5-12), only allow whitelisted sites
      if (this._ageRange === 'children' && this.config && this.config.whitelist && this.config.whitelist.length > 0) {
        return {
          blocked: true,
          reason: 'Site not in approved list',
          explanation: 'For children aged 5-12, only pre-approved websites are accessible. ' +
                      'This helps ensure a safe browsing experience.',
          confidence: 1.0
        };
      }

      // For demonstration purposes, randomly block some domains for teenagers
      // In a real implementation, this would use actual content analysis
      if (this._ageRange === 'teenagers') {
        // Simulate domain reputation check (would be a real API call in production)
        const domainScore = this.simulateDomainReputationCheck(domain);
        
        if (domainScore < 0.7) {
          return {
            blocked: true,
            reason: 'Site may contain inappropriate content',
            explanation: `This website's safety score (${(domainScore * 100).toFixed(0)}%) ` +
                        `is below our threshold for teenager browsing.`,
            confidence: 1 - domainScore
          };
        }
      }

      return { blocked: false, reason: '', explanation: '' };
    } catch (error) {
      console.error('Error checking URL:', error);
      return { 
        blocked: true, 
        reason: 'Invalid URL',
        explanation: 'Failed to analyze URL'
      };
    }
  }
  
  /**
   * Simulates a domain reputation check
   * In a real implementation, this would call a reputation API or database
   */
  private simulateDomainReputationCheck(domain: string): number {
    // This is just a simulation - in a real implementation, we would use an actual
    // reputation database or API to check the domain's safety score
    
    // Some domains we'll consider "safe" for demonstration
    const safeDomains = [
      'google.com', 'bing.com', 'yahoo.com', 'duckduckgo.com',
      'wikipedia.org', 'khanacademy.org', 'ted.com', 'nasa.gov',
      'nationalgeographic.com', 'pbs.org', 'discovery.com',
      'howstuffworks.com', 'sciencedaily.com', 'space.com'
    ];
    
    // Check if the domain or a parent domain is in our safe list
    for (const safeDomain of safeDomains) {
      if (domain === safeDomain || domain.endsWith('.' + safeDomain)) {
        return 0.9 + (Math.random() * 0.1); // 0.9-1.0 score for safe domains
      }
    }
    
    // For other domains, generate a score based on domain length and TLD
    // (This is just for demonstration - real scoring would be much more sophisticated)
    let score = 0.5; // Start with a neutral score
    
    // Longer domains tend to be more legitimate
    score += Math.min(domain.length / 100, 0.2);
    
    // Common TLDs are generally safer
    const safeTLDs = ['.com', '.org', '.edu', '.gov', '.net'];
    if (safeTLDs.some(tld => domain.endsWith(tld))) {
      score += 0.1;
    }
    
    // Add some randomness (simulating other factors in reputation scoring)
    score += (Math.random() * 0.2) - 0.1;
    
    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  public isDomainAllowed(domain: string): boolean {
    if (!this.config) {
      throw new Error('Filter service not initialized');
    }

    // If no allowed domains are specified, all domains are allowed
    if (this.config.allowedDomains.length === 0) {
      return true;
    }

    return this.config.allowedDomains.some(
      allowedDomain => domain.toLowerCase().includes(allowedDomain.toLowerCase())
    );
  }

  public isWhitelisted(text: string): boolean {
    if (!this.config) {
      throw new Error('Filter service not initialized');
    }
    return this.config.whitelist.some(domain => 
      text.toLowerCase().includes(domain.toLowerCase())
    );
  }
}

export default new ContentFilterService();
