import fetcher from "@/utils/fetcher";
import { useEffect, useState, useMemo } from "react";
import { 
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import StatCard from "@/components/Warehouse/StatCard";
import useSettingsStore from "@/contexts/SettingsContext";

interface Stats {
    total_sell_money: Record<string, number>;
    total_income_money: Record<string, number>;
    check_count: Record<string, number>;
    most_sell_items: Record<string, number>;
    most_income_items: Record<string, number>;
}

export default function StatsPage() {
    const { formatCurrency } = useSettingsStore();
    const today = new Date();
    
    // First day of current month
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstDayStr = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
    
    // Last day of current month
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const lastDayStr = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;

    const [startDate, setStartDate] = useState<string>(firstDayStr);
    const [endDate, setEndDate] = useState<string>(lastDayStr);
    const [periodType, setPeriodType] = useState<"daily" | "monthly" | "yearly">("daily");
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    const handleGetStats = async () => {
        setLoading(true);
        try {
            const res = await fetcher({
                url: `${import.meta.env.VITE_API_URL}/calc/summary`,
                method: "POST",
                body: {
                    start_date: startDate,
                    end_date: endDate,
                    point_type: periodType,
                }
            });
            setStats(res);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleGetStats();
    }, [startDate, endDate, periodType]);

    const totals = useMemo(() => {
        let sell = 0;
        let income = 0;
        let checks = 0;

        if (stats) {
            Object.values(stats.total_sell_money || {}).forEach(val => sell += Number(val));
            Object.values(stats.total_income_money || {}).forEach(val => income += Number(val));
            Object.values(stats.check_count || {}).forEach(val => checks += Number(val));
        }

        return { sell, income, checks };
    }, [stats]);

    const financeData = useMemo(() => {
        if (!stats) return [];
        const dates = Array.from(new Set([
            ...Object.keys(stats.total_sell_money || {}),
            ...Object.keys(stats.total_income_money || {})
        ])).sort();
        
        return dates.map(date => ({
            date,
            Продажи: stats.total_sell_money[date] || 0,
            Прибыль: stats.total_income_money[date] || 0,
        }));
    }, [stats]);

    const checksData = useMemo(() => {
        if (!stats) return [];
        const dates = Array.from(new Set(Object.keys(stats.check_count || {}))).sort();
        
        return dates.map(date => ({
            date,
            Чеки: stats.check_count[date] || 0,
        }));
    }, [stats]);

    const topSellItems = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.most_sell_items || {})
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [stats]);

    const topIncomeItems = useMemo(() => {
        if (!stats) return [];
        return Object.entries(stats.most_income_items || {})
            .map(([name, value]) => ({ name, value: Number(value) }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [stats]);

    console.log(stats);

    return (
        <div className="p-8 max-w-[1400px] mx-auto min-h-screen bg-[#FAFAFA]">
            <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-[32px] font-extrabold text-[#2C2C2C] mb-3 uppercase tracking-tight">
                        Статистика
                    </h1>
                    <p className="text-gray-500 font-medium">Анализируйте продажи и доходы вашего бизнеса</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Начало</label>
                        <input 
                            type="date" 
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#61605A] outline-none text-gray-700 transition-shadow"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Конец</label>
                        <input 
                            type="date" 
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#61605A] outline-none text-gray-700 transition-shadow"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">Группировка</label>
                        <select 
                            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#61605A] outline-none text-gray-700 transition-shadow min-w-[140px]"
                            value={periodType}
                            onChange={(e) => setPeriodType(e.target.value as "daily" | "monthly" | "yearly")}
                        >
                            <option value="daily">По дням</option>
                            <option value="monthly">По месяцам</option>
                            <option value="yearly">По годам</option>
                        </select>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#61605A]"></div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Оборот" value={formatCurrency(totals.sell)} />
                        <StatCard 
                            title="Прибыль" 
                            value={formatCurrency(totals.income)} 
                            valueColor={totals.income < 0 ? "text-[#D94F4F]" : "text-[#6B8E23]"} 
                        />
                        <StatCard title="Средний чек" value={formatCurrency(totals.checks > 0 ? totals.sell / totals.checks : 0)} valueColor="text-[#3B82F6]" />
                        <StatCard title="Количество чеков" value={totals.checks.toString()} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-[14px] font-bold text-gray-500 mb-6 uppercase tracking-widest">Финансы</h3>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4A4A4A" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#4A4A4A" stopOpacity={0}/>
                                            </linearGradient>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6B8E23" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#6B8E23" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(0)}k` : value} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), '']}
                                        />
                                        <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                                        <Area type="monotone" dataKey="Продажи" stroke="#4A4A4A" strokeWidth={3} fillOpacity={1} fill="url(#colorSell)" />
                                        <Area type="monotone" dataKey="Прибыль" stroke="#6B8E23" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-[14px] font-bold text-gray-500 mb-6 uppercase tracking-widest">Количество чеков</h3>
                            <div className="h-[320px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={checksData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                            cursor={{ fill: '#F9FAFB' }}
                                        />
                                        <Bar dataKey="Чеки" fill="#61605A" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-[14px] font-bold text-gray-500 mb-6 uppercase tracking-widest">Топ товаров (по сумме)</h3>
                            <div className="h-[360px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topSellItems} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(0)}k` : value} />
                                        <YAxis type="category" dataKey="name" width={100} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                            cursor={{ fill: '#F9FAFB' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), 'Оборот']}
                                        />
                                        <Bar dataKey="value" name="Оборот" fill="#8C8B82" radius={[0, 4, 4, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-[14px] font-bold text-gray-500 mb-6 uppercase tracking-widest">Самые прибыльные товары</h3>
                            <div className="h-[360px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topIncomeItems} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F3F4F6" />
                                        <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => value > 1000 ? `${(value/1000).toFixed(0)}k` : value} />
                                        <YAxis type="category" dataKey="name" width={100} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            contentStyle={{ borderRadius: '12px', border: '1px solid #F3F4F6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                            cursor={{ fill: '#F9FAFB' }}
                                            formatter={(value: any) => [formatCurrency(Number(value)), 'Прибыль']}
                                        />
                                        <Bar dataKey="value" name="Прибыль" fill="#6B8E23" radius={[0, 4, 4, 0]} barSize={24} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}