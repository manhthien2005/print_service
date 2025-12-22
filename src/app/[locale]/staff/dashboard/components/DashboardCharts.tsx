'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { CustomTooltip } from './CustomTooltip';
import { PieTooltip } from './PieTooltip';

export interface DashboardChartsProps {
  weeklyActivity: Array<{ day: string; jobs: number; pages: number }>;
  paperSizeUsage: Array<{ name: string; value: number; color: string }>;
  translations: {
    weekly: {
      title: string;
      description: string;
      jobs: string;
      pages: string;
    };
    paper: {
      title: string;
      description: string;
    };
  };
}

export function DashboardCharts({
  weeklyActivity,
  paperSizeUsage,
  translations,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {/* Weekly Activity Bar Chart */}
      <Card className="border-white/10 bg-white/5 backdrop-blur xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-white">
            {translations.weekly.title}
          </CardTitle>
          <CardDescription className="text-white/70">
            {translations.weekly.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyActivity}
              barSize={18}
              tabIndex={-1}
              style={{ outline: 'none' }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="#334155" />
              <XAxis
                dataKey="day"
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ color: '#cbd5e1' }}
              />
              <Bar
                dataKey="jobs"
                name={translations.weekly.jobs}
                radius={[6, 6, 0, 0]}
                fill="url(#jobsGradient)"
              />
              <Bar
                dataKey="pages"
                name={translations.weekly.pages}
                radius={[6, 6, 0, 0]}
                fill="url(#pagesGradient)"
              />
              <defs>
                <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="pagesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ec4899" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Paper Size Usage Pie Chart */}
      <Card className="border-white/10 bg-white/5 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">
            {translations.paper.title}
          </CardTitle>
          <CardDescription className="text-white/70">
            {translations.paper.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[320px] select-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart tabIndex={-1} style={{ outline: 'none' }}>
              <Pie
                data={paperSizeUsage}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={60}
                paddingAngle={6}
              >
                {paperSizeUsage.map(entry => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                height={36}
                wrapperStyle={{ color: '#cbd5e1' }}
              />
              <RechartsTooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

