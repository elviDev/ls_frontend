import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayButtonProps {
  isPlaying: boolean;
  isLoading: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md';
}

export function PlayButton({ isPlaying, isLoading, onToggle, size = 'md' }: PlayButtonProps) {
  const sizeClasses = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <Button
      onClick={onToggle}
      variant="ghost"
      size="icon"
      disabled={isLoading}
      className={`${sizeClasses} rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex-shrink-0`}
    >
      {isLoading ? (
        <div className={`${iconSize} border-2 border-brand-700 border-t-transparent rounded-full animate-spin`} />
      ) : isPlaying ? (
        <Pause className={iconSize} />
      ) : (
        <Play className={iconSize} />
      )}
    </Button>
  );
}