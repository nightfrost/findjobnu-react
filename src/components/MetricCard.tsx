import React from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

export type MetricCardProps = {
  label: string;
  tooltip: string;
  value?: React.ReactNode;
  ok: boolean;
  showIndicator?: boolean;
};

const MetricCard: React.FC<MetricCardProps> = ({ label, tooltip, value, ok, showIndicator = true }) => {
  return (
    <div className="rounded-box border border-base-200 p-3">
      <div className="text-sm text-base-content/70 flex items-center gap-1">
        <span>{label}</span>
        <button
          type="button"
          className="tooltip tooltip-top"
          data-tip={tooltip}
          aria-label={`Hjælp til ${label}`}
        >
          <QuestionMarkCircleIcon className="w-4 h-4 text-base-content/60 hover:text-base-content" />
        </button>
      </div>
      <div className="text-lg font-semibold flex items-center gap-2">
        {value != null && <span>{value}</span>}
        {showIndicator && (
          <span
            className={ok ? 'text-success' : 'text-warning'}
            aria-label={ok ? 'OK' : 'Advarsel'}
            title={ok ? 'OK' : 'Tjek anbefaling'}
          >
            {ok ? '✅' : '⚠️'}
          </span>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
