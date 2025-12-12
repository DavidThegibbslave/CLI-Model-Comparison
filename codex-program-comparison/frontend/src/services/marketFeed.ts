import * as signalR from '@microsoft/signalr';
import { sampleAssets } from './sampleData';
import { apiBaseUrl } from './apiClient';
import type { MarketUpdate } from '../types/crypto';

type Status = 'idle' | 'connecting' | 'live' | 'fallback' | 'error' | 'stopped';

export type FeedHandle = {
  close: () => void;
};

export function createMarketFeed(
  onUpdate: (update: MarketUpdate) => void,
  onStatusChange: (status: Status) => void,
): FeedHandle {
  let connection: signalR.HubConnection | null = null;
  let fallbackInterval: number | null = null;
  let closed = false;

  async function startSignalR() {
    onStatusChange('connecting');
    try {
      connection = new signalR.HubConnectionBuilder()
        .withUrl(`${apiBaseUrl}/hubs/market`)
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .configureLogging(signalR.LogLevel.Error)
        .build();

      connection.on('PriceUpdate', (payload: MarketUpdate) => onUpdate(payload));

      connection.onreconnected(() => onStatusChange('live'));
      connection.onclose(() => {
        if (!closed) {
          startFallback();
        }
      });

      await connection.start();
      if (!closed) {
        onStatusChange('live');
      }
    } catch (err) {
      console.warn('SignalR unavailable, falling back to polling', err);
      startFallback();
    }
  }

  function startFallback() {
    if (closed) return;
    onStatusChange('fallback');
    if (fallbackInterval) {
      window.clearInterval(fallbackInterval);
    }
    fallbackInterval = window.setInterval(() => {
      const pick = sampleAssets[Math.floor(Math.random() * sampleAssets.length)];
      const drift = (Math.random() - 0.5) * (pick.price * 0.005);
      const nextPrice = Math.max(0.01, pick.price + drift);
      const deltaPct = ((nextPrice - pick.price) / pick.price) * 100;
      onUpdate({
        id: pick.id,
        price: parseFloat(nextPrice.toFixed(2)),
        change24hPct: parseFloat((pick.change24hPct + deltaPct / 10).toFixed(2)),
        change7dPct: pick.change7dPct,
        volume24h: pick.volume24h,
      });
    }, 5000);
  }

  startSignalR();

  return {
    close() {
      closed = true;
      if (fallbackInterval) window.clearInterval(fallbackInterval);
      if (connection) {
        void connection.stop();
      }
      onStatusChange('stopped');
    },
  };
}
