import { Component, type ErrorInfo, type ReactNode } from 'react';
import EmptyState from './EmptyState';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <EmptyState
          title="Something went wrong"
          message={this.props.fallbackMessage || this.state.error?.message || 'An unexpected error occurred.'}
        />
      );
    }
    return this.props.children;
  }
}
