export function StrategicInsights() {
  return (
    <div className="bg-surface-muted rounded-xl p-[4%] md:p-5">
      <h3 className="font-poppins font-semibold text-[4.5vw] md:text-lg text-primary mb-3">
        Strategic Insights
      </h3>
      <ul className="space-y-1.5">
        <li className="font-poppins text-xs text-text-secondary">
          - Monitor high-risk contributors closely - they represent significant liquidity concentration
        </li>
        <li className="font-poppins text-xs text-text-secondary">
          - Specialty center showing declining collections despite high value - investigate root cause
        </li>
        <li className="font-poppins text-xs text-text-secondary">
          - Primary Care Clinic is top performance; replicate their processes across network
        </li>
      </ul>
    </div>
  );
}
