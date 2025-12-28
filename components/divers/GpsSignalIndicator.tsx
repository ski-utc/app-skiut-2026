import { View, StyleSheet } from 'react-native';
import { MapPin } from 'lucide-react-native';
import { Colors } from '@/constants/GraphSettings';

type GpsSignalIndicatorProps = {
  accuracy: number | null;
};

export default function GpsSignalIndicator({ accuracy }: GpsSignalIndicatorProps) {
  // Determine signal quality
  // Accuracy is in meters (lower is better)
  // < 10m: Excellent (4 bars)
  // < 20m: Good (3 bars)
  // < 50m: Fair (2 bars)
  // >= 50m: Poor (1 bar)
  // null: No signal (0 bars)

  let bars = 0;
  let color = Colors.muted;

  if (accuracy !== null) {
    if (accuracy < 10) {
      bars = 4;
      color = Colors.success;
    } else if (accuracy < 20) {
      bars = 3;
      color = '#8BC34A';
    } else if (accuracy < 50) {
      bars = 2;
      color = '#FFC107';
    } else {
      bars = 1;
      color = Colors.error;
    }
  }

  return (
    <View style={styles.container}>
      <MapPin size={16} color={color} style={styles.icon} />
      <View style={styles.barsContainer}>
        {[1, 2, 3, 4].map((index) => (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height: 6 + index * 3,
                backgroundColor: index <= bars ? color : Colors.lightMuted,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  icon: {
    marginRight: 2,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 18,
  },
  bar: {
    width: 3,
    borderRadius: 1,
  },
});
