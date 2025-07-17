import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Pause, Loader2 } from "lucide-react";

interface ProgressPanelProps {
  isGenerating: boolean;
  generationProgress: {
    currentPrompt: number;
    totalPrompts: number;
    currentImage: number;
    imagesPerPrompt: number;
    timeRemaining: number;
    currentImageUrl: string;
    currentPromptText: string;
  };
  setIsGenerating: (value: boolean) => void;
}

export default function ProgressPanel({
  isGenerating,
  generationProgress,
  setIsGenerating,
}: ProgressPanelProps) {
  const {
    currentPrompt,
    totalPrompts,
    currentImage,
    imagesPerPrompt,
    timeRemaining,
    currentImageUrl,
    currentPromptText,
  } = generationProgress;

  const progressPercentage = totalPrompts > 0 ? (currentPrompt / totalPrompts) * 100 : 0;

  if (!isGenerating) {
    return (
      <Card className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Generation Progress</h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-400">Ready to generate images</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Generation Progress</h3>
          <Button
            onClick={() => setIsGenerating(false)}
            variant="destructive"
            size="sm"
          >
            <Pause className="mr-2 h-4 w-4" />
            Pause
          </Button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Current Prompt:</span>
            <span className="text-white font-medium">{currentPrompt} of {totalPrompts}</span>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          <div className="text-center">
            <p className="text-sm text-white mb-2">
              Generating: "{currentPromptText.substring(0, 50)}..."
            </p>
            <p className="text-xs text-gray-400">
              Image {currentImage} of {imagesPerPrompt} for this prompt
            </p>
          </div>
          
          {/* Live Preview */}
          {currentImageUrl && (
            <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Live Preview</h4>
              <div className="relative">
                <img
                  src={`/api/proxy-image?url=${encodeURIComponent(currentImageUrl)}`}
                  alt="Current generation"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                  <div className="text-white text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Generated!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Countdown Timer */}
          {timeRemaining > 0 && (
            <div className="text-center backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-3">
              <p className="text-sm text-gray-400">Next generation in:</p>
              <p className="text-2xl font-bold text-white">
                {Math.floor(timeRemaining / 60).toString().padStart(2, '0')}:
                {(timeRemaining % 60).toString().padStart(2, '0')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
