import type { TooltipProps } from 'recharts';

export interface StaffDashboardProps {
  locale: string;
  t: any;
}

export type Trend = 'up' | 'down' | 'flat';

export type ChartTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{
    name?: string;
    value?: number | string;
    color?: string;
  }>;
  label?: string | number;
};
