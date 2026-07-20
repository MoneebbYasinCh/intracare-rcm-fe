import { AlertTriangle, ArrowDown } from 'lucide-react';

const pipelineStages = [
  {
    id: 1,
    name: 'Charges Posted',
    claims: '3,200',
    amount: '$4,200,000',
    conversion: '100.00%',
    avgDays: '2',
    fromStart: '100%',
    progress: 100,
    hasWarning: false,
  },
  {
    id: 2,
    name: 'Claims Submitted',
    claims: '3,008',
    amount: '$3,980,000',
    conversion: '94.00%',
    avgDays: '4',
    fromStart: '94%',
    progress: 94,
    hasWarning: true,
    warningText: 'Adjudication queue processing delays',
    evidence: 'Avg adjudication time increased from 9 → 14 days | 1,200 claims pending (Category: Authorization)',
  },
  {
    id: 3,
    name: 'Claims Adjudicated',
    claims: '2,808',
    amount: '$3,680,000',
    conversion: '88.00%',
    avgDays: '14',
    fromStart: '88%',
    progress: 88,
    hasWarning: true,
    warningText: 'Payer processing delays, denial appeals',
    evidence: 'Payment lag increased by +11 days for top commercial payer | Adjustment Rate at 22% (↑ +6%)',
  },
];

const pipelineMetrics = [
  { label: 'Entry Volume', value: '3,200', description: 'charges posted' },
  { label: 'Exit Conversion', value: '69%', description: 'to cash realized', valueColor: 'text-danger-accent' },
  { label: 'Leakage', value: '31%', description: 'Claims', valueColor: 'text-danger-dark' },
  { label: 'Value Leakage', value: '$1,350,000', description: 'unrealized', valueColor: 'text-danger-dark' },
];

function PipelineStage({ stage, isLast }) {
  return (
    <div className="mb-4">
      {/* Stage Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 mb-1.5">
        <div>
          <h4 className="font-poppins font-semibold text-sm text-text-primary leading-snug">
            {stage.name}
          </h4>
          <p className="font-prompt text-xs text-text-secondary">
            {stage.claims} claims | <span className="font-bold">{stage.amount}</span> | {stage.conversion} conversion | Avg {stage.avgDays} days
          </p>
        </div>
        <div className="text-right">
          <p className="font-prompt text-xs text-text-primary">From Start</p>
          <p className="font-prompt font-bold text-sm text-primary">{stage.fromStart}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative h-5 bg-white shadow-sm overflow-hidden">
        <div 
          className="h-full bg-gradient-progress transition-all duration-500"
          style={{ width: `${stage.progress}%` }}
        />
      </div>

      {/* Warning Alert (if present) */}
      {stage.hasWarning && (
        <div className="mt-2 flex items-start gap-2 bg-danger-light border border-danger-dark rounded-md px-3 py-2">
          <AlertTriangle size={14} className="text-danger-dark flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="block font-poppins text-xs md:text-sm text-danger-dark">
              {stage.warningText}
            </span>
            <span className="block font-poppins text-xs md:text-sm text-danger-dark mt-0.5 md:mt-0 md:ml-4">
              <span className="font-bold">AI Evidence:</span> {stage.evidence}
            </span>
          </div>
        </div>
      )}

      {/* Arrow to next stage */}
      {!isLast && (
        <div className="flex justify-center my-2">
          <ArrowDown size={26} strokeWidth={1.8} className="text-text-secondary" />
        </div>
      )}
    </div>
  );
}

function ConversionInsight({ title, children }) {
  return (
    <div className="flex-1">
      <h4 className="font-poppins font-semibold text-sm text-primary mb-1">
        {title}
      </h4>
      <p className="font-poppins text-xs text-text-secondary leading-relaxed">
        {children}
      </p>
    </div>
  );
}

export function RevenueFlowPipeline() {
  return (
    <div className="border border-border rounded-lg p-[4%] md:p-5">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary leading-normal">
          Revenue Flow Pipeline
        </h3>
        <p className="font-poppins font-light text-xs md:text-sm text-text-secondary leading-normal">
          How revenue moves through the system - where it slows, leaks and stalls
        </p>
      </div>

      {/* Pipeline Visualization */}
      <div className="bg-primary-muted rounded-md p-[4%] md:p-4 mb-4">
        {pipelineStages.map((stage, index) => (
          <PipelineStage 
            key={stage.id} 
            stage={stage} 
            isLast={index === pipelineStages.length - 1}
          />
        ))}

      </div>

      {/* Conversion Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <ConversionInsight title="Conversion Quality">
          Clean claims improved 3.2%, but cash realization lagging by 5 days. Adjudication processing is the primary bottleneck submission and payment.
          <br />
          <span className="font-bold">Recommended Action:</span> Accelerate adjudication cycles to reduce processing delays and close the 5-day cash realization gap.
        </ConversionInsight>
        <ConversionInsight title="Flow Friction">
          Conversion weak between adjudication and payment stage. <span className="font-bold">AI Evidence:</span> 23% drop-off | ~$1.35M unrealized driven by payer delays and AR backlog. This is where 23% of value leaks.
          <br />
          <span className="font-bold">Recommended Action:</span> Focus on payer reconciliation could unlock $480K in near-term cash
        </ConversionInsight>
      </div>

      {/* Pipeline Metrics Summary */}
      <div className="bg-primary-muted rounded-md p-[4%] md:p-4">
        <h4 className="font-poppins font-semibold text-sm text-primary mb-3">
          Pipeline Metrics
        </h4>
        <div className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 md:gap-x-10 gap-y-3">
          {pipelineMetrics.map((metric, index) => (
            <div key={index} className="text-left md:justify-self-center">
              <p className="font-prompt text-xs text-text-primary">{metric.label}</p>
              <p className={`font-prompt font-semibold text-base ${metric.valueColor || 'text-primary'}`}>
                {metric.value}
              </p>
              <p className="font-prompt text-xs text-text-secondary">{metric.description}</p>
            </div>
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}
