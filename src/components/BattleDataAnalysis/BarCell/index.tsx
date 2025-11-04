import { useMemo } from 'react';
import { calculateBarColor } from '../../../utils/colorUtils';
import './styles.css';

interface BarCellProps {
  value: number;
  maxValue: number;
  minValue?: number;
  colorScheme?: 'red' | 'green' | 'blue' | 'purple';
  showValue?: boolean;
}

export function BarCell({ 
  value, 
  maxValue, 
  minValue = 0, 
  colorScheme = 'blue',
  showValue = true 
}: BarCellProps) {
  // 计算百分比
  const percentage = useMemo(() => {
    if (maxValue === minValue) return 0;
    return ((value - minValue) / (maxValue - minValue)) * 100;
  }, [value, maxValue, minValue]);

  // 计算颜色
  const barColor = useMemo(() => {
    return calculateBarColor(value, minValue, maxValue, colorScheme);
  }, [value, minValue, maxValue, colorScheme]);

  return (
    <div className="bar-cell">
      <div 
        className="bar-cell-background"
        style={{
          width: `${percentage}%`,
          backgroundColor: barColor,
        }}
      />
      {showValue && (
        <div className="bar-cell-value">
          {value.toLocaleString()}
        </div>
      )}
    </div>
  );
}
