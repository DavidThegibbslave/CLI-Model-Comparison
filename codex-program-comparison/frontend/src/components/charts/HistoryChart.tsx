import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useContainerSize } from '../../hooks/useContainerSize';

type HistoryPoint = { timestamp: number; price: number };

type HistoryChartProps = {
  data: HistoryPoint[];
};

function formatDateLabel(value: number) {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

export function HistoryChart({ data }: HistoryChartProps) {
  const { ref, size } = useContainerSize<HTMLDivElement>();
  const hasRoom = size.width > 8 && size.height > 120;
  const hasData = data.length > 0;

  return (
    <div ref={ref} style={{ width: '100%', height: 300, minHeight: 300 }}>
      {hasRoom && hasData ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatDateLabel}
              stroke="var(--color-muted)"
              tickMargin={10}
            />
            <YAxis
              dataKey="price"
              stroke="var(--color-muted)"
              tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
              width={90}
            />
            <Tooltip
              contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
              formatter={(value: number, _name, props) => [
                `$${Number(value).toLocaleString()}`,
                new Date((props.payload as any).timestamp).toLocaleString(),
              ]}
            />
            <Area type="monotone" dataKey="price" stroke="var(--color-primary-500)" fill="url(#priceArea)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height: 300, display: 'grid', placeItems: 'center', color: 'var(--color-muted)' }}>
          {hasData ? 'Preparing chart...' : 'No data to visualize'}
        </div>
      )}
    </div>
  );
}
