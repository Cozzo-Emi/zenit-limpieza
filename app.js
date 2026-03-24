const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrz0jwtU-gpFJWblZ-6i8wPGhZFgucHFct6rMvEVi45iKbQTEUKAccXAOLb9KfQmu4G7cDE-8Ob95c/pub?output=csv";
const WHATSAPP_NUMBER = "5491123802851"; 

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carritoZenit')) || []; 

async function cargarProductos() {
    try {
        const respuesta = await fetch(SHEET_URL);
        const textoCsv = await respuesta.text();

        Papa.parse(textoCsv, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                productos = results.data.filter(p => p.Producto);
                renderizarCatalogo();
                actualizarCarritoUI();
            }
        });
    } catch (error) {
        console.error("Error:", error);
        document.getElementById('catalogo').innerHTML = "<p>Error al cargar catálogo.</p>";
    }
}

function renderizarCatalogo() {
    const catalogo = document.getElementById('catalogo');
    if (!catalogo) return;
    catalogo.innerHTML = "";

    productos.forEach(prod => {
        const nombre = prod.Producto || "Sin nombre";
        const precio = prod.PrecioVenta || 0;
        let desc = prod.DESCRIPCIÓN || prod.Descripcion || "";
        if (desc.length > 50) desc = desc.substring(0, 47) + "...";
        
        const img = prod.Imagen || 'https://via.placeholder.com/150?text=Zenit';
        const id = prod.ID || "sin-id";

        catalogo.innerHTML += `
            <div class="card" id="card-${id}">
                <img src="${img}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/150?text=Zenit'">
                <h3>${nombre}</h3>
                <p class="descripcion">${desc}</p>
                <p class="precio">$${Number(precio).toLocaleString('es-AR')}</p>
                <button onclick="agregarAlCarrito('${id}')">Agregar</button>
            </div>
        `;
    });
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.ID === id);
    if (!prod) return;

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

    // Feedback visual
    mostrarToast(`+1 ${prod.Producto}`);
    guardarCarrito();
    actualizarCarritoUI();
}

function mostrarToast(mensaje) {
    const viejo = document.getElementById('toast-notificacion');
    if (viejo) viejo.remove();

    const toast = document.createElement('div');
    toast.id = 'toast-notificacion';
    toast.innerText = mensaje;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = '0.5s';
        setTimeout(() => toast.remove(), 500);
    }, 2000);
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
                <div class="info-item">
                    <strong>${item.nombre}</strong><br>
                    <small>$${item.precio.toLocaleString('es-AR')} c/u</small>
                </div>
                <div class="item-controles">
                    <button onclick="modificarCantidad(${index}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="modificarCantidad(${index}, 1)">+</button>
                    <button onclick="eliminarDelCarrito(${index})">❌</button>
                </div>
            </div>
        `;
    });
    totalSpan.innerText = total.toLocaleString('es-AR');
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

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    guardarCarrito();
    actualizarCarritoUI();
}

function guardarCarrito() {
    localStorage.setItem('carritoZenit', JSON.stringify(carrito));
}

function abrirRevision() {
    if (carrito.length === 0) return alert("El carrito está vacío.");
    const form = document.getElementById('form-datos');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const resumen = document.getElementById('resumen-pedido');
    const total = document.getElementById('precio-total').innerText;
    
    resumen.innerHTML = `
        <ul style="list-style:none; padding:0; font-size:0.9rem;">
            ${carrito.map(i => `<li>• ${i.cantidad}x ${i.nombre} ($${(i.precio * i.cantidad).toLocaleString('es-AR')})</li>`).join('')}
        </ul>
        <hr><p><strong>Total: $${total}</strong></p>
    `;
    document.getElementById('modal-revision').classList.remove('hidden');
}

function cerrarModal() { document.getElementById('modal-revision').classList.add('hidden'); }

function enviarWhatsApp() {
    const nombre = document.getElementById('nombre').value;
    const direccion = document.getElementById('direccion').value;
    const telefono = document.getElementById('telefono').value;
    const notas = document.getElementById('notas').value;
    const total = document.getElementById('precio-total').innerText;

    let mensaje = `🛒 *NUEVO PEDIDO - ZENIT*\n\n👤 *Cliente:* ${nombre}\n📞 *Tel:* ${telefono}\n📍 *Entrega:* ${direccion}\n`;
    if (notas) mensaje += `📝 *Notas:* ${notas}\n`;
    mensaje += `\n--------------------------\n`;
    carrito.forEach(i => { mensaje += `• ${i.cantidad}x ${i.nombre} ($${(i.precio * i.cantidad).toLocaleString('es-AR')})\n`; });
    mensaje += `--------------------------\n💰 *TOTAL: $${total}*`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

document.addEventListener('DOMContentLoaded', cargarProductos);