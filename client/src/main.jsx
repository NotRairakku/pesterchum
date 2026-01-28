import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'
import './index.css'

import { getCurrentWindow } from "@tauri-apps/api/window";
import { currentMonitor } from "@tauri-apps/api/window";

const win = getCurrentWindow();

(async () => {
    const saved = localStorage.getItem("win-pos");

    if (saved) {
        const { x, y } = JSON.parse(saved);
        await win.setPosition({ x, y });
    } else {
        const monitor = await currentMonitor();
        const size = await win.outerSize();

        if (monitor) {
            const x = monitor.size.width - size.width;
            const y = Math.round((monitor.size.height - size.height) / 2);
            await win.setPosition({ x, y });
        }
    }
})();

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);