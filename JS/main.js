const { jsPDF } = window.jspdf;
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

function inicializarInventario() {
    if (!localStorage.getItem('inventario')) {
        const inventarioInicial = [
            {id: 1, nombre: "Martillo", precio: 15000, stock: 10, imagen: "img/martillo.jpg"},
            {id: 2, nombre: "Destornillador", precio: 8000, stock: 15, imagen: "img/destornillador.jpg"},
            {id: 3, nombre: "Taladro", precio: 120000, stock: 5, imagen: "img/taladro.jpg"},
            {id: 4, nombre: "Ventilador", precio: 123, stock: 9, imagen: "img/ventilador.jpg"},
            {id: 5, nombre: "Tubo de acero", precio: 986, stock: 82, imagen: "img/tubo-acero.jpg"},
            {id: 6, nombre: "Guantes", precio: 200, stock: 78, imagen: "img/guantes.jpg"},
            {id: 7, nombre: "Cascos", precio: 9600, stock: 50, imagen: "img/casco.jpg"},
            {id: 8, nombre: "Alicates", precio: 100, stock: 45, imagen: "img/alicates.jpg"},
            {id: 9, nombre: "Varillas", precio: 600, stock: 73, imagen: "img/varillas.jpg"},
            {id: 10, nombre: "Tornillos c/u", precio: 0.50, stock: 5000, imagen: "img/tornillos.jpg"}
        ];
        localStorage.setItem('inventario', JSON.stringify(inventarioInicial));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarInventario();
    cargarCatalogo();
    inicializarEventos();
    actualizarCarrito();
});

document.addEventListener('DOMContentLoaded', () => {
    cargarCatalogo();
    inicializarEventos();
    actualizarCarrito();
});

function cargarCatalogo() {
    const productos = JSON.parse(localStorage.getItem('inventario')) || [];
    const catalogo = document.getElementById('catalogo');

    catalogo.innerHTML = productos.map(producto => `
        <div class="producto" data-id="${producto.id}">
            <img src="${producto.imagen || 'img/producto-default.jpg'}" 
                 alt="${producto.nombre}" 
                 class="producto-imagen"
                 onerror="this.src='img/producto-default.jpg'">
            <h3>${producto.nombre}</h3>
            <p>$${producto.precio.toLocaleString('es-CO')}</p>
            <p>Stock: ${producto.stock}</p>
            <button class="agregar-carrito">Agregar al Carrito</button>
        </div>
    `).join('');
}

function inicializarEventos() {
    document.querySelector('.carrito-icono').addEventListener('click', () => {
        document.getElementById('modal-carrito').style.display = 'flex';
    });

    document.getElementById('cerrar-modal').addEventListener('click', () => {
        document.getElementById('modal-carrito').style.display = 'none';
    });

    document.getElementById('pagar').addEventListener('click', () => {
        if (carrito.length === 0) {
            alert("El carrito está vacío");
            return;
        }
        document.getElementById('modal-carrito').style.display = 'none';
        document.getElementById('modal-pago').style.display = 'flex';
    });

    document.getElementById('catalogo').addEventListener('click', (e) => {
        if (e.target.classList.contains('agregar-carrito')) {
            agregarAlCarrito(e);
        }
    });

    document.getElementById('lista-carrito').addEventListener('click', (e) => {
        if (e.target.classList.contains('eliminar-item')) {
            eliminarDelCarrito(e);
        }
    });

    document.getElementById('formulario-pago').addEventListener('submit', procesarPago);
}

function agregarAlCarrito(e) {
    const productoDiv = e.target.closest('.producto');
    const productos = JSON.parse(localStorage.getItem('inventario')) || [];
    const productoId = productoDiv.dataset.id;
    const producto = productos.find(p => p.id == productoId);

    if (!producto) {
        alert("Producto no encontrado");
        return;
    }

    if (producto.stock <= 0) {
        alert('¡Producto agotado!');
        return;
    }

    const existeEnCarrito = carrito.some(item => item.id == producto.id);
    if (existeEnCarrito) {
        alert("Este producto ya está en tu carrito");
        return;
    }

    carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        stock: producto.stock,
        imagen: producto.imagen
    });

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
    alert("Producto agregado al carrito");
}

function actualizarCarrito() {
    const listaCarrito = document.getElementById('lista-carrito');
    const totalCarrito = document.getElementById('total-carrito');
    const contadorCarrito = document.getElementById('contador-carrito');

    listaCarrito.innerHTML = carrito.map(item => `
        <li>
            ${item.nombre} - $${item.precio.toLocaleString('es-CO')}
            <button class="eliminar-item" data-id="${item.id}">🗑️</button>
        </li>
    `).join('');

    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    totalCarrito.textContent = total.toLocaleString('es-CO');
    contadorCarrito.textContent = carrito.length;
}

function eliminarDelCarrito(e) {
    const id = e.target.dataset.id;
    carrito = carrito.filter(item => item.id != id);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
}

function procesarPago(e) {
    e.preventDefault();

    const tarjeta = document.querySelector('#formulario-pago input[type="text"]:nth-child(2)').value;
    if (tarjeta.length !== 16) {
        alert("Número de tarjeta inválido");
        return;
    }

    const doc = new jsPDF();
    const numFactura = 'FAC-' + Date.now().toString().slice(-6);
    const fecha = new Date().toLocaleDateString('es-CO');
    
    doc.setFontSize(18);
    doc.text(`FACTURA #${numFactura}`, 105, 20, null, null, 'center');
    doc.setFontSize(12);
    doc.text(`FerreMax - ${fecha}`, 105, 30, null, null, 'center');
    
    doc.setFontSize(14);
    doc.text("Detalle de la compra:", 14, 45);
    
    let yPos = 55;
    doc.setFontSize(12);
    carrito.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.nombre}`, 20, yPos);
        doc.text(`$${item.precio.toLocaleString('es-CO')}`, 180, yPos, null, null, 'right');
        yPos += 10;
    });
    
    doc.setFontSize(14);
    doc.line(20, yPos + 5, 190, yPos + 5);
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    doc.text("Total:", 20, yPos + 15);
    doc.text(`$${total.toLocaleString('es-CO')}`, 180, yPos + 15, null, null, 'right');
    
    doc.save(`factura_${numFactura}.pdf`);

    const venta = {
        id: Date.now(),
        numFactura,
        fecha,
        productos: [...carrito],
        total: total
    };
    
    let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
    ventas.push(venta);
    localStorage.setItem('ventas', JSON.stringify(ventas));

    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();
    
    alert(`¡Compra exitosa!\nFactura #${numFactura} generada`);
    document.getElementById('modal-pago').style.display = 'none';
    document.getElementById('formulario-pago').reset();
}