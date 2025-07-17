import axios, { AxiosResponse } from 'axios';
import { storage } from '../storage';

export interface TogetherAIRequest {
  model: string;
  prompt: string;
  width: number;
  height: number;
  steps: number;
  n: number;
}

export interface TogetherAIResponse {
  data: Array<{
    url: string;
    b64_json?: string;
  }>;
}

export interface GenerationResult {
  imageUrl: string;
  usedApiKey: string;
  success: boolean;
  error?: string;
}

export class TogetherAIService {
  private apiKeys: string[] = [
    process.env.TOGETHER_AI_KEY_1 || "30007227e495131a87c70d558f56cd54d212c47ab94221f2299e11da832b3166",
    process.env.TOGETHER_AI_KEY_2 || "34b44ff37f5f56048ae0475f4acafc05bb8a252c23a2c5797300e166aa5b31d9",
    process.env.TOGETHER_AI_KEY_3 || "1d4fb6b33893281cb45c2107ebf4a49744497902500e23a35ef63837d93dcac3",
    process.env.TOGETHER_AI_KEY_4 || "dadc74fda1176aa1ab68c129b7cf9805e2f5b3e82fc7c81124db24214133d8f6"
  ];

  private currentKeyIndex = 0;
  private readonly API_ENDPOINT = 'https://api.together.xyz/v1/images/generations';
  private readonly TIMEOUT_MS = 60000; // 60 seconds
  private readonly COOLDOWN_MS = 60000; // 60 seconds cooldown

  constructor() {
    this.initializeApiKeyStatuses();
  }

  private async initializeApiKeyStatuses(): Promise<void> {
    for (let i = 0; i < this.apiKeys.length; i++) {
      const existingStatus = await storage.getApiKeyStatus(i);
      if (!existingStatus) {
        await storage.updateApiKeyStatus(i, {
          keyIndex: i,
          isActive: true,
          failureCount: 0,
          cooldownUntil: null,
        });
      }
    }
  }

  private async getNextAvailableKey(): Promise<{ key: string; index: number } | null> {
    const statuses = await storage.getAllApiKeyStatuses();
    const now = new Date();

    // Check if any keys are out of cooldown
    for (const status of statuses) {
      if (status.cooldownUntil && status.cooldownUntil < now) {
        await storage.updateApiKeyStatus(status.keyIndex, {
          isActive: true,
          cooldownUntil: null,
          failureCount: 0,
        });
      }
    }

    // Find next available key using round-robin
    for (let i = 0; i < this.apiKeys.length; i++) {
      const keyIndex = (this.currentKeyIndex + i) % this.apiKeys.length;
      const status = statuses.find(s => s.keyIndex === keyIndex);
      
      if (status && status.isActive && (!status.cooldownUntil || status.cooldownUntil < now)) {
        this.currentKeyIndex = (keyIndex + 1) % this.apiKeys.length;
        return { key: this.apiKeys[keyIndex], index: keyIndex };
      }
    }

    return null;
  }

  private async markKeyAsUsed(keyIndex: number): Promise<void> {
    await storage.updateApiKeyStatus(keyIndex, {
      lastUsed: new Date(),
    });
  }

  private async markKeyAsFailed(keyIndex: number): Promise<void> {
    const status = await storage.getApiKeyStatus(keyIndex);
    const failureCount = (status?.failureCount || 0) + 1;
    
    const updateData: any = {
      failureCount,
      lastUsed: new Date(),
    };

    // If 3 or more failures, put in cooldown
    if (failureCount >= 3) {
      updateData.isActive = false;
      updateData.cooldownUntil = new Date(Date.now() + this.COOLDOWN_MS);
    }

    await storage.updateApiKeyStatus(keyIndex, updateData);
  }

  async generateImage(prompt: string, imagesPerPrompt: number = 1): Promise<GenerationResult> {
    const keyInfo = await this.getNextAvailableKey();
    
    if (!keyInfo) {
      return {
        imageUrl: '',
        usedApiKey: '',
        success: false,
        error: 'All API keys are in cooldown or failed. Please try again later.',
      };
    }

    const requestData: TogetherAIRequest = {
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt,
      width: 768,
      height: 768,
      steps: 4,
      n: imagesPerPrompt,
    };

    try {
      const response: AxiosResponse<TogetherAIResponse> = await axios.post(
        this.API_ENDPOINT,
        requestData,
        {
          headers: {
            'Authorization': `Bearer ${keyInfo.key}`,
            'Content-Type': 'application/json',
          },
          timeout: this.TIMEOUT_MS,
        }
      );

      await this.markKeyAsUsed(keyInfo.index);

      if (response.data.data && response.data.data.length > 0) {
        const imageUrl = response.data.data[0].url;
        return {
          imageUrl,
          usedApiKey: `Key ${keyInfo.index + 1}`,
          success: true,
        };
      } else {
        throw new Error('No image data received from API');
      }
    } catch (error: any) {
      await this.markKeyAsFailed(keyInfo.index);
      
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      console.error(`API Key ${keyInfo.index + 1} failed:`, errorMessage);
      
      return {
        imageUrl: '',
        usedApiKey: `Key ${keyInfo.index + 1}`,
        success: false,
        error: errorMessage,
      };
    }
  }

  async getApiKeyStatuses() {
    return await storage.getAllApiKeyStatuses();
  }

  async resetApiKeys() {
    await storage.resetApiKeyStatuses();
    this.currentKeyIndex = 0;
  }
}

export const togetherAI = new TogetherAIService();
