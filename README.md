# ZÉNIT - Catálogo Web Interactivo 🧼

Este proyecto consiste en una plataforma web minimalista y moderna para la visualización de productos y gestión de pedidos de **Zénit**. Permite a los usuarios explorar el catálogo en tiempo real y armar un pedido personalizado que se envía directamente a través de WhatsApp.

##  Características

- **Sincronización Dinámica:** Los productos, precios y descripciones se gestionan de forma remota a través de Google Sheets, permitiendo actualizaciones instantáneas sin tocar el código.
- **Experiencia de Usuario (UX):** Interfaz limpia y minimalista optimizada para dispositivos móviles.
- **Gestión de Carrito:** Sistema de persistencia local (`localStorage`) que permite mantener el pedido incluso si se recarga la página.
- **Flujo de Confirmación:** Validación de datos de contacto y revisión de pedido previa al envío final.
- **Integración con WhatsApp:** Generación automática de mensajes formateados para facilitar la comunicación entre el cliente y el comercio.

## Tecnologías Utilizadas

- **Frontend:** HTML5, CSS3 (Flexbox/Grid), JavaScript Vanilla (ES6+).
- **Integraciones:** [PapaParse](https://www.papaparse.com/) para el procesamiento de datos CSV.
- **Gestión de Datos:** Google Sheets API (vía Publicación Web).
- **Deployment:** GitHub Pages.

## 🔗 Enlaces del Proyecto

- **Tienda en Vivo:** [Visitar Tienda Zénit](https://cozzo-emi.github.io/zenit-limpieza/)
---
*Este software ha sido desarrollado como una solución escalable para la digitalización de inventarios locales.*
