const PHONE = "50765905100";
let seleccion = JSON.parse(localStorage.getItem("seleccion")) || [];
let productoActual = null;

/* ================= INICIALIZAR ================= */
document.addEventListener("DOMContentLoaded", () => {
  restaurarSeleccion();
  actualizarContador();
  actualizarBotonWA();
  cerrarModal(); // Asegurar que el modal está cerrado al inicio
});

/* ================= ABRIR MODAL ================= */
function abrirModal(img){
  const card = img.closest(".card");
  const nombre = card.dataset.nombre;
  const descripcion = card.dataset.descripcion || "Producto de alta calidad.";
  const agotado = card.classList.contains("agotado");
  productoActual = nombre;

  document.getElementById("modalImg").src = img.src;
  document.getElementById("modalNombre").textContent = nombre;
  document.getElementById("modalDesc").textContent = descripcion;
  // Mostrar precio si existe en el dataset (data-precio)
  const precioElem = document.getElementById("modalPrecio");
  const precio = card.dataset.precio || card.dataset.price || null;
  if(precio){
    precioElem.style.display = "block";
    precioElem.textContent = precio;
  } else {
    precioElem.style.display = "none";
    precioElem.textContent = "";
  }

  // --- Carousel automático: leer imágenes y empezar interval ---
  // Limpiar interval previo si existe
  if(window.modalInterval){
    clearInterval(window.modalInterval);
    window.modalInterval = null;
  }

  // Obtener imágenes desde data-images; si no existe, usar la imagen del card como fallback
  let imgs = (card.dataset.images || '').split(',').map(s=>s.trim()).filter(Boolean);
  if(!imgs.length){
    const cardImg = card.querySelector('img');
    if(cardImg && cardImg.src){
      imgs = [cardImg.src];
    }
  }

  if(imgs.length){
    window.modalImages = imgs;
    window.modalIndex = 0;
    // mostrar la primera imagen del conjunto
    document.getElementById("modalImg").src = window.modalImages[0];
    // iniciar rotación automática solo si hay más de una imagen
    if(window.modalImages.length > 1){
      window.modalInterval = setInterval(()=>{
        window.modalIndex = (window.modalIndex + 1) % window.modalImages.length;
        document.getElementById("modalImg").src = window.modalImages[window.modalIndex];
      }, 2500);
    } else {
      // asegurar que no haya interval activo
      if(window.modalInterval){
        clearInterval(window.modalInterval);
        window.modalInterval = null;
      }
    }
  } else {
    window.modalImages = null;
    window.modalIndex = null;
  }

  const modalBtn = document.getElementById("modalBtn");
  
  if(agotado){
    modalBtn.disabled = true;
    modalBtn.style.backgroundColor = "#a0a0a0";
    modalBtn.textContent = "Producto Agotado";
  } else if(seleccion.includes(nombre)){
    modalBtn.disabled = false;
    modalBtn.classList.add("selected");
    modalBtn.style.backgroundColor = "var(--wa)";
    modalBtn.textContent = "Eliminar de consulta";
  } else {
    modalBtn.disabled = false;
    modalBtn.classList.remove("selected");
    modalBtn.style.backgroundColor = "var(--primary)";
    modalBtn.textContent = "Agregar a consulta";
  }

  document.getElementById("modalImagen").classList.add("activo");
}

/* ================= CERRAR MODAL ================= */
function cerrarModal(){
  document.getElementById("modalImagen").classList.remove("activo");
  productoActual = null;
  // limpiar rotación automática si existe
  if(window.modalInterval){
    clearInterval(window.modalInterval);
    window.modalInterval = null;
  }
}

/* Cerrar modal al hacer clic fuera de él */
document.addEventListener("click", (e) => {
  const modal = document.getElementById("modalImagen");
  if(e.target === modal){
    cerrarModal();
  }
});

