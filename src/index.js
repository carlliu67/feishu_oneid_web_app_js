import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.js';
import ErrorBoundary from './utils/ErrorBoundary.js';
import './utils/globalErrorHandler.js'; // 初始化全局错误处理

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
);