import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // 업데이트된 state 로 다음 렌더링에서 폴백 UI가 보이게 함
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 여기서 에러 로깅 서비스에 전송 가능
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;
    if (hasError) {
      // 기본 폴백 UI 제공 혹은 커스텀 넘겨받은 fallback 사용
      return (
        fallback ?? (
          <div className='p-6 text-center text-red-600'>
            <p className='font-bold'>뭔가 잘못되었습니다.</p>
            <p>{error?.message}</p>
          </div>
        )
      );
    }
    return children;
  }
}
