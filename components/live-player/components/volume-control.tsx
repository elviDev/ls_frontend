import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: () => void;
  className?: string;
}

export function VolumeControl({ 
  volume, 
  isMuted, 
  onVolumeChange, 
  onMuteToggle, 
  className = "" 
}: VolumeControlProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        onClick={onMuteToggle}
        variant="ghost"
        size="icon"
        className="text-muted-foreground flex-shrink-0"
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>
      <Slider
        value={[volume]}
        min={0}
        max={100}
        step={1}
        onValueChange={(value) => onVolumeChange(value[0])}
        className="flex-1"
      />
    </div>
  );
}