import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function QueryInterface() {
  const [question, setQuestion] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await apiRequest('POST', '/api/query', { question });
      return response.json();
    },
    onSuccess: () => {
      setQuestion("");
      toast({
        title: "Query processed",
        description: "Your question has been answered successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/queries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Query failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    queryMutation.mutate(question.trim());
  };

  const quickQueries = [
    "Summarize key points",
    "Find methodology",
    "Extract conclusions",
  ];

  const handleQuickQuery = (query: string) => {
    setQuestion(query);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Query Your Documents</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full">AI Powered</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="resize-none pr-20"
            rows={4}
            placeholder="Ask anything about your documents... e.g., 'What are the key findings in the research papers?'"
            disabled={queryMutation.isPending}
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <span className="text-xs text-gray-400">{question.length}/500</span>
            <Button 
              type="submit"
              size="sm"
              className="bg-primary hover:bg-blue-700"
              disabled={!question.trim() || queryMutation.isPending}
            >
              {queryMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Queries */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Queries:</p>
          <div className="flex flex-wrap gap-2">
            {quickQueries.map((query, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                type="button"
                onClick={() => handleQuickQuery(query)}
                className="text-sm"
              >
                {query}
              </Button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
