import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Area,
    AreaChart,
} from 'recharts';

interface SalesTrendItem {
    date: string;
    sales: number;
}

interface SalesLineChartProps {
    data: SalesTrendItem[];
}

const SalesLineChart: React.FC<SalesLineChartProps> = ({ data }) => {
    // 날짜 포맷팅 (MM/DD)
    const formatXAxis = (tickItem: string) => {
        const date = new Date(tickItem);
        return `${date.getMonth() + 1}/${date.getDate()}`;
    };

    // 금액 포맷팅
    const formatYAxis = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
        return value.toString();
    };

    return (
        <div style={{ width: '100%', height: 300, marginTop: '20px' }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 0,
                        bottom: 0,
                    }}
                >
                    <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatXAxis}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        minTickGap={30}
                    />
                    <YAxis
                        tickFormatter={formatYAxis}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: '#64748b' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value: any) => [`${Number(value).toLocaleString()}원`, '매출']}
                        labelFormatter={(label) => {
                            const date = new Date(label);
                            return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorSales)"
                        dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesLineChart;
