import { ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';

const payerGroups = [
  {
    id: 1,
    name: 'Aetna',
    logo: '/aetna.png',
    description: 'Commercial payer cluster trending slower than historical norm',
    behaviorNote: 'This Payer is showing behavioral changes that may impact liquidity',
    monthlyContribution: '$2,100,000',
    payerCycle: '45 days',
    paymentTrend: { days: 8, direction: 'down', label: 'Slowing' },
    risk: 'high',
    evidence: 'Payment lag increased from 37 → 45 days | Impacting ~$2.1M in monthly collections.',
    cycleProgress: 89,
  },
  {
    id: 2,
    name: 'Cigna',
    logo: '/cigna.png',
    description: 'Stable payment cycles with minor volatility',
    behaviorNote: null,
    monthlyContribution: '$1,850,000',
    payerCycle: '86 days',
    paymentTrend: { days: 2, direction: 'down', label: 'Slowing' },
    risk: 'medium',
    evidence: 'Payment lag increased from 78 → 86 days | ~$1.85M monthly collections affected with moderate variability across claims.',
    cycleProgress: 76,
  },
  {
    id: 3,
    name: 'Medicaid',
    logo: '/medicaid.png',
    description: 'Consistent performance, slight improvement trend',
    behaviorNote: null,
    monthlyContribution: '$1,620,000',
    payerCycle: '32 days',
    paymentTrend: { days: 1, direction: 'up', label: 'Improving' },
    risk: 'low',
    evidence: 'Payment cycle stable at ~32 days (↓ 1 day vs baseline) | Consistent conversion from claims to cash with low variance across recent payment cycles.',
    cycleProgress: 76,
  },
];

const timelineData = [
  { name: 'Aetna', logo: '/aetna.png', baseline: '35 days', current: '46 days', baselineMarker: 76, currentMarker: 92 },
  { name: 'United Healthcare', logo: '/united-healthcare.png', baseline: '35 days', current: '38 days', baselineMarker: 76, currentMarker: 82 },
  { name: 'Medicaid', logo: '/medicaid.png', baseline: '35 days', current: '38 days', baselineMarker: 76, currentMarker: 82 },
];

const portfolioSummary = [
  { label: 'Total Contributors', value: '5', description: 'Payer groups' },
  { label: 'High Risk', value: '2', description: 'Payers', valueColor: 'text-danger-dark' },
  { label: 'Average Payment Days', value: '49', description: 'Days' },
  { label: 'Trending Slower', value: '4', description: 'Payers', valueColor: 'text-warning' },
];

const riskConfig = {
  high: { label: 'High Risk', bgColor: 'bg-danger-light', textColor: 'text-danger-dark' },
  medium: { label: 'Medium Risk', bgColor: 'bg-warning-light', textColor: 'text-warning' },
  low: { label: 'Low Risk', bgColor: 'bg-success-muted', textColor: 'text-success' },
};

function PayerCard({ payer }) {
  const risk = riskConfig[payer.risk];
  const TrendIcon = payer.paymentTrend.direction === 'down' ? ArrowUp : ArrowDown;
  const trendColor = payer.paymentTrend.direction === 'down' ? 'text-danger-accent' : 'text-success';

  return (
    <div className="bg-primary-muted rounded-lg p-2.5">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Left Section */}
        <div className="flex-1 min-w-0">
          {/* Top Row: Logo + Description */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <img src={payer.logo} alt={payer.name} className="h-3.5 w-auto object-contain flex-shrink-0" />
            <span className="font-poppins text-xs text-text-secondary truncate">
              {payer.description}
            </span>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1.5 mt-1.5">
            <div>
              <p className="font-poppins text-xs text-text-secondary">Monthly Contribution</p>
              <p className="font-poppins font-semibold text-xs text-text-primary">{payer.monthlyContribution}</p>
              <div className="w-full h-1 bg-primary rounded-full mt-1" />
            </div>
            <div>
              <p className="font-poppins text-xs text-text-secondary">Payer Cycle</p>
              <p className="font-poppins font-semibold text-xs text-text-primary">{payer.payerCycle}</p>
              <div className="w-full h-1 bg-white rounded-full mt-1 overflow-hidden">
                <div className="h-full rounded-full bg-danger-accent" style={{ width: `${payer.cycleProgress}%` }} />
              </div>
            </div>
            <div>
              <p className="font-poppins text-xs text-text-secondary">Payment Trend</p>
              <div className="flex items-center gap-0.5">
                <TrendIcon size={12} strokeWidth={2} className={trendColor} />
                <p className="font-poppins font-semibold text-xs text-text-primary">{payer.paymentTrend.days} days</p>
              </div>
              <p className="font-poppins text-xs text-text-secondary">{payer.paymentTrend.label}</p>
            </div>
          </div>

          {payer.behaviorNote && (
            <div className="flex items-center gap-1 mt-1.5">
              <AlertTriangle size={10} className="text-warning flex-shrink-0" />
              <span className="font-poppins text-xs text-text-primary">{payer.behaviorNote}</span>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="w-full md:w-[30%] flex-shrink-0 flex flex-col gap-1">
          <div className="flex md:justify-end">
            <span className={`px-2.5 py-1 rounded-full text-xs font-prompt font-medium ${risk.bgColor} ${risk.textColor}`}>
              {risk.label}
            </span>
          </div>
          <div className="flex-1 bg-surface-muted rounded-md p-1.5">
            <p className="font-poppins font-bold text-xs text-danger-dark mb-0.5">AI Evidence:</p>
            <p className="font-poppins text-[11px] text-text-secondary leading-tight">{payer.evidence}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertBox({ title, description, evidence }) {
  return (
    <div className="bg-surface-muted rounded-md p-3">
      <h5 className="font-poppins font-semibold text-sm text-danger-dark mb-0.5">{title}</h5>
      <p className="font-poppins text-xs text-text-secondary mb-1 leading-tight">{description}</p>
      <p className="font-poppins text-xs text-primary leading-tight">
        <span className="font-bold">AI Evidence:</span> {evidence}
      </p>
    </div>
  );
}

export function PaymentBehaviorIntelligence() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
      {/* Left Column - Payment Behavior Intelligence */}
      <div className="border border-border rounded-lg p-[4%] md:p-4 flex flex-col h-full">
        <div className="mb-3">
          <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary">Payment Behavior Intelligence</h3>
          <p className="font-poppins font-light text-xs md:text-sm text-text-secondary">
            How different payer groups behave over time - patterns, delays, and emerging slowdowns
          </p>
        </div>

        {/* Payer Cards */}
        <div className="space-y-2.5 mb-4">
          {payerGroups.map((payer) => (
            <PayerCard key={payer.id} payer={payer} />
          ))}
        </div>

        {/* Alert Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <AlertBox
            title="High Risk Alert"
            description="Commercial payer cluster trending below historical norms, with the top two payers showing consistent 8–11 day delays above baseline. Close monitoring recommended over the next two weeks."
            evidence="Avg payment lag increased from 35 → 46 days across top 2 payers | ~$3.9M impacted in current cycle"
          />
          <AlertBox
            title="Emerging Pattern"
            description="Self-pay balances trending above threshold showing delayed behavior. Collection velocity declining 15% YoY. Consider enhanced collection strategy."
            evidence="Avg days to collect increased from 48 → 67 days | Collection velocity down 15% across self-pay segment"
          />
        </div>

        {/* Payment Performance Timeline */}
        <div className="mb-4">
          <h4 className="font-poppins font-semibold text-sm text-primary mb-2">Payment Performance Timeline</h4>
          <div className="space-y-2">
            {timelineData.map((item, index) => (
              <div key={index}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-1">
                  <img src={item.logo} alt={item.name} className="h-5 w-24 object-contain object-left" />
                  <span className="font-poppins text-xs text-text-primary">
                    Baseline: {item.baseline} | Current: {item.current}
                  </span>
                </div>
                <div className="h-5 bg-border/60 overflow-hidden relative">
                  <div className="absolute inset-y-0 w-px bg-text-secondary/50" style={{ left: `${item.baselineMarker}%` }} />
                  <div className="absolute inset-y-0 w-px bg-primary" style={{ left: `${item.currentMarker}%` }} />
                  <div
                    className="absolute inset-y-0"
                    style={{
                      left: `${item.currentMarker}%`,
                      width: '10%',
                      background: 'linear-gradient(90deg, rgba(15,124,255,0.7) 0%, rgba(15,124,255,0) 100%)'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payer Portfolio Summary */}
        <div className="bg-surface-muted rounded-lg p-[4%] md:p-3.5">
          <h4 className="font-poppins font-semibold text-sm text-primary mb-2">Payer Portfolio Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {portfolioSummary.map((metric, index) => (
              <div key={index}>
                <p className="font-prompt text-xs text-text-primary">{metric.label}</p>
                <p className={`font-prompt font-semibold text-[5.5vw] md:text-xl leading-tight ${metric.valueColor || 'text-primary'}`}>
                  {metric.value}
                </p>
                <p className="font-prompt text-xs text-text-secondary">{metric.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Cash Driver Decomposition */}
      <div className="border border-border rounded-xl p-[4%] md:p-5 flex flex-col h-full">
        <div className="mb-3">
          <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary leading-normal">
            Cash Driver Decomposition
          </h3>
          <p className="font-poppins font-light text-xs md:text-sm text-text-secondary leading-normal">
            Breaking down what's changing forecasted cash and why
          </p>
        </div>

        {/* Forecasted Cash Movement */}
        <div className="bg-danger-muted/40 rounded-xl p-4 mb-4 text-center">
          <p className="font-poppins text-xs text-text-primary mb-1">Forecasted Cash Movement</p>
          <p className="font-poppins font-bold text-[5.5vw] md:text-xl text-danger-accent mb-1">-$660,000</p>
          <p className="font-poppins text-xs text-text-secondary">Net change driven by 1 positive and 3 negative factors</p>
        </div>

        {/* Narrative Decomposition */}
        <div className="mb-4">
          <h4 className="font-poppins font-semibold text-sm text-primary mb-3">
            Narrative Decomposition
          </h4>

          {/* Positive Drivers */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-success" />
              <span className="font-poppins font-semibold text-sm text-success">Positive Drivers</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1">
              <div className="flex-1 h-7 bg-surface-border rounded overflow-hidden relative">
                <div className="h-full bg-gradient-to-r from-success to-success/60 rounded" style={{ width: '72%' }} />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 font-poppins font-semibold text-sm text-text-primary">
                  $420,000
                </span>
              </div>
              <div className="text-left min-w-0 md:min-w-[140px]">
                <p className="font-poppins font-semibold text-sm text-text-primary">Increased Charges</p>
                <p className="font-poppins text-xs text-text-secondary">Higher service volume in primary care and specialties.</p>
              </div>
              <ArrowDown size={18} className="text-primary-light flex-shrink-0" />
            </div>
            <p className="font-poppins text-xs text-text-secondary bg-danger-muted/70 rounded-full px-2 py-0.5 leading-tight">
              <span className="font-bold text-primary">AI Evidence:</span> Charges increased by 10% vs last month (from $3.8M → $4.2M), driven by primary care and specialty visits
            </p>
          </div>

          {/* Headwinds */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-3 h-3 rounded-full bg-danger" />
              <span className="font-poppins font-semibold text-sm text-danger">Headwinds</span>
            </div>
            
            {[
              { amount: '-$650,000', barWidth: '100%', title: 'Denial Impact', desc: 'Claims not approved by payers requiring rework or write-off', evidence: 'Adjustment rate increased from 16% → 22%; ~1,200 claims impacted, primarily authorization-related' },
              { amount: '-$290,000', barWidth: '55%', title: 'Payment Lag', desc: 'Delayed conversion of claims to actual cash receipts', evidence: 'Avg payment lag increased from 35 → 46 days (service date vs payment date), impacting ~$290K in expected cash timing' },
              { amount: '-$180,000', barWidth: '35%', title: 'AR Aging', desc: 'Reduced recovery rates on aging accounts', evidence: 'AR >90 days increased from 18% → 26%, contributing ~$180K reduction in near-term recoverability' },
            ].map((item, index) => (
              <div key={index} className="mb-3">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-1">
                  <div className="flex-1 h-7 bg-surface-border rounded overflow-hidden relative">
                    <div className="h-full bg-gradient-to-r from-danger to-danger/60 rounded" style={{ width: item.barWidth }} />
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 font-poppins font-semibold text-sm text-text-primary">
                      {item.amount}
                    </span>
                  </div>
                  <div className="text-left min-w-0 md:min-w-[140px]">
                    <p className="font-poppins font-semibold text-sm text-text-primary">{item.title}</p>
                    <p className="font-poppins text-xs text-text-secondary">{item.desc}</p>
                  </div>
                  <ArrowDown size={18} className="text-primary-light flex-shrink-0" />
                </div>
                <p className="font-poppins text-xs text-text-secondary bg-danger-muted/70 rounded-full px-2 py-0.5 leading-tight">
                  <span className="font-bold text-primary">AI Evidence:</span> {item.evidence}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* AI Narrative Summary */}
        <div className="bg-surface-muted rounded-xl p-4 mb-4">
          <h4 className="font-poppins font-semibold text-sm text-primary-accent mb-2">
            AI Narrative Summary
          </h4>
          <p className="font-poppins text-xs text-text-secondary leading-relaxed">
            Forecasted cash is down due to a combination of factors. <span className="font-semibold">Charges</span> increased by <span className="font-semibold text-success">$420K (+10%)</span>, but this is offset by higher <span className="font-semibold">adjustment rates</span> <span className="font-semibold text-danger">(22%)</span>, increased <span className="font-semibold">payment lag</span> <span className="font-semibold text-danger">(+11 days)</span>, and rising <span className="font-semibold">AR &gt;90 days</span> <span className="font-semibold text-danger">(26%)</span>. The <span className="font-semibold">net impact</span> reflects a <span className="font-semibold text-danger">$660K</span> contraction in <span className="font-semibold">near-term cash availability</span>.
          </p>
        </div>

        {/* Driver Ranking */}
        <div>
          <h4 className="font-poppins font-semibold text-sm text-primary mb-3">
            Driver Ranking
          </h4>
          <div className="space-y-2">
            {[
              { label: 'Denial Impact', value: '-$610,000 | Adj rate ↑ to 22%', color: 'text-danger', dotColor: 'bg-danger' },
              { label: 'Increased Charges', value: '+$420,000 | Charges ↑ 10%', color: 'text-success', dotColor: 'bg-success' },
              { label: 'Payment Lag', value: '-$290,000 | Lag ↑ +11 days', color: 'text-warning', dotColor: 'bg-warning' },
              { label: 'AR Aging', value: '-$180,000 | AR >90 at 26%', color: 'text-danger', dotColor: 'bg-danger' },
            ].map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 bg-surface-muted rounded-md px-4 py-2.5">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.dotColor}`} />
                  <span className="font-poppins text-xs text-text-primary text-left">{item.label}</span>
                </div>
                <span className={`font-poppins font-semibold text-xs ${item.color}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
