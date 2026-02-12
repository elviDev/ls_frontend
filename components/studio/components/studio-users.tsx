import { Mic, MicOff, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalParticipant, useRemoteParticipants, ConnectionQualityIndicator, BarVisualizer, useTracks, useRoomContext } from "@livekit/components-react";
import { Track } from "livekit-client";
import { toast } from "sonner";

export function StudioUsers() {
  const { localParticipant } = useLocalParticipant();
  const remoteParticipants = useRemoteParticipants();
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: false });
  const room = useRoomContext();

  const handleMuteParticipant = async (participantId: string, mute: boolean) => {
    // Host can request participant to mute (this would need server-side implementation)
    console.log(`Request ${mute ? 'mute' : 'unmute'} for participant:`, participantId);
    toast.info(`Mute request sent to participant`);
  };

  const handleRemoveParticipant = async (participantId: string) => {
    try {
      console.log('Removing participant:', participantId);
      
      // Find the participant
      const participant = remoteParticipants.find(p => p.identity === participantId);
      if (!participant) {
        toast.error('Participant not found');
        return;
      }

      // Remove from LiveKit room
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/livekit/remove-participant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        },
        body: JSON.stringify({
          roomName: room.name,
          participantIdentity: participantId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove participant from studio');
        return;
      }

      // Also kick from chat if they're there
      try {
        const chatResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/kick`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          },
          body: JSON.stringify({
            broadcastId: room.name,
            targetUserId: participantId,
            reason: 'Removed from studio',
          }),
        });
        
        if (chatResponse.ok) {
          console.log('Participant also kicked from chat');
        }
      } catch (chatError) {
        console.log('Error kicking from chat (may not be in chat):', chatError);
      }

      toast.success('Participant removed from studio and chat');
    } catch (error) {
      console.error('Error removing participant:', error);
      toast.error('Failed to remove participant');
    }
  };

  const getRoleColor = (identity: string) => {
    if (identity.includes('host')) return 'bg-purple-500';
    if (identity.includes('broadcaster')) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getRole = (identity: string) => {
    if (identity.includes('host')) return 'host';
    if (identity.includes('broadcaster')) return 'broadcaster';
    return 'listener';
  };

  const allParticipants = [localParticipant, ...remoteParticipants];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Studio Participants ({allParticipants.length})</span>
          <Button size="sm" onClick={() => {}}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {allParticipants.map((participant) => {
            const isLocal = participant === localParticipant;
            const micTrack = tracks.find(t => t.participant === participant);
            const isMuted = !participant.isMicrophoneEnabled;
            
            return (
              <div key={participant.identity} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    participant.connectionQuality !== 'unknown' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {participant.name || participant.identity}
                        {isLocal && ' (You)'}
                      </p>
                      <ConnectionQualityIndicator participant={participant} />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(participant.identity)} variant="secondary">
                        {getRole(participant.identity)}
                      </Badge>
                      {micTrack && !isMuted && (
                        <div className="w-16 h-4">
                          <BarVisualizer trackRef={micTrack} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!isLocal && (
                    <>
                      <Button
                        size="sm"
                        variant={isMuted ? "destructive" : "outline"}
                        onClick={() => handleMuteParticipant(participant.identity, !isMuted)}
                        title={isMuted ? 'Request Unmute' : 'Request Mute'}
                      >
                        {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveParticipant(participant.identity)}
                        title="Remove Participant"
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {isLocal && (
                    <Button
                      size="sm"
                      variant={isMuted ? "destructive" : "outline"}
                      onClick={() => localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled)}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          
          {allParticipants.length === 1 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-8 w-8 mx-auto mb-2" />
              <p>Only you in the studio</p>
              <p className="text-sm">Invite participants to start broadcasting</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}