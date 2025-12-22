import { Volume2, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AudioChannel {
  id: string;
  name: string;
  volume: number;
  isMuted: boolean;
  isActive: boolean;
}

interface AudioMixerProps {
  channels: AudioChannel[];
  masterVolume: number;
  onChannelVolumeChange: (channelId: string, volume: number) => void;
  onChannelMute: (channelId: string, muted: boolean) => void;
  onMasterVolumeChange: (volume: number) => void;
}

export function AudioMixer({
  channels,
  masterVolume,
  onChannelVolumeChange,
  onChannelMute,
  onMasterVolumeChange
}: AudioMixerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Mixer</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {channels.map((channel) => (
            <div key={channel.id} className="space-y-3 p-3 border rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Mic className="h-4 w-4" />
                  <span className="font-medium text-sm">{channel.name}</span>
                </div>
                <div className={`w-2 h-2 rounded-full mx-auto ${
                  channel.isActive ? 'bg-green-500' : 'bg-gray-300'
                }`} />
              </div>
              
              <div className="space-y-2">
                <Slider
                  value={[channel.volume]}
                  onValueChange={(value) => onChannelVolumeChange(channel.id, value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-center">{channel.volume}%</div>
              </div>
              
              <Button
                size="sm"
                variant={channel.isMuted ? "destructive" : "outline"}
                onClick={() => onChannelMute(channel.id, !channel.isMuted)}
                className="w-full"
              >
                {channel.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          ))}
          
          {/* Master Volume */}
          <div className="space-y-3 p-3 border rounded-lg bg-slate-50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Volume2 className="h-4 w-4" />
                <span className="font-medium text-sm">Master</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Slider
                value={[masterVolume]}
                onValueChange={(value) => onMasterVolumeChange(value[0])}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="text-xs text-center">{masterVolume}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}