import { ArrowDown } from 'lucide-react';

const riskItems = [
  {
    id: 1,
    title: 'AR Aging Beyond 90 Days',
    subtitle: '$1.8M at Risk:',
    description: 'Accounts receivable aging significantly impacts liquidity',
    evidence: 'AR >90 Days: 18% → 26% (Last 30 Days) | Total AR (Bucket 4 + 5): $1.8M | Key Drivers: Clinic East, Commercial Payer Mix',
    severity: 'critical',
  },
  {
    id: 2,
    title: 'Top Commercial Payer Delaying',
    subtitle: '11 days above baseline:',
    description: 'Largest payer showing sustained payment delay compared to historical patterns',
    evidence: 'Avg payment lag increased from 23 → 34 days (DOS vs payment date) | Impacting ~$620K in expected cash',
    severity: 'high',
  },
  {
    id: 3,
    title: 'Denial Rework Backlog',
    subtitle: 'Affects 2-week Cash Window:',
    description: 'Outstanding denials waiting rework prevent claim resubmission and payment',
    evidence: 'Adjustment rate increased from 16% to 22% | ~1,200 claims in rework, primarily authorization-related',
    severity: 'high',
  },
  {
    id: 4,
    title: 'Self-Pay Balance Aging',
    subtitle: 'Trending Longer:',
    description: 'Self-pay account showing extended aging pattern and reduced collection velocity',
    evidence: 'Avg days to collect increased from 48 → 67 days | self-pay AR now at $420K with declining recovery rate',
    severity: 'medium',
  },
];

const severityConfig = {
  critical: {
    label: 'Critical',
    bgColor: 'bg-danger-light',
    textColor: 'text-danger',
  },
  high: {
    label: 'High',
    bgColor: 'bg-warning-light',
    textColor: 'text-warning',
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-warning-pale',
    textColor: 'text-warning-subtle',
  },
};

function RiskItem({ item, isLast }) {
  const severity = severityConfig[item.severity];

  return (
    <div className={`py-2.5 ${!isLast ? 'border-b border-border' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-poppins font-semibold text-sm text-text-primary leading-snug">
            {item.title}
          </h4>
          <p className="font-prompt text-xs text-text-primary leading-relaxed mt-0.5">
            <span className="font-medium">{item.subtitle}</span>{' '}
            <span>{item.description}</span>
          </p>
          <p className="font-prompt text-xs text-primary leading-relaxed mt-0.5">
            <span className="font-bold">AI Evidence:</span>{' '}
            <span>{item.evidence}</span>
          </p>
        </div>
        <div className="flex flex-col items-end justify-start gap-1 flex-shrink-0 min-w-[72px]">
          <span className={`px-3 py-0.5 rounded-full text-xs font-prompt font-medium ${severity.bgColor} ${severity.textColor}`}>
            {severity.label}
          </span>
          <ArrowDown size={20} strokeWidth={1.5} className="text-primary mt-1" />
        </div>
      </div>
    </div>
  );
}

export function LiquidityRiskPanel() {
  return (
    <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary leading-normal">
          Liquidity Risk Intelligence
        </h3>
        <p className="font-poppins font-light text-xs md:text-sm text-text-secondary leading-normal">
          AI-Identified risks impacting near-terms cash availability
        </p>
      </div>

      {/* Total Risk Amount */}
      <div className="mb-2">
        <span className="font-poppins font-bold text-[5.5vw] md:text-xl text-danger-accent leading-none">$4,100,000 </span>
        <span className="font-poppins text-xs text-text-secondary">in identified liquidity risks across 4 key areas</span>
      </div>

      {/* Risk Items */}
      <div className="flex-1">
        {riskItems.map((item, index) => (
          <RiskItem 
            key={item.id} 
            item={item} 
            isLast={index === riskItems.length - 1}
          />
        ))}
      </div>

      {/* Footer Context */}
      <div className="mt-2 pt-2 border-t border-border">
        <p className="font-poppins text-xs text-primary">
          <span className="font-semibold">AI Context:</span>{' '}
          <span className="font-medium">
            Insights derived from AR aging (bucket 4-5), payment lag (service date vs payment date), adjustment patterns, and payer-level behavior across the last 30–90 days.
          </span>
        </p>
      </div>
    </div>
  );
}
