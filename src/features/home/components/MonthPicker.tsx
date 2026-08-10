import React, { useState, useRef, useEffect } from 'react';
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
}

export function MonthPicker({ onMonthChange }: Props) {
  const [activeIndex, setActiveIndex] = useState(new Date().getMonth());
  const flatListRef = useRef<FlatList>(null);

  // Скроллим к текущему месяцу при первой загрузке
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: activeIndex,
        animated: false,
      });
    }, 100);
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollOffset / ITEM_WIDTH);
    
    if (index !== activeIndex && index >= 0 && index < MONTHS.length) {
      setActiveIndex(index);
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
        pagingEnabled // Чтобы листалось по одному
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthWrapper: {
    width: ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
});