import { Moon, Settings, Cog, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onSettingsClick: () => void;
  apiKeyStatuses: any[];
}

export default function Header({ onSettingsClick, apiKeyStatuses }: HeaderProps) {
  const activeKeys = apiKeyStatuses?.filter(status => status.isActive).length || 0;
  const totalKeys = apiKeyStatuses?.length || 4;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-xl">
              <Zap className="text-white text-xl" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Hukam Image Generations
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* API Key Status */}
            <div className="flex items-center space-x-2 backdrop-blur-lg bg-white/10 border border-white/20 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">{activeKeys} of {totalKeys} Keys Active</span>
            </div>
            
            {/* Settings Button */}
            <Button
              onClick={onSettingsClick}
              variant="ghost"
              size="sm"
              className="backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Settings className="h-4 w-4 text-gray-300" />
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              <Moon className="h-4 w-4 text-gray-300" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