/* ================= AGREGAR DESDE MODAL ================= */
function agregarDelModal(){
  if(!productoActual) return;
  
  // Obtener la card actual del producto
  const cardActual = document.querySelector(`.card[data-nombre="${productoActual}"]`);
  if(cardActual && cardActual.classList.contains("agotado")) return; // No permite si está agotado
  
  if(seleccion.includes(productoActual)){
    seleccion = seleccion.filter(p => p !== productoActual);
  } else {
    seleccion.push(productoActual);
  }

  guardarSeleccion();
  actualizarContador(true);
  actualizarBotonWA();
  
  // Actualizar estado del botón en el modal
  const modalBtn = document.getElementById("modalBtn");
  if(seleccion.includes(productoActual)){
    modalBtn.classList.add("selected");
    modalBtn.textContent = "Eliminar de consulta";
  } else {
    modalBtn.classList.remove("selected");
    modalBtn.textContent = "Agregar a consulta";
  }

  // Actualizar estado en la card
  restaurarSeleccion();
}

/* ================= SELECCIONAR PRODUCTO ================= */
function toggleProducto(btn){
  const card = btn.closest(".card");
  const nombre = card.dataset.nombre;
  const agotado = card.classList.contains("agotado");

  if(agotado) return; // No permite agregar si está agotado

  if(seleccion.includes(nombre)){
    seleccion = seleccion.filter(p => p !== nombre);
    btn.classList.remove("selected");
    btn.textContent = "Consultar";
  } else {
    seleccion.push(nombre);
    btn.classList.add("selected");
    btn.textContent = "Seleccionado";
  }

  guardarSeleccion();
  actualizarContador(true);
  actualizarBotonWA();
}

/* ================= GUARDAR SELECCIÓN ================= */
function guardarSeleccion(){
  localStorage.setItem("seleccion", JSON.stringify(seleccion));
}

/* ================= RESTAURAR SELECCIÓN ================= */
function restaurarSeleccion(){
  document.querySelectorAll(".card").forEach(card => {
    const nombre = card.dataset.nombre;
    const btn = card.querySelector("button");
    const agotado = card.classList.contains("agotado");

    if(agotado){
      btn.disabled = true;
      btn.classList.remove("selected");
      btn.textContent = "Agotado";
      btn.style.backgroundColor = "#a0a0a0";
    } else if(seleccion.includes(nombre)){
      btn.disabled = false;
      btn.classList.add("selected");
      btn.textContent = "Seleccionado";
      btn.style.backgroundColor = "";
    } else {
      btn.disabled = false;
      btn.classList.remove("selected");
      btn.textContent = "Consultar";
      btn.style.backgroundColor = "";
    }
  });
}

/* ================= CONTADOR ================= */
function actualizarContador(animar=false){
  const count = document.getElementById("count");
  count.textContent = seleccion.length;

  if(animar){
    count.style.transform = "scale(1.3)";
    setTimeout(()=> count.style.transform = "scale(1)", 200);
  }
}

/* ================= BOTÓN WHATSAPP ================= */
function actualizarBotonWA(){
  const btn = document.querySelector(".float-wa");

  if(seleccion.length === 0){
    btn.style.backgroundColor = "gray";
    btn.style.pointerEvents = "none";
  } else {
    btn.style.backgroundColor = "var(--wa";
    btn.style.pointerEvents = "auto";
  }
}

function enviarWA(){
  if(!seleccion.length) return;

  let msg = "Hola Home Style 507, deseo consultar:\n\n";
  seleccion.forEach((p,i)=>{
    msg += `${i+1}. ${p}\n`;
  });

  window.open(
    `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
}

/* ================= BUSCADOR ================= */
function filtrar(){
  const q = document.getElementById("search").value.toLowerCase();

  document.querySelectorAll(".card").forEach(card=>{
    const nombre = card.dataset.nombre.toLowerCase();
    const categoria = card.closest(".categoria").dataset.categoria.toLowerCase();

    const visible = nombre.includes(q) || categoria.includes(q);
    card.style.display = visible ? "" : "none";
  });
}

/* ================= FILTRO POR CATEGORÍA ================= */
function filtrarCategoria(cat, btn){
  document.getElementById("search").value = "";

  document.querySelectorAll("nav button").forEach(b=>{
    b.classList.remove("active");
  });
  btn.classList.add("active");

  document.querySelectorAll(".categoria").forEach(sec=>{
    sec.style.display =
      cat === "Todos" || sec.dataset.categoria === cat
      ? ""
      : "none";
  });

  // Scroll suave a la categoría
  const target = document.querySelector(
    cat === "Todos" ? ".categoria" : `.categoria[data-categoria="${cat}"]`
  );

  if(target){
    target.scrollIntoView({ behavior:"smooth", block:"start" });
  }
}