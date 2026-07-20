import { ArrowUp, ArrowDown, Wallet, Building2, User } from 'lucide-react';

const summaryMetrics = [
  { label: 'Total Contributors', value: '6', description: 'entities tracking' },
  { label: 'Total Contributors', value: '$7,890,000', description: 'forecasting' },
  { label: 'High Risk', value: '2', description: 'entities', valueColor: 'text-danger-dark' },
  { label: 'Top Contributor', value: 'aetna', description: '$1,850,000', isLogo: true, logo: '/aetna.png' },
];

const payerRankings = [
  {
    name: 'Aetna',
    logo: '/aetna.png',
    type: 'Payer',
    contribution: '$1,850,000',
    risk: 'high',
    pattern: 'Slowing payment cycles, emerging delays',
    trend: { value: '2%', direction: 'up', label: 'this period' },
    progress: 100,
  },
  {
    name: 'United Healthcare',
    logo: '/united-healthcare.png',
    type: 'Payer',
    contribution: '$1,640,000',
    risk: 'medium',
    pattern: 'Stable with minor volatility',
    trend: { value: '1%', direction: 'up', label: 'this period' },
    progress: 88,
  },
];

const clinicRankings = [
  {
    name: 'Primary Case Clinic',
    type: 'Clinic',
    contribution: '$1,430,000',
    risk: 'low',
    pattern: 'Growing consistently, best performance clinic',
    trend: { value: '5%', direction: 'up', label: 'this period' },
    progress: 100,
  },
  {
    name: 'Specialty Center',
    type: 'Clinic',
    contribution: '$960,000',
    risk: 'high',
    pattern: 'High value but declining collections',
    trend: { value: '3%', direction: 'down', label: 'this period' },
    progress: 67,
  },
];

const providerRankings = [
  {
    name: 'Dr. Aziz',
    type: 'Provider',
    contribution: '$670,000',
    risk: 'low',
    pattern: 'Top individual performer, strong claim quality',
    trend: { value: '8%', direction: 'up', label: 'this period' },
    progress: 100,
  },
];

const concentrationData = [
  { name: 'Aetna', logo: '/aetna.png', value: '23%', progress: 23 },
  { name: 'United Healthcare', logo: '/united-healthcare.png', value: '20.9%', progress: 20.9 },
  { name: 'Primary Care Clinic', logo: null, value: '17.1%', progress: 17.1 },
];

const riskDistribution = { low: 43, medium: 32, high: 25, entities: 3 };

const riskConfig = {
  high: { label: 'High Risk', bgColor: 'bg-danger-light', textColor: 'text-danger-dark' },
  medium: { label: 'Medium Risk', bgColor: 'bg-warning-light', textColor: 'text-warning' },
  low: { label: 'Low Risk', bgColor: 'bg-success-muted', textColor: 'text-success' },
};

function EntityCard({ entity, showLogo = true }) {
  const risk = riskConfig[entity.risk];
  const TrendIcon = entity.trend.direction === 'up' ? ArrowUp : ArrowDown;
  const trendColor = entity.trend.direction === 'up' ? 'text-success' : 'text-danger';

  return (
    <div className="bg-primary-muted rounded-lg p-3 mb-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {showLogo && entity.logo ? (
            <img src={entity.logo} alt={entity.name} className="h-4 w-auto object-contain" />
          ) : (
            <span className="font-poppins font-semibold text-sm text-primary">{entity.name}</span>
          )}
          <span className="font-poppins text-xs text-text-secondary">{entity.type}</span>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-prompt font-medium ${risk.bgColor} ${risk.textColor}`}>
          {risk.label}
        </span>
      </div>

      {/* Cash Contribution */}
      <div className="mb-2">
        <p className="font-poppins text-xs text-text-secondary">Cash Contribution</p>
        <div className="flex items-center justify-between">
          <div className="flex-1 h-2 bg-surface-border rounded-full mr-3 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${entity.progress}%` }}
            />
          </div>
          <span className="font-poppins font-semibold text-sm text-primary">{entity.contribution}</span>
        </div>
      </div>

      {/* Pattern */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
        <p className="font-poppins text-xs text-text-secondary">
          <span className="font-semibold text-primary">Pattern:</span> {entity.pattern}
        </p>
        <div className="flex items-center gap-1">
          <TrendIcon size={12} className={trendColor} />
          <span className={`font-poppins text-xs font-semibold ${trendColor}`}>{entity.trend.value}</span>
          <span className="font-poppins text-xs text-text-secondary">{entity.trend.label}</span>
        </div>
      </div>
    </div>
  );
}

