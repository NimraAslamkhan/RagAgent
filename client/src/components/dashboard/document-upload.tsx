import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadingFile {
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
}

export function DocumentUpload() {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data, file) => {
      setUploadingFiles(prev => 
        prev.map(f => f.file === file ? { ...f, status: 'processing', progress: 100 } : f)
      );
      
      toast({
        title: "Upload successful",
        description: `${file.name} is being processed...`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
      
      // Remove from uploading files after a delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f => f.file !== file));
      }, 3000);
    },
    onError: (error: Error, file) => {
      setUploadingFiles(prev => 
        prev.map(f => f.file === file ? { ...f, status: 'error' } : f)
      );
      
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const validTypes = ['application/pdf', 'text/plain'];
      const validSize = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported file type. Please upload PDF or TXT files.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!validSize) {
        toast({
          title: "File too large",
          description: `${file.name} is larger than 10MB. Please upload a smaller file.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Add files to uploading state
    const newUploadingFiles = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));
    
    setUploadingFiles(prev => [...prev, ...newUploadingFiles]);
    
    // Upload each file
    validFiles.forEach(file => {
      uploadMutation.mutate(file);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    handleFiles(e.dataTransfer.files);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
        <span className="text-sm text-gray-500">PDF, TXT supported</span>
      </div>
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive 
            ? 'border-primary bg-blue-50' 
            : 'border-gray-300 hover:border-primary'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
          <CloudUpload className="text-gray-400 text-2xl" />
        </div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</h4>
        <p className="text-gray-500 mb-4">Support for PDF and TXT files up to 10MB</p>
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="bg-primary hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Choose Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.txt"
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          {uploadingFiles.map((upload, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{upload.file.name}</span>
                <span className={`text-sm ${
                  upload.status === 'complete' ? 'text-secondary' :
                  upload.status === 'error' ? 'text-red-500' :
                  'text-primary'
                }`}>
                  {upload.status === 'uploading' ? 'Uploading...' :
                   upload.status === 'processing' ? 'Processing...' :
                   upload.status === 'complete' ? 'Complete' :
                   'Error'}
                </span>
              </div>
              <Progress value={upload.progress} className="mb-1" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{(upload.file.size / 1024 / 1024).toFixed(1)} MB</span>
                <span>{upload.progress}% complete</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
