/**
 * charts.js - Chart.js integrations for Dashboard Insights
 */

const DashboardCharts = {
    codersStatusChart: null,
    callsChart: null,

    init(codersData, llamadasData) {
        this.renderCodersStatus(codersData);
        // this.renderCallsTimeline(llamadasData); // Optional depending on mockup requirements
    },

    renderCodersStatus(coders) {
        const ctx = document.getElementById('codersStatusChart');
        if (!ctx) return;

        // Group coders by status
        const statusCounts = {
            pendiente: 0,
            agendado: 0,
            otro: 0
        };

        coders.forEach(c => {
            const st = (c.estado_gestion || 'nuevo').toLowerCase();
            if (st === 'nuevo') statusCounts.pendiente++; // map nuevo to pendiente logically
            else if (st !== 'rechazado') statusCounts.agendado++; // others in process
            else statusCounts.otro++;
        });

        if (this.codersStatusChart) {
            this.codersStatusChart.destroy();
        }

        this.codersStatusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Pendiente', 'Agendado', 'Otro'],
                datasets: [{
                    data: [statusCounts.pendiente, statusCounts.agendado, statusCounts.otro],
                    backgroundColor: [
                        'rgba(245, 158, 11, 0.8)', // Warning (Pendiente)
                        'rgba(16, 185, 129, 0.8)', // Success (Agendado)
                        'rgba(148, 163, 184, 0.8)'  // Muted (Otro)
                    ],
                    borderColor: 'rgba(255,255,255,0.05)',
                    borderWidth: 2,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#94a3b8',
                            font: {
                                family: 'Outfit',
                                size: 14
                            },
                            padding: 20
                        }
                    }
                },
                cutout: '75%' // Thin minimalist doughnut
            }
        });
    }
};
