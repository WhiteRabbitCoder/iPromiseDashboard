require('dotenv').config({ path: '.env.local' });
const express = require('express');
const cors = require('cors');
const path = require('path');

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
        supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
        n8nWebhookUrl: process.env.N8N_WEBHOOK_URL
    });
});

// Fallback to index.html for SPA-like behavior if needed
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running beautifully on http://localhost:${PORT}`);
});
