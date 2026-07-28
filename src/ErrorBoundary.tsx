import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
  errorStack: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: "",
    errorStack: ""
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message, errorStack: error.stack || "" };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", fontFamily: "monospace" }}>
          <h1>App Error</h1>
          <p><strong>{this.state.errorMsg}</strong></p>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f8d7da", padding: "10px" }}>
            {this.state.errorStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
