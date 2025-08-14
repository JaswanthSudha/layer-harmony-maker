import { useState, useCallback } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { Canvas } from "@/components/Canvas";
import { ControlPanel } from "@/components/ControlPanel";
import { ExportPanel } from "@/components/ExportPanel";
import { Header } from "@/components/Header";
import { toast } from "sonner";

export interface ImageData {
  file: File;
  url: string;
  width: number;
  height: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

const Index = () => {
  const [backgroundImage, setBackgroundImage] = useState<ImageData | null>(null);
  const [foregroundImage, setForegroundImage] = useState<ImageData | null>(null);
  const [transform, setTransform] = useState<Transform>({
    x: 0,
    y: 0,
    scale: 1,
    rotation: 0,
    opacity: 1,
  });

  const handleBackgroundUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setBackgroundImage({
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      toast.success("Background image loaded successfully!");
    };
    img.src = url;
  }, []);

  const handleForegroundUpload = useCallback((file: File) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setForegroundImage({
        file,
        url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      toast.success("Foreground image loaded successfully!");
    };
    img.src = url;
  }, []);

  const handleTransformChange = useCallback((newTransform: Partial<Transform>) => {
    setTransform(prev => ({ ...prev, ...newTransform }));
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Panel - Image Uploads */}
        <div className="w-80 bg-card border-r border-border p-6 overflow-y-auto">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary">Background Image</h2>
              <ImageUpload
                onImageUpload={handleBackgroundUpload}
                imageData={backgroundImage}
                placeholder="Upload background image"
                type="background"
              />
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4 text-primary">Foreground Image</h2>
              <ImageUpload
                onImageUpload={handleForegroundUpload}
                imageData={foregroundImage}
                placeholder="Upload foreground image"
                type="foreground"
              />
            </div>
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-canvas-bg">
          <Canvas
            backgroundImage={backgroundImage}
            foregroundImage={foregroundImage}
            transform={transform}
            onTransformChange={handleTransformChange}
          />
        </div>

        {/* Right Panel - Controls */}
        <div className="w-80 bg-card border-l border-border p-6 overflow-y-auto">
          <ControlPanel
            transform={transform}
            onTransformChange={handleTransformChange}
            foregroundImage={foregroundImage}
          />
        </div>
      </div>

      {/* Bottom Panel - Export */}
      <ExportPanel
        backgroundImage={backgroundImage}
        foregroundImage={foregroundImage}
        transform={transform}
      />
    </div>
  );
};

export default Index;