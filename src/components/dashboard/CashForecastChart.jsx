import { useState, useEffect, useMemo } from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
  Tooltip,
} from 'recharts';
import { api } from '../../api';

function formatDateShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
}

/**
 * Find local extrema (inflection points) in an array of numbers.
 * Returns indices where the slope changes sign.
 */
function findInflectionPoints(values) {
  const points = [];
  for (let i = 2; i < values.length - 2; i++) {
    const prev = values[i - 1] - values[i - 2];
    const next = values[i + 1] - values[i];
    if ((prev > 0 && next < 0) || (prev < 0 && next > 0)) {
      // Slope reversed — inflection point
      const mag = Math.abs(prev) + Math.abs(next);
      points.push({ index: i, value: values[i], magnitude: mag });
    }
  }
  // Return top 3 by magnitude, sorted by index
  return points.sort((a, b) => b.magnitude - a.magnitude).slice(0, 3).sort((a, b) => a.index - b.index);
}

export function CashForecastChart() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const result = await api.getForecast(7, 30);
      if (cancelled) return;
      if (!result) {
        setError('Failed to load forecast data');
        setLoading(false);
        return;
      }
      setData(result.chart_data);
      setStats({
        totalPredicted: result.total_predicted,
        avgDaily: result.avg_daily,
        model: result.model,
        dataEnd: result.data_end,
      });
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Transform raw API data to chart-ready format (value in millions)
  const { chartData, inflectionPoints, yDomain, tickIndices, tickLabels, forecastDates } = useMemo(() => {
    if (!data || data.length === 0) return {};

    // Filter: only forecast points (predicted != null)
    const forecastData = data.filter(pt => pt.predicted !== null);
    if (forecastData.length === 0) return {};

    const transformed = forecastData.map((pt, i) => ({
      x: i,
      rawDate: pt.date,
      value: ((pt.actual ?? pt.predicted) / 1e6) || 0,
      high: (pt.upper_ci / 1e6) || 0,
      low: (pt.lower_ci / 1e6) || 0,
    }));

    // Compute Y domain from CI bounds — bottom at 0, top at max upper CI + 10% padding
    const yMax = Math.max(...transformed.map(d => d.high || 0));
    const yRounded = [0, +(yMax * 1.1).toFixed(2)];

    // Find inflection points in forecasted portion (predicted ≠ null)
    const forecastValues = transformed.map(d => d.value);
    const inflections = findInflectionPoints(forecastValues);

    // X-axis ticks: ~4 evenly spaced
    const n = transformed.length;
    const tickCount = 4;
    const step = Math.max(1, Math.floor(n / (tickCount - 1)));
    const ticks = [];
    const labels = {};
    for (let i = 0; i < n; i += step) {
      ticks.push(i);
      labels[i] = formatDateShort(forecastData[i]?.date || '');
    }
    // Always include last point
    if (ticks[ticks.length - 1] !== n - 1) {
      ticks.push(n - 1);
      labels[n - 1] = formatDateShort(forecastData[n - 1]?.date || '');
    }

    return {
      chartData: transformed,
      inflectionPoints: inflections,
      yDomain: yRounded,
      tickIndices: ticks,
      tickLabels: labels,
      forecastDates: forecastData.map(pt => pt.date),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col items-center justify-center min-h-[200px] md:min-h-[280px]">
        <p className="font-poppins text-sm text-text-secondary">Loading forecast data…</p>
      </div>
    );
  }

  if (error || !chartData) {
    return (
      <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col items-center justify-center min-h-[200px] md:min-h-[280px]">
        <p className="font-poppins text-sm text-danger-accent">{error || 'No data available'}</p>
      </div>
    );
  }

  // Build Y-axis ticks
  const yStep = (yDomain[1] - yDomain[0]) / 5;
  const yTicks = Array.from({ length: 6 }, (_, i) => +(yDomain[0] + yStep * i).toFixed(1));

  return (
    <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary leading-normal">
          Cash Intelligence & Liquidity Forecast
        </h3>
        <p className="font-poppins font-light text-xs md:text-sm text-text-secondary leading-normal">
          AI-driven projection showing expected cash trajectory with confidence bands
        </p>
      </div>

      {/* Chart */}
      <div className="relative flex-1 min-h-[200px] md:min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="confidenceBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#9AC8FF" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#9AC8FF" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="x"
              type="number"
              domain={[0, chartData.length - 1]}
              ticks={tickIndices}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#5F5F5F', fontFamily: 'Prompt' }}
              tickFormatter={(value) => tickLabels[value] || ''}
            />

            <YAxis
              domain={yDomain}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#5F5F5F', fontFamily: 'Prompt' }}
              tickFormatter={(value) => `$${value}M`}
              ticks={yTicks}
            />

            {/* Grid lines */}
            {yTicks.map(y => (
              <ReferenceLine key={`grid-${y}`} y={y} stroke="#E6E6E6" strokeWidth={0.5} />
            ))}

            {/* Confidence band — high area with gradient, low area with white (creates band effect) */}
            <Area
              type="monotone"
              dataKey="high"
              name="high-ci-fill"
              stroke="none"
              fill="url(#confidenceBand)"
            />
            <Area
              type="monotone"
              dataKey="low"
              name="low-ci-fill"
              stroke="none"
              fill="#FFFFFF"
            />

            {/* Main forecast line */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0F7CFF"
              strokeWidth={2}
              fill="none"
              dot={{ r: 3, fill: '#0F7CFF', stroke: '#0F7CFF' }}
            />

            {/* Confidence band boundaries (dashed) */}
            <Line
              type="monotone"
              dataKey="high"
              stroke="#B8B8B8"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="low"
              stroke="#B8B8B8"
              strokeWidth={1}
              strokeDasharray="4 4"
              dot={false}
            />

            {/* Tooltip on hover */}
            <Tooltip
              formatter={(value, name) => {
                if (name === 'high-ci-fill' || name === 'low-ci-fill') return [null, null];
                if (name === 'value') return [`$${(value * 1e6).toLocaleString()}`, 'Predicted'];
                if (name === 'high') return [`$${(value * 1e6).toLocaleString()}`, 'Upper CI'];
                if (name === 'low') return [`$${(value * 1e6).toLocaleString()}`, 'Lower CI'];
                return [value, name];
              }}
              labelFormatter={(idx) => forecastDates[idx] || ''}
            />

            {/* Inflection point dots */}
            {inflectionPoints.map((p, i) => (
              <ReferenceDot
                key={`dot-${i}`}
                x={p.index}
                y={p.value}
                r={5}
                fill="#FFFFFF"
                stroke="#FF7A58"
                strokeWidth={2}
              />
            ))}

            {/* Annotation connector lines */}
            {inflectionPoints.length >= 2 && (
              <>
                <ReferenceLine
                  segment={[
                    { x: inflectionPoints[0].index - 1, y: inflectionPoints[0].value + 0.1 },
                    { x: inflectionPoints[0].index - 1, y: inflectionPoints[0].value - 0.3 },
                  ]}
                  stroke="#6B7280"
                  strokeWidth={1}
                />
                <ReferenceLine
                  segment={[
                    { x: inflectionPoints[1].index + 1, y: inflectionPoints[1].value + 0.3 },
                    { x: inflectionPoints[1].index + 1, y: inflectionPoints[1].value - 0.1 },
                  ]}
                  stroke="#6B7280"
                  strokeWidth={1}
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>

        {/* Annotation labels */}
        {inflectionPoints.length >= 2 && (
          <>
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${((1 - (inflectionPoints[0].value - yDomain[0]) / (yDomain[1] - yDomain[0])) * 100)}%`,
                left: `${(inflectionPoints[0].index / chartData.length) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-prompt font-semibold text-[10px] md:text-xs text-text-secondary leading-tight text-center w-[30vw] md:w-[170px]">
                Expected dip driven
                <br />
                by payer delays
              </p>
            </div>
            <div
              className="absolute pointer-events-none"
              style={{
                top: `${((1 - (inflectionPoints[1].value - yDomain[0]) / (yDomain[1] - yDomain[0])) * 100)}%`,
                left: `${(inflectionPoints[1].index / chartData.length) * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              <p className="font-prompt font-semibold text-[10px] md:text-xs text-text-secondary leading-tight text-center w-[34vw] md:w-[190px]">
                Recovery from high-value
                <br />
                claims nearing payments
              </p>
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-4">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-primary-light" />
          <span className="font-prompt text-xs md:text-sm text-text-secondary">Forecast</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-primary-lighter" />
          <span className="font-prompt text-xs md:text-sm text-text-secondary">Confidence Band</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-danger-accent bg-white" />
          <span className="font-prompt text-xs md:text-sm text-text-secondary">Inflection Point</span>
        </div>
      </div>
    </div>
  );
}
