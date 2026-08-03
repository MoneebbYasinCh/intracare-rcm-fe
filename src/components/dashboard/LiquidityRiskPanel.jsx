import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../api';

const severityConfig = {
  Critical:  { label: 'Critical', bgColor: 'bg-danger-light',  textColor: 'text-danger' },
  High:      { label: 'High',     bgColor: 'bg-warning-light',  textColor: 'text-warning' },
  Medium:    { label: 'Medium',   bgColor: 'bg-warning-pale',   textColor: 'text-warning-subtle' },
  Low:       { label: 'Low',      bgColor: 'bg-gray-100',       textColor: 'text-gray-600' },
  Unknown:   { label: '—',        bgColor: 'bg-gray-100',       textColor: 'text-gray-400' },
};

const severityLabels = {
  ar: 'Insurance AR', payer: 'Payer Delays', denial: 'Denials', /* selfpay: 'Patient Balances', */
};

function formatCurrency(n) {
  if (n == null || isNaN(n)) return '—';
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function timeAgo(isoString) {
  if (!isoString) return 'never';
  const diff = Date.now() - new Date(isoString).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return `${secs}s ago`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
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
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isStale, setIsStale] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pollRef = useRef(null);

  const loadLastUpdated = useCallback(async () => {
    const info = await api.getRiskCardsLastUpdated();
    setLastUpdated(info.last_updated);
    setIsStale(info.is_stale);
    return info;
  }, []);

  const loadRiskCards = useCallback(async () => {
    setLoading(true); setError(null);
    const result = await api.getForecastRiskCards(7, 90);
    setData(result?.risk_snapshot ? result : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      await Promise.all([loadRiskCards(), loadLastUpdated()]);
    }
    load();
    return () => { cancelled = true; };
  }, [loadRiskCards, loadLastUpdated]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await api.refreshRiskCards();

    pollRef.current = setInterval(async () => {
      const info = await api.getRiskCardsLastUpdated();
      setLastUpdated(info.last_updated);
      setIsStale(info.is_stale);
      if (!info.is_stale) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setRefreshing(false);
        // re-fetch fresh risk cards
        setLoading(true);
        const result = await api.getForecastRiskCards(7, 90);
        setData(result?.risk_snapshot ? result : null);
        setLoading(false);
      }
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
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
  const cards = (snap.risk_cards || []).filter(card => !/self.?pay/i.test(card.title));

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
          <p className="font-prompt text-[2.5vw] md:text-xs text-text-secondary mt-0.5">
            Updated {timeAgo(lastUpdated)}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
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
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1 text-xs font-prompt font-medium rounded border border-border text-text-secondary hover:bg-gray-50 hover:text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Staleness warning + refresh */}
      {isStale && (
        <div className="flex items-center justify-between gap-2 mb-2 px-3 py-2 bg-warning-light border border-warning rounded-md">
          <p className="font-prompt text-xs text-text-primary font-medium">
            Data may be outdated. Refreshing retrieves the latest risk analysis.
          </p>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-1 text-xs font-prompt font-medium rounded-md border border-warning bg-warning text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      )}

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
          {/* <SeverityPill label={severityLabels.selfpay} value={snap.selfpay_severity} /> */}
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
