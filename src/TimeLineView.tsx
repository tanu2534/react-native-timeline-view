import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  type ViewStyle,
  type StyleProp,
} from 'react-native';

const { width: initialWidth, height: initialHeight } = Dimensions.get('window');

interface Booking {
  title: string;
  startDate: string;
  endDate: string;
}

export interface Slot {
  slot: string;
  available: boolean;
  booking?: Booking;
}

interface TimeLineViewProps {
  slots: Slot[];
  onPress: (slot: any) => void;
  dynamicStyle?: StyleProp<ViewStyle>;
  autoRefresh?: boolean;
  pollingInterval?: number;
  fetchSlots?: () => Promise<Slot[]>;
}

const TimeLineView: React.FC<TimeLineViewProps> = ({
  slots = [],
  onPress,
  dynamicStyle,
  autoRefresh = false,
  pollingInterval = 2000,
  fetchSlots,
}) => {
  const [landscape] = useState<boolean>(initialWidth > initialHeight);
  const [generatedHours, setGeneratedHours] = useState(() =>
    generateHours(slots)
  );

  useEffect(() => {
    setGeneratedHours(generateHours(slots));
  }, [slots]);

  useEffect(() => {
    if (autoRefresh && typeof fetchSlots === 'function') {
      const interval = setInterval(async () => {
        const updatedSlots = await fetchSlots();
        setGeneratedHours(generateHours(updatedSlots));
      }, pollingInterval);
      return () => clearInterval(interval);
    }

    return undefined; // ✅ this solves it
  }, [autoRefresh, pollingInterval, fetchSlots]);

  const renderTimeSlot = (hourObj: any, index: number) => {
    const hour = hourObj.time;
    const now = new Date();
    const [time, period] = hour.split(' ');
    const [h, m] = time.split(':');
    let hourNum = parseInt(h);
    const min = parseInt(m);
    if (period === 'PM' && hourNum !== 12) hourNum += 12;
    if (period === 'AM' && hourNum === 12) hourNum = 0;

    const slotStart = new Date();
    slotStart.setHours(hourNum, min, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + 15);

    const isCurrentTimeSlot = now >= slotStart && now <= slotEnd;

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPress?.(hourObj)}
        style={styles.hourContainer}
      >
        {!hourObj.available && (
          <View style={styles.unavailableSlot}>
            <Text style={styles.bookingTitle}>
              {hourObj?.booking?.title || 'Reserved'}
            </Text>
          </View>
        )}
        {isCurrentTimeSlot && (
          <View style={styles.currentLine}>
            <View style={styles.currentDot} />
          </View>
        )}
        <View style={styles.line} />
        {index % 2 === 0 && <Text style={styles.hourText}>{hour}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView
      style={[
        styles.scrollContainer,
        !landscape ? { height: 350, width: 650 } : {},
        dynamicStyle,
      ]}
      showsVerticalScrollIndicator
      persistentScrollbar
    >
      <View style={styles.container}>
        {generatedHours.map((hour, index) => (
          <View key={index} style={styles.slotContainer}>
            {renderTimeSlot(hour, index)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const generateHours = (slots: Slot[]) => {
  const hours = [];
  const minElements = 20;
  const intervalMinutes = 15;
  let currentTime = slots[0]?.slot ? new Date(slots[0].slot) : new Date();
  currentTime.setMinutes(0, 0, 0);

  const bookings = slots
    .filter((slot) => slot.booking)
    .map((slot) => slot.booking!) as Booking[];

  while (hours.length < minElements) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + intervalMinutes);

    const overlappingBooking = bookings.find((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return (
        (start <= slotStart && end > slotStart) ||
        (start < slotEnd && end >= slotEnd)
      );
    });

    const matchingSlot = slots.find(
      (slot) => new Date(slot.slot).toISOString() === slotStart.toISOString()
    );

    const hour = formatTime(slotStart);

    hours.push({
      time: hour,
      available: overlappingBooking ? false : matchingSlot?.available !== false,
      booking: overlappingBooking || {},
      isoTime: slotStart.toISOString(),
    });

    currentTime.setMinutes(currentTime.getMinutes() + intervalMinutes);
  }

  return hours;
};

const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const paddedMinutes =
    minutes === 0 ? '00' : minutes.toString().padStart(2, '0');
  return `${hours}:${paddedMinutes} ${period}`;
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    height: 580,
    width: 410,
    paddingTop: 20,
  },
  container: {
    alignItems: 'center',
    position: 'relative',
  },
  hourContainer: {
    height: 60,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    flexDirection: 'row',
  },
  line: {
    height: 1,
    backgroundColor: 'black',
    width: '80%',
    opacity: 0.2,
  },
  hourText: {
    position: 'absolute',
    right: 0,
    top: -10,
    color: 'black',
    fontSize: 15,
    fontWeight: '500',
    opacity: 0.5,
  },
  currentLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    width: '83%',
    height: 2,
    backgroundColor: '#176CFF',
    opacity: 0.8,
  },
  currentDot: {
    position: 'absolute',
    right: 0,
    top: -6,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#176CFF',
  },
  unavailableSlot: {
    backgroundColor: '#F2F2F2',
    width: '75%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderRadius: 5,
    paddingHorizontal: 10,
  },
  bookingTitle: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  slotContainer: {
    position: 'relative',
    width: '100%',
    height: 60,
  },
});

export default TimeLineView;
