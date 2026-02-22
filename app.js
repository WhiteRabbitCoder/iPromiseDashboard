/**
 * app.js - Main Application Logic
 */
import { AppAPI } from './api.js';
import { ModalSystem } from './modals.js';
import { DashboardCharts } from './charts.js';

export const App = {
    state: {
        currentView: 'dashboard',
        coders: [],
        clientes: [],
        eventos: [],
        llamadas: []
    },

    async init() {
        console.log("Initializing App...");
        await AppAPI.init();

        this.bindNavigation();
        await this.loadView(this.state.currentView);
    },

    bindNavigation() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.preventDefault();
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                e.currentTarget.classList.add('active');

                // Load view
                const view = e.currentTarget.dataset.view;
                await this.loadView(view);
            });
        });
    },

    async loadView(viewName) {
        this.state.currentView = viewName;
        const container = document.getElementById('view-container');

        // Show loading state
        container.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-spinner fa-spin"></i>
                <p>Cargando información...</p>
            </div>
        `;

        try {
            switch (viewName) {
                case 'dashboard':
                    await this.renderDashboard(container);
                    break;
                case 'coders':
                    await this.renderCoders(container);
                    break;
                case 'clientes':
                    await this.renderClientes(container);
                    break;
                case 'eventos':
                    await this.renderEventos(container);
                    break;
                case 'llamadas':
                    await this.renderLlamadas(container);
                    break;
            }
        } catch (e) {
            console.error(e);
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation" style="color: var(--danger)"></i>
                    <p>Ocurrió un error cargando la vista.</p>
                </div>
            `;
        }
    },

    // --- DASHBOARD VIEW ---
    async renderDashboard(container) {
        // Fetch all necessary data
        [this.state.coders, this.state.clientes, this.state.eventos, this.state.llamadas] = await Promise.all([
            AppAPI.getCoders(),
            AppAPI.getClientes(),
            AppAPI.getEventos(),
            AppAPI.getLlamadas()
        ]);

        const totalCoders = this.state.coders.length;
        const totalClientes = this.state.clientes.length;
        const totalEventos = this.state.eventos.length;
        const totalLlamadas = this.state.llamadas.length;

        container.innerHTML = `
            <div class="view-header">
                <h1>Dashboard Overview</h1>
            </div>
            
            <div class="dashboard-overview">
                <div class="glass-card stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-users"></i></div>
                    <div class="stat-info">
                        <span>Total Coders</span>
                        <h3>${totalCoders}</h3>
                    </div>
                </div>
                <div class="glass-card stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-briefcase"></i></div>
                    <div class="stat-info">
                        <span>Total Clientes</span>
                        <h3>${totalClientes}</h3>
                    </div>
                </div>
                <div class="glass-card stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-calendar-days"></i></div>
                    <div class="stat-info">
                        <span>Total Eventos</span>
                        <h3>${totalEventos}</h3>
                    </div>
                </div>
                <div class="glass-card stat-card">
                    <div class="stat-icon"><i class="fa-solid fa-phone"></i></div>
                    <div class="stat-info">
                        <span>Llamadas Registradas</span>
                        <h3>${totalLlamadas}</h3>
                    </div>
                </div>
            </div>

            <div class="charts-grid">
                <div class="glass-card">
                    <h3 style="margin-bottom: 20px; font-weight: 500;">Distribución de Estados (Candidatos)</h3>
                    <div class="chart-container">
                        <canvas id="codersStatusChart"></canvas>
                    </div>
                </div>
                <div class="glass-card">
                    <h3 style="margin-bottom: 20px; font-weight: 500;">Próximos Eventos</h3>
                    <div class="table-container" style="max-height: 250px; overflow-y: auto;">
                        <table style="font-size: 13px;">
                            <thead>
                                <tr>
                                    <th>Tipo</th>
                                    <th>Fecha</th>
                                    <th>Cupos</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.state.eventos.slice(0, 5).map(e => `
                                    <tr>
                                        <td>${e.tipo_reunion}</td>
                                        <td>${new Date(e.fecha_hora).toLocaleDateString()}</td>
                                        <td>${e.inscritos_actuales}/${e.capacidad_total}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // init chart after DOM rendered
        DashboardCharts.init(this.state.coders, this.state.llamadas);
    },

    async renderLlamadas(container) {
        this.state.llamadas = await AppAPI.getLlamadas();
        console.log("llamadas", this.state.llamadas);

        container.innerHTML = `
            <div class="view-header">
                <h1>Historial de Llamadas</h1>
                <button class="btn btn-primary" id="trigger-webhook-btn" onclick="App.triggerWebhook()">
                    <i class="fa-solid fa-play"></i> Iniciar Flujo de Llamadas (N8N)
                </button>
            </div>
            
            <div class="glass-card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Candidato</th>
                                <th>Fecha/Hora</th>
                                <th>Resultado</th>
                                <th>Evento Asignado</th>
                                <th>Resumen</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.state.llamadas.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No hay llamadas registradas</td></tr>` :
                this.state.llamadas.map(ll => `
                                <tr>
                                    <td><strong>${ll.candidatos ? (ll.candidatos.nombre || '') + ' ' + (ll.candidatos.apellido || '') : 'Desconocido'}</strong></td>
                                    <td>${ll.fecha_hora_llamada ? new Date(ll.fecha_hora_llamada).toLocaleString() : 'N/A'}</td>
                                    <td><span class="badge ${ll.resultado === 'exitoso' ? 'agendado' : 'pendiente'}">${ll.resultado || 'Pendiente'}</span></td>
                                    <td><span style="font-size: 0.85em; color: var(--text-muted);">${ll.eventos ? ll.eventos.tipo_reunion : 'Ninguno'}</span></td>
                                    <td style="max-width:250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${ll.resumen || ''}">${ll.resumen || 'Sin resumen'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    async triggerWebhook() {
        const btn = document.getElementById('trigger-webhook-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Disparando...';

        try {
            const result = await AppAPI.triggerN8NWebhook();

            // Check if response is actually the HTML of the dashboard (indicating incorrect URL)
            if (typeof result === 'string' && result.includes('<!DOCTYPE html>')) {
                alert("⚠️ Error: El servidor devolvió la página principal en lugar de ejecutar el webhook. Asegúrate de haber REINICIADO el servidor después de guardar el archivo .env.local.");
                return;
            }

            if (result && result.message === "Workflow was started") {
                alert("🚀 " + result.message + ": ¡Las llamadas han comenzado!");
            } else {
                alert("Respuesta del Webhook: " + (typeof result === 'object' ? JSON.stringify(result) : result));
            }
        } catch (e) {
            alert("❌ Errror: " + e.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar Flujo de Llamadas (N8N)';
        }
    },

    // --- EVENTOS VIEW ---
    async renderEventos(container) {
        this.state.eventos = await AppAPI.getEventos();

        container.innerHTML = `
            <div class="view-header">
                <h1>Gestión de Eventos</h1>
                <button class="btn btn-primary" onclick="App.openEventoModal()">
                    <i class="fa-solid fa-plus"></i> Nuevo Evento
                </button>
            </div>
            
            <div class="glass-card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Tipo de Reunión</th>
                                <th>Fecha y Hora</th>
                                <th>Capacidad</th>
                                <th>Inscritos</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.state.eventos.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No hay eventos registrados</td></tr>` :
                this.state.eventos.map(e => `
                                <tr>
                                    <td><strong>${e.tipo_reunion || 'N/A'}</strong></td>
                                    <td>${e.fecha_hora ? new Date(e.fecha_hora).toLocaleString() : 'N/A'}</td>
                                    <td>${e.capacidad_total || 0}</td>
                                    <td>${e.inscritos_actuales || 0}</td>
                                    <td><span class="badge ${e.estado === 'disponible' ? 'agendado' : 'pendiente'}">${e.estado || 'Otro'}</span></td>
                                    <td>
                                        <div class="actions-cell">
                                            <button class="icon-btn edit" onclick="App.openEventoModal('${e.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                                            <button class="icon-btn delete" onclick="App.deleteEvento('${e.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openEventoModal(id = null) {
        const evento = id ? this.state.eventos.find(e => String(e.id) === String(id)) : null;

        ModalSystem.show({
            title: evento ? 'Editar Evento' : 'Crear Nuevo Evento',
            content: `
                <div class="form-group">
                    <label>Tipo de Reunión</label>
                    <input type="text" name="tipo_reunion" class="form-control" required value="${evento ? (evento.tipo_reunion || '') : ''}">
                </div>
                <div class="form-group">
                    <label>Fecha y Hora</label>
                    <input type="datetime-local" name="fecha_hora" class="form-control" required value="${evento && evento.fecha_hora ? new Date(evento.fecha_hora).toISOString().slice(0, 16) : ''}">
                </div>
                <div class="form-group">
                    <label>Capacidad Total</label>
                    <input type="number" name="capacidad_total" class="form-control" value="${evento ? (evento.capacidad_total || 5) : 5}">
                </div>
                <div class="form-group">
                    <label>Estado</label>
                    <select name="estado" class="form-control">
                        <option value="disponible" ${evento && evento.estado === 'disponible' ? 'selected' : ''}>Disponible</option>
                        <option value="lleno" ${evento && evento.estado === 'lleno' ? 'selected' : ''}>Lleno</option>
                        <option value="finalizado" ${evento && evento.estado === 'finalizado' ? 'selected' : ''}>Finalizado</option>
                    </select>
                </div>
            `,
            onSubmit: async (data) => {
                if (evento) {
                    await AppAPI.updateEvento(id, data);
                } else {
                    await AppAPI.createEvento(data);
                }
                await this.loadView('eventos'); // reload view
            }
        });
    },

    deleteEvento(id) {
        ModalSystem.confirmDelete('Evento', async () => {
            await AppAPI.deleteEvento(id);
            await this.loadView('eventos');
        });
    },

    // --- CODERS (CANDIDATOS) VIEW ---
    async renderCoders(container) {
        this.state.coders = await AppAPI.getCoders();

        container.innerHTML = `
            <div class="view-header">
                <h1>Gestión de Candidatos (Coders)</h1>
                <button class="btn btn-primary" onclick="App.openCoderModal()">
                    <i class="fa-solid fa-plus"></i> Añadir Candidato
                </button>
            </div>
            
            <div class="glass-card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Ciudad</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.state.coders.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">No hay candidatos registrados</td></tr>` :
                this.state.coders.map(c => `
                                <tr>
                                    <td><strong>${c.nombre || ''} ${c.apellido || ''}</strong></td>
                                    <td>${c.telefono || 'N/A'}</td>
                                    <td>${c.correo || 'N/A'}</td>
                                    <td>${c.ciudad || 'N/A'}</td>
                                    <td><span class="badge ${c.estado_gestion && c.estado_gestion !== 'nuevo' ? 'agendado' : 'pendiente'}">${c.estado_gestion || 'Nuevo'}</span></td>
                                    <td>
                                        <div class="actions-cell">
                                            <button class="icon-btn edit" onclick="App.openCoderModal('${c.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                                            <button class="icon-btn delete" onclick="App.deleteCoder('${c.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openCoderModal(id = null) {
        const coder = id ? this.state.coders.find(c => String(c.id) === String(id)) : null;

        ModalSystem.show({
            title: coder ? 'Editar Candidato' : 'Añadir Nuevo Candidato',
            content: `
                <div style="display: flex; gap: 16px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Nombre</label>
                        <input type="text" name="nombre" class="form-control" required value="${coder ? (coder.nombre || '') : ''}">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Apellido</label>
                        <input type="text" name="apellido" class="form-control" required value="${coder ? (coder.apellido || '') : ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="tel" name="telefono" class="form-control" required value="${coder ? (coder.telefono || '') : ''}">
                </div>
                
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" name="correo" class="form-control" value="${coder ? (coder.correo || '') : ''}">
                </div>
                
                <div class="form-group">
                    <label>Ciudad</label>
                    <input type="text" name="ciudad" class="form-control" value="${coder ? (coder.ciudad || '') : ''}">
                </div>

                <div class="form-group">
                    <label>Estado de Gestión</label>
                    <select name="estado_gestion" class="form-control">
                        <option value="nuevo" ${coder && coder.estado_gestion === 'nuevo' ? 'selected' : ''}>Nuevo</option>
                        <option value="contactado" ${coder && coder.estado_gestion === 'contactado' ? 'selected' : ''}>Contactado</option>
                        <option value="entrevistado" ${coder && coder.estado_gestion === 'entrevistado' ? 'selected' : ''}>Entrevistado</option>
                        <option value="rechazado" ${coder && coder.estado_gestion === 'rechazado' ? 'selected' : ''}>Rechazado</option>
                        <option value="contratado" ${coder && coder.estado_gestion === 'contratado' ? 'selected' : ''}>Contratado</option>
                    </select>
                </div>
            `,
            onSubmit: async (data) => {
                if (coder) {
                    await AppAPI.updateCoder(id, data);
                } else {
                    await AppAPI.createCoder(data);
                }
                await this.loadView('coders');
            }
        });
    },

    deleteCoder(id) {
        ModalSystem.confirmDelete('Candidato', async () => {
            await AppAPI.deleteCoder(id);
            await this.loadView('coders');
        });
    },

    // --- CLIENTES VIEW ---
    async renderClientes(container) {
        this.state.clientes = await AppAPI.getClientes();

        container.innerHTML = `
            <div class="view-header">
                <h1>Gestión de Clientes</h1>
                <button class="btn btn-primary" onclick="App.openClienteModal()">
                    <i class="fa-solid fa-plus"></i> Nuevo Cliente
                </button>
            </div>
            
            <div class="glass-card">
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Empresa / Nombre</th>
                                <th>Contacto</th>
                                <th>Teléfono</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.state.clientes.length === 0 ? `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No hay clientes registrados</td></tr>` :
                this.state.clientes.map(c => `
                                <tr>
                                    <td><strong>${c.nombre || c.empresa || 'N/A'}</strong></td>
                                    <td>${c.email || c.contacto || 'N/A'}</td>
                                    <td>${c.telefono || c.phone || 'N/A'}</td>
                                    <td>
                                        <div class="actions-cell">
                                            <button class="icon-btn edit" onclick="App.openClienteModal('${c.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
                                            <button class="icon-btn delete" onclick="App.deleteCliente('${c.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    },

    openClienteModal(id = null) {
        const cliente = id ? this.state.clientes.find(c => String(c.id) === String(id)) : null;

        ModalSystem.show({
            title: cliente ? 'Editar Cliente' : 'Nuevo Cliente',
            content: `
                <div class="form-group">
                    <label>Nombre / Empresa</label>
                    <input type="text" name="nombre" class="form-control" required value="${cliente ? (cliente.nombre || cliente.empresa || '') : ''}">
                </div>
                <div class="form-group">
                    <label>Email de Contacto</label>
                    <input type="email" name="email" class="form-control" required value="${cliente ? (cliente.email || cliente.contacto || '') : ''}">
                </div>
                <div class="form-group">
                    <label>Teléfono</label>
                    <input type="text" name="telefono" class="form-control" value="${cliente ? (cliente.telefono || cliente.phone || '') : ''}">
                </div>
            `,
            onSubmit: async (data) => {
                if (cliente) {
                    await AppAPI.updateCliente(id, data);
                } else {
                    await AppAPI.createCliente(data);
                }
                await this.loadView('clientes');
            }
        });
    },

    deleteCliente(id) {
        ModalSystem.confirmDelete('Cliente', async () => {
            await AppAPI.deleteCliente(id);
            await this.loadView('clientes');
        });
    }

};
