import { apiRequest } from "./queryClient";

export interface GenerateImageRequest {
  prompt: string;
  imagesPerPrompt: number;
}

export interface GenerateImageResponse {
  success: boolean;
  imageUrl?: string;
  usedApiKey?: string;
  imageId?: number;
  error?: string;
}

export const generateImage = async (data: GenerateImageRequest): Promise<GenerateImageResponse> => {
  const response = await apiRequest("POST", "/api/generate-image", data);
  return await response.json();
};

export const getGeneratedImages = async () => {
  const response = await apiRequest("GET", "/api/generated-images", undefined);
  return await response.json();
};

export const getApiKeyStatus = async () => {
  const response = await apiRequest("GET", "/api/api-key-status", undefined);
  return await response.json();
};

export const resetApiKeys = async () => {
  const response = await apiRequest("POST", "/api/reset-api-keys", {});
  return await response.json();
};

export const getPromptHistory = async () => {
  const response = await apiRequest("GET", "/api/prompt-history", undefined);
  return await response.json();
};
