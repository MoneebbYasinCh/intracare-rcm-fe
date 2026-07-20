import { useState } from 'react';

const scenarioDefinitions = [
  {
    id: 1,
    title: 'Denial Rate Improves 2%',
    description:
      'Forecasting on improving the denial rate shows significant potential in reducing claim denials and strengthening liquidity.',
    impact: '+$730,000',
    impactValue: 730000,
    confidence: 65,
    highImpactOpportunities: [
      {
        title: 'Reduce Denial Rate',
        target: '4.2% denial rate',
        impact: '+$490,000',
      },
    ],
    supportingOpportunity: {
      title: 'Improvement in Denial Conversion',
      impact: '+$240,000',
    },
    supportingVolume: '$1M worth of claims processed more efficiently',
    combinedPotential: 730000,
    aiRecommendation:
      'Forecasting on improving the Denial Rate shows significant potential in reducing claim denials, yielding a $490,000 improvement. AI suggests optimizing adjudication processes further for increased confidence in liquidity improvement with a 65% chance of success.',
  },
  {
    id: 2,
    title: 'Top Payers Reduces Payment Lag',
    description: 'Commercial payers return to 35-days baseline from current 46-day average',
    impact: '+$680,000',
    impactValue: 680000,
    confidence: 45,
    highImpactOpportunities: [
      {
        title: 'Reduce Payer Lag',
        value: '+$620,000',
        items: [
          'Target lag reduction from 46 → 35 days',
          'Impacted volume: ~$2.8M monthly collections',
        ],
      },
      {
        title: 'Improve Denial Conversion',
        subtitle: 'Supporting Opportunity:',
        value: '+$480,000',
        items: [
          'Adjustment rate currently at 22% (↑ 6%)',
          '~1200 claims eligible for faster reprocessing',
        ],
      },
    ],
    combinedPotential: 1100000,
    aiRecommendation:
      'Forecasting on reducing payer lag for the top 2 commercial payers represents the highest confidence opportunity to improve liquidity. This scenario has 45% confidence with $620,000 potential impact.',
  },
  {
    id: 3,
    title: 'AR Aging Collections Accelerate',
    description:
      'Accelerating recovery on aging AR and self-pay follow-up is projected to materially improve cash recovery.',
    impact: '+$880,000',
    impactValue: 880000,
    confidence: 72,
    highImpactOpportunities: [
      {
        title: 'Accelerate AR Aging Collections',
        target: 'Improve AR recovery from 35% to 50%',
        impact: '+$650,000',
      },
    ],
    supportingOpportunity: {
      title: 'Improvement in Self-Pay Collection Efforts',
      impact: '+$230,000',
    },
    supportingVolume: '$2.5M in self-pay accounts',
    combinedPotential: 880000,
    aiRecommendation:
      'Accelerating AR Aging Collections delivers a projected improvement of $650,000. AI recommends enhancing follow-up efforts on aging balances and introducing automated reminders to improve recovery rates for outstanding AR, with a 72% confidence in achieving the impact.',
  },
  {
    id: 4,
    title: 'Improve Self-Pay Collection Efforts',
    description:
      'Reduce 60+ day balances by 30% while improving denial conversion on self-pay claims to lift combined recovery.',
    impact: '+$920,000',
    impactValue: 920000,
    confidence: 72,
    highImpactOpportunities: [
      {
        title: 'Improve Self-Pay Collection Efforts',
        target: 'Reduce 60+ day balances by 30%',
        impact: '+$440,000',
      },
    ],
    supportingOpportunity: {
      title: 'Improve Denial Conversion',
      impact: '+$480,000',
    },
    supportingVolume: '$1.5M in self-pay claims',
    combinedPotential: 920000,
    aiRecommendation:
      'Forecasting on improving self-pay collections shows a projected improvement of $440,000. AI suggests automating self-pay reminders and enhancing payment plans for greater recovery of aging balances. With a 72% confidence level, this approach has a strong chance to positively impact liquidity.',
  },
];

