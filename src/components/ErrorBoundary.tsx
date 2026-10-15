import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      isChunkError: false,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    const isChunk =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('error loading dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');

    return { hasError: true, error, isChunkError: isChunk };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);

    const isChunk =
      error?.name === 'ChunkLoadError' ||
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('error loading dynamically imported module') ||
      error?.message?.includes('Importing a module script failed');

    // If chunk failed to load (e.g. after fresh deploy or network drop), attempt an automatic reload once
    if (isChunk && typeof window !== 'undefined') {
      const reloadKey = 'eb_chunk_auto_reload_ts';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - parseInt(lastReload, 10) > 20000) {
        sessionStorage.setItem(reloadKey, now.toString());
        console.warn('ErrorBoundary auto-reloading page to recover from dynamic module import error...');
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    }
  }

  private handleReload = async () => {
    if (typeof window !== 'undefined') {
      if ('caches' in window) {
        try {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        } catch (e) {}
      }
      window.location.reload();
    }
  };

  private handleReset = () => {
    try {
      localStorage.removeItem('shia-quran-active-surah');
      localStorage.removeItem('shia-quran-active-juz');
      sessionStorage.clear();
    } catch (e) {}
    this.setState({ hasError: false, error: null, isChunkError: false });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      const isChunk = this.state.isChunkError;
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 select-none text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-500/40 flex items-center justify-center mb-6 text-emerald-400">
            {isChunk ? <WifiOff size={32} /> : <AlertTriangle size={32} />}
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">
            {isChunk ? 'Connection Reconnecting' : 'Something went wrong'}
          </h1>
          <p className="text-sm text-slate-400 max-w-sm mb-6">
            {isChunk
              ? 'A fresh update or temporary network reconnection interrupted component loading. Tap reload to fetch the latest version.'
              : 'The application encountered an unexpected issue while rendering. You can reload or return to the main screen.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs">
            <button
              onClick={this.handleReload}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors cursor-pointer"
            >
              <RefreshCw size={16} />
              <span>{isChunk ? 'Refresh App' : 'Reload App'}</span>
            </button>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors cursor-pointer"
            >
              <Home size={16} />
              <span>Reset to Home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