function ProviderCard({ provider }) {
  const risk = riskConfig[provider.risk];
  const TrendIcon = provider.trend.direction === 'up' ? ArrowUp : ArrowDown;
  const trendColor = provider.trend.direction === 'up' ? 'text-success' : 'text-danger';

  return (
    <div className="bg-primary-muted rounded-lg p-3">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-poppins font-semibold text-sm text-primary">{provider.name}</span>
            <span className="font-poppins text-xs text-text-secondary">{provider.type}</span>
          </div>
          <p className="font-poppins text-xs text-text-secondary">Cash Contribution</p>
        </div>
        <div className="text-right">
          <span className={`px-2.5 py-1 rounded-full text-xs font-prompt font-medium ${risk.bgColor} ${risk.textColor}`}>
            {risk.label}
          </span>
          <p className="font-poppins font-semibold text-sm text-primary mt-1">{provider.contribution}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-surface-border rounded-full mb-2 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${provider.progress}%` }}
        />
      </div>

      {/* Pattern & Trend */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
        <p className="font-poppins text-xs text-text-secondary">
          <span className="font-semibold text-primary">Pattern:</span> {provider.pattern}
        </p>
        <div className="flex items-center gap-1">
          <TrendIcon size={12} className={trendColor} />
          <span className={`font-poppins text-xs font-semibold ${trendColor}`}>{provider.trend.value}</span>
          <span className="font-poppins text-xs text-text-secondary">{provider.trend.label}</span>
        </div>
      </div>
    </div>
  );
}

export function EntityContributionIntelligence() {
  return (
    <div className="border border-border rounded-xl p-[4%] md:p-5">
      {/* Header */}
      <div className="mb-3">
        <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary leading-normal">
          Entity Contribution Intelligence
        </h3>
        <p className="font-poppins font-light text-xs md:text-sm text-text-secondary leading-normal">
          Ranked contribution to future cash flow-payers, clinic, and providers
        </p>
      </div>

      {/* Summary Metrics */}
      <div className="bg-danger-muted/40 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
        {summaryMetrics.map((metric, index) => (
          <div key={index} className="text-center">
            <p className="font-poppins text-xs text-text-secondary">{metric.label}</p>
            {metric.isLogo ? (
              <div className="flex items-center justify-center gap-1">
                <img src={metric.logo} alt={metric.value} className="h-5 w-auto object-contain" />
              </div>
            ) : (
              <p className={`font-poppins font-bold text-[5.5vw] md:text-xl ${metric.valueColor || 'text-primary'}`}>
                {metric.value}
              </p>
            )}
            <p className="font-poppins text-xs text-text-secondary">{metric.description}</p>
          </div>
        ))}
      </div>

      {/* Payer & Clinic Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Payer Ranking */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={16} className="text-primary" />
            <h4 className="font-poppins font-semibold text-sm text-primary">Payer Ranking</h4>
          </div>
          {payerRankings.map((payer, index) => (
            <EntityCard key={index} entity={payer} showLogo={true} />
          ))}
        </div>

        {/* Clinic Ranking */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} className="text-primary" />
            <h4 className="font-poppins font-semibold text-sm text-primary">Clinic Ranking</h4>
          </div>
          {clinicRankings.map((clinic, index) => (
            <EntityCard key={index} entity={clinic} showLogo={false} />
          ))}
        </div>
      </div>

      {/* Rendering Provider Ranking */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <User size={16} className="text-primary" />
          <h4 className="font-poppins font-semibold text-sm text-primary">Rendering Provider Ranking</h4>
        </div>
        {providerRankings.map((provider, index) => (
          <ProviderCard key={index} provider={provider} />
        ))}
      </div>

      {/* Concentration & Risk Analysis */}
      <div className="bg-surface-muted rounded-xl p-4">
        <h4 className="font-poppins font-semibold text-sm text-primary mb-4">
          Concentration & Risk Analysis
        </h4>

        {/* Top Contributor Concentration */}
        <div className="mb-4">
          <p className="font-poppins text-sm text-text-primary mb-2">Top Contributor Concentration</p>
          <div className="space-y-2">
            {concentrationData.map((item, index) => (
              <div key={index} className="flex items-center gap-2 md:gap-3">
                {item.logo ? (
                  <img src={item.logo} alt={item.name} className="h-4 w-20 object-contain object-left" />
                ) : (
                  <span className="font-poppins text-xs text-text-primary w-16 md:w-20">{item.name}</span>
                )}
                <div className="flex-1 h-2 bg-surface-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${item.progress * 3}%` }}
                  />
                </div>
                <span className="font-poppins text-sm text-text-primary w-12 md:w-14 text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div>
          <p className="font-poppins text-sm text-text-primary mb-2">Risk Distribution</p>
          <div className="flex flex-wrap items-center gap-1 mb-1">
            <span className="font-poppins text-xs text-text-secondary">Low Risk</span>
            <div className="flex-1 h-3 bg-surface-border rounded-full overflow-hidden flex">
              <div className="h-full bg-success" style={{ width: `${riskDistribution.low}%` }} />
              <div className="h-full bg-white" style={{ width: `${riskDistribution.medium}%` }} />
              <div className="h-full bg-white" style={{ width: `${riskDistribution.high}%` }} />
            </div>
            <span className="font-poppins text-xs text-text-primary">{riskDistribution.low}%</span>
            <span className="font-poppins text-xs text-text-secondary">| {riskDistribution.entities} Entities</span>
          </div>
        </div>
      </div>
    </div>
  );
}
