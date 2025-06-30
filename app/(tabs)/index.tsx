import { BookingService, SIKKIM_LOCATIONS, WASH_SERVICES } from '@/services/BookingService';
import { Booking, BookingFormData, Location, TimeSlot, WashService } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type BookingStep = 'location' | 'timeslot' | 'service' | 'details' | 'confirmation';

export default function BookWashScreen() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('location');
  const [formData, setFormData] = useState<BookingFormData>({
    customerName: '',
    customerPhone: '',
  });
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [bookingId, setBookingId] = useState<string>('');

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      let slots = await BookingService.getTimeSlots();
      
      // Add some demo unavailable/booked slots for better UX demonstration
      slots = slots.map((slot, index) => {
        // Make some slots unavailable for demo purposes
        if (index % 7 === 0) { // Every 7th slot is booked
          return { ...slot, isAvailable: false, isBooked: true };
        } else if (index % 11 === 0) { // Every 11th slot is unavailable
          return { ...slot, isAvailable: false, isBooked: false };
        }
        return slot;
      });
      
      setAvailableTimeSlots(slots); // Include all slots, not just available ones
    } catch (error) {
      console.error('Error loading time slots:', error);
    }
  };

  const handleLocationSelect = (location: Location) => {
    setFormData({ ...formData, location });
    setShowLocationModal(false);
    setCurrentStep('timeslot');
  };

  const handleServiceSelect = (service: WashService) => {
    setFormData({ ...formData, washService: service });
    setCurrentStep('details');
  };

  const handleTimeSlotSelect = (slot: TimeSlot) => {
    // Only allow selection of available slots
    if (!slot.isAvailable || slot.isBooked) {
      return;
    }
    setFormData({ ...formData, timeSlot: slot });
    setCurrentStep('service');
  };

  const goBack = () => {
    switch (currentStep) {
      case 'timeslot':
        setCurrentStep('location');
        break;
      case 'service':
        setCurrentStep('timeslot');
        break;
      case 'details':
        setCurrentStep('service');
        break;
      default:
        setCurrentStep('location');
    }
  };

  const handleBookingSubmit = async () => {
    if (!formData.location || !formData.washService || !formData.timeSlot) {
      Alert.alert('Error', 'Please complete all booking steps');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      Alert.alert('Error', 'Please enter your name and phone number');
      return;
    }

    try {
      const totalPrice = BookingService.calculateTotalPrice(formData.washService, formData.location);
      const fuelCharge = BookingService.calculateFuelCharge(formData.location);
      
      const booking: Booking = {
        id: Date.now().toString(),
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        location: formData.location,
        timeSlot: formData.timeSlot,
        washService: formData.washService,
        totalPrice,
        fuelCharge,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      await BookingService.saveBooking(booking);
      setBookingId(booking.id);
      setCurrentStep('confirmation');
      await loadTimeSlots(); // Refresh available slots
    } catch (error) {
      console.error('Error saving booking:', error);
      Alert.alert('Error', 'Failed to save booking. Please try again.');
    }
  };

  const resetBooking = () => {
    setCurrentStep('location');
    setFormData({
      customerName: '',
      customerPhone: '',
    });
    setBookingId('');
  };

  const getStepNumber = (step: BookingStep): number => {
    const steps = { location: 1, timeslot: 2, service: 3, details: 4, confirmation: 5 };
    return steps[step];
  };

  const getCurrentStepNumber = () => getStepNumber(currentStep);

  // Step Indicator Component
  const StepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      {[1, 2, 3, 4, 5].map((step, index) => (
        <View key={step} style={styles.stepIndicatorRow}>
          <View style={[
            styles.stepCircle,
            step <= getCurrentStepNumber() ? styles.stepCircleActive : styles.stepCircleInactive
          ]}>
            <Text style={[
              styles.stepNumber,
              step <= getCurrentStepNumber() ? styles.stepNumberActive : styles.stepNumberInactive
            ]}>
              {step}
            </Text>
          </View>
          {index < 4 && (
            <View style={[
              styles.stepConnector,
              step < getCurrentStepNumber() ? styles.stepConnectorActive : styles.stepConnectorInactive
            ]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="location" size={64} color="#3B82F6" style={styles.stepIcon} />
        <Text style={styles.stepTitle}>Select Your Location</Text>
        <Text style={styles.stepSubtitle}>We serve across Sikkim</Text>
      </View>
      
      <TouchableOpacity
        style={styles.locationSelector}
        onPress={() => setShowLocationModal(true)}
      >
        <Ionicons name="location-outline" size={24} color="#3B82F6" />
        <Text style={styles.locationText}>
          {formData.location ? formData.location.name : 'Enter your city or area'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </TouchableOpacity>

      <LinearGradient
        colors={['#3B82F6', '#8B5CF6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradientButton, !formData.location && styles.disabledButton]}
      >
        <TouchableOpacity
          style={styles.buttonContent}
          onPress={() => formData.location && setCurrentStep('timeslot')}
          disabled={!formData.location}
        >
          <Text style={styles.buttonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </LinearGradient>

      <Modal visible={showLocationModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Location</Text>
            <TouchableOpacity onPress={() => setShowLocationModal(false)}>
              <Ionicons name="close" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={SIKKIM_LOCATIONS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.locationItem}
                onPress={() => handleLocationSelect(item)}
              >
                <View>
                  <Text style={styles.locationName}>{item.name}</Text>
                  <Text style={styles.locationDetails}>
                    Pincode: {item.pincode} • Distance: {item.distanceFromOffice}km
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );

  const renderServiceStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="car-sport" size={64} color="#3B82F6" style={styles.stepIcon} />
        <Text style={styles.stepTitle}>Select Wash Type</Text>
        <Text style={styles.stepSubtitle}>Choose the service that fits your needs</Text>
      </View>
      
      {WASH_SERVICES.map((service) => {
        const totalPrice = formData.location 
          ? BookingService.calculateTotalPrice(service, formData.location)
          : service.basePrice;
        const fuelCharge = formData.location 
          ? BookingService.calculateFuelCharge(formData.location)
          : 0;

        return (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceCard}
            onPress={() => handleServiceSelect(service)}
          >
            <View style={styles.serviceInfo}>
              <View style={styles.serviceHeader}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.servicePrice}>₹{totalPrice}</Text>
              </View>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceFeatures}>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>Exterior wash</Text>
                </View>
                <View style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                  <Text style={styles.featureText}>Duration: {service.duration} min</Text>
                </View>
                {fuelCharge > 0 && (
                  <View style={styles.featureItem}>
                    <Ionicons name="car" size={16} color="#10B981" />
                    <Text style={styles.featureText}>+ ₹{fuelCharge} fuel charge</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color="#6B7280" />
        <Text style={styles.backButtonText}>Back to Time Slots</Text>
      </TouchableOpacity>
    </View>
  );

  const renderTimeSlotStep = () => {
    const groupedSlots = availableTimeSlots.reduce((groups, slot) => {
      if (!groups[slot.date]) {
        groups[slot.date] = [];
      }
      groups[slot.date].push(slot);
      return groups;
    }, {} as Record<string, TimeSlot[]>);

    const getSlotStatus = (slot: TimeSlot) => {
      if (slot.isBooked) return 'Booked';
      if (!slot.isAvailable) return 'Unavailable';
      return 'Available';
    };

    const getSlotStatusColor = (slot: TimeSlot) => {
      if (slot.isBooked) return '#EF4444';
      if (!slot.isAvailable) return '#9CA3AF';
      return '#10B981';
    };

    return (
      <View style={styles.stepContent}>
        <View style={styles.stepHeader}>
          <Ionicons name="time" size={64} color="#3B82F6" style={styles.stepIcon} />
          <Text style={styles.stepTitle}>Choose Time Slot</Text>
          <Text style={styles.stepSubtitle}>Select your preferred time</Text>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false} style={styles.timeSlotsContainer}>
          {Object.entries(groupedSlots).map(([date, slots]) => (
            <View key={date} style={styles.dateGroup}>
              <Text style={styles.dateHeader}>
                {new Date(date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              
              <View style={styles.timeSlotGrid}>
                {slots.map((slot) => {
                  const isAvailable = slot.isAvailable && !slot.isBooked;
                  const isSelected = formData.timeSlot?.id === slot.id;
                  
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        styles.timeSlotButton,
                        isSelected && styles.selectedTimeSlot,
                        !isAvailable && styles.disabledTimeSlot
                      ]}
                      onPress={() => isAvailable && handleTimeSlotSelect(slot)}
                      disabled={!isAvailable}
                    >
                      <Text style={[
                        styles.timeSlotText,
                        isSelected && styles.selectedTimeSlotText,
                        !isAvailable && styles.disabledTimeSlotText
                      ]}>
                        {slot.time}
                      </Text>
                      <Text style={[
                        styles.timeSlotStatus,
                        isSelected && styles.selectedTimeSlotStatus,
                        !isAvailable && styles.disabledTimeSlotStatus,
                        { color: isSelected ? 'rgba(255,255,255,0.8)' : getSlotStatusColor(slot) }
                      ]}>
                        {getSlotStatus(slot)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Back to Location</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderDetailsStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.stepHeader}>
        <Ionicons name="calculator" size={64} color="#3B82F6" style={styles.stepIcon} />
        <Text style={styles.stepTitle}>Booking Summary</Text>
        <Text style={styles.stepSubtitle}>Review your booking details</Text>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Full Name *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.customerName}
          onChangeText={(text) => setFormData({ ...formData, customerName: text })}
          placeholder="Enter your full name"
          placeholderTextColor="#9CA3AF"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.inputLabel}>Phone Number *</Text>
        <TextInput
          style={styles.textInput}
          value={formData.customerPhone}
          onChangeText={(text) => setFormData({ ...formData, customerPhone: text })}
          placeholder="Enter your phone number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Location</Text>
          <Text style={styles.summaryValue}>{formData.location?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time Slot</Text>
          <Text style={styles.summaryValue}>{formData.timeSlot?.time}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Service</Text>
          <Text style={styles.summaryValue}>{formData.washService?.name}</Text>
        </View>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Base Price</Text>
          <Text style={styles.summaryValue}>₹{formData.washService?.basePrice}</Text>
        </View>
        
        {formData.location && formData.washService && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Distance ({formData.location.distanceFromOffice} km)</Text>
              <Text style={styles.summaryValue}>
                ₹{BookingService.calculateFuelCharge(formData.location)}
              </Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ₹{BookingService.calculateTotalPrice(formData.washService, formData.location)}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.paymentNote}>
        <Text style={styles.paymentNoteText}>
          <Text style={styles.paymentNoteLabel}>Payment Method:</Text> Cash on Delivery (COD)
        </Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.backButtonHalf} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color="#6B7280" />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        
        <LinearGradient
          colors={['#10B981', '#3B82F6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.confirmButtonHalf}
        >
          <TouchableOpacity style={styles.buttonContent} onPress={handleBookingSubmit}>
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );

  const renderConfirmationStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.confirmationContainer}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        </View>
        
        <Text style={styles.confirmationTitle}>Booking Confirmed!</Text>
        <Text style={styles.confirmationSubtitle}>Your car wash has been scheduled successfully</Text>
        
        <View style={styles.confirmationDetails}>
          <Text style={styles.confirmationDetailItem}>
            <Text style={styles.confirmationDetailLabel}>Booking ID:</Text> SW{bookingId.slice(-6)}
          </Text>
          <Text style={styles.confirmationDetailItem}>
            <Text style={styles.confirmationDetailLabel}>Date:</Text> Today
          </Text>
          <Text style={styles.confirmationDetailItem}>
            <Text style={styles.confirmationDetailLabel}>Time:</Text> {formData.timeSlot?.time}
          </Text>
          <Text style={styles.confirmationDetailItem}>
            <Text style={styles.confirmationDetailLabel}>Location:</Text> {formData.location?.name}
          </Text>
          <Text style={styles.confirmationDetailItem}>
            <Text style={styles.confirmationDetailLabel}>Total:</Text> ₹{formData.location && formData.washService ? BookingService.calculateTotalPrice(formData.washService, formData.location) : 0}
          </Text>
        </View>
        
        <LinearGradient
          colors={['#3B82F6', '#8B5CF6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientButton}
        >
          <TouchableOpacity style={styles.buttonContent} onPress={resetBooking}>
            <Text style={styles.buttonText}>Book Another Service</Text>
          </TouchableOpacity>
        </LinearGradient>
        
        <TouchableOpacity style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>View My Bookings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'location':
        return renderLocationStep();
      case 'timeslot':
        return renderTimeSlotStep();
      case 'service':  
        return renderServiceStep();
      case 'details':
        return renderDetailsStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return renderLocationStep();
    }
  };

  return (
    <LinearGradient
      colors={['#DBEAFE', '#FFFFFF', '#F3E8FF']}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Ionicons name="water" size={32} color="#3B82F6" />
            <Text style={styles.headerTitle}>SmartWash</Text>
          </View>
          {currentStep !== 'confirmation' && <StepIndicator />}
        </View>

        {/* Content Card */}
        <View style={styles.contentCard}>
          {renderStepContent()}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const { width } = Dimensions.get('window');
const maxWidth = Math.min(width - 32, 400);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 120 : 110, // Tab bar height + comfortable spacing
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  
  // Step Indicator
  stepIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepCircleInactive: {
    backgroundColor: '#D1D5DB',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepNumberActive: {
    color: 'white',
  },
  stepNumberInactive: {
    color: '#6B7280',
  },
  stepConnector: {
    width: 32,
    height: 4,
  },
  stepConnectorActive: {
    backgroundColor: '#3B82F6',
  },
  stepConnectorInactive: {
    backgroundColor: '#D1D5DB',
  },
  
  // Content Card
  contentCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginHorizontal: 16,
    maxWidth: maxWidth,
    alignSelf: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  
  // Step Content
  stepContent: {
    width: '100%',
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepIcon: {
    marginBottom: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  
  // Location Step
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 24,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#374151',
  },
  
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 60,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  locationName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  locationDetails: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  
  // Service Step
  serviceCard: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  serviceInfo: {
    width: '100%',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    flex: 1,
  },
  servicePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  serviceFeatures: {
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  
  // Time Slot Step
  timeSlotsContainer: {
    maxHeight: 400,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timeSlotButton: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexBasis: '30%',
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  timeSlotText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  selectedTimeSlotText: {
    color: 'white',
  },
  timeSlotStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  selectedTimeSlotStatus: {
    color: 'rgba(255,255,255,0.8)',
  },
  disabledTimeSlot: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  disabledTimeSlotText: {
    color: '#9CA3AF',
  },
  disabledTimeSlotStatus: {
    color: '#9CA3AF',
  },
  
  // Details Step
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontSize: 16,
    color: '#1F2937',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  totalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  paymentNote: {
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
    marginTop: 20,
  },
  paymentNoteText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
  },
  paymentNoteLabel: {
    fontWeight: 'bold',
  },
  
  // Confirmation Step
  confirmationContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: '#DCFCE7',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  confirmationDetails: {
    backgroundColor: '#DCFCE7',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10B981',
    marginBottom: 32,
    width: '100%',
  },
  confirmationDetailItem: {
    fontSize: 14,
    color: '#065F46',
    marginBottom: 8,
  },
  confirmationDetailLabel: {
    fontWeight: 'bold',
  },
  
  // Buttons
  gradientButton: {
    borderRadius: 12,
    marginBottom: 12,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  backButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 16,
  },
  backButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  backButtonHalf: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  confirmButtonHalf: {
    flex: 1,
    borderRadius: 12,
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});
