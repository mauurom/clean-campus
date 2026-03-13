const STORAGE_KEY = 'materias_ocultas_utn';

class UTNCampusCleaner {
    constructor() {
        this.materiasOcultas = new Set();
        this.observer = null;
        this.init();
    }

    async init() {
        await this.loadHiddenCourses();
        this.injectUI();
        this.processCourses();
        this.setupObserver();
    }

    async loadHiddenCourses() {
        return new Promise((resolve) => {
            chrome.storage.local.get([STORAGE_KEY], (result) => {
                const arr = result[STORAGE_KEY] || [];
                this.materiasOcultas = new Set(arr);
                resolve();
            });
        });
    }

    async saveHiddenCourses() {
        const arr = Array.from(this.materiasOcultas);
        return new Promise((resolve) => {
            chrome.storage.local.set({ [STORAGE_KEY]: arr }, () => resolve());
        });
    }

    setupObserver() {
        let timeout;
        this.observer = new MutationObserver(() => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.processCourses();
            }, 300); // 300ms debounce
        });
        
        const container = document.querySelector('.frontpage-course-list-enrolled') || document.querySelector('#frontpage-course-list') || document.querySelector('#page-header') || document.body;
        if(container) {
            this.observer.observe(container, { childList: true, subtree: true });
        }
    }

    processCourses() {
        const tarjetas = document.querySelectorAll('.coursebox');
        
        tarjetas.forEach(tarjeta => {
            if (tarjeta.dataset.utnCleanerProcessed) return;
            
            const elementoTitulo = tarjeta.querySelector('.coursebox-content h3');
            if (!elementoTitulo) return;

            const tituloMateria = elementoTitulo.innerText.trim();
            tarjeta.dataset.utnCleanerProcessed = "true";
            tarjeta.dataset.utnCourseTitle = tituloMateria;

            if (this.materiasOcultas.has(tituloMateria)) {
                tarjeta.style.display = 'none';
                return;
            }

            this.injectHideButton(tarjeta, tituloMateria);
        });
    }

    injectHideButton(tarjeta, tituloMateria) {
        const panelBody = tarjeta.querySelector('.panel-body');
        if (!panelBody) return;

        // Aseguramos de que el panel body tenga posición relativa para poder posicionar el botón de forma absoluta
        if (getComputedStyle(panelBody).position === 'static') {
            panelBody.style.position = 'relative';
        }

        const btnContainer = document.createElement('div');
        btnContainer.className = 'utn-cleaner-hide-container';
        btnContainer.innerHTML = `
            <button class="utn-cleaner-btn-hide" title="Ocultar esta materia">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
            </button>
        `;

        const btn = btnContainer.querySelector('button');
        btn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await this.hideCourse(tituloMateria, tarjeta);
        });

        // Insertamos el botón flotante dentro del panel-body
        panelBody.appendChild(btnContainer);
    }

    async hideCourse(titulo, tarjeta) {
        if (!this.materiasOcultas.has(titulo)) {
            this.materiasOcultas.add(titulo);
            await this.saveHiddenCourses();
            
            // Animación suave al ocultar
            tarjeta.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            tarjeta.style.opacity = '0';
            tarjeta.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                tarjeta.style.display = 'none';
                tarjeta.style.transform = ''; 
            }, 400);

            // Refrescamos el modal si está abierto
            if (!document.getElementById('utn-cleaner-modal-overlay').classList.contains('utn-cleaner-hidden')) {
                this.renderizarListaModal();
            }
        }
    }

    injectUI() {
        this.crearModal();
        this.inyectarBotonGestion();
    }

    crearModal() {
        if (document.getElementById('utn-cleaner-modal-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'utn-cleaner-modal-overlay';
        overlay.className = 'utn-cleaner-hidden';
        
        const modal = document.createElement('div');
        modal.id = 'utn-cleaner-modal-content';

        modal.innerHTML = `
            <div class="utn-cleaner-modal-header">
                <h3><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; vertical-align: bottom;"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> Materias Ocultas</h3>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button id="utn-cleaner-btn-restaurar-todas" class="utn-cleaner-btn-restaurar-todas" style="display: none;" title="Restaurar todas las materias">Restaurar Todas</button>
                    <button id="utn-cleaner-btn-cerrar" title="Cerrar">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>
            <div class="utn-cleaner-modal-body">
                <ul id="utn-cleaner-lista-materias"></ul>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        const btnCerrar = document.getElementById('utn-cleaner-btn-cerrar');
        const btnRestaurarTodas = document.getElementById('utn-cleaner-btn-restaurar-todas');
        
        btnRestaurarTodas.addEventListener('click', () => this.restaurarTodas());
        
        const cerrarModal = () => {
            overlay.classList.add('utn-cleaner-fade-out');
            setTimeout(() => {
                overlay.classList.add('utn-cleaner-hidden');
                overlay.classList.remove('utn-cleaner-fade-out');
            }, 300);
        };

        btnCerrar.addEventListener('click', cerrarModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cerrarModal();
        });
    }

    abrirModal() {
        const overlay = document.getElementById('utn-cleaner-modal-overlay');
        this.renderizarListaModal();
        overlay.classList.remove('utn-cleaner-hidden');
    }

    renderizarListaModal() {
        const lista = document.getElementById('utn-cleaner-lista-materias');
        const btnRestaurarTodas = document.getElementById('utn-cleaner-btn-restaurar-todas');
        lista.innerHTML = '';

        if (this.materiasOcultas.size === 0) {
            if (btnRestaurarTodas) btnRestaurarTodas.style.display = 'none';
            lista.innerHTML = `
                <div class="utn-cleaner-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M16 16s-1.5-2-4-2-4 2-4 2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                    <p>No tenés materias ocultas actualmente.</p>
                </div>
            `;
        } else {
            if (btnRestaurarTodas) btnRestaurarTodas.style.display = 'block';
            const arrMaterias = Array.from(this.materiasOcultas).sort();
            arrMaterias.forEach(materia => {
                const li = document.createElement('li');
                
                const spanTitulo = document.createElement('span');
                spanTitulo.innerText = materia;
                spanTitulo.className = 'utn-cleaner-item-title';
                
                const btnRestaurar = document.createElement('button');
                btnRestaurar.innerHTML = `
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"></path><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                    Restaurar
                `;
                btnRestaurar.className = 'utn-cleaner-btn-restaurar';
                
                btnRestaurar.onclick = () => this.restaurarMateria(materia, li);

                li.appendChild(spanTitulo);
                li.appendChild(btnRestaurar);
                lista.appendChild(li);
            });
        }
    }

    async restaurarMateria(titulo, elementoLista) {
        this.materiasOcultas.delete(titulo);
        await this.saveHiddenCourses();

        // Animación al borrar de la lista
        if (elementoLista) {
            elementoLista.style.transition = 'all 0.3s ease';
            elementoLista.style.opacity = '0';
            elementoLista.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                elementoLista.remove();
                
                const lista = document.getElementById('utn-cleaner-lista-materias');
                if (lista && lista.children.length === 0) {
                    this.renderizarListaModal();
                }
            }, 300);
        }

        // Restaurar en el campus
        const tarjetas = document.querySelectorAll('.coursebox');
        tarjetas.forEach(tarjeta => {
            if (tarjeta.dataset.utnCourseTitle === titulo) {
                // Borramos todo el estilo inline que aplicaba para achicar o difuminar la tarjeta
                tarjeta.style.cssText = ''; 
                // Removemos el botón inyectado para obligar al observer a re-crearlo en estado limpio
                const btnContainer = tarjeta.querySelector('.utn-cleaner-hide-container');
                if (btnContainer) btnContainer.remove();
                
                // Eliminamos la marca para que la detecte como una tarjeta "nueva" a procesar
                delete tarjeta.dataset.utnCleanerProcessed;
                
                // Si el mouse quedó en bug desencadenando el hover nativo predeterminado
                const anclaje = tarjeta.querySelector('a');
                if (anclaje) anclaje.blur();
                tarjeta.blur();
            }
        });
        
        // Timeout ligero para que el DOM se asiente y reinyecte el botón
        setTimeout(() => this.processCourses(), 50);
    }

    async restaurarTodas() {
        if (!confirm('¿Estás seguro de que deseas restaurar TODAS las materias ocultas?')) return;
        
        const materias = Array.from(this.materiasOcultas);
        for (const titulo of materias) {
            await this.restaurarMateria(titulo, null);
        }
        
        this.renderizarListaModal();
    }

    inyectarBotonGestion() {
        if (document.getElementById('utn-cleaner-fab')) return;

        const fab = document.createElement('button');
        fab.id = 'utn-cleaner-fab';
        fab.title = 'Gestionar materias ocultas';
        fab.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `;

        fab.addEventListener('click', () => this.abrirModal());

        document.body.appendChild(fab);
    }
}

// Inicializar de forma segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new UTNCampusCleaner());
} else {
    new UTNCampusCleaner();
}