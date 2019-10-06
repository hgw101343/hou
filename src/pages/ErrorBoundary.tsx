import React from 'react';

interface ErrorBoundaryType {
	children: React.ReactNode
}

interface stateType {
	hasError: boolean
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryType> {

	state: stateType = {
		hasError: false
	}

	static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // 你同样可以将错误日志上报给服务器
  }
	
	render(){
		if (this.state.hasError) {
      // 你可以自定义降级后的 UI 并渲染
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children; 
	}
}