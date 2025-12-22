import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScheduleItem } from "../types";

interface ScheduleSheetProps {
  schedule: ScheduleItem[];
  size?: 'sm' | 'md';
}

export function ScheduleSheet({ schedule, size = 'md' }: ScheduleSheetProps) {
  const renderScheduleGroup = (items: ScheduleItem[], title: string) => (
    <div>
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between p-3 rounded-lg bg-muted">
            <div>
              <p className="font-medium">{item.show}</p>
              <p className="text-sm text-muted-foreground">with {item.host}</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium">{item.time}</div>
              {!["Weekdays", "Weekends", "Saturday", "Sunday"].includes(item.day) && (
                <div className="text-xs text-muted-foreground">{item.day}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="link" 
          size={size === 'sm' ? 'sm' : 'default'}
          className={`text-primary ${size === 'md' ? 'ml-4' : 'px-2'}`}
        >
          <Calendar className={`${size === 'sm' ? 'h-3 w-3 mr-1' : 'h-4 w-4 mr-2'}`} />
          <span className={size === 'sm' ? 'text-xs' : ''}>Schedule</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle>Broadcast Schedule</SheetTitle>
          <SheetDescription>Check out our weekly programming schedule</SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-full py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              {renderScheduleGroup(
                schedule.filter(item => item.day === "Weekdays"),
                "Weekdays"
              )}
              {renderScheduleGroup(
                schedule.filter(item => 
                  !["Weekdays", "Weekends", "Saturday", "Sunday"].includes(item.day)
                ),
                "Special Shows"
              )}
            </div>
            <div>
              {renderScheduleGroup(
                schedule.filter(item => item.day === "Weekends"),
                "Weekends"
              )}
              {renderScheduleGroup(
                schedule.filter(item => item.day === "Saturday"),
                "Saturday"
              )}
              {renderScheduleGroup(
                schedule.filter(item => item.day === "Sunday"),
                "Sunday"
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}