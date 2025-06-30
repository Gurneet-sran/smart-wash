export interface Location {
  id: string;
  name: string;
  pincode: string;
  distanceFromOffice: number; // in km
}

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
}

export interface WashService {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: number; // in minutes
}

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  location: Location;
  timeSlot: TimeSlot;
  washService: WashService;
  totalPrice: number;
  fuelCharge: number;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export interface BookingFormData {
  customerName: string;
  customerPhone: string;
  location?: Location;
  timeSlot?: TimeSlot;
  washService?: WashService;
} 