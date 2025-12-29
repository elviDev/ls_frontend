import { create } from "zustand";

interface BroadcastFormData {
  title: string;
  description: string;
  startTime: Date | undefined;
  startTimeHour: string;
  startTimeMinute: string;
  endTime: Date | undefined;
  endTimeHour: string;
  endTimeMinute: string;
  hostId: string;
  programId: string;
  bannerId: string;
  bannerFile: File | null;
  staff: { userId: string; role: string }[];
  guests: { name: string; title: string; role: string }[];
}

interface BroadcastStore {
  formData: BroadcastFormData;
  currentBroadcast: any;
  currentShow: string;
  selectedBroadcast: any;
  broadcasts: any[];
  upcomingBroadcasts: any[];
  broadcastEvents: { live: any; upcoming: any } | null;
  
  // Form management
  setFormData: (data: Partial<BroadcastFormData>) => void;
  resetForm: () => void;
  
  // Broadcast state management
  setBroadcast: (broadcast: any) => void;
  setCurrentShow: (show: string) => void;
  setSelectedBroadcast: (broadcast: any) => void;
  setBroadcasts: (broadcasts: any[]) => void;
  setUpcomingBroadcasts: (broadcasts: any[]) => void;
  setBroadcastEvents: (events: { live: any; upcoming: any }) => void;
  
  // Staff management
  addStaffMember: (userId: string, role: string) => void;
  removeStaffMember: (index: number) => void;
  updateStaffMember: (index: number, field: 'userId' | 'role', value: string) => void;
  
  // Guest management
  addGuest: () => void;
  removeGuest: (index: number) => void;
  updateGuest: (index: number, field: 'name' | 'title' | 'role', value: string) => void;
  
  // Broadcast operations
  updateBroadcastInList: (id: string, updates: any) => void;
  removeBroadcastFromList: (id: string) => void;
  addBroadcastToList: (broadcast: any) => void;
}

const defaultFormData: BroadcastFormData = {
  title: "",
  description: "",
  startTime: undefined,
  startTimeHour: "09",
  startTimeMinute: "00",
  endTime: undefined,
  endTimeHour: "10",
  endTimeMinute: "00",
  hostId: "",
  programId: "",
  bannerId: "",
  bannerFile: null,
  staff: [],
  guests: []
};

export const useBroadcastStore = create<BroadcastStore>((set) => ({
  formData: defaultFormData,
  currentBroadcast: null,
  currentShow: 'No live broadcast',
  selectedBroadcast: null,
  broadcasts: [],
  upcomingBroadcasts: [],
  broadcastEvents: null,
  
  // Form management
  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data }
    })),
  
  resetForm: () =>
    set({ formData: defaultFormData }),
  
  // Broadcast state management
  setBroadcast: (broadcast) =>
    set({ currentBroadcast: broadcast }),
  
  setCurrentShow: (show) =>
    set({ currentShow: show }),
  
  setSelectedBroadcast: (broadcast) =>
    set({ selectedBroadcast: broadcast }),
  
  setBroadcasts: (broadcasts) =>
    set({ broadcasts }),
  
  setUpcomingBroadcasts: (broadcasts) =>
    set({ upcomingBroadcasts: broadcasts }),
  
  setBroadcastEvents: (events) =>
    set({ broadcastEvents: events }),
  
  // Staff management
  addStaffMember: (userId, role) =>
    set((state) => ({
      formData: {
        ...state.formData,
        staff: [...state.formData.staff, { userId, role }]
      }
    })),
  
  removeStaffMember: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        staff: state.formData.staff.filter((_, i) => i !== index)
      }
    })),
  
  updateStaffMember: (index, field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        staff: state.formData.staff.map((member, i) =>
          i === index ? { ...member, [field]: value } : member
        )
      }
    })),
  
  // Guest management
  addGuest: () =>
    set((state) => ({
      formData: {
        ...state.formData,
        guests: [...state.formData.guests, { name: "", title: "", role: "Guest" }]
      }
    })),
  
  removeGuest: (index) =>
    set((state) => ({
      formData: {
        ...state.formData,
        guests: state.formData.guests.filter((_, i) => i !== index)
      }
    })),
  
  updateGuest: (index, field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        guests: state.formData.guests.map((guest, i) =>
          i === index ? { ...guest, [field]: value } : guest
        )
      }
    })),
  
  // Broadcast operations
  updateBroadcastInList: (id, updates) =>
    set((state) => ({
      broadcasts: state.broadcasts.map(broadcast =>
        broadcast.id === id ? { ...broadcast, ...updates } : broadcast
      ),
      upcomingBroadcasts: state.upcomingBroadcasts.map(broadcast =>
        broadcast.id === id ? { ...broadcast, ...updates } : broadcast
      )
    })),
  
  removeBroadcastFromList: (id) =>
    set((state) => ({
      broadcasts: state.broadcasts.filter(broadcast => broadcast.id !== id),
      upcomingBroadcasts: state.upcomingBroadcasts.filter(broadcast => broadcast.id !== id)
    })),
  
  addBroadcastToList: (broadcast) =>
    set((state) => ({
      broadcasts: [broadcast, ...state.broadcasts]
    })),
}));