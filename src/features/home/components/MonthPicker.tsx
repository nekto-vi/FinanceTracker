import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_WIDTH = SCREEN_WIDTH - 40; 
const currentYear = new Date().getFullYear();

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

interface Props {
  onMonthChange?: (index: number) => void;
  selectedMonth: number; 
}

export function MonthPicker({ onMonthChange, selectedMonth }: Props) {
  const flatListRef = useRef<FlatList>(null);
  const lastTrackedIndex = useRef(selectedMonth - 1);

  useEffect(() => {
    const targetIndex = selectedMonth - 1;
    if (targetIndex !== lastTrackedIndex.current) {
      lastTrackedIndex.current = targetIndex;
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: true,
      });
    }
  }, [selectedMonth]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / ITEM_WIDTH);
    
    if (index !== lastTrackedIndex.current && index >= 0 && index < MONTHS.length) {
      lastTrackedIndex.current = index;
      onMonthChange?.(index); 
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={MONTHS}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd} 
        scrollEventThrottle={16}
        initialScrollIndex={selectedMonth - 1} 
        renderItem={({ item }) => (
          <View style={styles.monthWrapper}>
            <Text style={styles.monthText}>{item} {currentYear}</Text>
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: ITEM_WIDTH,
          offset: ITEM_WIDTH * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    width: ITEM_WIDTH,
  },
  monthWrapper: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.5,
  },
});