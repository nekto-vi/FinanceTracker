import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
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
  currentBalance,
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

  return (
  <View style={styles.container}>
    {/* Header */}
    {mode === 'chart' && (
      <View style={styles.header}>
        <Text style={styles.label}>Общая прибыль за месяц</Text>
        <Text style={styles.profit}>+{formatNumber(monthlyProfit)} {currency}</Text>
      </View>
    )}

    {/* Chart / Detail area */}
    <View style={[styles.chartBox, mode === 'detail' && styles.detailBox]}>
      {mode === 'chart' ? (
        <View style={styles.chartWrapper}>
          {/* Y-axis */}
          <View style={styles.yAxis}>
            {Array.from({ length: ySteps + 1 }).map((_, i) => (
              <Text key={i} style={styles.yLabel}>
                {formatNumber(Math.round((maxTotal / ySteps) * (ySteps - i)))}
              </Text>
            ))}
          </View>

          <View style={styles.chartArea}>
            {Array.from({ length: ySteps + 1 }).map((_, i) => (
              <View key={i} style={[styles.gridLine, { bottom: `${(i / ySteps) * 100}%` }]} />
            ))}

            <View style={styles.barsRow}>
              {data.map((day, dayIndex) => {
                const total = totals[dayIndex];
                const barHeight = (total / maxTotal) * 100;
                const isHovered = hoveredIndex === dayIndex;

                return (
                  <Pressable
                    key={dayIndex}
                    // ИЗМЕНЕНИЕ: Добавлен zIndex, чтобы тултип был поверх соседних колонок
                    style={[styles.barWrapper, { zIndex: isHovered ? 100 : 1 }]} 
                    onPressIn={() => setHoveredIndex(dayIndex)}
                    onPressOut={() => setHoveredIndex(null)}
                    onPress={() => handleBarPress(day)}
                  >
                    {isHovered && (
                      <View style={styles.tooltip}>
                        <Text style={styles.tooltipText} numberOfLines={1}>
                          {formatNumber(total)} {currency}
                        </Text>
                      </View>
                    )}

                    <View style={[styles.bar, { height: `${barHeight}%` }]}>
                      {[...day.segments].reverse().map((seg, segIndex) => {
                        const isTop = segIndex === 0;
                        return (
                          <View
                            key={segIndex}
                            style={[
                              styles.segment,
                              {
                                flex: seg.amount,
                                backgroundColor: seg.color,
                                borderTopLeftRadius: isTop ? 6 : 0,
                                borderTopRightRadius: isTop ? 6 : 0,
                                marginBottom: day.segments.length > 1 ? 0.5 : 0,
                              },
                            ]}
                          />
                        );
                      })}
                    </View>
                    <Text style={styles.xLabel}>{day.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      ) : (
        /* Detail View — теперь нажатие на любую область возвращает назад */
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

          <ScrollView 
            style={styles.detailScroll} 
            showsVerticalScrollIndicator={false}
          >
            {/* Оборачиваем содержимое ScrollView, чтобы клик по списку тоже закрывал его */}
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

    {mode === 'chart' && (
      <View style={styles.navigator}>
        <Pressable onPress={onPrevWeek} hitSlop={8}><Text style={styles.navArrow}>{'<'}</Text></Pressable>
        <Text style={styles.navText}>{weekRange}</Text>
        <Pressable onPress={onNextWeek} hitSlop={8}><Text style={styles.navArrow}>{'>'}</Text></Pressable>
      </View>
    )}
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 6,
    marginBottom: 2,
  },
  profit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  chartBox: {
    height: 180,
    marginTop: 4,
  },
  // 3. ИЗМЕНЕНИЕ: Высота виджета в режиме детализации (чтобы заменить скрытую шапку и навигатор)
  detailBox: {
    height: 250, 
  },
  chartWrapper: {
    flexDirection: 'row',
    height: '100%',
  },
  yAxis: {
    width: 36,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 6,
    paddingBottom: 24,
  },
  yLabel: {
    fontSize: 11,
    color: '#C7C7CC',
  },
  chartArea: {
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 24,
    paddingHorizontal: 4,
  },
  tooltip: {
    position: 'absolute',
    top: -35,
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    // ИЗМЕНЕНИЕ: Убрали жесткую привязку, добавили minWidth
    minWidth: 70, 
    alignItems: 'center',
    justifyContent: 'center',
    // Тень, чтобы тултип выглядел объемнее
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    // Предотвращаем перенос
    flexShrink: 0,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    // Важно: zIndex прописывается динамически в самом компоненте (см. выше)
  },
  detailWrapper: {
    flex: 1,
    paddingLeft: 4,
    // Растягиваем на всю доступную область
    width: '100%',
    height: '100%',
  },
  bar: {
    width: '70%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    borderRadius: 6,
    overflow: 'hidden',
  },
  segment: {
    width: '100%',
  },
  xLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 6,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backArrow: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '500',
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  detailScroll: {
    flex: 1,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 10,
  },
  txDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  txNote: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 1,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  navigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 16,
  },
  navArrow: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '500',
  },
  navText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
});