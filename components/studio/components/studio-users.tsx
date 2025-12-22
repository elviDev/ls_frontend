import { Mic, MicOff, UserPlus, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StudioUser {
  id: string;
  username: string;
  role: 'host' | 'co-host' | 'guest';
  isConnected: boolean;
  isMuted: boolean;
  audioLevel: number;
}

interface StudioUsersProps {
  users: StudioUser[];
  onAddUser: (user: StudioUser) => void;
  onRemoveUser: (userId: string) => void;
  onToggleMute: (userId: string, muted: boolean) => void;
}

export function StudioUsers({
  users,
  onAddUser,
  onRemoveUser,
  onToggleMute
}: StudioUsersProps) {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'host': return 'bg-purple-500';
      case 'co-host': return 'bg-blue-500';
      case 'guest': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Studio Users ({users.length})</span>
          <Button size="sm" onClick={() => {}}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  user.isConnected ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div>
                  <p className="font-medium">{user.username}</p>
                  <div className="flex items-center gap-2">
                    <Badge className={getRoleColor(user.role)} variant="secondary">
                      {user.role}
                    </Badge>
                    {user.audioLevel > 0 && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(user.audioLevel)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant={user.isMuted ? "destructive" : "outline"}
                  onClick={() => onToggleMute(user.id, !user.isMuted)}
                >
                  {user.isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onRemoveUser(user.id)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {users.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <UserPlus className="h-8 w-8 mx-auto mb-2" />
              <p>No users in studio</p>
              <p className="text-sm">Add users to start broadcasting</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}