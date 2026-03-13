# UTN Campus Cleaner

Extensión para Google Chrome diseñada para ocultar asignaturas completadas o inactivas en el tablero principal de Moodle. Optimizada específicamente para el entorno virtual de la Universidad Tecnológica Nacional, Facultad Regional San Rafael (UTN-FRSR).

## Características

- **Gestión visual del tablero:** Permite ocultar tarjetas de cursos desde la vista principal de Moodle para reducir el ruido visual.
- **Rendimiento optimizado:** Utiliza un `MutationObserver` con manejo de concurrencia y retraso (*debounce*) para operar sobre el DOM dinámico de Moodle sin impacto negativo en la carga original de la página.
- **Interfaz no intrusiva:** La interfaz inyectada se acopla estructuralmente a las tarjetas de curso existentes mediante estilización CSS encapsulada.
- **Administración centralizada:** Incluye un menú (modal) para restaurar asignaturas individuales o deshacer las acciones de forma masiva.
- **Estado local persistente:** Hace uso de la API `chrome.storage.local` para guardar las preferencias directamente en el navegador local, garantizando la privacidad sin depender de servidores externos.

## Instalación (Modo Desarrollador)

Dado que la extensión aún no se publica en la Chrome Web Store, la instalación debe realizarse de forma manual:

1. Descargar el código fuente de este repositorio y extraerlo en un directorio local.
2. Abrir el navegador Google Chrome y navegar a la URL: `chrome://extensions/`.
3. Habilitar el **Modo desarrollador** (interruptor ubicado en la esquina superior derecha).
4. Hacer clic en el botón **Cargar descomprimida** y seleccionar el directorio raíz del proyecto (la carpeta que contiene el archivo `manifest.json`).

La funcionalidad estará disponible en la próxima actualización de la pestaña del campus virtual.

## Estructura del Proyecto

- `manifest.json`: Configurado para Manifest V3. Define la meta-información, los scripts a inyectar y los permisos requeridos (`storage`).
- `content.js`: Script de contenido central. Contiene la clase `UTNCampusCleaner`, encargada de evaluar el estado del DOM, inyectar los controladores asíncronamente y sincronizar estados con la API de Chrome.
- `styles.css`: Hoja de estilos complementaria. Emplea variables CSS y animaciones parametrizadas para la superposición de los botones y los cuadros modales.

## Compatibilidad

El DOM de Moodle varía considerablemente según el tema (*Theme*) instalado en cada institución. Esta extensión orienta sus selectores (`.coursebox`, `.cimbox`, `.panel-body`) y nodos de inyección a la estructura existente en la plataforma de la UTN-FRSR. Su viabilidad en otras instalaciones de Moodle está sujeta a la similitud estructural con dicha instancia.
