import React from 'react';

const SimpleBarChart = ({ data }) => {
  // data: { month: string, total: number }[]
  if (!data || data.length === 0) return <p className="text-secondary-500">Grafik için veri yok.</p>;

  const maxValue = Math.max(...data.map(d => d.total));

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.month} className="flex items-center gap-2">
          <span className="w-16 text-sm text-secondary-600">{item.month}</span>
          <div className="flex-1 h-6 bg-secondary-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-600 rounded-full"
              style={{ width: `${(item.total / maxValue) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-secondary-800">{item.total.toFixed(2)} TL</span>
        </div>
      ))}
    </div>
  );
};

export default SimpleBarChart;