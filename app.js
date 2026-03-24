// URL de tu Google Sheet publicada como CSV
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrz0jwtU-gpFJWblZ-6i8wPGhZFgucHFct6rMvEVi45iKbQTEUKAccXAOLb9KfQmu4G7cDE-8Ob95c/pub?output=csv";
const WHATSAPP_NUMBER = "5491123802851"; 

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carritoZenit')) || []; 

// --- 1. CARGA DE DATOS DESDE GOOGLE SHEETS ---

async function cargarProductos() {
    try {
        const respuesta = await fetch(SHEET_URL);
        const textoCsv = await respuesta.text();

        // Convertir CSV a objetos JS usando PapaParse
        Papa.parse(textoCsv, {
            header: true, // La primera fila son los títulos
            dynamicTyping: true, // Convierte números automáticamente
            complete: function(results) {
                productos = results.data.filter(p => p.ID); // Filtrar filas vacías
                renderizarCatalogo();
                actualizarCarritoUI();
            }
        });

    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById('catalogo').innerHTML = "<p>Error al cargar el catálogo. Por favor reintente.</p>";
    }
}

// --- 2. LÓGICA DEL CATÁLOGO ---

function renderizarCatalogo() {
    const catalogo = document.getElementById('catalogo');
    if (!catalogo) return;
    catalogo.innerHTML = "";

    productos.forEach(prod => {
        const nombre = prod.Producto || "Sin nombre";
        const precio = prod.PrecioVenta || 0;
        
        // Limitamos la descripción a 60 caracteres para mantener el minimalismo
        let desc = prod.DESCRIPCIÓN || prod.Descripcion || "";
        if (desc.length > 60) desc = desc.substring(0, 57) + "...";
        
        const img = prod.Imagen || 'https://via.placeholder.com/150?text=Zenit';
        const id = prod.ID || "sin-id";

        catalogo.innerHTML += `
            <div class="card">
                <img src="${img}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/150?text=Zenit'">
                <div class="card-info">
                    <h3>${nombre}</h3>
                    <p class="descripcion">${desc}</p>
                </div>
                <div class="card-footer">
                    <p class="precio">$${Number(precio).toLocaleString('es-AR')}</p>
                    <button onclick="agregarAlCarrito('${id}')">Agregar</button>
                </div>
            </div>
        `;
    });
}

// --- 3. LÓGICA DEL CARRITO ---

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.ID === id);
    if (!prod) return;

    // Verificar si ya está en el carrito para sumar cantidad
    const itemExistente = carrito.find(item => item.ID === id);

    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            ID: prod.ID,
            nombre: prod.Producto,
            precio: prod.PrecioVenta,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarCarritoUI();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarCarritoUI();
}

function modificarCantidad(index, cambio) {
    carrito[index].cantidad += cambio;
    if (carrito[index].cantidad <= 0) {
        eliminarDelCarrito(index);
    } else {
        guardarCarrito();
        actualizarCarritoUI();
    }
}

function guardarCarrito() {
    localStorage.setItem('carritoZenit', JSON.stringify(carrito));
}

function actualizarCarritoUI() {
    const lista = document.getElementById('items-carrito');
    const totalSpan = document.getElementById('precio-total');
    lista.innerHTML = "";
    let total = 0;

    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        lista.innerHTML += `
            <div class="carrito-item">
                <span class="item-nombre">${item.nombre}</span>
                <div class="item-controles">
                    <button onclick="modificarCantidad(${index}, -1)">-</button>
                    <span class="item-cantidad">${item.cantidad}</span>
                    <button onclick="modificarCantidad(${index}, 1)">+</button>
                </div>
                <span class="item-subtotal">$${subtotal.toLocaleString('es-AR')}</span>
                <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar">❌</button>
            </div>
        `;
    });
    totalSpan.innerText = total.toLocaleString('es-AR');
}

// --- 4. MODAL Y ENVÍO A WHATSAPP ---

function abrirRevision() {
    if (carrito.length === 0) return alert("El carrito está vacío.");
    
    // Validación básica del formulario
    const form = document.getElementById('form-datos');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const resumen = document.getElementById('resumen-pedido');
    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const total = document.getElementById('precio-total').innerText;
    
    let htmlResumen = `
        <p><strong>Cliente:</strong> ${nombre}</p>
        <p><strong>Dirección:</strong> ${direccion}</p>
        <hr>
        <ul class="lista-resumen">
            ${carrito.map(i => `<li>${i.cantidad}x ${i.nombre} ($${(i.precio * i.cantidad).toLocaleString('es-AR')})</li>`).join('')}
        </ul>
        <hr>
        <p class="total-final"><strong>Total a pagar: $${total}</strong></p>
    `;
    
    resumen.innerHTML = htmlResumen;
    document.getElementById('modal-revision').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('modal-revision').classList.add('hidden');
}

function enviarWhatsApp() {
    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const notas = document.getElementById('notas').value;
    const total = document.getElementById('precio-total').innerText;

    // Construcción del mensaje formateado
    let mensaje = `🛒 *NUEVO PEDIDO - ZENIT*\n\n`;
    mensaje += `👤 *Cliente:* ${nombre}\n`;
    mensaje += `📞 *Teléfono:* ${telefono}\n`;
    mensaje += `📍 *Entrega:* ${direccion}\n`;
    if (notas) mensaje += `📝 *Notas:* ${notas}\n`;
    mensaje += `\n--------------------------\n\n`;

    carrito.forEach(i => {
        mensaje += `• ${i.cantidad}x ${i.nombre} ($${(i.precio * i.cantidad).toLocaleString('es-AR')})\n`;
    });

    mensaje += `\n--------------------------\n`;
    mensaje += `💰 *TOTAL A PAGAR: $${total}*`;
    mensaje += `\n\n_Por favor, confirme la recepción de este pedido._`;

    // Crear el enlace wa.me
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    
    window.open(url, '_blank');
    
    // Opcional: Limpiar carrito después de enviar
    // carrito = [];
    // guardarCarrito();
    // actualizarCarritoUI();
    // cerrarModal();
}

// Iniciar la carga al abrir la página
document.addEventListener('DOMContentLoaded', cargarProductos);