import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Filter, Eye, Download, Trash, FileText, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface DocumentData {
  id: string;
  filename: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
  processedAt: string | null;
}

export function DocumentLibrary() {
  const { data: documents, isLoading } = useQuery<DocumentData[]>({
    queryKey: ["/api/documents"],
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (documentId: string) => {
      await apiRequest('DELETE', `/api/documents/${documentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Document deleted",
        description: "Document has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = (documentId: string, filename: string) => {
    if (confirm(`Are you sure you want to delete "${filename}"?`)) {
      deleteMutation.mutate(documentId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-secondary text-white';
      case 'processing':
        return 'bg-accent text-white';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'application/pdf') {
      return <FileText className="text-red-600" />;
    }
    return <File className="text-blue-600" />;
  };

  if (isLoading) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Document Library</h3>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4">
              <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Document Library</h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search documents..." 
              className="pl-10 pr-4 py-2"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          </div>
          <Button variant="ghost" size="icon">
            <Filter className="h-4 w-4 text-gray-400" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Document</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Type</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Size</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Processed</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
              <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {documents && documents.length > 0 ? (
              documents.map((doc: any) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.originalName}</p>
                        <p className="text-sm text-gray-500">
                          Added {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {doc.fileType === 'application/pdf' ? 'PDF' : 'TXT'}
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {(doc.fileSize / 1024 / 1024).toFixed(1)} MB
                  </td>
                  <td className="py-4 px-4 text-gray-600">
                    {doc.processedAt ? 'Yes' : 'Processing'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doc.status)}`}>
                      {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm" title="View">
                        <Eye className="h-4 w-4 text-gray-400 hover:text-primary" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Download">
                        <Download className="h-4 w-4 text-gray-400 hover:text-primary" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        title="Delete"
                        onClick={() => handleDelete(doc.id, doc.originalName)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash className="h-4 w-4 text-gray-400 hover:text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">
                  No documents uploaded yet. Upload your first document to get started!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
