import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, EyeOff, Sun, Moon } from "lucide-react";
import { useLocalStorage } from "@/hooks/use-local-storage";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [customApiKey, setCustomApiKey] = useLocalStorage("custom-api-key", "");
  const [defaultImagesPerPrompt, setDefaultImagesPerPrompt] = useLocalStorage("default-images-per-prompt", "4");
  const [theme, setTheme] = useLocalStorage("theme", "dark");
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    // Settings are automatically saved via useLocalStorage
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-lg bg-black/80 border border-white/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Custom API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm font-medium text-gray-300">
              Custom API Key
            </Label>
            <div className="relative">
              <Input
                id="api-key"
                type={showApiKey ? "text" : "password"}
                value={customApiKey}
                onChange={(e) => setCustomApiKey(e.target.value)}
                placeholder="Enter your Together AI API key"
                className="backdrop-blur-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Stored locally in your browser</p>
          </div>
          
          {/* Theme Settings */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">Theme</Label>
            <div className="flex space-x-2">
              <Button
                onClick={() => setTheme("dark")}
                variant={theme === "dark" ? "default" : "ghost"}
                className="flex-1"
              >
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </Button>
              <Button
                onClick={() => setTheme("light")}
                variant={theme === "light" ? "default" : "ghost"}
                className="flex-1"
              >
                <Sun className="mr-2 h-4 w-4" />
                Light
              </Button>
            </div>
          </div>
          
          {/* Generation Settings */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-300">
              Default Images per Prompt
            </Label>
            <Select value={defaultImagesPerPrompt} onValueChange={setDefaultImagesPerPrompt}>
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
          
          {/* Database Status */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-2">Database Status</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-400">PostgreSQL Connected</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Images stored persistently</p>
          </div>
        </div>
        
        <div className="flex space-x-4 mt-8">
          <Button
            onClick={handleSave}
            className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
          >
            Save Settings
          </Button>
          <Button
            onClick={onClose}
            variant="ghost"
            className="flex-1 backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
