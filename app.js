const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRrz0jwtU-gpFJWblZ-6i8wPGhZFgucHFct6rMvEVi45iKbQTEUKAccXAOLb9KfQmu4G7cDE-8Ob95c/pub?output=csv";
const WHATSAPP_NUMBER = "5491150279546"; 

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
                renderizarCatalogo(productos);
                actualizarCarritoUI();
            }
        });
    } catch (error) {
        console.error("Error cargando productos:", error);
        document.getElementById('catalogo').innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Error al cargar el catálogo.</p>";
    }
}

function filtrarProductos() {
    const termino = document.getElementById('input-busqueda').value.toLowerCase();
    const productosFiltrados = productos.filter(prod => {
        const nombre = (prod.Producto || "").toLowerCase();
        const desc = (prod.DESCRIPCIÓN || prod.Descripcion || "").toLowerCase();
        const cat = (prod.Categoria || "").toLowerCase();
        return nombre.includes(termino) || desc.includes(termino) || cat.includes(termino);
    });
    renderizarCatalogo(productosFiltrados);
}

function renderizarCatalogo(listaDeProductos) {
    const catalogo = document.getElementById('catalogo');
    if (!catalogo) return;
    catalogo.innerHTML = "";

    if (listaDeProductos.length === 0) {
        catalogo.innerHTML = "<p style='grid-column: 1/-1; text-align:center; padding: 40px; color: #86868b;'>No encontramos lo que buscas.</p>";
        return;
    }

    listaDeProductos.forEach(prod => {
        const nombre = prod.Producto || "Producto Zénit";
        const precio = prod.PrecioVenta || 0;
        let desc = prod.DESCRIPCIÓN || prod.Descripcion || "";
        if (desc.length > 55) desc = desc.substring(0, 52) + "...";
        
        const img = prod.Imagen || 'https://via.placeholder.com/300?text=Zenit';
        const id = prod.ID || "id-" + Math.random();

        catalogo.innerHTML += `
            <div class="card">
                <div class="card-img-container">
                    <img src="${img}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/300?text=Zenit'">
                </div>
                <h3>${nombre}</h3>
                <p class="descripcion">${desc}</p>
                <p class="precio">$${Number(precio).toLocaleString('es-AR')}</p>
                <button class="btn-add" onclick="agregarAlCarrito('${id}')">Agregar al pedido</button>
            </div>
        `;
    });
}

function agregarAlCarrito(id) {
    const prod = productos.find(p => p.ID == id);
    if (!prod) return;

    const itemExistente = carrito.find(item => item.ID == id);
    if (itemExistente) {
        itemExistente.cantidad++;
    } else {
        carrito.push({
            ID: prod.ID,
            nombre: prod.Producto,
            precio: prod.PrecioVenta,
            cantidad: 1,
            imagen: prod.Imagen || 'https://via.placeholder.com/150?text=Zenit'
        });
    }

    mostrarToast(`Añadido: ${prod.Producto}`);
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
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 500);
    }, 2500);
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
                    <span class="item-nombre">${item.nombre}</span>
                    <span class="item-precio">$${item.precio.toLocaleString('es-AR')}</span>
                </div>
                <div class="item-controles">
                    <button onclick="modificarCantidad(${index}, -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="modificarCantidad(${index}, 1)">+</button>
                    <button onclick="eliminarDelCarrito(${index})" class="btn-eliminar-item">✕</button>
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
    if (carrito.length === 0) return mostrarToast("El carrito está vacío");
    const form = document.getElementById('form-datos');
    if (!form.checkValidity()) { form.reportValidity(); return; }

    const resumen = document.getElementById('resumen-pedido');
    const total = document.getElementById('precio-total').innerText;
    
    resumen.innerHTML = `
        <div class="resumen-lista">
            ${carrito.map(i => `
                <div class="resumen-row">
                    <span>${i.cantidad}x ${i.nombre}</span>
                    <span>$${(i.precio * i.cantidad).toLocaleString('es-AR')}</span>
                </div>
            `).join('')}
            <div class="resumen-total">Total: $${total}</div>
        </div>
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

    let mensaje = `🛒 *PEDIDO ZÉNIT*\n\n👤 *Cliente:* ${nombre}\n📞 *Tel:* ${telefono}\n📍 *Entrega:* ${direccion}\n`;
    if (notas) mensaje += `📝 *Notas:* ${notas}\n`;
    mensaje += `\n*PRODUCTOS:*\n`;
    carrito.forEach(i => { mensaje += `• ${i.cantidad}x ${i.nombre} ($${(i.precio * i.cantidad).toLocaleString('es-AR')})\n`; });
    mensaje += `\n💰 *TOTAL: $${total}*`;

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`, '_blank');
}

function descargarPDFPrecios() {
    if (productos.length === 0) return;
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("ZÉNIT - LISTA DE PRECIOS", 14, 22);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Generado el: ${new Date().toLocaleDateString('es-AR')}`, 14, 30);

    const datosTabla = productos
        .filter(p => p.Producto && p.PrecioVenta)
        .map(p => [p.Producto, p.DESCRIPCIÓN || "-", `$${Number(p.PrecioVenta).toLocaleString('es-AR')}`]);

    doc.autoTable({
        startY: 35,
        head: [['Producto', 'Descripción', 'Precio']],
        body: datosTabla,
        theme: 'striped',
        headStyles: { fillColor: [29, 29, 31] },
        styles: { fontSize: 9 }
    });

    doc.save("Zénit_Precios.pdf");
}

document.addEventListener('DOMContentLoaded', cargarProductos);