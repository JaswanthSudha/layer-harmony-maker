import { Layers, Sparkles } from "lucide-react";

export const Header = () => {
  return (
    <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Layers className="h-8 w-8 text-primary" />
          <Sparkles className="h-4 w-4 text-accent absolute -top-1 -right-1" />
        </div>
        <div>
          <h1 className="text-xl font-bold gradient-primary bg-clip-text text-transparent">
            Image Compositor
          </h1>
          <p className="text-sm text-muted-foreground">Professional mask generator</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <span>v1.0</span>
        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
        <span>Ready</span>
      </div>
    </header>
  );
};