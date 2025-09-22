'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  PieLabelRenderProps,
} from 'recharts';
import { useRef, useState } from 'react';

interface PollResultsChartProps {
  question: string;
  options: { text: string; votes: number }[];
  totalVotes: number;
}

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#AF19FF',
  '#FF19A6',
  '#19FFED',
  '#FFD700',
  '#ADFF2F',
  '#FF6347',
];

export default function PollResultsChart({
  question,
  options,
  totalVotes,
}: PollResultsChartProps) {
  const data = options.map((option) => ({
    name: option.text,
    value: option.votes,
    percentage: totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0,
  }));

  // For accessible tooltip
  const [activeSlice, setActiveSlice] = useState<null | {
    name: string;
    value: number;
    percentage: number;
  }>(null);

  // IDs for aria-labelledby/aria-describedby
  const chartTitleId = `poll-results-chart-title`;
  const chartDescId = `poll-results-chart-desc`;

  // Custom Tooltip for accessibility
  function AccessibleTooltip({ active, payload }: any) {
    if (active && payload && payload.length) {
      const { name, value, percentage } = payload[0].payload;
      // Update active slice for aria-live region
      setActiveSlice({ name, value, percentage });
      return (
        <div
          className='bg-white border rounded px-2 py-1 text-sm shadow'
          aria-hidden='true'
        >
          <span>
            {name}: {value} votes ({percentage.toFixed(1)}%)
          </span>
        </div>
      );
    }
    // Clear active slice when tooltip is not active
    if (activeSlice !== null) setActiveSlice(null);
    return null;
  }

  return (
    <div
      role='img'
      aria-labelledby={chartTitleId}
      aria-describedby={chartDescId}
      className='relative'
    >
      {/* Visually hidden title and description for screen readers */}
      <span id={chartTitleId} className='sr-only'>
        Poll results for: {question}
      </span>
      <span id={chartDescId} className='sr-only'>
        Pie chart showing poll results. Each slice represents an option and its
        percentage of total votes. Use Tab to focus each slice and hear its
        details.
      </span>

      <ResponsiveContainer width='100%' height={300}>
        <PieChart>
          {/* SVG <title> and <desc> for screen readers */}
          <title id={`${chartTitleId}-svg`}>Poll results for: {question}</title>
          <desc id={`${chartDescId}-svg`}>
            Pie chart showing poll results. Each slice represents an option and
            its percentage of total votes.
          </desc>
          <Pie
            data={data}
            cx='50%'
            cy='50%'
            labelLine={false}
            outerRadius={80}
            fill='#8884d8'
            dataKey='value'
            label={({ payload }: PieLabelRenderProps) => {
              const typedPayload = payload as {
                name: string;
                percentage: number;
              };
              return `${typedPayload.name} (${typedPayload.percentage.toFixed(
                1
              )}%)`;
            }}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                tabIndex={0}
                aria-label={`${entry.name}: ${
                  entry.value
                } votes (${entry.percentage.toFixed(1)}%)`}
                role='listitem'
                onFocus={() => setActiveSlice(entry)}
                onBlur={() => setActiveSlice(null)}
              />
            ))}
          </Pie>
          <Tooltip content={<AccessibleTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Accessible live region for tooltip updates */}
      <div
        aria-live='polite'
        aria-atomic='true'
        className='sr-only'
        id='poll-results-chart-tooltip-live'
      >
        {activeSlice
          ? `${activeSlice.name}: ${
              activeSlice.value
            } votes (${activeSlice.percentage.toFixed(1)}%)`
          : ''}
      </div>
    </div>
  );
}
