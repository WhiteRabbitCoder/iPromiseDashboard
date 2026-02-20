# 🚀 iPromise Dashboard

Un dashboard administrativo moderno con estética **Glassmorphism**, diseñado para la gestión eficiente de candidatos, eventos y automatización de llamadas.

![Glassmorphism UI](https://img.shields.io/badge/UI-Glassmorphism-blueviolet?style=for-the-badge)
![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![n8n](https://img.shields.io/badge/Automation-n8n-FF6D5A?style=for-the-badge&logo=n8n)

## ✨ Características Principales

-   **💎 Interfaz Glassmorphism**: Diseño oscuro, elegante y minimalista con efectos de desenfuerzo (blur) y transparencias premium.
-   **👨‍💻 Gestión de Candidatos (Coders)**: CRUD completo sincronizado con Supabase para administrar el flujo de talento.
-   **📅 Sistema de Eventos**: Seguimiento de reuniones, capacidades y estados de inscripción en tiempo real.
-   **📞 Integración con n8n**: Disparador inteligente para flujos de llamadas masivas mediante webhooks.
-   **📊 Dashboard Dinámico**: Estadísticas visuales con Chart.js y resúmenes rápidos de la operativa diaria.

## 🛠️ Stack Tecnológico

-   **Frontend**: HTML5, CSS3 (Custom Variables), JavaScript Vanilla.
-   **Backend**: Node.js, Express.
-   **Base de Datos**: Supabase (PostgreSQL).
-   **Librerías**: Axios, Chart.js, Font Awesome.
-   **Automatización**: n8n.

## 🚀 Instalación y Configuración

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/WhiteRabbitCoder/iPromiseDashboard.git
    cd iPromiseDashboard
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:
    ```env
    SUPABASE_URL=tu_url_de_supabase
    SUPABASE_ANON_KEY=tu_anon_key
    SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
    N8N_WEBHOOK_URL=https://tu-instancia-n8n.app/webhook-test/MakeAllCalls
    PORT=3000
    ```

4.  **Iniciar el servidor**:
    ```bash
    npm start
    # O si usas node directamente:
    node server/server.js
    ```

5.  **Acceder a la aplicación**:
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📝 Roadmap / Pendientes
-   [ ] Pulir detalles visuales en el modal de eventos.
-   [ ] Implementar sistema de logs detallados para las respuestas del webhook.
-   [ ] Añadir filtros avanzados en la tabla de candidatos.

---
Desarrollado con ❤️ para **Riwi** por **WhiteRabbitCoder**.
