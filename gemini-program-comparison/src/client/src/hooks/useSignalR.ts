import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  price_change_percentage_24h: number;
}

export const useSignalR = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    const newConnection = new HubConnectionBuilder()
      .withUrl('/cryptohub', {
        accessTokenFactory: () => token || ''
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    setConnection(newConnection);
  }, []);

  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log('SignalR Connected!');
          setIsConnected(true);
          
          connection.on('ReceivePrices', (data: CryptoPrice[]) => {
            setPrices(data);
          });
        })
        .catch(e => console.error('Connection failed: ', e));
        
      return () => {
        connection.stop();
      }
    }
  }, [connection]);

  return { prices, isConnected };
};
