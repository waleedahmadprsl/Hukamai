import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { GeneratedImage } from "@shared/schema";

export const downloadAllAsZip = async (images: GeneratedImage[]) => {
  const zip = new JSZip();
  
  for (let i = 0; i < images.length; i++) {
    const image = images[i];
    
    try {
      // Fetch image via proxy to avoid CORS issues
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(image.imageUrl)}`);
      const blob = await response.blob();
      
      // Create a sanitized filename
      const sanitizedPrompt = image.prompt
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
      
      const filename = `${sanitizedPrompt}_${i + 1}.png`;
      
      // Add to zip
      zip.file(filename, blob);
    } catch (error) {
      console.error(`Failed to download image ${i + 1}:`, error);
    }
  }
  
  // Generate and download zip
  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "hukam_generated_images.zip");
};

export const downloadSingleImage = async (image: GeneratedImage) => {
  try {
    const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(image.imageUrl)}`);
    const blob = await response.blob();
    
    const sanitizedPrompt = image.prompt
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50);
    
    const filename = `${sanitizedPrompt}.png`;
    
    saveAs(blob, filename);
  } catch (error) {
    console.error("Failed to download image:", error);
    throw error;
  }
};
