import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

type State = { failed: boolean };

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro inesperado na interface', error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="state" role="alert">
        <h2>Algo deu errado</h2>
        <button type="button" className="btn" onClick={() => location.reload()}>
          Recarregar
        </button>
      </div>
    );
  }
}
