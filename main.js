import './styles.css';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

import { AppAPI } from './api.js';
import { ModalSystem } from './modals.js';
import { DashboardCharts } from './charts.js';
import { App } from './app.js';

// Re-expose legacy globals for HTML onclick handlers
window.axios = axios;
window.Chart = Chart;
window.AppAPI = AppAPI;
window.ModalSystem = ModalSystem;
window.DashboardCharts = DashboardCharts;
window.App = App;

// Bootstrap application
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
