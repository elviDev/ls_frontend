import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BroadcastData } from "../types";

interface ShareButtonProps {
  streamUrl: string | null;
  currentBroadcast: BroadcastData | null;
  size?: 'sm' | 'md';
}

export function ShareButton({ streamUrl, currentBroadcast, size = 'md' }: ShareButtonProps) {
  if (!streamUrl || !currentBroadcast) return null;

  const handleShare = async () => {
    const shareData = {
      title: `🎙️ Listen Live: ${currentBroadcast.title}`,
      text: `Join the live broadcast: ${currentBroadcast.title}`,
      url: streamUrl
    };
    
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Share cancelled by user');
      }
    } else if (typeof navigator !== 'undefined') {
      try {
        await navigator.clipboard.writeText(streamUrl);
        alert('Share link copied to clipboard!');
      } catch (error) {
        console.error('Failed to copy share URL:', error);
      }
    }
  };

  const buttonSize = size === 'sm' ? 'sm' : 'sm';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <Button 
      variant="outline" 
      size={buttonSize}
      onClick={handleShare}
      className={size === 'sm' ? 'px-2 py-1 h-8' : 'mr-2'}
    >
      <Share2 className={`${iconSize} ${size === 'md' ? 'mr-2' : ''}`} />
      {size === 'md' && 'Share'}
    </Button>
  );
}