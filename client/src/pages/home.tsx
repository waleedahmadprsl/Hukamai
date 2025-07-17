import { useState } from "react";
import Header from "@/components/Header";
import PromptInput from "@/components/PromptInput";
import GeneratedImages from "@/components/GeneratedImages";
import ProgressPanel from "@/components/ProgressPanel";
import APIKeyStatus from "@/components/APIKeyStatus";
import PromptHistory from "@/components/PromptHistory";
import SettingsModal from "@/components/SettingsModal";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({
    currentPrompt: 0,
    totalPrompts: 0,
    currentImage: 0,
    imagesPerPrompt: 1,
    timeRemaining: 0,
    currentImageUrl: "",
    currentPromptText: "",
  });

  const { data: generatedImages, refetch: refetchImages } = useQuery({
    queryKey: ["/api/generated-images"],
    select: (data: any) => data.images || [],
  });

  const { data: apiKeyStatuses } = useQuery({
    queryKey: ["/api/api-key-status"],
    select: (data: any) => data.statuses || [],
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  return (
    <div className="min-h-screen">
      <Header 
        onSettingsClick={() => setIsSettingsOpen(true)}
        apiKeyStatuses={apiKeyStatuses}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Prompt Input & Generated Images */}
          <div className="lg:col-span-2 space-y-6">
            <PromptInput
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              generationProgress={generationProgress}
              setGenerationProgress={setGenerationProgress}
              onImageGenerated={refetchImages}
            />
            
            <GeneratedImages images={generatedImages || []} />
          </div>
          
          {/* Right Column: Progress & Settings */}
          <div className="space-y-6">
            <ProgressPanel
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              setIsGenerating={setIsGenerating}
            />
            
            <APIKeyStatus statuses={apiKeyStatuses || []} />
            
            <PromptHistory />
          </div>
        </div>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
