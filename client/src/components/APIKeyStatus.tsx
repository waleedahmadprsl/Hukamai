import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import type { ApiKeyStatus } from "@shared/schema";

interface APIKeyStatusProps {
  statuses: ApiKeyStatus[];
}

export default function APIKeyStatus({ statuses }: APIKeyStatusProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleResetKeys = async () => {
    try {
      await apiRequest("POST", "/api/reset-api-keys", {});
      await queryClient.invalidateQueries({ queryKey: ["/api/api-key-status"] });
      toast({
        title: "API Keys reset",
        description: "All API keys have been reset successfully",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: "Failed to reset API keys",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: ApiKeyStatus) => {
    if (!status.isActive) return "bg-red-400";
    if (status.cooldownUntil && new Date(status.cooldownUntil) > new Date()) return "bg-yellow-400";
    return "bg-green-400";
  };

  const getStatusText = (status: ApiKeyStatus) => {
    if (!status.isActive) return "Inactive";
    if (status.cooldownUntil && new Date(status.cooldownUntil) > new Date()) {
      const remaining = Math.ceil((new Date(status.cooldownUntil).getTime() - Date.now()) / 1000);
      return `Cooldown: ${remaining}s`;
    }
    return "Active";
  };

  return (
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">API Key Status</h3>
        <div className="space-y-3">
          {statuses.map((status) => (
            <div key={status.keyIndex} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
                <span className="text-sm text-gray-300">Key {status.keyIndex + 1}</span>
              </div>
              <span className="text-xs text-gray-400">{getStatusText(status)}</span>
            </div>
          ))}
          
          {statuses.length === 0 && (
            <div className="text-center py-4">
              <p className="text-gray-400 text-sm">Loading API key status...</p>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleResetKeys}
          className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 mt-4 transition-all duration-300"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Keys
        </Button>
      </CardContent>
    </Card>
  );
}
