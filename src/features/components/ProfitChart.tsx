import React, { useState, useCallback, useRef } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  GestureResponderEvent,
} from 'react-native';

export type ChartSegment = {
  categoryId: string;
  amount: number;
  color: string;
};

export type Transaction = {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  color: string;
  note?: string;
  time?: string;
};

export type ChartDay = {
  label: string;
  segments: ChartSegment[];
  transactions: Transaction[];
};

type ProfitChartProps = {
  currentBalance: number;
  monthlyProfit: number;
  weekRange: string;
  data: ChartDay[];
  currency?: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

export function ProfitChart({
  monthlyProfit,
  weekRange,
  data,
  currency = 'BYN',
  onPrevWeek,
  onNextWeek,
}: ProfitChartProps) {
  const [mode, setMode] = useState<'chart' | 'detail'>('chart');
  const [selectedDay, setSelectedDay] = useState<ChartDay | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  
  const touchStartTime = useRef(0);

  const totals = data.map((d) => d.segments.reduce((s, seg) => s + seg.amount, 0));
  const maxTotal = Math.max(...totals, 1);
  const ySteps = 4;

  const formatNumber = (n: number) =>
    n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });

  const handleBarPress = useCallback((day: ChartDay) => {
    setSelectedDay(day);
    setMode('detail');
    setHoveredIndex(null);
  }, []);

  const handleBack = useCallback(() => {
    setMode('chart');
    setSelectedDay(null);
    setHoveredIndex(null);
  }, []);

  const updateHoverIndex = (evt: GestureResponderEvent) => {
    const touchX = evt.nativeEvent.locationX;
    if (containerWidth > 0) {
      const index = Math.floor((touchX / containerWidth) * data.length);
      const clampedIndex = Math.max(0, Math.min(index, data.length - 1));
      setHoveredIndex(clampedIndex);
    }
  };

  return (
    // ГЛАВНОЕ ИЗМЕНЕНИЕ: Теперь у контейнера всегда фиксированная высота 280
    <View style={styles.container}>
      {mode === 'chart' ? (
        // РЕЖИМ ГРАФИКА
        <View style={styles.fullHeight}>
            <View style={styles.header}>
                <Text style={styles.label}>Общая прибыль за месяц</Text>
                <Text style={styles.profit}>+{formatNumber(monthlyProfit)} {currency}</Text>
            </View>

            <View style={styles.chartAreaWrapper}>
                <View style={styles.chartContent}>
                    {/* Y-axis просто отображается, жесты на нем не ловим */}
                    <View style={styles.yAxis}>
                        {Array.from({ length: ySteps + 1 }).map((_, i) => (
                            <Text key={i} style={styles.yLabel}>
                                {formatNumber(Math.round((maxTotal / ySteps) * (ySteps - i)))}
                            </Text>
                        ))}
                    </View>
                    <View 
                    style={styles.barsContainer}
                    onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={(evt) => {
                        touchStartTime.current = Date.now();
                        updateHoverIndex(evt);
                    }}
                    onResponderMove={(evt) => updateHoverIndex(evt)}
                    onResponderRelease={(evt) => {
                        const duration = Date.now() - touchStartTime.current;
                        if (duration < 200 && hoveredIndex !== null) {
                        handleBarPress(data[hoveredIndex]);
                        }
                        setHoveredIndex(null);
                    }}
                    >
                    {/* Grid lines */}
                    {Array.from({ length: ySteps + 1 }).map((_, i) => (
                        <View key={i} style={[styles.gridLine, { bottom: `${(i / ySteps) * 100}%` }]} />
                    ))}

                    {/* Bars */}
                    <View style={styles.barsRow} pointerEvents="none">
                        {data.map((day, dayIndex) => {
                        const total = totals[dayIndex];
                        const barHeight = (total / maxTotal) * 100;
                        const isHovered = hoveredIndex === dayIndex;

                        return (
                            <View key={dayIndex} style={[styles.barWrapper, { zIndex: isHovered ? 100 : 1 }]}>
                            {isHovered && (
                                <View style={styles.tooltip}>
                                <Text style={styles.tooltipText} numberOfLines={1}>
                                    {formatNumber(total)} {currency}
                                </Text>
                                </View>
                            )}
                            <View style={[styles.bar, { height: `${barHeight}%` }]}>
                                {[...day.segments].reverse().map((seg, segIndex) => (
                                <View
                                    key={segIndex}
                                    style={[
                                    styles.segment,
                                    {
                                        flex: seg.amount,
                                        backgroundColor: seg.color,
                                        borderTopLeftRadius: segIndex === 0 ? 6 : 0,
                                        borderTopRightRadius: segIndex === 0 ? 6 : 0,
                                        marginBottom: day.segments.length > 1 ? 0.5 : 0,
                                    },
                                    ]}
                                />
                                ))}
                            </View>
                            <Text style={styles.xLabel}>{day.label}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    </View>
</View>

          <View style={styles.navigator}>
            <Pressable onPress={onPrevWeek} hitSlop={12}><Text style={styles.navArrow}>{'<'}</Text></Pressable>
            <Text style={styles.navText}>{weekRange}</Text>
            <Pressable onPress={onNextWeek} hitSlop={12}><Text style={styles.navArrow}>{'>'}</Text></Pressable>
          </View>
        </View>
      ) : (
        // РЕЖИМ ДЕТАЛИЗАЦИИ (занимает всё пространство)
        <Pressable style={styles.detailWrapper} onPress={handleBack}>
          <View style={styles.detailHeader}>
            <Text style={styles.backArrow}>{'<'}</Text>
            <Text style={styles.detailTitle}>
              {selectedDay?.label} — {formatNumber(
                selectedDay?.transactions.reduce((s, t) => s + t.amount, 0) ?? 0
              )} {currency}
            </Text>
            <View style={{ width: 20 }} />
          </View>

          <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
            <Pressable onPress={handleBack}>
              {selectedDay?.transactions.map((tx) => (
                <View key={tx.id} style={styles.txRow}>
                  <View style={[styles.txDot, { backgroundColor: tx.color }]} />
                  <View style={styles.txInfo}>
                    <Text style={styles.txName}>{tx.categoryName}</Text>
                    {tx.note && <Text style={styles.txNote} numberOfLines={1}>{tx.note}</Text>}
                  </View>
                  <Text style={styles.txAmount}>-{formatNumber(tx.amount)} {currency}</Text>
                </View>
              ))}
            </Pressable>
          </ScrollView>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingVertical: 15,   // УМЕНЬШИЛИ (было 20) — это отступ от края карточки до текста
    height: 280,           // Можно чуть уменьшить общую высоту, если нужно
    justifyContent: 'center',
  },
  fullHeight: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 4,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 2,
  },
  profit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  chartAreaWrapper: {
    flex: 1, // Занимает всё место между шапкой и навигатором
    paddingVertical: 5,
    marginVertical: 4,
  },
  chartContent: {
    flex: 1,
    flexDirection: 'row',
  },
  yAxis: {
    width: 35,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 22,
  },
  yLabel: {
    fontSize: 10,
    color: '#C7C7CC',
  },
  barsContainer: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#F2F2F7',
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingBottom: 22,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  bar: {
    width: '60%',
    borderRadius: 6,
    overflow: 'hidden',
  },
  segment: {
    width: '100%',
  },
  xLabel: {
    position: 'absolute',
    bottom: -22,
    fontSize: 11,
    color: '#8E8E93',
  },
  tooltip: {
    position: 'absolute',
    top: -35,
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 65,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  detailWrapper: {
    flex: 1,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingTop: 5,
  },
  backArrow: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  detailScroll: {
    flex: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  txDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 15,
    fontWeight: '500',
  },
  txNote: {
    fontSize: 12,
    color: '#8E8E93',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  navigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingTop: 10,
  },
  navArrow: {
    fontSize: 22,
    color: '#007AFF',
    fontWeight: '600',
  },
  navText: {
    fontSize: 15,
    fontWeight: '500',
  },
});