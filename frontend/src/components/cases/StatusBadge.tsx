interface Props {
  status: string;
}

const config: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-gray-100 text-gray-700 border border-gray-200',
  },
  verifying_in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-700 border border-blue-200',
  },
  verifying: {
    label: 'Verifying',
    className: 'bg-amber-100 text-amber-700 border border-amber-200',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-100 text-green-700 border border-green-200',
  },
  disputed: {
    label: 'Disputed',
    className: 'bg-red-100 text-red-700 border border-red-200',
  },
};

export default function StatusBadge({ status }: Props) {
  const { label, className } = config[status] ?? config.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {label}
    </span>
  );
}
