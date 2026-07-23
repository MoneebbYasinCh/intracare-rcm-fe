import { useState, useEffect } from 'react';
import { ArrowDown } from 'lucide-react';
import { api } from '../../api';

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
  low: {
    label: 'Low',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
  },
};

function formatCurrency(n) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function RiskItem({ card, isLast }) {
  const severity = severityConfig[card.severity.toLowerCase()] || severityConfig.medium;

  return (
    <div className={`py-2.5 ${!isLast ? 'border-b border-border' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-poppins font-semibold text-sm text-text-primary leading-snug">
            {card.title}
          </h4>
          <p className="font-prompt text-xs text-text-primary leading-relaxed mt-0.5">
            {card.impact_summary}
          </p>
          {card.ai_evidence && (
            <p className="font-prompt text-xs text-primary leading-relaxed mt-0.5">
              <span className="font-bold">AI Evidence:</span>{' '}
              <span>{card.ai_evidence}</span>
            </p>
          )}
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
  const [days, setDays] = useState(null);
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      const result = await api.getForecastRiskCards(7, 90);
      if (cancelled) return;
      if (!result || !result.risk_intelligence || result.risk_intelligence.length === 0) {
        setDays([]);
        setLoading(false);
        return;
      }
      setDays(result.risk_intelligence);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col items-center justify-center min-h-[200px]">
        <p className="font-poppins text-sm text-text-secondary">Loading risk intelligence…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col items-center justify-center min-h-[200px]">
        <p className="font-poppins text-sm text-danger-accent">{error}</p>
      </div>
    );
  }

  if (!days || days.length === 0) {
    return (
      <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col items-center justify-center min-h-[200px]">
        <p className="font-poppins text-sm text-text-secondary">
          No risk data available. Risk intelligence requires Athena and OpenAI API access.
        </p>
      </div>
    );
  }

  const currentDay = days[selectedDayIdx] || days[0];
  const cards = currentDay.risk_cards || [];

  return (
    <div className="border border-border rounded-lg p-[4%] md:p-5 h-full flex flex-col">
      {/* Header */}
      <div className="mb-2">
        <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary leading-normal">
          Liquidity Risk Intelligence
        </h3>
        <p className="font-poppins font-light text-xs md:text-sm text-text-secondary leading-normal">
          AI-Identified risks impacting near-term cash availability
        </p>
      </div>

      {/* Day selector tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {days.map((day, i) => (
          <button
            key={day.forecast_date}
            onClick={() => setSelectedDayIdx(i)}
            className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-prompt font-medium transition-colors whitespace-nowrap
              ${i === selectedDayIdx
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
              }`}
          >
            {formatDate(day.forecast_date)}
          </button>
        ))}
      </div>

      {/* Day summary */}
      <div className="flex items-center gap-3 mb-2 pb-2 border-b border-border">
        <div>
          <span className="font-poppins text-xs text-text-secondary">Predicted cash:</span>{' '}
          <span className="font-poppins font-semibold text-sm text-text-primary">
            {formatCurrency(currentDay.predicted_cash_flow)}
          </span>
        </div>
        <div>
          <span className="font-poppins text-xs text-text-secondary">Risk exposure:</span>{' '}
          <span className="font-poppins font-semibold text-sm text-danger-accent">
            {formatCurrency(currentDay.total_risk_amount)}
          </span>
        </div>
      </div>

      {/* Selected day risk */}
      <div className="mb-2">
        <span className="font-poppins font-bold text-[5vw] md:text-lg text-danger-accent leading-none">
          {formatCurrency(currentDay.total_risk_amount)}{' '}
        </span>
        <span className="font-poppins text-xs text-text-secondary">
          identified liquidity risks for {formatDate(currentDay.forecast_date)}
        </span>
      </div>

      {/* Risk Items for selected day */}
      <div className="flex-1">
        {cards.length > 0 ? cards.map((card, index) => (
          <RiskItem
            key={`${currentDay.forecast_date}-${card.title}`}
            card={card}
            isLast={index === cards.length - 1}
          />
        )) : (
          <p className="font-poppins text-sm text-text-secondary py-4">
            No risk data available for this day.
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-border">
        <p className="font-poppins text-xs text-primary">
          <span className="font-semibold">AI Context:</span>{' '}
          <span className="font-medium">
            Insights derived from AR aging, payment lag (service date vs payment date), adjustment patterns, and payer-level behavior across the last 30–90 days.
          </span>
        </p>
      </div>
    </div>
  );
}
