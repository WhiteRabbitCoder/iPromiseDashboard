/**
 * api.js - Centralized Supabase API client
 */

const AppAPI = {
    supabaseUrl: '',
    anonKey: '',
    axiosInstance: null,

    async init() {
        try {
            // Fetch config securely from our backend 
            const response = await fetch('/api/config');
            const config = await response.json();

            this.supabaseUrl = config.supabaseUrl;
            this.anonKey = config.supabaseAnonKey;

            console.log("Config loaded:", { url: this.supabaseUrl });

            // Configure Axios instance
            this.axiosInstance = axios.create({
                baseURL: `${this.supabaseUrl}/rest/v1`,
                headers: {
                    "apikey": this.anonKey,
                    "Authorization": `Bearer ${this.anonKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=representation"
                }
            });
            console.log("API initialized successfully");
        } catch (error) {
            console.error("Failed to initialize API:", error);
            alert("No se pudo conectar al servidor para obtener las credenciales.");
        }
    },

    // --- CODERS (Candidatos) ---
    async getCoders() {
        try {
            const res = await this.axiosInstance.get('/candidatos?select=*');
            return res.data;
        } catch (e) {
            console.error("Error fetching candidatos:", e);
            return [];
        }
    },
    async getCoder(id) {
        try {
            const res = await this.axiosInstance.get(`/candidatos?id=eq.${id}&select=*`);
            return res.data[0];
        } catch (e) {
            console.error("Error fetching candidato:", e);
            return null;
        }
    },
    async createCoder(data) {
        try {
            // Note: Prefer return=representation will return the created object in an array
            const res = await this.axiosInstance.post('/candidatos', data);
            return res.data[0];
        } catch (e) {
            console.error("Error creating candidato:", e);
            throw e;
        }
    },
    async updateCoder(id, data) {
        try {
            const res = await this.axiosInstance.patch(`/candidatos?id=eq.${id}`, data);
            return res.data[0];
        } catch (e) {
            console.error("Error updating candidato:", e);
            throw e;
        }
    },
    async deleteCoder(id) {
        try {
            await this.axiosInstance.delete(`/candidatos?id=eq.${id}`);
            return true;
        } catch (e) {
            console.error("Error deleting candidato:", e);
            return false;
        }
    },

    // --- CLIENTES ---
    async getClientes() {
        try {
            const res = await this.axiosInstance.get('/clientes?select=*');
            return res.data;
        } catch (e) {
            console.error("Error fetching clientes:", e);
            return [];
        }
    },
    async getCliente(id) {
        try {
            const res = await this.axiosInstance.get(`/clientes?id=eq.${id}&select=*`);
            return res.data[0];
        } catch (e) {
            console.error("Error fetching cliente:", e);
            return null;
        }
    },
    async createCliente(data) {
        try {
            const res = await this.axiosInstance.post('/clientes', data);
            return res.data[0];
        } catch (e) {
            console.error("Error creating cliente:", e);
            throw e;
        }
    },
    async updateCliente(id, data) {
        try {
            const res = await this.axiosInstance.patch(`/clientes?id=eq.${id}`, data);
            return res.data[0];
        } catch (e) {
            console.error("Error updating cliente:", e);
            throw e;
        }
    },
    async deleteCliente(id) {
        try {
            await this.axiosInstance.delete(`/clientes?id=eq.${id}`);
            return true;
        } catch (e) {
            console.error("Error deleting cliente:", e);
            return false;
        }
    },

    // --- EVENTOS ---
    async getEventos() {
        try {
            const res = await this.axiosInstance.get('/eventos?select=*');
            return res.data;
        } catch (e) {
            console.error("Error fetching eventos:", e);
            return [];
        }
    },
    async getEvento(id) {
        try {
            const res = await this.axiosInstance.get(`/eventos?id=eq.${id}&select=*`);
            return res.data[0];
        } catch (e) {
            console.error("Error fetching evento:", e);
            return null;
        }
    },
    async createEvento(data) {
        try {
            const res = await this.axiosInstance.post('/eventos', data);
            return res.data[0];
        } catch (e) {
            console.error("Error creating evento:", e);
            throw e;
        }
    },
    async updateEvento(id, data) {
        try {
            const res = await this.axiosInstance.patch(`/eventos?id=eq.${id}`, data);
            return res.data[0];
        } catch (e) {
            console.error("Error updating evento:", e);
            throw e;
        }
    },
    async deleteEvento(id) {
        try {
            await this.axiosInstance.delete(`/eventos?id=eq.${id}`);
            return true;
        } catch (e) {
            console.error("Error deleting evento:", e);
            return false;
        }
    },

    async getLlamadas() {
        try {
            const res = await this.axiosInstance.get('/llamadas?select=*,candidatos(nombre,apellido),eventos(tipo_reunion)');
            return res.data;
        } catch (e) {
            console.error("Error fetching llamadas with joins:", e.response?.data || e.message);
            // Fallback: fetch plain data and enrich manually with separate requests
            try {
                const [llamadasRes, candidatosRes, eventosRes] = await Promise.all([
                    this.axiosInstance.get('/llamadas?select=*'),
                    this.axiosInstance.get('/candidatos?select=id,nombre,apellido').catch(() => ({ data: [] })),
                    this.axiosInstance.get('/eventos?select=id,tipo_reunion').catch(() => ({ data: [] }))
                ]);
                const candidatosMap = Object.fromEntries(candidatosRes.data.map(c => [c.id, c]));
                const eventosMap = Object.fromEntries(eventosRes.data.map(ev => [ev.id, ev]));
                return llamadasRes.data.map(ll => ({
                    ...ll,
                    // Support common FK column name patterns
                    candidatos: candidatosMap[ll.candidato_id] || candidatosMap[ll.id_candidato] || null,
                    eventos: eventosMap[ll.evento_id] || eventosMap[ll.id_evento] || null
                }));
            } catch (e2) {
                console.error("Error in llamadas fallback:", e2);
                return [];
            }
        }
    },

    // --- N8N WEBHOOK ---
    async triggerN8NWebhook() {
        try {
            // Call the server-side proxy to avoid browser CORS restrictions
            const res = await axios.post('/api/trigger-flow');
            return res.data;
        } catch (e) {
            console.error("Error triggering webhook:", e);
            throw e;
        }
    }
};
