# React Native Timeline View

A customizable timeline component for React Native that displays time slots with bookings/events. Perfect for scheduling applications, appointment systems, and calendar views.

## Features

- ✨ **Real-time current time indicator** - Shows current time with a moving line and dot
- 📅 **Flexible time slots** - Configurable slot duration and start times
- 🎨 **Fully customizable styling** - Override any component style
- 📱 **Responsive design** - Works on both portrait and landscape orientations
- 🔄 **Auto-refresh support** - Optional polling for real-time updates
- 🎯 **Event overlap handling** - Displays bookings that span across multiple slots
- 📍 **Precise positioning** - Events are positioned based on actual start/end times
- 🏷️ **Custom content rendering** - Render custom booking content

## Installation

```bash
npm install react-native-timeline-view
```

## Basic Usage

```tsx
tsximport React from 'react';
import { SafeAreaView } from 'react-native';
import TimeLineView from 'react-native-timeline-view';

const App = () => {
  const slots = [
    {
      slot: new Date().toISOString(),
      available: false,
      Event: {
        title: 'Meeting',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min later
      },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TimeLineView
        slots={slots}
        onPress={(slot) => console.log('Slot pressed:', slot)}
      />
    </SafeAreaView>
  );
};

export default App;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slots` | `Slot[]` | `[]` | Array of time slots with availability and events |
| `onPress` | `(slot: any) => void` | `-` | Callback when a slot is pressed |
| `dynamicStyle` | `StyleProp` | `-` | Additional styles for the main container |
| `stylesConfig` | `TimeLineViewStyles` | `{}` | Custom styles configuration object |
| `autoRefresh` | `boolean` | `false` | Enable automatic data refresh |
| `pollingInterval` | `number` | `2000` | Refresh interval in milliseconds |
| `fetchSlots` | `() => Promise` | `-` | Function to fetch updated slots |
| `startTime` | `Date` | `-` | Timeline start time |
| `slotDuration` | `number` | `15` | Duration of each slot in minutes |
| `labelEverySlot` | `number` | `2` | Show time label every N slots |
| `roundToNearestSlot` | `boolean` | `true` | Round start time to nearest slot interval |
| `renderBookingContent` | `(Event: Booking, slotIndex: number) => React.ReactNode` | `-` | Custom renderer for booking content |
| `renderSlotContent` | `(slot: Slot, index: number) => React.ReactNode` | `-` | Custom renderer for slot content |


 # Data Types
 ## Slot

 ```tsx
tsxinterface Slot {
  slot: string; // ISO date string
  available: boolean;
  Event?: Booking;
}
```

## Booking

```tsx
tsxinterface Booking {
  title: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
}
```

## TimeLineViewStyles
```tsx
tsxinterface TimeLineViewStyles {
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
```


## Advanced Example

```tsx
tsximport React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import TimeLineView from 'react-native-timeline-view';

const App = () => {
  const mockEvents = [
    {
      slot: new Date(new Date().setHours(19, 30, 0, 0)).toISOString(),
      available: false,
      Event: {
        title: 'Team Meeting',
        startDate: new Date(new Date().setHours(19, 30, 0, 0)).toISOString(),
        endDate: new Date(new Date().setHours(20, 0, 0, 0)).toISOString(),
      },
    },
    {
      slot: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
      available: false,
      Event: {
        title: 'Lunch Break',
        startDate: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
        endDate: new Date(new Date().setHours(21, 30, 0, 0)).toISOString(),
      },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, marginTop: 60 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', alignSelf: 'center' }}>
        Schedule
      </Text>
      <TimeLineView
        slots={mockEvents}
        onPress={(slot) => console.log('Selected slot:', slot)}
        startTime={new Date(new Date().setHours(19, 0, 0, 0))}
        slotDuration={30}
        labelEverySlot={2}
        renderBookingContent={(Event, index) => (
          <View key={index} style={{ padding: 5 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              {Event.title}
            </Text>
            <Text style={{ fontSize: 12, color: '#666' }}>
              {new Date(Event.startDate).toLocaleTimeString()} - 
              {new Date(Event.endDate).toLocaleTimeString()}
            </Text>
          </View>
        )}
        stylesConfig={{
          currentLine: { backgroundColor: 'red', width: '80%' },
          currentDot: { backgroundColor: 'red' },
          hourContainer: { width: '95%' },
          scrollContainer: { backgroundColor: 'white', width: '100%' },
          unavailableSlot: { backgroundColor: '#E3F2FD', borderRadius: 8 },
        }}
      />
    </SafeAreaView>
  );
};

export default App;
```

## Styling
You can customize the appearance using the stylesConfig prop:

```tsx
tsxconst customStyles = {
  scrollContainer: { backgroundColor: '#f5f5f5' },
  currentLine: { backgroundColor: '#ff6b6b', height: 3 },
  currentDot: { backgroundColor: '#ff6b6b', width: 14, height: 14 },
  unavailableSlot: { backgroundColor: '#e8f4f8', borderRadius: 10 },
  EventTitle: { color: '#2c3e50', fontSize: 16, fontWeight: 'bold' },
  hourText: { color: '#7f8c8d', fontSize: 14 },
};

<TimeLineView stylesConfig={customStyles} {...otherProps} />
```

## Auto-refresh
Enable real-time updates by providing a fetch function:

```tsx
tsxconst fetchSlots = async () => {
  const response = await fetch('/api/slots');
  return response.json();
};

<TimeLineView
  slots={slots}
  autoRefresh={true}
  pollingInterval={5000} // 5 seconds
  fetchSlots={fetchSlots}
  {...otherProps}
/>
```


## License
MIT

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

Made with ❤️ for the React Native community
## Keywords: 
react-native, timeline, scheduler, calendar, appointments, booking, time-slots