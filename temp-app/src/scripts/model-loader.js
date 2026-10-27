const tf = require('@tensorflow/tfjs-node');
const nsfw = require('@tensorflow-models/nsfw');
const path = require('path');

class ModelLoader {
  constructor() {
    this.nsfwModel = null;
    this.distilBERTModel = null;
    this.modelStatus = {
      nsfw: false,
      distilbert: false
    };
  }

  async initializeModels() {
    try {
      // Load NSFW.js model
      this.nsfwModel = await nsfw.load();
      this.modelStatus.nsfw = true;
      console.log('NSFW model loaded successfully');

      // Load DistilBERT model
      await this.initializeDistilBERT();
      console.log('All models loaded successfully');

      return true;
    } catch (error) {
      console.error('Error loading models:', error);
      return false;
    }
  }

  async initializeDistilBERT() {
    try {
      // Initialize DistilBERT for text classification
      const modelPath = path.join(__dirname, '../models/distilbert');
      this.distilBERTModel = await tf.loadLayersModel(`file://${modelPath}/model.json`);
      this.modelStatus.distilbert = true;
      console.log('DistilBERT model loaded successfully');
    } catch (error) {
      console.error('Error loading DistilBERT model:', error);
      throw error;
    }
  }

  async classifyImage(imageBuffer) {
    if (!this.modelStatus.nsfw) {
      throw new Error('NSFW model not initialized');
    }

    try {
      const predictions = await this.nsfwModel.classify(imageBuffer);
      return predictions;
    } catch (error) {
      console.error('Error classifying image:', error);
      throw error;
    }
  }

  async analyzeText(text) {
    if (!this.modelStatus.distilbert) {
      throw new Error('DistilBERT model not initialized');
    }

    try {
      // Implement text analysis with DistilBERT
      // This is a placeholder for the actual implementation
      const result = await this.distilBERTModel.predict(text);
      return result;
    } catch (error) {
      console.error('Error analyzing text:', error);
      throw error;
    }
  }

  getModelStatus() {
    return this.modelStatus;
  }
}

module.exports = new ModelLoader(); 