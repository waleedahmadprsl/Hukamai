import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Grid, List } from "lucide-react";
import { downloadAllAsZip } from "@/lib/download";
import { useToast } from "@/hooks/use-toast";
import type { GeneratedImage } from "@shared/schema";

interface GeneratedImagesProps {
  images: GeneratedImage[];
}

export default function GeneratedImages({ images }: GeneratedImagesProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownloadAll = async () => {
    if (images.length === 0) {
      toast({
        title: "No images to download",
        description: "Generate some images first",
        variant: "destructive",
      });
      return;
    }

    setIsDownloading(true);
    try {
      await downloadAllAsZip(images);
      toast({
        title: "Download complete",
        description: `Downloaded ${images.length} images`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to create ZIP file",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadSingleImage = async (image: GeneratedImage) => {
    try {
      const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(image.imageUrl)}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${image.prompt.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Generated Images</h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">{images.length} images generated</span>
            <Button
              onClick={handleDownloadAll}
              disabled={isDownloading || images.length === 0}
              className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloading ? "Downloading..." : "Download All (ZIP)"}
            </Button>
          </div>
        </div>
        
        {images.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Grid className="h-8 w-8 text-white" />
            </div>
            <p className="text-gray-400 text-lg">No images generated yet</p>
            <p className="text-gray-500 text-sm mt-2">Start by entering some prompts above</p>
          </div>
        ) : (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {images.map((image) => (
              <div
                key={image.id}
                className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <img
                  src={`/api/proxy-image?url=${encodeURIComponent(image.imageUrl)}`}
                  alt={image.prompt}
                  className="w-full h-48 object-cover"
                  loading="lazy"
                />
                <div className="p-4">
                  <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                    {image.prompt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {new Date(image.createdAt).toLocaleString()}
                    </span>
                    <Button
                      onClick={() => downloadSingleImage(image)}
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                    >
                      <Download className="mr-1 h-3 w-3" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
