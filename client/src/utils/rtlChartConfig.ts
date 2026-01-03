import { ChartOptions } from 'chart.js';

export type ChartType = 'line' | 'bar' | 'doughnut' | 'pie';

export function getRTLChartOptions(
  isRTL: boolean,
  chartType: ChartType = 'line'
): ChartOptions {
  const baseOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: isRTL ? 'end' : 'start',
        rtl: isRTL,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        enabled: true,
        rtl: isRTL,
        titleAlign: isRTL ? 'right' : 'left',
        bodyAlign: isRTL ? 'right' : 'left',
      },
    },
  };

  if (chartType === 'line' || chartType === 'bar') {
    return {
      ...baseOptions,
      scales: {
        x: {
          reverse: isRTL,
        },
        y: {
          position: isRTL ? 'right' : 'left',
        },
      },
    } as ChartOptions;
  }

  return baseOptions as ChartOptions;
}
