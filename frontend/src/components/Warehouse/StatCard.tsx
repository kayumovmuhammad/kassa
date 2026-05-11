interface StatCardProps {
  title: string;
  value: string | number;
  valueColor?: string;
}

export default function StatCard({ title, value, valueColor = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6 flex flex-col justify-center">
      <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
        {title}
      </h3>
      <p className={`text-4xl font-bold tracking-tight ${valueColor}`}>
        {value}
      </p>
    </div>
  );
}
