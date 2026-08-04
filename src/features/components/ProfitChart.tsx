import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

export type ChartSegment = {
  categoryId: string;
  amount: number;
  color: string;
};

export type ChartDay = {
  label: string;
  segments: ChartSegment[];
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
  const totals = data.map((d) => d.segments.reduce((s, seg) => s + seg.amount, 0));
  const maxTotal = Math.max(...totals, 1);
  const ySteps = 4;

  const formatNumber = (n: number) =>
    n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Текущий баланс</Text>
        <Text style={styles.balance}>{formatNumber(currentBalance)} {currency}</Text>

        <Text style={styles.label}>Общая прибыль за месяц</Text>
        <Text style={styles.profit}>+{formatNumber(monthlyProfit)} {currency}</Text>
      </View>

      <View style={styles.chartWrapper}>
        <View style={styles.yAxis}>
          {Array.from({ length: ySteps + 1 }).map((_, i) => (
            <Text key={i} style={styles.yLabel}>
              {formatNumber(Math.round((maxTotal / ySteps) * (ySteps - i)))}
            </Text>
          ))}
        </View>

        <View style={styles.chartArea}>
          {Array.from({ length: ySteps + 1 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.gridLine,
                { bottom: `${(i / ySteps) * 100}%` },
              ]}
            />
          ))}

          <View style={styles.barsRow}>
            {data.map((day, dayIndex) => {
              const total = totals[dayIndex];
              const barHeight = (total / maxTotal) * 100;

              return (
                <View key={dayIndex} style={styles.barWrapper}>
                  <View style={[styles.bar, { height: `${barHeight}%` }]}>
                    {/* Рендерим сегменты снизу вверх — первая в массиве = низ колонки */}
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
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.navigator}>
        <Pressable onPress={onPrevWeek} hitSlop={8}>
          <Text style={styles.navArrow}>{'<'}</Text>
        </Pressable>
        <Text style={styles.navText}>{weekRange}</Text>
        <Pressable onPress={onNextWeek} hitSlop={8}>
          <Text style={styles.navArrow}>{'>'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 8,
    marginBottom: 2,
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.5,
  },
  profit: {
    fontSize: 20,
    fontWeight: '600',
    color: '#007AFF',
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 180,
    marginTop: 10,
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
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
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