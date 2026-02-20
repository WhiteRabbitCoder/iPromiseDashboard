require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

// Securely provide configuration to the frontend
// We only expose the ANON key, as it's safe for client-side use with RLS
// We NEVER expose the SERVICE_ROLE_KEY
app.get('/api/config', (req, res) => {
    res.json({
        supabaseUrl: process.env.SUPABASE_URL,
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY
    });
});

// Proxy endpoint for n8n webhook to avoid browser CORS issues
app.post('/api/trigger-flow', async (req, res) => {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
        return res.status(503).json({ error: 'N8N_WEBHOOK_URL no está configurado en el servidor. Revisa tu archivo .env.local y reinicia el servidor.' });
    }
    try {
        const response = await axios.get(webhookUrl);
        res.json(response.data);
    } catch (e) {
        console.error("Error proxying n8n webhook:", e.message);
        res.status(502).json({ error: 'No se pudo contactar el servicio de automatización. Verifica que el servidor n8n esté activo y la URL del webhook sea correcta.' });
    }
});

// Fallback to index.html for SPA-like behavior if needed
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
