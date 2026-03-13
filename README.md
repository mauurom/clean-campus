# Limpiador de Campus UTN 🎓

Una extensión de navegador moderna, ligera y nativa para limpiar visualmente las asignaturas aprobadas de tu tablero principal en Moodle (Diseñada específicamente para el **Campus UTN Facultad Regional San Rafael**).

## ✨ Características

- **Ocultamiento de Asignaturas Cursadas**: Remueve discretamente de tu "dashboard" visual los cursos y aulas virtuales que ya no te interesan.
- **Diseño Premium**: Arquitectura puramente orientada a objetos que se inyecta con CSS moderno, modo *Glassmorphism* y suavizado de *transiciones fluidas* que se mimetiza con el Moodle Universitario de la UTN-FRSR.
- **Botón Discreto Integrado**: Inyector de diseño sutil (`Hover State`) en la misma tarjeta curricular, para evitar menoscabar la experiencia nativa del tablero.
- **Panel de Control (FAB)**: Botón de gestión flotante accesible desde cualquier lugar para "Restaurar" asignaturas de inmediato o "Restaurar todas" con un solo clic.

---

## 🚀 Instalación en Modo Desarrollador (Google Chrome)

Al no encontrarse aún en la Chrome Web Store, puedes usar esta extensión descargándola e instalándola manualmente en tres simples pasos:

1. **Descarga el Proyecto**: Clona o descarga `.zip` de este repositorio en tu computadora. Descomprime la carpeta si descargaste el zip.
2. **Abre el Gestor de Extensiones**: Escribe `chrome://extensions/` en la barra de direcciones de tu navegador Chrome.
3. **Activar e Instalar**: Asegúrate de tener encendido el **Modo Productor/Desarrollador** (arriba a la derecha). Posteriormente, pulsa el botón *"Cargar descomprimida"* y selecciona la carpeta **raíz** (`clean-campus`) donde está el archivo `manifest.json`.

¡Y listo! Ya aparecerá y se activará sola en tu próximo inicio de sesión del Moodle UTN-FRSR.

---

## 🔧 Archivos y Arquitectura

* `manifest.json`: (V3) Gestiona permisos básicos únicamente de `storage` local (sin conexión externa ni bases de datos), volviéndola totalmente privada.
* `content.js`: Inyector del motor de gestión y arquitectura Orientada a Objetos en JS. Evita la sobre-ejecución del Moodle gracias a un *debounce MutationObserver* altamente texturizado.
* `styles.css`: Estilado modular utilizando variables de CSS puras (`:root`) para mimetizarse fluidamente en el campus con transiciones *Spring-bounce*.

## 📌 Limitaciones (A tener en cuenta)

Esta extensión lee el `DOM` HTML específico del tema actual (Theme) del **Campus UTN (FRSR)**. Aunque puede que funcione en otros Moodle dependiendo de las clases de bootstrap y HTML sub-estructural (`.coursebox`, `.cimbox`, `.panel-body`), no se garantiza su compatibilidad visual al 100% con temas distintos a los estandarizados (como *Boost* o *Academi*).
