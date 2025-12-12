import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { useContainerSize } from '../../hooks/useContainerSize';

type SparklineProps = {
  data: Array<{ t: number; v: number }>;
  color?: string;
};

export function Sparkline({ data, color = 'var(--color-primary-500)' }: SparklineProps) {
  const { ref, size } = useContainerSize<HTMLDivElement>();
  const hasRoom = size.width > 12 && size.height > 12;

  return (
    <div ref={ref} style={{ width: 120, height: 48, minWidth: 80 }}>
      {hasRoom && data.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: 'var(--color-muted)', fontSize: 12 }}>
          ---
        </div>
      )}
    </div>
  );
}
