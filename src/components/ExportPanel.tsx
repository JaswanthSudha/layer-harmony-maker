import { useState, useCallback } from "react";
import { Download, Image as ImageIcon, Layers, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { ImageData, Transform } from "@/pages/Index";

interface ExportPanelProps {
  backgroundImage: ImageData | null;
  foregroundImage: ImageData | null;
  transform: Transform;
}

export const ExportPanel = ({ backgroundImage, foregroundImage, transform }: ExportPanelProps) => {
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [isExporting, setIsExporting] = useState(false);

  const generateComposite = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!backgroundImage) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = backgroundImage.width;
    canvas.height = backgroundImage.height;

    // Draw background
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    
    return new Promise((resolve) => {
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

        if (foregroundImage) {
          const fgImg = new Image();
          fgImg.crossOrigin = "anonymous";
          
          fgImg.onload = () => {
            ctx.save();

            // Apply transformations - scale positions from canvas display to actual image size
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // Calculate scale factor from display canvas to actual image
            const maxDisplayWidth = 800;
            const maxDisplayHeight = 600;
            const aspectRatio = backgroundImage.width / backgroundImage.height;
            
            let displayWidth = backgroundImage.width;
            let displayHeight = backgroundImage.height;
            
            if (displayWidth > maxDisplayWidth) {
              displayWidth = maxDisplayWidth;
              displayHeight = displayWidth / aspectRatio;
            }
            
            if (displayHeight > maxDisplayHeight) {
              displayHeight = maxDisplayHeight;
              displayWidth = displayHeight * aspectRatio;
            }
            
            const scaleFactorX = canvas.width / displayWidth;
            const scaleFactorY = canvas.height / displayHeight;

            ctx.globalAlpha = transform.opacity;
            ctx.translate(centerX + (transform.x * scaleFactorX), centerY + (transform.y * scaleFactorY));
            ctx.rotate((transform.rotation * Math.PI) / 180);
            ctx.scale(transform.scale, transform.scale);

            // Draw foreground image with original dimensions
            ctx.drawImage(
              fgImg,
              -foregroundImage.width / 2,
              -foregroundImage.height / 2,
              foregroundImage.width,
              foregroundImage.height
            );

            ctx.restore();
            resolve(canvas);
          };
          fgImg.src = foregroundImage.url;
        } else {
          resolve(canvas);
        }
      };
      bgImg.src = backgroundImage.url;
    });
  }, [backgroundImage, foregroundImage, transform]);

  const generateMask = useCallback(async (): Promise<HTMLCanvasElement | null> => {
    if (!backgroundImage || !foregroundImage) return null;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    canvas.width = backgroundImage.width;
    canvas.height = backgroundImage.height;

    // Fill with black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Create mask for foreground
    const fgImg = new Image();
    fgImg.crossOrigin = "anonymous";
    
    return new Promise((resolve) => {
      fgImg.onload = () => {
        ctx.save();

        // Apply transformations - scale positions from canvas display to actual image size
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Calculate scale factor from display canvas to actual image
        const maxDisplayWidth = 800;
        const maxDisplayHeight = 600;
        const aspectRatio = backgroundImage.width / backgroundImage.height;
        
        let displayWidth = backgroundImage.width;
        let displayHeight = backgroundImage.height;
        
        if (displayWidth > maxDisplayWidth) {
          displayWidth = maxDisplayWidth;
          displayHeight = displayWidth / aspectRatio;
        }
        
        if (displayHeight > maxDisplayHeight) {
          displayHeight = maxDisplayHeight;
          displayWidth = displayHeight * aspectRatio;
        }
        
        const scaleFactorX = canvas.width / displayWidth;
        const scaleFactorY = canvas.height / displayHeight;

        ctx.translate(centerX + (transform.x * scaleFactorX), centerY + (transform.y * scaleFactorY));
        ctx.rotate((transform.rotation * Math.PI) / 180);
        ctx.scale(transform.scale, transform.scale);

        // Create a temporary canvas to extract alpha channel
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) {
          resolve(null);
          return;
        }

        tempCanvas.width = foregroundImage.width;
        tempCanvas.height = foregroundImage.height;
        tempCtx.drawImage(fgImg, 0, 0);

        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;

        // Convert to binary mask
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
          const isOpaque = alpha > 128;
          data[i] = isOpaque ? 255 : 0;     // R
          data[i + 1] = isOpaque ? 255 : 0; // G
          data[i + 2] = isOpaque ? 255 : 0; // B
          data[i + 3] = 255;                // A
        }

        tempCtx.putImageData(imageData, 0, 0);

        // Draw the mask to main canvas
        ctx.drawImage(
          tempCanvas,
          -foregroundImage.width / 2,
          -foregroundImage.height / 2,
          foregroundImage.width,
          foregroundImage.height
        );

        ctx.restore();
        resolve(canvas);
      };
      fgImg.src = foregroundImage.url;
    });
  }, [backgroundImage, foregroundImage, transform]);

  const downloadCanvas = useCallback((canvas: HTMLCanvasElement, filename: string, format: string) => {
    const link = document.createElement('a');
    link.download = filename;
    
    if (format === 'jpg') {
      link.href = canvas.toDataURL('image/jpeg', 0.9);
    } else {
      link.href = canvas.toDataURL('image/png');
    }
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleExportComposite = useCallback(async () => {
    if (!backgroundImage) {
      toast.error("No background image to export");
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await generateComposite();
      if (canvas) {
        const filename = `composite_${Date.now()}.${exportFormat}`;
        downloadCanvas(canvas, filename, exportFormat);
        toast.success("Composite image exported successfully!");
      }
    } catch (error) {
      toast.error("Failed to export composite image");
    } finally {
      setIsExporting(false);
    }
  }, [backgroundImage, generateComposite, exportFormat, downloadCanvas]);

  const handleExportMask = useCallback(async () => {
    if (!backgroundImage || !foregroundImage) {
      toast.error("Need both background and foreground images to generate mask");
      return;
    }

    setIsExporting(true);
    try {
      const canvas = await generateMask();
      if (canvas) {
        const filename = `mask_${Date.now()}.png`;
        downloadCanvas(canvas, filename, 'png');
        toast.success("Mask exported successfully!");
      }
    } catch (error) {
      toast.error("Failed to export mask");
    } finally {
      setIsExporting(false);
    }
  }, [backgroundImage, foregroundImage, generateMask, downloadCanvas]);

  const handleExportBoth = useCallback(async () => {
    if (!backgroundImage || !foregroundImage) {
      toast.error("Need both images to export");
      return;
    }

    setIsExporting(true);
    try {
      const [compositeCanvas, maskCanvas] = await Promise.all([
        generateComposite(),
        generateMask()
      ]);

      if (compositeCanvas && maskCanvas) {
        const timestamp = Date.now();
        downloadCanvas(compositeCanvas, `composite_${timestamp}.${exportFormat}`, exportFormat);
        downloadCanvas(maskCanvas, `mask_${timestamp}.png`, 'png');
        toast.success("Both images exported successfully!");
      }
    } catch (error) {
      toast.error("Failed to export images");
    } finally {
      setIsExporting(false);
    }
  }, [backgroundImage, foregroundImage, generateComposite, generateMask, exportFormat, downloadCanvas]);

  const canExport = backgroundImage !== null;
  const canExportMask = backgroundImage !== null && foregroundImage !== null;

  return (
    <Card className="m-4">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Download className="h-5 w-5 text-primary" />
              <span className="font-semibold">Export Options</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Format:</span>
              <Select value={exportFormat} onValueChange={(value: 'png' | 'jpg') => setExportFormat(value)}>
                <SelectTrigger className="w-20 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpg">JPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportComposite}
              disabled={!canExport || isExporting}
              className="flex items-center space-x-2"
            >
              <ImageIcon className="h-4 w-4" />
              <span>Export Composite</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMask}
              disabled={!canExportMask || isExporting}
              className="flex items-center space-x-2"
            >
              <FileImage className="h-4 w-4" />
              <span>Export Mask</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handleExportBoth}
              disabled={!canExportMask || isExporting}
              className="flex items-center space-x-2 gradient-primary"
            >
              <Layers className="h-4 w-4" />
              <span>Export Both</span>
            </Button>
          </div>
        </div>

        {!canExport && (
          <div className="mt-3 text-sm text-muted-foreground flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">Info</Badge>
            <span>Upload a background image to enable export options</span>
          </div>
        )}

        {canExport && !canExportMask && (
          <div className="mt-3 text-sm text-muted-foreground flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">Info</Badge>
            <span>Upload a foreground image to enable mask generation</span>
          </div>
        )}
      </div>
    </Card>
  );
};