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
  Event?: Booking;
}

interface TimeLineViewStyles {
  scrollContainer?: StyleProp<ViewStyle>;
  container?: StyleProp<ViewStyle>;
  hourContainer?: StyleProp<ViewStyle>;
  line?: StyleProp<ViewStyle>;
  hourText?: StyleProp<ViewStyle>;
  currentLine?: StyleProp<ViewStyle>;
  currentDot?: StyleProp<ViewStyle>;
  unavailableSlot?: StyleProp<ViewStyle>;
  EventTitle?: StyleProp<ViewStyle>;
  slotContainer?: StyleProp<ViewStyle>;

}

interface TimeLineViewProps {
  slots: Slot[];
  onPress: (slot: any) => void;
  dynamicStyle?: StyleProp<ViewStyle>;
  stylesConfig?: TimeLineViewStyles;
  autoRefresh?: boolean;
  pollingInterval?: number;
  fetchSlots?: () => Promise<Slot[]>;
  startTime?: Date;
  slotDuration?: number;
  labelEverySlot?: number;
  roundToNearestSlot?: boolean;
  renderBookingContent?: (Event: Booking, slotIndex: number) => React.ReactNode;
}

const TimeLineView: React.FC<TimeLineViewProps> = ({
  slots = [],
  onPress,
  dynamicStyle,
  stylesConfig = {},
  autoRefresh = false,
  pollingInterval = 2000,
  fetchSlots,
  startTime,
  slotDuration = 15,
  labelEverySlot = 2,
  roundToNearestSlot = true, // Default true
  renderBookingContent,
}) => {
  const [landscape] = useState<boolean>(initialWidth > initialHeight);
  const [generatedHours, setGeneratedHours] = useState(() =>
    generateHours(slots, startTime, slotDuration, roundToNearestSlot)
  );
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timeInterval);
  }, []);

  useEffect(() => {
    setGeneratedHours(generateHours(slots, startTime, slotDuration, roundToNearestSlot));
  }, [slots, startTime, slotDuration, roundToNearestSlot]);

  useEffect(() => {
    if (autoRefresh && typeof fetchSlots === 'function') {
      const interval = setInterval(async () => {
        const updatedSlots = await fetchSlots();
        setGeneratedHours(generateHours(updatedSlots, startTime, slotDuration, roundToNearestSlot));
      }, pollingInterval);
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh, pollingInterval, fetchSlots, startTime, slotDuration, roundToNearestSlot]);

  const renderTimeSlot = (hourObj: any, index: number) => {
    const hour = hourObj.time;
    const now = currentTime;

    const slotStart = new Date(hourObj.isoTime);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

    const isCurrentTimeSlot = now >= slotStart && now < slotEnd;

    const getSlotHeight = () => {
      const defaultHeight = styles.hourContainer.height || 60;
      const customHourContainer = stylesConfig.hourContainer
        ? StyleSheet.flatten(stylesConfig.hourContainer)
        : undefined;
      const customHeight =
        customHourContainer && typeof customHourContainer.height === 'number'
          ? customHourContainer.height
          : undefined;
      return customHeight || defaultHeight;
    };

    const currentSlotHeight = getSlotHeight();
    const slotHeightPerMinute = currentSlotHeight / slotDuration;

    const calculateCurrentTimeOffset = () => {
      if (!isCurrentTimeSlot) return 0;
      const elapsed = now.getTime() - slotStart.getTime();
      const total = slotEnd.getTime() - slotStart.getTime();
      const percent = (elapsed / total);
      return percent * currentSlotHeight;
    };

    const currentTimeOffset = calculateCurrentTimeOffset();

    const calculateBookingOffsetAndHeight = () => {
      if (!hourObj.Event || hourObj.available) return { height: currentSlotHeight, top: 0 };

      const EventStart = new Date(hourObj.Event.startDate);
      const EventEnd = new Date(hourObj.Event.endDate);

      const overlapStart = new Date(Math.max(EventStart.getTime(), slotStart.getTime()));
      const overlapEnd = new Date(Math.min(EventEnd.getTime(), slotEnd.getTime()));
      const overlapDuration = Math.max(0, (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60));

      const offsetMinutes = Math.max(0, (overlapStart.getTime() - slotStart.getTime()) / (1000 * 60));
      const offsetTop = offsetMinutes * slotHeightPerMinute;
      const height = overlapDuration * slotHeightPerMinute;

      return { height, top: offsetTop };
    };

    const { height: EventHeight, top: EventOffsetTop } = calculateBookingOffsetAndHeight();

    return (
      <TouchableOpacity
        key={index}
        onPress={() => onPress?.(hourObj)}
        style={[styles.hourContainer, stylesConfig.hourContainer]}
      >
        {!hourObj.available && (
          <View
            style={[
              styles.unavailableSlot,
              stylesConfig.unavailableSlot,
              {
                height: EventHeight,
                top: EventOffsetTop,
                position: 'absolute', // important for correct offset
              },
            ]}
          >
            {renderBookingContent
              ? renderBookingContent(hourObj.Event, index)
              : (
                <Text style={[styles.EventTitle, stylesConfig.EventTitle]}>
                  {hourObj?.Event?.title || 'Reserved'}
                </Text>
              )
            }
          </View>
        )}

        {isCurrentTimeSlot && (
          <View style={[
            styles.currentLine,
            stylesConfig.currentLine,
            {
              top: currentTimeOffset,
              transform: [{ translateY: -1 }]
            }
          ]}>
            <View style={[styles.currentDot, stylesConfig.currentDot]}>
            </View>
            <Text style={[styles.hourText, stylesConfig.hourText, { position: 'absolute', right: -70 }]}>
              {formatTime(now)}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.line,
            stylesConfig.line,
            !hourObj?.available && { position: 'absolute', zIndex: -1 },
          ]}
        />
        {index % labelEverySlot === 0 && (
          <Text style={[styles.hourText, stylesConfig.hourText]}>{hour}</Text>
        )}
      </TouchableOpacity>
    );
  };


  return (
    <ScrollView
      style={[
        styles.scrollContainer,
        !landscape ? { height: 350, width: 650 } : {},
        dynamicStyle,
        stylesConfig.scrollContainer,
      ]}
      showsVerticalScrollIndicator
      persistentScrollbar
    >
      <View style={[styles.container, stylesConfig.container]}>
        {generatedHours.map((hour, index) => (
          <View key={index} style={[styles.slotContainer, stylesConfig.slotContainer]}>
            {renderTimeSlot(hour, index)}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const generateHours = (
  slots: Slot[],
  startTime?: Date,
  slotDuration: number = 15,
  roundToNearestSlot: boolean = true
) => {
  const hours = [];
  const minElements = 20;
  const intervalMinutes = slotDuration;

  let currentTime = startTime
    ? new Date(startTime)
    : slots[0]?.slot
      ? new Date(slots[0].slot)
      : new Date();

  // Round to nearest slot interval only if user wants it
  if (roundToNearestSlot) {
    currentTime.setMinutes(
      Math.floor(currentTime.getMinutes() / intervalMinutes) * intervalMinutes,
      0,
      0
    );
  } else {
    // Keep exact time but reset seconds and ms
    currentTime.setSeconds(0, 0);
  }

  const Events = slots
    .filter((slot) => slot.Event)
    .map((slot) => slot.Event!) as Booking[];

  while (hours.length < minElements) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotEnd.getMinutes() + intervalMinutes);

    // Check for overlapping Events based on actual Event times
    const overlappingBooking = Events.find((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      return (
        (start < slotEnd && end > slotStart) // Any overlap
      );
    });

    const matchingSlot = slots.find(
      (slot) => new Date(slot.slot).toISOString() === slotStart.toISOString()
    );

    const hour = formatTime(slotStart);

    hours.push({
      time: hour,
      available: overlappingBooking ? false : matchingSlot?.available !== false,
      Event: overlappingBooking || {},
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
  return `${hours.toString().padStart(2, '0')}:${paddedMinutes} ${period}`;
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    height: 500,
    width: 200,
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
  EventTitle: {
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
