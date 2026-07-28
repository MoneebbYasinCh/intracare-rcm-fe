import { useState, useEffect } from 'react';
import { api } from '../../api';

const severityConfig = {
  Critical:  { label: 'Critical', bgColor: 'bg-danger-light',  textColor: 'text-danger' },
  High:      { label: 'High',     bgColor: 'bg-warning-light',  textColor: 'text-warning' },
  Medium:    { label: 'Medium',   bgColor: 'bg-warning-pale',   textColor: 'text-warning-subtle' },
  Low:       { label: 'Low',      bgColor: 'bg-gray-100',       textColor: 'text-gray-600' },
  Unknown:   { label: '—',        bgColor: 'bg-gray-100',       textColor: 'text-gray-400' },
};

const severityLabels = {
  ar: 'Insurance AR', payer: 'Payer Delays', denial: 'Denials', selfpay: 'Patient Balances',
};

function formatCurrency(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function RiskItem({ card, isLast }) {
  const sev = severityConfig[card.severity] || severityConfig.Medium;
  return (
    <div className={`py-2 ${!isLast ? 'border-b border-border' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-poppins font-semibold text-sm text-text-primary">{card.title}</h4>
            <span className={`px-2 py-0.5 rounded-full text-xs font-prompt font-medium flex-shrink-0 ${sev.bgColor} ${sev.textColor}`}>{sev.label}</span>
          </div>
          <p className="font-prompt text-xs text-text-primary leading-relaxed mt-0.5">{card.impact_summary}</p>
          {card.ai_evidence && (
            <p className="font-prompt text-xs text-primary leading-relaxed mt-0.5">
              <span className="font-semibold">Data:</span> {card.ai_evidence}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SeverityPill({ label, value }) {
  const cfg = severityConfig[value] || severityConfig.Unknown;
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-prompt font-medium ${cfg.bgColor} ${cfg.textColor}`}>
      {label}: {cfg.label}
    </span>
  );
}

export function LiquidityRiskPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true); setError(null);
      const result = await api.getForecastRiskCards(7, 90);
      if (cancelled) return;
      setData(result?.risk_snapshot ? result : null);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="border border-border rounded-lg p-5 h-full flex items-center justify-center min-h-[200px]"><p className="font-poppins text-sm text-text-secondary">Loading risk intelligence…</p></div>;
  }
  if (error) {
    return <div className="border border-border rounded-lg p-5 h-full flex items-center justify-center min-h-[200px]"><p className="font-poppins text-sm text-danger-accent">{error}</p></div>;
  }
  if (!data) {
    return <div className="border border-border rounded-lg p-5 h-full flex items-center justify-center min-h-[200px]"><p className="font-poppins text-sm text-text-secondary">No risk data available.</p></div>;
  }

  const snap = data.risk_snapshot;
  const cards = snap.risk_cards || [];

  return (
    <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col">
      {/* Header: title + forecast summary side-by-side */}
      <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
        <div>
          <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary">
            Liquidity Risk Intelligence
          </h3>
          <p className="font-poppins font-light text-[3.2vw] md:text-sm text-text-secondary mt-0.5">
            AI analysis of revenue cycle risks impacting near-term cash
          </p>
        </div>
        <div className="flex gap-3 text-right">
          <div>
            <div className="font-prompt text-[2.8vw] md:text-xs text-text-secondary">7-Day Cash Forecast</div>
            <div className="font-poppins font-semibold text-sm text-text-primary">{formatCurrency(data.total_predicted)}</div>
          </div>
          <div>
            <div className="font-prompt text-[2.8vw] md:text-xs text-text-secondary">Avg / Day</div>
            <div className="font-poppins font-semibold text-sm text-text-primary">{formatCurrency(data.avg_daily)}</div>
          </div>
        </div>
      </div>

      {/* Risk exposure + severity pills */}
      <div className="mb-2">
        <span className="font-poppins font-bold text-[5vw] md:text-lg text-danger-accent">
          {formatCurrency(snap.total_risk_amount)}
        </span>
        <span className="font-prompt text-[2.5vw] md:text-xs text-text-secondary ml-1.5">
          outstanding risk — unpaid claims, denials &amp; aged patient balances
        </span>
        <div className="flex gap-1.5 flex-wrap mt-1">
          <SeverityPill label={severityLabels.ar} value={snap.ar_severity} />
          <SeverityPill label={severityLabels.payer} value={snap.payer_severity} />
          <SeverityPill label={severityLabels.denial} value={snap.denial_severity} />
          <SeverityPill label={severityLabels.selfpay} value={snap.selfpay_severity} />
        </div>
      </div>

      <div className="border-t border-border mb-2" />

      {/* Risk cards */}
      <div className="flex-1">
        {cards.length > 0 ? cards.map((card, i) => (
          <RiskItem key={card.title} card={card} isLast={i === cards.length - 1} />
        )) : (
          <p className="font-poppins text-sm text-text-secondary py-2">No risk cards available.</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-1.5 pt-2 border-t border-border">
        <p className="font-poppins text-xs text-text-secondary leading-relaxed">
          <span className="font-semibold">Sources:</span>{' '}
          AR aging, charge-posting delays, denial backlog &amp; patient balance data from the last 30–90 days.
        </p>
      </div>
    </div>
  );
}
