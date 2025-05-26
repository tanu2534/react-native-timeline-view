declare module 'react-native-timeline-view' {
  import { ViewStyle } from 'react-native';

  export interface Slot {
    slot: string;
    available: boolean;
    booking?: {
      title: string;
      startDate: string;
      endDate: string;
    };
  }

  interface TimeLineViewProps {
    slots: Slot[];
    onPress?: (slot: Slot) => void;
    dynamicStyle?: ViewStyle;
    autoRefresh?: boolean;
    pollingInterval?: number;
    fetchSlots?: () => Promise<Slot[]>;
  }

  export const TimeLineView: React.FC<TimeLineViewProps>;
}
