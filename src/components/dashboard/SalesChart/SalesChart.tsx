import { MoreVertical } from 'lucide-react';
import './SalesChart.css';

interface SalesChartProps {
  percentage: number;
}

function SalesChart({ percentage }: SalesChartProps) {
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="sales-chart">
      <div className="sales-chart__header">
        <h3 className="sales-chart__title">Sales</h3>
        <button className="sales-chart__more-btn">
          <MoreVertical size={20} />
        </button>
      </div>
      <div className="sales-chart__content">
        <svg className="sales-chart__svg" viewBox="0 0 100 100">
          <circle
            className="sales-chart__bg-circle"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
          />
          <circle
            className="sales-chart__progress-circle"
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
          <text
            x="50"
            y="50"
            className="sales-chart__percentage"
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {percentage}%
          </text>
        </svg>
        <p className="sales-chart__label">Sales target achievement</p>
      </div>
    </div>
  );
}

export default SalesChart;
