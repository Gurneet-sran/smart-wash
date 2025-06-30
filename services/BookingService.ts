import { Booking, Location, TimeSlot, WashService } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Sample locations in Sikkim
export const SIKKIM_LOCATIONS: Location[] = [
  { id: '1', name: 'Gangtok', pincode: '737101', distanceFromOffice: 0 },
  { id: '2', name: 'Namchi', pincode: '737126', distanceFromOffice: 78 },
  { id: '3', name: 'Pelling', pincode: '737113', distanceFromOffice: 115 },
  { id: '4', name: 'Mangan', pincode: '737116', distanceFromOffice: 68 },
  { id: '5', name: 'Geyzing', pincode: '737111', distanceFromOffice: 110 },
  { id: '6', name: 'Jorethang', pincode: '737121', distanceFromOffice: 95 },
  { id: '7', name: 'Rangpo', pincode: '737132', distanceFromOffice: 45 },
];

// Wash service types
export const WASH_SERVICES: WashService[] = [
  {
    id: 'normal',
    name: 'Normal Wash',
    description: 'Basic exterior wash with soap and water',
    basePrice: 150,
    duration: 30,
  },
  {
    id: 'premium',
    name: 'Premium Wash',
    description: 'Complete wash with interior cleaning, wax, and polish',
    basePrice: 300,
    duration: 60,
  },
];

// Fuel cost per km
const FUEL_COST_PER_KM = 8;

export class BookingService {
  private static BOOKINGS_KEY = 'smartwash_bookings';
  private static TIMESLOTS_KEY = 'smartwash_timeslots';

  // Generate time slots for the next 7 days
  static generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      
      // Generate slots from 9 AM to 6 PM
      for (let hour = 9; hour <= 18; hour++) {
        const timeSlot: TimeSlot = {
          id: `${date.toISOString().split('T')[0]}_${hour}`,
          date: date.toISOString().split('T')[0],
          time: `${hour.toString().padStart(2, '0')}:00`,
          isAvailable: true,
          isBooked: false,
        };
        slots.push(timeSlot);
      }
    }
    
    return slots;
  }

  // Calculate total price including fuel charges
  static calculateTotalPrice(washService: WashService, location: Location): number {
    const fuelCharge = location.distanceFromOffice * FUEL_COST_PER_KM * 2; // Round trip
    return washService.basePrice + fuelCharge;
  }

  // Calculate fuel charge
  static calculateFuelCharge(location: Location): number {
    return location.distanceFromOffice * FUEL_COST_PER_KM * 2; // Round trip
  }

  // Validate if location is in Sikkim
  static isValidSikkimLocation(pincode: string): boolean {
    return SIKKIM_LOCATIONS.some(loc => loc.pincode === pincode);
  }

  // Get location by pincode
  static getLocationByPincode(pincode: string): Location | undefined {
    return SIKKIM_LOCATIONS.find(loc => loc.pincode === pincode);
  }

  // Save booking
  static async saveBooking(booking: Booking): Promise<void> {
    try {
      const existingBookings = await this.getBookings();
      const updatedBookings = [...existingBookings, booking];
      await AsyncStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(updatedBookings));
      
      // Mark time slot as booked
      await this.updateTimeSlotStatus(booking.timeSlot.id, false, true);
    } catch (error) {
      console.error('Error saving booking:', error);
      throw error;
    }
  }

  // Get all bookings
  static async getBookings(): Promise<Booking[]> {
    try {
      const bookingsJson = await AsyncStorage.getItem(this.BOOKINGS_KEY);
      return bookingsJson ? JSON.parse(bookingsJson) : [];
    } catch (error) {
      console.error('Error getting bookings:', error);
      return [];
    }
  }

  // Get time slots
  static async getTimeSlots(): Promise<TimeSlot[]> {
    try {
      let timeSlotsJson = await AsyncStorage.getItem(this.TIMESLOTS_KEY);
      if (!timeSlotsJson) {
        // Generate initial time slots
        const initialSlots = this.generateTimeSlots();
        await AsyncStorage.setItem(this.TIMESLOTS_KEY, JSON.stringify(initialSlots));
        return initialSlots;
      }
      return JSON.parse(timeSlotsJson);
    } catch (error) {
      console.error('Error getting time slots:', error);
      return this.generateTimeSlots();
    }
  }

  // Update time slot status
  static async updateTimeSlotStatus(slotId: string, isAvailable: boolean, isBooked: boolean): Promise<void> {
    try {
      const timeSlots = await this.getTimeSlots();
      const updatedSlots = timeSlots.map(slot => 
        slot.id === slotId 
          ? { ...slot, isAvailable, isBooked }
          : slot
      );
      await AsyncStorage.setItem(this.TIMESLOTS_KEY, JSON.stringify(updatedSlots));
    } catch (error) {
      console.error('Error updating time slot:', error);
      throw error;
    }
  }

  // Update booking status
  static async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
    try {
      const bookings = await this.getBookings();
      const updatedBookings = bookings.map(booking =>
        booking.id === bookingId ? { ...booking, status } : booking
      );
      await AsyncStorage.setItem(this.BOOKINGS_KEY, JSON.stringify(updatedBookings));
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  }
} 