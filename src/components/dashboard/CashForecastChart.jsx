import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';

const chartData = [
  { x: 0, date: 'APR 13', value: 2.35, low: 2.45, high: 2.2 },
  { x: 1, date: '', value: 1.9, low: 2.05, high: 1.75 },
  { x: 2, date: '', value: 1.75, low: 1.9, high: 1.6 },
  { x: 3, date: 'APR 22', value: 1.65, low: 1.8, high: 1.5 },
  { x: 4, date: '', value: 2.15, low: 2.35, high: 1.95 },
  { x: 5, date: '', value: 2.6, low: 2.75, high: 2.4 },
  { x: 6, date: '', value: 2.52, low: 2.65, high: 2.3 },
  { x: 7, date: 'MAY 02', value: 2.2, low: 2.4, high: 2.0 },
  { x: 8, date: '', value: 1.9, low: 2.05, high: 1.75 },
  { x: 9, date: '', value: 1.85, low: 2.0, high: 1.7 },
  { x: 10, date: '', value: 1.8, low: 2.1, high: 1.45 },
  { x: 11, date: '', value: 2.1, low: 2.35, high: 1.75 },
  { x: 12, date: '', value: 2.52, low: 2.72, high: 2.3 },
  { x: 13, date: 'MAY 12', value: 2.52, low: 2.7, high: 2.32 },
  { x: 14, date: '', value: 2.15, low: 2.28, high: 2.0 },
];

export function CashForecastChart() {
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
              domain={[0, 14]}
              ticks={[0, 3, 7, 13]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#5F5F5F', fontFamily: 'Prompt' }}
              tickFormatter={(value) => {
                if (value === 0) return 'APR 13';
                if (value === 3) return 'APR 22';
                if (value === 7) return 'MAY 02';
                if (value === 13) return 'MAY 12';
                return '';
              }}
            />
            <YAxis
              domain={[1, 3]}
              reversed
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#5F5F5F', fontFamily: 'Prompt' }}
              tickFormatter={(value) => `$${value}M`}
              ticks={[1, 1.5, 2, 2.5, 3]}
            />
            
            {/* Grid lines */}
            <ReferenceLine y={1} stroke="#E6E6E6" strokeWidth={0.5} />
            <ReferenceLine y={1.5} stroke="#E6E6E6" strokeWidth={0.5} />
            <ReferenceLine y={2} stroke="#E6E6E6" strokeWidth={0.5} />
            <ReferenceLine y={2.5} stroke="#E6E6E6" strokeWidth={0.5} />
            <ReferenceLine y={3} stroke="#E6E6E6" strokeWidth={0.5} />

            {/* Confidence band */}
            <Area
              type="monotone"
              dataKey="high"
              stroke="none"
              fill="url(#confidenceBand)"
            />
            <Area
              type="monotone"
              dataKey="low"
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

            {/* Confidence band bounds */}
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

            {/* Orange highlight points */}
            <ReferenceDot
              x={5}
              y={2.6}
              r={5}
              fill="#FFFFFF"
              stroke="#FF7A58"
              strokeWidth={2}
            />
            <ReferenceDot
              x={10}
              y={1.8}
              r={5}
              fill="#FFFFFF"
              stroke="#FF7A58"
              strokeWidth={2}
            />

            {/* Annotation connector lines anchored to chart coordinates */}
            <ReferenceLine
              segment={[
                { x: 4, y: 1.85 },
                { x: 4, y: 2.15 },
              ]}
              stroke="#6B7280"
              strokeWidth={1}
            />
            <ReferenceLine
              segment={[
                { x: 9, y: 1.45 },
                { x: 9, y: 1.85 },
              ]}
              stroke="#6B7280"
              strokeWidth={1}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Annotation labels + connectors */}
        <div
          className="absolute pointer-events-none"
          style={{ top: '32%', left: '37%', transform: 'translateX(-50%)' }}
        >
          <p className="font-prompt font-semibold text-[10px] md:text-xs text-text-secondary leading-tight text-center w-[30vw] md:w-[170px]">
            Expected dip driven
            <br />
            by payer delays
          </p>
        </div>

        <div
          className="absolute pointer-events-none"
          style={{ top: '12%', left: '71%', transform: 'translateX(-50%)' }}
        >
          <p className="font-prompt font-semibold text-[10px] md:text-xs text-text-secondary leading-tight text-center w-[34vw] md:w-[190px]">
            Recovery from high-value
            <br />
            claims nearing payments
          </p>
        </div>
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
