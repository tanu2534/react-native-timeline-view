// import React from 'react';
import { SafeAreaView, View, Text } from 'react-native';
import TimeLineView from 'react-native-timeline-view';

const mockEvents = [
  {
    slot: new Date(new Date().setHours(19, 30, 0, 0)).toISOString(),
    available: false,
    Event: {
      title: 'Food For Thought',
      startDate: new Date(new Date().setHours(19, 30, 0, 0)).toISOString(),
      endDate: new Date(new Date().setHours(19, 47, 0, 0)).toISOString(), // 30 min later
    },
  },
  {
    slot: new Date(new Date().setHours(21, 17, 0, 0)).toISOString(),
    available: false,
    Event: {
      title: 'Lunch',
      startDate: new Date(new Date().setHours(21, 0, 0, 0)).toISOString(),
      endDate: new Date(new Date().setHours(21, 30, 0, 0)).toISOString(),
    },
  },
];

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1, marginTop: 60 }}>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          alignSelf: 'center',
          opacity: 0.6,
        }}
      >
        Time Line
      </Text>
      <TimeLineView
        slots={mockEvents}
        onPress={(slot) => console.log(slot)}
        startTime={new Date(new Date().setHours(19, 0, 0, 0))}
        slotDuration={30}
        labelEverySlot={2}
        renderBookingContent={(Event, index) => (
          <View key={index} style={{ padding: 5 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              Event : {Event.title}
            </Text>
            <Text style={{ fontSize: 10, color: '#666' }}>
              {new Date(Event.startDate).toLocaleTimeString()} -{' '}
              {new Date(Event.endDate).toLocaleTimeString()}
            </Text>
          </View>
        )}
        stylesConfig={{
          currentLine: { backgroundColor: 'red', width: '80%' },
          currentDot: { backgroundColor: 'red' },
          hourContainer: { width: '95%' },
          scrollContainer: { backgroundColor: 'white', width: '100%' },
          unavailableSlot: { backgroundColor: '#D3D3D3' },
        }}
      />
    </SafeAreaView>
  );
};

export default App;
