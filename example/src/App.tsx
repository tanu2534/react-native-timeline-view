// import React from 'react';
import { SafeAreaView } from 'react-native'; 
import  TimeLineView  from 'react-native-timeline-view';

const mockSlots = [
  {
    slot: new Date().toISOString(),
    available: false,
    booking: {
      title: 'A meeting for testing',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 60000).toISOString(), // 30 min later
    },
  },
  {
    slot: new Date(Date.now() + 60 * 60000).toISOString(),
    available: false,
    booking: {
      title: 'Designing issues resolutions',
      startDate: new Date(Date.now() + 60 * 60000).toISOString(),
      endDate: new Date(Date.now() + 90 * 60000).toISOString(),
    },
  },
];

const App = () => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TimeLineView slots={mockSlots} onPress={(slot : any) => console.log(slot)} />
    </SafeAreaView>
  );
};

export default App;
