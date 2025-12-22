"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Broadcast } from "../types"

interface BroadcastTeamCardProps {
  broadcast: Broadcast
}

export function BroadcastTeamCard({ broadcast }: BroadcastTeamCardProps) {
  return (
    <Card className="mb-4 sm:mb-6">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
          <span>Broadcast Team</span>
          <Badge variant="outline" className="text-xs">
            {broadcast.staff.length + broadcast.guests.length} members
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-xs sm:text-sm">
              Staff ({broadcast.staff.length})
            </h4>
            <div className="space-y-1">
              {broadcast.staff.map((staff) => (
                <div
                  key={staff.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {staff.user.firstName.charAt(0)}
                      {staff.user.lastName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {staff.user.firstName} {staff.user.lastName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {staff.role.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={staff.isActive ? "default" : "secondary"}
                    className="text-xs flex-shrink-0"
                  >
                    {staff.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {broadcast.guests.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-xs sm:text-sm">
                Guests ({broadcast.guests.length})
              </h4>
              <div className="space-y-1">
                {broadcast.guests.map((guest) => (
                  <div
                    key={guest.id}
                    className="flex items-center justify-between p-2 bg-green-50 rounded"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                        {guest.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm font-medium truncate">
                          {guest.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {guest.title || guest.role}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      Guest
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}