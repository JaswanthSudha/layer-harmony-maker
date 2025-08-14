import { Move, RotateCw, Scale, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { Transform, ImageData } from "@/pages/Index";

interface ControlPanelProps {
  transform: Transform;
  onTransformChange: (transform: Partial<Transform>) => void;
  foregroundImage: ImageData | null;
}

export const ControlPanel = ({ transform, onTransformChange, foregroundImage }: ControlPanelProps) => {
  if (!foregroundImage) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground space-y-2">
              <Scale className="h-12 w-12 mx-auto opacity-50" />
              <p className="font-medium">No Foreground Image</p>
              <p className="text-sm">Upload a foreground image to access transformation controls</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Position Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Move className="h-4 w-4 text-primary" />
            <span>Position</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pos-x" className="text-xs text-muted-foreground">X Position</Label>
              <Input
                id="pos-x"
                type="number"
                value={Math.round(transform.x)}
                onChange={(e) => onTransformChange({ x: Number(e.target.value) })}
                className="h-8 text-xs"
              />
            </div>
            <div>
              <Label htmlFor="pos-y" className="text-xs text-muted-foreground">Y Position</Label>
              <Input
                id="pos-y"
                type="number"
                value={Math.round(transform.y)}
                onChange={(e) => onTransformChange({ y: Number(e.target.value) })}
                className="h-8 text-xs"
              />
            </div>
          </div>
          
          <div className="text-center">
            <Badge variant="outline" className="text-xs">
              {Math.round(transform.x)}, {Math.round(transform.y)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Scale Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Scale className="h-4 w-4 text-primary" />
            <span>Scale</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Size</Label>
              <Badge variant="secondary" className="text-xs">
                {Math.round(transform.scale * 100)}%
              </Badge>
            </div>
            <Slider
              value={[transform.scale]}
              onValueChange={([value]) => onTransformChange({ scale: value })}
              min={0.1}
              max={3}
              step={0.05}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="scale-input" className="text-xs text-muted-foreground">Precise Scale</Label>
            <Input
              id="scale-input"
              type="number"
              value={transform.scale.toFixed(2)}
              onChange={(e) => onTransformChange({ scale: Number(e.target.value) })}
              min="0.1"
              max="3"
              step="0.01"
              className="h-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Rotation Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <RotateCw className="h-4 w-4 text-primary" />
            <span>Rotation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Angle</Label>
              <Badge variant="secondary" className="text-xs">
                {Math.round(transform.rotation)}°
              </Badge>
            </div>
            <Slider
              value={[transform.rotation]}
              onValueChange={([value]) => onTransformChange({ rotation: value })}
              min={0}
              max={360}
              step={1}
              className="w-full"
            />
          </div>
          
          <div>
            <Label htmlFor="rotation-input" className="text-xs text-muted-foreground">Precise Angle</Label>
            <Input
              id="rotation-input"
              type="number"
              value={Math.round(transform.rotation)}
              onChange={(e) => onTransformChange({ rotation: Number(e.target.value) })}
              min="0"
              max="360"
              className="h-8 text-xs"
            />
          </div>
        </CardContent>
      </Card>

      {/* Opacity Controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center space-x-2">
            <Eye className="h-4 w-4 text-primary" />
            <span>Opacity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Transparency</Label>
              <Badge variant="secondary" className="text-xs">
                {Math.round(transform.opacity * 100)}%
              </Badge>
            </div>
            <Slider
              value={[transform.opacity]}
              onValueChange={([value]) => onTransformChange({ opacity: value })}
              min={0}
              max={1}
              step={0.01}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Image Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Image Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Original Size:</span>
            <span>{foregroundImage.width} × {foregroundImage.height}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">File Size:</span>
            <span>{(foregroundImage.file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Format:</span>
            <span>{foregroundImage.file.type.split('/')[1].toUpperCase()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};