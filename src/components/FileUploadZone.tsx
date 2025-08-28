import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Download, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';

interface FileItem {
  id: string;
  file: File;
  content: string;
  status: 'pending' | 'reading' | 'success' | 'error';
}

export const FileUploadZone = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [combinedContent, setCombinedContent] = useState<string>('');
  const { toast } = useToast();

  const MAX_FILES = 1000;
  const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100MB

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const currentTotalSize = files.reduce((sum, f) => sum + f.file.size, 0);
    const newFilesSize = acceptedFiles.reduce((sum, f) => sum + f.size, 0);
    
    if (files.length + acceptedFiles.length > MAX_FILES) {
      toast({
        title: "Too many files",
        description: `Maximum ${MAX_FILES} files allowed`,
        variant: "destructive"
      });
      return;
    }

    if (currentTotalSize + newFilesSize > MAX_TOTAL_SIZE) {
      toast({
        title: "Files too large",
        description: "Combined file size exceeds 100MB limit",
        variant: "destructive"
      });
      return;
    }

    const newFiles = acceptedFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      content: '',
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
    
    // Read files
    newFiles.forEach(fileItem => {
      setFiles(prev => prev.map(f => 
        f.id === fileItem.id ? { ...f, status: 'reading' } : f
      ));

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id 
            ? { ...f, content, status: 'success' } 
            : f
        ));
      };
      reader.onerror = () => {
        setFiles(prev => prev.map(f => 
          f.id === fileItem.id ? { ...f, status: 'error' } : f
        ));
      };
      reader.readAsText(fileItem.file);
    });
  }, [files, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'text/markdown': ['.md'],
      'application/json': ['.json']
    },
    multiple: true
  });

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const combineFiles = async () => {
    setIsProcessing(true);
    
    const successFiles = files.filter(f => f.status === 'success');
    if (successFiles.length === 0) {
      toast({
        title: "No files to combine",
        description: "Please upload valid text files first",
        variant: "destructive"
      });
      setIsProcessing(false);
      return;
    }

    let combined = '';
    successFiles.forEach((fileItem, index) => {
      combined += `\n\n=== File ${index + 1}: ${fileItem.file.name} ===\n\n`;
      combined += fileItem.content;
    });

    setCombinedContent(combined);
    setIsProcessing(false);
    
    toast({
      title: "Files combined successfully!",
      description: `${successFiles.length} files merged`,
    });
  };

  const downloadCombined = () => {
    const blob = new Blob([combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'combined-files.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setFiles([]);
    setCombinedContent('');
  };

  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);
  const sizeProgress = (totalSize / MAX_TOTAL_SIZE) * 100;
  const fileProgress = (files.length / MAX_FILES) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Upload Zone */}
      <Card className="shadow-card border-2 border-dashed hover:border-primary/50 transition-colors">
        <CardContent className="p-8">
          <div
            {...getRootProps()}
            className={`cursor-pointer text-center p-8 rounded-lg transition-all duration-300 ${
              isDragActive 
                ? 'bg-primary/10 border-primary scale-105' 
                : 'hover:bg-muted/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragActive ? 'text-primary animate-upload-pulse' : 'text-muted-foreground'}`} />
            <h3 className="text-xl font-semibold mb-2">
              {isDragActive ? 'Drop files here!' : 'Upload Text Files'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag & drop your text files or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports .txt, .csv, .md, .json files
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Progress Indicators */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">File Count</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={fileProgress} className="mb-2" />
              <p className="text-sm text-muted-foreground">
                {files.length} / {MAX_FILES} files
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm">Total Size</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress 
                value={sizeProgress} 
                className={`mb-2 ${sizeProgress > 90 ? 'bg-warning/20' : ''}`}
              />
              <p className="text-sm text-muted-foreground">
                {(totalSize / (1024 * 1024)).toFixed(1)} / 100 MB
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Uploaded Files ({files.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={combineFiles}
                disabled={isProcessing || files.filter(f => f.status === 'success').length === 0}
                variant="hero"
                size="sm"
              >
                {isProcessing ? 'Processing...' : 'Combine Files'}
              </Button>
              <Button onClick={clearAll} variant="outline" size="sm">
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="max-h-64 overflow-y-auto">
            <div className="space-y-2">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card animate-file-slide"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{fileItem.file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(fileItem.file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {fileItem.status === 'reading' && (
                      <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    )}
                    {fileItem.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    {fileItem.status === 'success' && (
                      <div className="h-2 w-2 bg-success rounded-full" />
                    )}
                    <Button
                      onClick={() => removeFile(fileItem.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Download Section */}
      {combinedContent && (
        <Card className="border-success/20 bg-success/5">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <Download className="h-5 w-5" />
              Files Combined Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Your files have been combined into a single text file. 
              File size: {(new Blob([combinedContent]).size / 1024).toFixed(1)} KB
            </p>
            <Button onClick={downloadCombined} variant="success">
              <Download className="h-4 w-4 mr-2" />
              Download Combined File
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};