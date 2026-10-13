import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in Dragon Pass Atlas:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0e0e11] text-[#f4eedb] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#16161a] border border-amber-900/40 rounded-2xl p-6 shadow-2xl flex flex-col items-center">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-4 text-amber-400">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-serif font-bold text-[#e2ba7d] mb-2">
              Une anomalie est survenue
            </h1>
            <p className="text-xs text-[#a0a0ab] mb-4">
              L'Atlas de la Passe du Dragon a rencontré une interruption inattendue. Vos données sauvegardées restent protégées.
            </p>
            {this.state.error && (
              <pre className="w-full bg-[#0d0d10] p-3 rounded-lg text-[11px] font-mono text-red-400/90 text-left overflow-x-auto mb-4 border border-white/5">
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e2ba7d] hover:bg-[#edd09e] text-black font-semibold text-xs transition shadow-lg active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recharger l'application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
