import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, Upload, Shuffle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface PromptInputProps {
  isGenerating: boolean;
  setIsGenerating: (value: boolean) => void;
  generationProgress: any;
  setGenerationProgress: (value: any) => void;
  onImageGenerated: () => void;
}

const promptTemplates = [
  "A [adjective] [animal] in [style] style",
  "A futuristic [object] in cyberpunk style",
  "A serene [landscape] at [time] time",
  "A majestic [creature] in [environment]",
  "A beautiful [scene] with [lighting] lighting",
];

const surprisePrompts = [
  "A majestic dragon soaring through storm clouds",
  "A cyberpunk cityscape with neon reflections",
  "A serene mountain lake at golden hour",
  "A futuristic robot in a field of flowers",
  "A mystical forest with glowing mushrooms",
  "A steampunk airship above Victorian London",
  "A peaceful zen garden with flowing water",
  "A cosmic nebula with swirling galaxies",
];

export default function PromptInput({
  isGenerating,
  setIsGenerating,
  generationProgress,
  setGenerationProgress,
  onImageGenerated,
}: PromptInputProps) {
  const [prompts, setPrompts] = useState("");
  const [imagesPerPrompt, setImagesPerPrompt] = useState("4");
  const [viewMode, setViewMode] = useState("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  const parsePrompts = useCallback((text: string) => {
    return text
      .split('\n')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setPrompts(content);
      };
      reader.readAsText(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload a .txt file",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleSurpriseMe = useCallback(() => {
    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    setPrompts(randomPrompt);
  }, []);

  const generateImages = useCallback(async () => {
    const promptList = parsePrompts(prompts);
    if (promptList.length === 0) {
      toast({
        title: "No prompts found",
        description: "Please enter at least one prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    abortControllerRef.current = new AbortController();
    
    setGenerationProgress({
      currentPrompt: 0,
      totalPrompts: promptList.length,
      currentImage: 0,
      imagesPerPrompt: parseInt(imagesPerPrompt),
      timeRemaining: 0,
      currentImageUrl: "",
      currentPromptText: "",
    });

    let failedPrompts = 0;
    const maxFailures = 3;

    for (let i = 0; i < promptList.length && !abortControllerRef.current?.signal.aborted; i++) {
      const prompt = promptList[i];
      
      setGenerationProgress(prev => ({
        ...prev,
        currentPrompt: i + 1,
        currentPromptText: prompt,
        currentImageUrl: "",
      }));

      const imagesCount = parseInt(imagesPerPrompt);
      
      for (let j = 0; j < imagesCount && !abortControllerRef.current?.signal.aborted; j++) {
        setGenerationProgress(prev => ({
          ...prev,
          currentImage: j + 1,
        }));

        try {
          const response = await apiRequest("POST", "/api/generate-image", {
            prompt,
            imagesPerPrompt: 1, // Generate one image at a time
          });

          const data = await response.json();
          
          if (data.success) {
            setGenerationProgress(prev => ({
              ...prev,
              currentImageUrl: data.imageUrl,
            }));
            
            onImageGenerated();
            
            toast({
              title: "Image generated successfully!",
              description: `Using ${data.usedApiKey}`,
            });
          } else {
            throw new Error(data.error || "Failed to generate image");
          }
        } catch (error: any) {
          console.error("Generation error:", error);
          failedPrompts++;
          
          if (failedPrompts >= maxFailures) {
            toast({
              title: "Generation failed",
              description: "⚠️ Server busy. Try again later.",
              variant: "destructive",
            });
            break;
          }

          toast({
            title: "Rate limit hit",
            description: "⏳ Waiting 60 seconds to retry...",
            variant: "destructive",
          });
          
          // Wait 60 seconds before retry
          await new Promise(resolve => setTimeout(resolve, 60000));
        }

        // Wait 20 seconds between images (except for the last image)
        if (j < imagesCount - 1 && !abortControllerRef.current?.signal.aborted) {
          for (let countdown = 20; countdown > 0; countdown--) {
            setGenerationProgress(prev => ({
              ...prev,
              timeRemaining: countdown,
            }));
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // Wait 20 seconds between prompts (except for the last prompt)
      if (i < promptList.length - 1 && !abortControllerRef.current?.signal.aborted) {
        for (let countdown = 20; countdown > 0; countdown--) {
          setGenerationProgress(prev => ({
            ...prev,
            timeRemaining: countdown,
          }));
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    setIsGenerating(false);
    setGenerationProgress(prev => ({
      ...prev,
      currentImageUrl: "",
      timeRemaining: 0,
    }));
  }, [prompts, imagesPerPrompt, parsePrompts, setIsGenerating, setGenerationProgress, onImageGenerated, toast]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setGenerationProgress(prev => ({
      ...prev,
      currentImageUrl: "",
      timeRemaining: 0,
    }));
  }, [setIsGenerating, setGenerationProgress]);

  const promptList = parsePrompts(prompts);

  return (
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Generate Images</h2>
          {promptList.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Prompts detected:</span>
              <span className="bg-gradient-to-r from-purple-500 to-blue-500 px-3 py-1 rounded-full text-sm font-medium">
                {promptList.length}
              </span>
            </div>
          )}
        </div>
        
        {/* Prompt Templates */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Button
            onClick={handleSurpriseMe}
            variant="ghost"
            size="sm"
            className="backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Surprise Me
          </Button>
          
          <Select>
            <SelectTrigger className="w-auto backdrop-blur-lg bg-white/10 border border-white/20 text-white">
              <SelectValue placeholder="Choose template" />
            </SelectTrigger>
            <SelectContent>
              {promptTemplates.map((template, index) => (
                <SelectItem key={index} value={template}>
                  {template}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Prompt Textarea */}
        <div className="relative">
          <Textarea
            value={prompts}
            onChange={(e) => setPrompts(e.target.value)}
            className="min-h-32 backdrop-blur-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 resize-none"
            placeholder="Enter your prompts here, one per line, or drag and drop a .txt file..."
          />
          
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20"
          >
            <Upload className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Images per Prompt</label>
            <Select value={imagesPerPrompt} onValueChange={setImagesPerPrompt}>
              <SelectTrigger className="backdrop-blur-lg bg-white/10 border border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 image</SelectItem>
                <SelectItem value="2">2 images</SelectItem>
                <SelectItem value="4">4 images</SelectItem>
                <SelectItem value="6">6 images</SelectItem>
                <SelectItem value="8">8 images</SelectItem>
                <SelectItem value="10">10 images</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">View Mode</label>
            <div className="flex backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-1">
              <Button
                onClick={() => setViewMode("grid")}
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
              >
                Grid
              </Button>
              <Button
                onClick={() => setViewMode("list")}
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="flex-1"
              >
                List
              </Button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
            {isGenerating ? (
              <Button
                onClick={stopGeneration}
                variant="destructive"
                className="w-full"
              >
                <Pause className="mr-2 h-4 w-4" />
                Pause Generation
              </Button>
            ) : (
              <Button
                onClick={generateImages}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
              >
                <Play className="mr-2 h-4 w-4" />
                Generate Images
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
