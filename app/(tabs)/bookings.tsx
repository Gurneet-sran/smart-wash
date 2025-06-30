import { BookingService, SIKKIM_LOCATIONS, WASH_SERVICES } from '@/services/BookingService';
import { Booking } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  // Generate test bookings for demonstration
  const generateTestBookings = (): Booking[] => {
    const testBookings: Booking[] = [
      {
        id: 'test_001',
        customerName: 'Rajesh Kumar',
        customerPhone: '+91 9876543210',
        location: SIKKIM_LOCATIONS[0], // Gangtok
        washService: WASH_SERVICES[1], // Premium Wash
        timeSlot: {
          id: '2024-01-15_14',
          date: '2024-01-15',
          time: '14:00',
          isAvailable: false,
          isBooked: true,
        },
        totalPrice: 300,
        fuelCharge: 0,
        status: 'completed',
        createdAt: '2024-01-14T10:30:00.000Z',
        notes: 'Car was very dirty, excellent service!'
      },
      {
        id: 'test_002',
        customerName: 'Priya Sharma',
        customerPhone: '+91 9876543211',
        location: SIKKIM_LOCATIONS[1], // Namchi
        washService: WASH_SERVICES[0], // Normal Wash
        timeSlot: {
          id: '2024-01-16_11',
          date: '2024-01-16',
          time: '11:00',
          isAvailable: false,
          isBooked: true,
        },
        totalPrice: 1398, // 150 + (78 * 8 * 2)
        fuelCharge: 1248,
        status: 'confirmed',
        createdAt: '2024-01-15T14:20:00.000Z',
      },
      {
        id: 'test_003',
        customerName: 'Amit Rai',
        customerPhone: '+91 9876543212',
        location: SIKKIM_LOCATIONS[2], // Pelling
        washService: WASH_SERVICES[1], // Premium Wash
        timeSlot: {
          id: '2024-01-17_10',
          date: '2024-01-17',
          time: '10:00',
          isAvailable: false,
          isBooked: true,
        },
        totalPrice: 2140, // 300 + (115 * 8 * 2)
        fuelCharge: 1840,
        status: 'in-progress',
        createdAt: '2024-01-16T09:15:00.000Z',
        notes: 'Please call 10 minutes before arrival'
      },
      {
        id: 'test_004',
        customerName: 'Sunita Devi',
        customerPhone: '+91 9876543213',
        location: SIKKIM_LOCATIONS[6], // Rangpo
        washService: WASH_SERVICES[0], // Normal Wash
        timeSlot: {
          id: '2024-01-18_15',
          date: '2024-01-18',
          time: '15:00',
          isAvailable: false,
          isBooked: true,
        },
        totalPrice: 870, // 150 + (45 * 8 * 2)
        fuelCharge: 720,
        status: 'pending',
        createdAt: '2024-01-17T16:45:00.000Z',
      },
      {
        id: 'test_005',
        customerName: 'Deepak Tamang',
        customerPhone: '+91 9876543214',
        location: SIKKIM_LOCATIONS[3], // Mangan
        washService: WASH_SERVICES[1], // Premium Wash
        timeSlot: {
          id: '2024-01-19_13',
          date: '2024-01-19',
          time: '13:00',
          isAvailable: false,
          isBooked: true,
        },
        totalPrice: 1388, // 300 + (68 * 8 * 2)
        fuelCharge: 1088,
        status: 'cancelled',
        createdAt: '2024-01-18T11:30:00.000Z',
        notes: 'Customer requested cancellation due to weather'
      }
    ];
    return testBookings;
  };

  const loadBookings = async () => {
    try {
      let allBookings = await BookingService.getBookings();
      
      // If no bookings exist, add test bookings
      if (allBookings.length === 0) {
        const testBookings = generateTestBookings();
        // Save test bookings to storage
        testBookings.forEach(async (booking) => {
          await BookingService.saveBooking(booking);
        });
        allBookings = testBookings;
      }
      
      // Sort by creation date, newest first
      const sortedBookings = allBookings.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setBookings(sortedBookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
      // Fallback to test bookings if there's an error
      setBookings(generateTestBookings());
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return '#F59E0B';
      case 'confirmed':
        return '#3B82F6';
      case 'in-progress':
        return '#8B5CF6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'confirmed':
        return 'checkmark-circle-outline';
      case 'in-progress':
        return 'car-sport-outline';
      case 'completed':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const getStatusGradient = (status: Booking['status']): [string, string] => {
    switch (status) {
      case 'pending':
        return ['#FEF3C7', '#FDE68A'];
      case 'confirmed':
        return ['#DBEAFE', '#BFDBFE'];
      case 'in-progress':
        return ['#EDE9FE', '#DDD6FE'];
      case 'completed':
        return ['#D1FAE5', '#A7F3D0'];
      case 'cancelled':
        return ['#FEE2E2', '#FECACA'];
      default:
        return ['#F3F4F6', '#E5E7EB'];
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const renderBookingCard = (booking: Booking) => (
    <View key={booking.id} style={styles.bookingCard}>
      {/* Status Bar */}
      <LinearGradient
        colors={getStatusGradient(booking.status)}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.statusBar}
      >
        <View style={styles.statusContent}>
          <View style={styles.statusLeft}>
            <Ionicons 
              name={getStatusIcon(booking.status)} 
              size={20} 
              color={getStatusColor(booking.status)}
            />
            <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
            </Text>
          </View>
          <Text style={styles.bookingId}>#{booking.id.slice(-6)}</Text>
        </View>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.cardContent}>
        <View style={styles.bookingHeader}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{booking.washService.name}</Text>
            <Text style={styles.bookingDate}>{formatDate(booking.createdAt)}</Text>
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.totalPrice}>₹{booking.totalPrice}</Text>
          </View>
        </View>

        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="location" size={16} color="#3B82F6" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{booking.location.name}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="calendar" size={16} color="#10B981" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>
                {formatDate(booking.timeSlot.date)} at {formatTime(booking.timeSlot.time)}
              </Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={16} color="#8B5CF6" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Customer</Text>
              <Text style={styles.detailValue}>{booking.customerName}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconContainer}>
              <Ionicons name="call" size={16} color="#F59E0B" />
            </View>
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{booking.customerPhone}</Text>
            </View>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceBreakdown}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Base Price</Text>
            <Text style={styles.priceValue}>₹{booking.washService.basePrice}</Text>
          </View>
          {booking.fuelCharge > 0 && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Fuel Charge ({booking.location.distanceFromOffice} km × 2)</Text>
              <Text style={styles.priceValue}>₹{booking.fuelCharge}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{booking.totalPrice}</Text>
          </View>
        </View>

        {booking.notes && (
          <View style={styles.notesContainer}>
            <View style={styles.notesHeader}>
              <Ionicons name="document-text" size={16} color="#6B7280" />
              <Text style={styles.notesLabel}>Notes</Text>
            </View>
            <Text style={styles.notesText}>{booking.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="calendar-outline" size={80} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Bookings Yet</Text>
             <Text style={styles.emptyMessage}>
         You haven&apos;t made any car wash bookings yet. Tap the Book Wash tab to get started!
       </Text>
      <TouchableOpacity style={styles.emptyButton}>
        <Text style={styles.emptyButtonText}>Book Your First Wash</Text>
      </TouchableOpacity>
    </View>
  );

  const getBookingStats = () => {
    const stats = {
      total: bookings.length,
      completed: bookings.filter(b => b.status === 'completed').length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
    };
    return stats;
  };

  const stats = getBookingStats();

  return (
    <LinearGradient
      colors={['#DBEAFE', '#FFFFFF', '#F3E8FF']}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="bookmarks" size={32} color="#3B82F6" />
            <Text style={styles.headerTitle}>My Bookings</Text>
          </View>
          
          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#3B82F6' }]}>{stats.confirmed}</Text>
              <Text style={styles.statLabel}>Confirmed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {bookings.length === 0 ? renderEmptyState() : (
            <View style={styles.bookingsList}>
              {bookings.map(renderBookingCard)}
            </View>
          )}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: Platform.OS === 'ios' ? 120 : 110, // Tab bar height + comfortable spacing
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  bookingsList: {
    gap: 16,
  },
  
  // Booking Card
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statusBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  statusContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bookingId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  
  // Card Content
  cardContent: {
    padding: 20,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  
  // Details Grid
  detailsGrid: {
    gap: 16,
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '600',
  },
  
  // Price Breakdown
  priceBreakdown: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  
  // Notes
  notesContainer: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 14,
    color: '#92400E',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 