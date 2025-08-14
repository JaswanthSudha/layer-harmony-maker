import { useCallback, useState } from "react";
import { Upload, Image as ImageIcon, X, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { ImageData } from "@/pages/Index";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  imageData: ImageData | null;
  placeholder: string;
  type: "background" | "foreground";
}

export const ImageUpload = ({ onImageUpload, imageData, placeholder, type }: ImageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      onImageUpload(file);
    } else {
      toast.error("Please upload a valid image file");
    }
  }, [onImageUpload]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB");
        return;
      }
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const clearImage = useCallback(() => {
    if (imageData) {
      URL.revokeObjectURL(imageData.url);
    }
  }, [imageData]);

  return (
    <Card className="relative overflow-hidden">
      {imageData ? (
        <div className="space-y-4">
          <div className="relative group">
            <img 
              src={imageData.url} 
              alt={`${type} preview`}
              className="w-full h-40 object-cover rounded-lg border border-border"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={clearImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Dimensions:</span>
              <Badge variant="secondary">{imageData.width} × {imageData.height}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Size:</span>
              <Badge variant="secondary">{formatFileSize(imageData.file.size)}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Format:</span>
              <Badge variant="secondary">{imageData.file.type.split('/')[1].toUpperCase()}</Badge>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`p-8 border-2 border-dashed rounded-lg transition-all cursor-pointer
            ${isDragOver 
              ? 'border-primary bg-primary/5 shadow-glow' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => document.getElementById(`file-${type}`)?.click()}
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              {isDragOver ? (
                <FileImage className="h-12 w-12 text-primary animate-bounce" />
              ) : (
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              )}
            </div>
            
            <div>
              <p className="text-sm font-medium text-foreground">{placeholder}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Drag & drop or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, WebP up to 10MB
              </p>
            </div>
            
            <Button variant="outline" size="sm" className="pointer-events-none">
              <Upload className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
          
          <input
            id={`file-${type}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>
      )}
    </Card>
  );
};