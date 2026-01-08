import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-500/20 border border-red-500/50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-200">⚠️ Something went wrong</h2>
          <p className="text-red-300 mb-6">{this.state.error?.message || 'Unknown error'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-xl font-bold"
          >
            🔄 Reload App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
