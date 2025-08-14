import { useEffect, useRef, useState, useCallback } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ImageData, Transform } from "@/pages/Index";

interface CanvasProps {
  backgroundImage: ImageData | null;
  foregroundImage: ImageData | null;
  transform: Transform;
  onTransformChange: (transform: Partial<Transform>) => void;
}

export const Canvas = ({ backgroundImage, foregroundImage, transform, onTransformChange }: CanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Update canvas size based on background image
  useEffect(() => {
    if (backgroundImage) {
      const maxWidth = 800;
      const maxHeight = 600;
      const aspectRatio = backgroundImage.width / backgroundImage.height;
      
      let width = backgroundImage.width;
      let height = backgroundImage.height;
      
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
      
      setCanvasSize({ width, height });
    }
  }, [backgroundImage]);

  // Render the canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !backgroundImage) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background image
    const bgImg = new Image();
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

      // Draw foreground image if available
      if (foregroundImage) {
        const fgImg = new Image();
        fgImg.onload = () => {
          ctx.save();

          // Apply transformations
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;

          ctx.globalAlpha = transform.opacity;
          ctx.translate(centerX + transform.x, centerY + transform.y);
          ctx.rotate((transform.rotation * Math.PI) / 180);
          ctx.scale(transform.scale, transform.scale);

          // Draw foreground image centered
          const scaledWidth = (foregroundImage.width * canvasSize.width) / backgroundImage.width;
          const scaledHeight = (foregroundImage.height * canvasSize.height) / backgroundImage.height;
          
          ctx.drawImage(
            fgImg,
            -scaledWidth / 2,
            -scaledHeight / 2,
            scaledWidth,
            scaledHeight
          );

          ctx.restore();
        };
        fgImg.src = foregroundImage.url;
      }
    };
    bgImg.src = backgroundImage.url;
  }, [backgroundImage, foregroundImage, transform, canvasSize]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!foregroundImage) return;
    
    setIsDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({
        x: e.clientX - rect.left - transform.x,
        y: e.clientY - rect.top - transform.y,
      });
    }
  }, [foregroundImage, transform]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !foregroundImage) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const newX = e.clientX - rect.left - dragStart.x;
      const newY = e.clientY - rect.top - dragStart.y;
      
      onTransformChange({ x: newX, y: newY });
    }
  }, [isDragging, foregroundImage, dragStart, onTransformChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const newZoom = direction === 'in' ? Math.min(zoom * 1.2, 3) : Math.max(zoom / 1.2, 0.5);
    setZoom(newZoom);
  }, [zoom]);

  const resetTransform = useCallback(() => {
    onTransformChange({ x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 });
  }, [onTransformChange]);

  return (
    <div className="h-full flex flex-col">
      {/* Canvas Controls */}
      <div className="p-4 bg-card border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Canvas: {canvasSize.width} × {canvasSize.height}
          </Badge>
          {foregroundImage && (
            <Badge variant="outline" className="text-xs">
              Position: {Math.round(transform.x)}, {Math.round(transform.y)}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Badge variant="secondary" className="text-xs">
            {Math.round(zoom * 100)}%
          </Badge>
          <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={resetTransform}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-8 overflow-auto canvas-grid" ref={containerRef}>
        <div className="flex items-center justify-center min-h-full">
          {backgroundImage ? (
            <div 
              className="relative border-2 border-canvas-border rounded-lg overflow-hidden shadow-elegant"
              style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
            >
              <canvas
                ref={canvasRef}
                className={`block ${foregroundImage ? 'cursor-move' : 'cursor-default'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
              
              {foregroundImage && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="text-xs bg-background/80">
                    <Move className="h-3 w-3 mr-1" />
                    Drag to position
                  </Badge>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4 text-muted-foreground">
              <div className="w-32 h-32 mx-auto border-2 border-dashed border-muted rounded-lg flex items-center justify-center">
                <Move className="h-12 w-12" />
              </div>
              <div>
                <p className="text-lg font-medium">No Background Image</p>
                <p className="text-sm">Upload a background image to start compositing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};