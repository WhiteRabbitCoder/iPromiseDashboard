/**
 * modals.js - Dynamic Modal System
 */

export const ModalSystem = {
    overlayClass: 'modal-overlay',
    contentClass: 'modal-content',

    /**
     * Shows a modal dialog with the given configuration
     * @param {Object} config - title, content (HTML string), onSubmit, submitText
     */
    show(config) {
        this.close(); // Close any existing first

        const overlay = document.createElement('div');
        overlay.className = this.overlayClass;
        overlay.id = 'current-modal';

        const content = document.createElement('div');
        content.className = this.contentClass;

        const header = document.createElement('div');
        header.className = 'modal-header';

        const title = document.createElement('h3');
        title.textContent = config.title;

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-modal';
        closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
        closeBtn.onclick = () => this.close();

        header.appendChild(title);
        header.appendChild(closeBtn);

        const form = document.createElement('form');
        form.id = 'modal-form';

        const bodyContent = document.createElement('div');
        bodyContent.innerHTML = config.content;

        const footer = document.createElement('div');
        footer.className = 'modal-footer';

        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.className = 'btn';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.onclick = () => this.close();

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = config.isDanger ? 'btn btn-danger' : 'btn btn-primary';
        submitBtn.textContent = config.submitText || 'Guardar';

        footer.appendChild(cancelBtn);
        footer.appendChild(submitBtn);

        form.appendChild(bodyContent);
        form.appendChild(footer);

        form.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            // disable submit button during process
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

            try {
                if (config.onSubmit) {
                    await config.onSubmit(data);
                }
                this.close();
            } catch (error) {
                console.error(error);
                alert("Ocurrió un error. Revisa la consola.");
                submitBtn.disabled = false;
                submitBtn.textContent = config.submitText || 'Guardar';
            }
        };

        content.appendChild(header);
        content.appendChild(form);
        overlay.appendChild(content);

        document.getElementById('modal-root').appendChild(overlay);

        // Animate in
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });

        // Close on outside click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.close();
            }
        });
    },

    close() {
        const overlay = document.getElementById('current-modal');
        if (overlay) {
            overlay.classList.remove('active');
            setTimeout(() => {
                const root = document.getElementById('modal-root');
                if (root && overlay.parentNode === root) {
                    root.removeChild(overlay);
                }
            }, 300); // match css transition
        }
    },

    confirmDelete(entityName, onDelete) {
        this.show({
            title: `Eliminar ${entityName}`,
            content: `<p style="margin-bottom: 20px;">¿Estás seguro de que deseas eliminar este ${entityName.toLowerCase()}? Esta acción no se puede deshacer.</p>`,
            submitText: 'Sí, Eliminar',
            isDanger: true,
            onSubmit: async () => {
                await onDelete();
            }
        });
    }
};
