import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

interface Props {
  data: number[];
}

export function Sparkline({ data }: Props) {
  const chartData = data.map((val, i) => ({ i, val }));
  const isPositive = data[data.length - 1] >= data[0];
  const strokeColor = isPositive ? "#22c55e" : "#ef4444";

  return (
    <div className="h-[40px] w-[100px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line 
            type="monotone" 
            dataKey="val" 
            stroke={strokeColor} 
            strokeWidth={2} 
            dot={false} 
            isAnimationActive={false}
          />
          <YAxis domain={['dataMin', 'dataMax']} hide />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