function ScenarioCard({ scenario, isSelected, onToggle }) {
  const confidenceColor = scenario.confidence >= 60 ? 'bg-success' : 'bg-primary';

  return (
    <div className="rounded-lg p-3" style={{ backgroundColor: '#E5E5E5' }}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 cursor-pointer transition-colors ${
            isSelected
              ? 'border-danger bg-white'
              : 'border-border bg-white hover:border-primary-light'
          }`}
        >
          {isSelected && <div className="w-3 h-3 bg-danger rounded-sm" />}
        </button>

        <div className="flex-1">
          <h4 className="font-poppins font-semibold text-sm text-primary mb-1">{scenario.title}</h4>
          <p className="font-poppins text-xs text-text-secondary mb-2">{scenario.description}</p>

          <div className="flex items-center justify-between">
            <div>
              <span className="font-poppins text-xs text-text-secondary">Impact: </span>
              <span className="font-poppins font-semibold text-xs text-success">{scenario.impact}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-poppins text-xs text-text-secondary">Confidence: </span>
              <span className="font-poppins font-semibold text-xs text-text-primary">{scenario.confidence}%</span>
              <div className="w-16 h-1.5 bg-surface-border rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${confidenceColor}`}
                  style={{ width: `${scenario.confidence}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatCurrencyPlain(value) {
  return '$' + value.toLocaleString();
}

export function ScenarioSimulationEngine() {
  const [selectedId, setSelectedId] = useState(2);

  const baseline = 2860000;
  const selectedScenario = scenarioDefinitions.find((s) => s.id === selectedId);
  const totalImpact = selectedScenario ? selectedScenario.impactValue : 0;
  const projected = baseline + totalImpact;

  const selectedScenarios = selectedScenario ? [selectedScenario] : [];

  const toggleScenario = (id) => {
    setSelectedId(id);
  };

  const formatCurrency = (value) => {
    return '$' + value.toLocaleString();
  };

  return (
    <div className="border border-border rounded-xl p-[4%] md:p-5">
      <div className="mb-3">
        <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary leading-normal">
          Scenario Simulation Engine
        </h3>
        <p className="font-poppins font-light text-xs md:text-sm text-text-secondary leading-normal">
          Explore "what if" scenarios and see projected liquidity improvements
        </p>
      </div>

      <div
        className="rounded-xl p-4 mb-4 flex items-center justify-between"
        style={{ backgroundColor: '#E5E5E5' }}
      >
        <div>
          <p className="font-poppins text-xs text-text-secondary">Baseline</p>
          <p className="font-poppins font-bold text-[5.5vw] md:text-xl text-primary">{formatCurrency(baseline)}</p>
          <p className="font-poppins text-xs text-text-secondary">Current forecast</p>
        </div>
        <div className="text-right">
          <p className="font-poppins text-xs text-text-secondary">Projected</p>
          <p className="font-poppins font-bold text-[5.5vw] md:text-xl text-success">{formatCurrency(projected)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {scenarioDefinitions.map((scenario) => (
          <ScenarioCard
            key={scenario.id}
            scenario={scenario}
            isSelected={selectedId === scenario.id}
            onToggle={() => toggleScenario(scenario.id)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-surface-muted rounded-xl p-4">
          <h4 className="font-poppins font-semibold text-sm text-primary mb-3">Selected Scenarios:</h4>
          {selectedScenarios.length > 0 ? (
            <div className="space-y-3">
              {selectedScenarios.map((scenario) => (
                <div key={scenario.id}>
                  <p className="font-poppins font-semibold text-sm text-text-primary mb-1">{scenario.title}</p>
                  <p className="font-poppins text-xs text-text-secondary">{scenario.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-poppins text-xs text-text-secondary">No scenarios selected</p>
          )}
        </div>

        <div className="bg-surface-muted rounded-xl p-4">
          <h4 className="font-poppins font-semibold text-sm text-primary mb-3">High Impact Opportunities</h4>
          {selectedScenario ? (
            <div className="space-y-3">
              {selectedScenario.highImpactOpportunities.map((opp) => (
                <div key={opp.title}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-poppins font-semibold text-xs text-danger-dark">{opp.title}</p>
                      {opp.subtitle && (
                        <p className="font-poppins text-xs text-text-secondary mt-0.5">
                          <span className="font-semibold text-text-primary">{opp.subtitle}</span> {opp.title}
                        </p>
                      )}
                      {opp.target && (
                        <p className="font-poppins text-xs text-text-secondary mt-0.5">
                          <span className="font-semibold text-text-primary">Target: </span>
                          {opp.target}
                        </p>
                      )}
                    </div>
                    <span className="font-poppins font-semibold text-xs text-success flex-shrink-0">
                      {opp.impact ?? opp.value}
                    </span>
                  </div>
                  {opp.items && (
                    <ul className="space-y-0.5">
                      {opp.items.map((item) => (
                        <li key={item} className="font-poppins text-xs text-text-secondary">
                          — {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {selectedScenario.supportingOpportunity && (
                <div className="pt-2 border-t border-border">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="font-poppins text-xs text-text-secondary">
                        <span className="font-semibold text-text-primary">Supporting Opportunity: </span>
                        {selectedScenario.supportingOpportunity.title}
                      </p>
                    </div>
                    <span className="font-poppins font-semibold text-xs text-success flex-shrink-0">
                      {selectedScenario.supportingOpportunity.impact}
                    </span>
                  </div>
                  <p className="font-poppins text-xs text-text-secondary mt-1">
                    <span className="font-semibold text-text-primary">Supporting Volume: </span>
                    {selectedScenario.supportingVolume}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-border">
                <span className="font-poppins text-xs text-text-secondary">
                  Combined potential:{' '}
                  <span className="font-semibold text-primary">
                    {formatCurrencyPlain(selectedScenario.combinedPotential)}
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <p className="font-poppins text-xs text-text-secondary">Select a scenario to view opportunities</p>
          )}
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: '#E5E5E5' }}>
        <h4 className="font-poppins font-semibold text-sm text-primary mb-2">AI Recommendation</h4>
        <p className="font-poppins text-xs text-text-secondary leading-relaxed">
          {selectedScenario?.aiRecommendation ??
            'Select a scenario above to see a tailored AI recommendation for liquidity impact.'}
        </p>
      </div>
    </div>
  );
}
