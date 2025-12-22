interface AudioVisualizerProps {
  isPlaying: boolean;
  audioLevel: number;
  barCount?: number;
  size?: 'sm' | 'md';
}

export function AudioVisualizer({ 
  isPlaying, 
  audioLevel, 
  barCount = 5, 
  size = 'md' 
}: AudioVisualizerProps) {
  const barWidth = size === 'sm' ? 'w-1' : 'w-1';
  const minHeight = size === 'sm' ? 4 : 5;
  const maxMultiplier = size === 'sm' ? 0.2 : 0.3;
  const maxRandom = size === 'sm' ? 8 : 10;

  return (
    <div className="flex space-x-1">
      {[...Array(barCount)].map((_, i) => (
        <div
          key={i}
          className={`${barWidth} bg-primary rounded-full ${isPlaying ? 'animate-pulse' : ''}`}
          style={{
            animationDuration: `${0.5 + Math.random() * 0.5}s`,
            height: `${
              isPlaying 
                ? Math.max(minHeight, audioLevel * maxMultiplier + Math.floor(Math.random() * maxRandom)) 
                : minHeight
            }px`,
          }}
        />
      ))}
    </div>
  );
}