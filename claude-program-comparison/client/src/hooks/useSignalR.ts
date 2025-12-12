import { useEffect, useState, useRef, useCallback } from 'react';
import * as signalR from '@microsoft/signalr';
import { PriceUpdateMessage } from '@/types';
import { getAccessToken } from '@/contexts/AuthContext';

/**
 * SignalR Connection Hook
 *
 * Manages SignalR connection for real-time price updates
 */

export type ConnectionState = 'Disconnected' | 'Connecting' | 'Connected' | 'Reconnecting' | 'Disconnecting';

interface UseSignalROptions {
  /**
   * Whether to automatically connect on mount
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Callback for price updates
   */
  onPriceUpdate?: (update: PriceUpdateMessage) => void;

  /**
   * Callback for connection state changes
   */
  onConnectionStateChange?: (state: ConnectionState) => void;

  /**
   * Callback for errors
   */
  onError?: (error: Error) => void;
}

export const useSignalR = (options: UseSignalROptions = {}) => {
  const {
    autoConnect = true,
    onPriceUpdate,
    onConnectionStateChange,
    onError,
  } = options;

  const [connectionState, setConnectionState] = useState<ConnectionState>('Disconnected');
  const [lastUpdate, setLastUpdate] = useState<PriceUpdateMessage | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isConnectingRef = useRef(false);

  // Get hub URL from environment
  const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:7001/hubs/prices';

  /**
   * Update connection state and notify callback
   */
  const updateConnectionState = useCallback((state: ConnectionState) => {
    setConnectionState(state);
    onConnectionStateChange?.(state);
  }, [onConnectionStateChange]);

  /**
   * Handle price update from server
   */
  const handlePriceUpdate = useCallback((update: PriceUpdateMessage) => {
    setLastUpdate(update);
    onPriceUpdate?.(update);
  }, [onPriceUpdate]);

  /**
   * Handle errors
   */
  const handleError = useCallback((error: Error) => {
    console.error('SignalR Error:', error);
    onError?.(error);
  }, [onError]);

  /**
   * Create and configure SignalR connection
   */
  const createConnection = useCallback(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => getAccessToken() || '',
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.ServerSentEvents,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 0s, 2s, 10s, 30s, 60s
          if (retryContext.previousRetryCount === 0) return 0;
          if (retryContext.previousRetryCount === 1) return 2000;
          if (retryContext.previousRetryCount === 2) return 10000;
          if (retryContext.previousRetryCount === 3) return 30000;
          return 60000;
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Connection event handlers
    connection.onclose((error) => {
      updateConnectionState('Disconnected');
      if (error) {
        handleError(error);
      }
    });

    connection.onreconnecting((error) => {
      updateConnectionState('Reconnecting');
      if (error) {
        handleError(error);
      }
    });

    connection.onreconnected(() => {
      updateConnectionState('Connected');
    });

    // Register server-to-client methods
    connection.on('ReceivePriceUpdate', handlePriceUpdate);

    return connection;
  }, [hubUrl, updateConnectionState, handlePriceUpdate, handleError]);

  /**
   * Connect to SignalR hub
   */
  const connect = useCallback(async () => {
    if (isConnectingRef.current || connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      isConnectingRef.current = true;
      updateConnectionState('Connecting');

      // Create connection if it doesn't exist
      if (!connectionRef.current) {
        connectionRef.current = createConnection();
      }

      // Start connection
      await connectionRef.current.start();
      updateConnectionState('Connected');
      console.log('SignalR Connected');
    } catch (error) {
      updateConnectionState('Disconnected');
      handleError(error as Error);
      throw error;
    } finally {
      isConnectingRef.current = false;
    }
  }, [createConnection, updateConnectionState, handleError]);

  /**
   * Disconnect from SignalR hub
   */
  const disconnect = useCallback(async () => {
    if (!connectionRef.current) return;

    try {
      updateConnectionState('Disconnecting');
      await connectionRef.current.stop();
      updateConnectionState('Disconnected');
      console.log('SignalR Disconnected');
    } catch (error) {
      handleError(error as Error);
      throw error;
    }
  }, [updateConnectionState, handleError]);

  /**
   * Subscribe to price updates for a specific crypto
   */
  const subscribeToPrice = useCallback(async (cryptoId: string) => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      throw new Error('Not connected to SignalR hub');
    }

    try {
      await connectionRef.current.invoke('SubscribeToPrice', cryptoId);
      console.log(`Subscribed to ${cryptoId}`);
    } catch (error) {
      handleError(error as Error);
      throw error;
    }
  }, [handleError]);

  /**
   * Unsubscribe from price updates for a specific crypto
   */
  const unsubscribeFromPrice = useCallback(async (cryptoId: string) => {
    if (!connectionRef.current || connectionRef.current.state !== signalR.HubConnectionState.Connected) {
      return;
    }

    try {
      await connectionRef.current.invoke('UnsubscribeFromPrice', cryptoId);
      console.log(`Unsubscribed from ${cryptoId}`);
    } catch (error) {
      handleError(error as Error);
      throw error;
    }
  }, [handleError]);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect().catch(console.error);
    }

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        disconnect().catch(console.error);
      }
    };
  }, []); // Empty deps - only run on mount/unmount

  return {
    connectionState,
    lastUpdate,
    connect,
    disconnect,
    subscribeToPrice,
    unsubscribeFromPrice,
    isConnected: connectionState === 'Connected',
    isConnecting: connectionState === 'Connecting' || connectionState === 'Reconnecting',
  };
};
