import { useQuery } from "@tanstack/react-query";
import { Clock, BarChart, ThumbsUp, ThumbsDown, Share, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryData {
  id: string;
  question: string;
  response: string;
  confidence: number | null;
  responseTime: number | null;
  referencedDocuments: string[] | null;
  createdAt: string;
}

export function RecentQueries() {
  const { data: queries, isLoading } = useQuery<QueryData[]>({
    queryKey: ["/api/queries"],
  });

  if (isLoading) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Queries & Responses</h3>
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-20 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Recent Queries & Responses</h3>
        <Button variant="ghost" className="text-primary hover:text-blue-700">
          View All
        </Button>
      </div>

      <div className="space-y-6">
        {queries && queries.length > 0 ? (
          queries.slice(0, 3).map((query: any) => (
            <div key={query.id} className="border-l-4 border-primary pl-6 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 mb-1">{query.question}</p>
                  <p className="text-sm text-gray-500">
                    Asked {new Date(query.createdAt).toLocaleString()} • {query.referencedDocuments?.length || 0} documents referenced
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs bg-secondary text-white px-2 py-1 rounded-full">Completed</span>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 leading-relaxed">{query.response}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Response time: {(query.responseTime / 1000).toFixed(1)}s
                    </span>
                    <span className="flex items-center">
                      <BarChart className="h-4 w-4 mr-1" />
                      Confidence: {Math.round((query.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm">
                      <ThumbsUp className="h-4 w-4 text-gray-400 hover:text-secondary" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ThumbsDown className="h-4 w-4 text-gray-400 hover:text-red-500" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No queries yet. Ask your first question!</p>
          </div>
        )}
      </div>
    </div>
  );
}
