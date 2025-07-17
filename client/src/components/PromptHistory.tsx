import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RotateCcw } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { PromptHistory } from "@shared/schema";

export default function PromptHistory() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: history } = useQuery({
    queryKey: ["/api/prompt-history"],
    select: (data: any) => data.history || [],
  });

  const filteredHistory = history?.filter((item: PromptHistory) =>
    item.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleReusePrompt = (prompt: string) => {
    // This would typically trigger a callback to parent component
    // For now, we'll just copy to clipboard
    navigator.clipboard.writeText(prompt);
  };

  return (
    <Card className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Prompt History</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search prompts..."
              className="pl-10 backdrop-blur-lg bg-white/10 border border-white/20 text-white placeholder-gray-400"
            />
          </div>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 text-sm">No prompt history found</p>
            </div>
          ) : (
            filteredHistory.map((item: PromptHistory) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 backdrop-blur-lg bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-all duration-300"
              >
                <span className="text-sm text-gray-300 flex-1 truncate">
                  {item.prompt}
                </span>
                <Button
                  onClick={() => handleReusePrompt(item.prompt)}
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
