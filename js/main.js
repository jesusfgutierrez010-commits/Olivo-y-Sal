/* ========== Olivo & Sal · JavaScript ========== */

/* ---------- 1. Modo noche / día (se recuerda) ---------- */
const themeBtn = document.getElementById("themeBtn");
function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  if (themeBtn) {
    themeBtn.textContent = t === "dark" ? "Modo día" : "Modo noche";
    themeBtn.setAttribute("aria-pressed", t === "dark");
  }
}
let saved = "light";
try { saved = localStorage.getItem("olivo-theme") || "light"; } catch (e) {}
applyTheme(saved);
if (themeBtn) themeBtn.addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  applyTheme(next);
  try { localStorage.setItem("olivo-theme", next); } catch (e) {}
});

/* ---------- 2. Menú móvil ---------- */
const menuBtn = document.getElementById("menuBtn");
const nav = document.getElementById("nav");
if (menuBtn && nav) menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
});

/* ---------- 3. Carta con pestañas por categoría ---------- */
const cartaBox = document.getElementById("carta");
if (cartaBox) {
  const V = "Vegetariano", SG = "Sin gluten";
  const platos = {
    "Entradas": [
      ["Hummus de garbanzo y limón confitado", "Con pan de pita tostado y aceite de oliva.", 8, [V, SG]],
      ["Pulpo a la brasa", "Sobre papas aplastadas y pimentón ahumado.", 14, [SG]],
      ["Tomate, burrata y albahaca", "Tomates de huerta, burrata fresca y vinagre de higo.", 11, [V, SG]],
      ["Croquetas de bacalao", "Seis piezas con alioli suave de ajo asado.", 9, []]
    ],
    "Principales": [
      ["Arroz meloso de mariscos", "Gambas, mejillones y calamar en caldo de pescado.", 22, [SG]],
      ["Pescado del día a la sal", "Para dos, con verduras asadas y salsa de limón.", 24, [SG]],
      ["Cordero lento con romero", "Cocinado 6 horas, con puré de coliflor.", 26, [SG]],
      ["Berenjenas rellenas", "Quinoa, feta, menta y granada.", 17, [V]]
    ],
    "Postres": [
      ["Tarta de limón y merengue", "Base de galleta de almendra y merengue quemado.", 7, [V]],
      ["Yogur griego con miel e higos", "Higos asados y nueces tostadas.", 6, [V, SG]],
      ["Helado de aceite de oliva", "Con escamas de sal y pan crujiente.", 6, [V]]
    ],
    "Bebidas": [
      ["Limonada de albahaca", "Hecha al momento, con hielo picado.", 4, [V, SG]],
      ["Vino blanco de la casa", "Copa de uva albariño, fresco y seco.", 6, [V, SG]],
      ["Sangría de la casa", "Jarra para compartir, con fruta de temporada.", 18, [V, SG]],
      ["Café espresso", "Tostado local de especialidad.", 2.5, [V, SG]]
    ]
  };
  const tabsBox = document.getElementById("tabs");
  const cats = Object.keys(platos);
  tabsBox.innerHTML = cats.map((c, i) =>
    `<button type="button" role="tab" id="tab-${i}" aria-selected="${i === 0}" aria-controls="carta" data-c="${c}">${c}</button>`).join("");
  function show(cat) {
    tabsBox.querySelectorAll("button").forEach(b => b.setAttribute("aria-selected", b.dataset.c === cat));
    cartaBox.innerHTML = platos[cat].map(([n, d, p, tags], i) => `
      <li style="animation-delay:${i * 70}ms">
        <div class="row"><b>${n}</b><span class="p">$${p % 1 ? p.toFixed(2) : p}</span></div>
        <p>${d}</p>
        ${tags.map(t => `<span class="pill ${t === V ? "v" : ""}">${t}</span>`).join("")}
      </li>`).join("");
  }
  tabsBox.addEventListener("click", e => { if (e.target.dataset.c) show(e.target.dataset.c); });
  show(cats[0]);
}

/* ---------- 4. Cotizador de menú para grupos ---------- */
const calc = document.getElementById("calc");
if (calc) {
  const precios = { almuerzo: 22, degustacion: 48, celebracion: 60 };
  const fmt = n => "$" + n.toLocaleString("es", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function cotizar() {
    const menu = document.getElementById("menu").value;
    const pers = Math.max(4, parseInt(document.getElementById("pers").value, 10) || 4);
    const bebidas = document.getElementById("bebidas").checked ? 12 : 0;
    const desc = pers >= 20 ? 0.1 : 0;
    const unit = (precios[menu] + bebidas) * (1 - desc);
    document.getElementById("total").textContent = fmt(unit * pers);
    document.getElementById("detalle").textContent =
      `${pers} personas a ${fmt(unit)} cada una` + (desc ? " (10% de descuento por grupo)." : ". Mínimo 4 personas; desde 20 hay 10% de descuento.");
  }
  calc.addEventListener("input", cotizar);
  cotizar();
}

/* ---------- 5. Validación del formulario de reservas ---------- */
const form = document.getElementById("contactForm");
if (form) {
  const fecha = document.getElementById("fecha");
  const hoy = new Date(); hoy.setMinutes(hoy.getMinutes() - hoy.getTimezoneOffset());
  const hoyStr = hoy.toISOString().slice(0, 10);
  fecha.min = hoyStr;
  const reglas = {
    nombre: v => v.trim().length >= 3 || "Escribe tu nombre (mínimo 3 letras).",
    email: v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || "Escribe un correo válido, por ejemplo nombre@correo.com.",
    telefono: v => /^[0-9+\s-]{7,15}$/.test(v) || "Escribe un teléfono con 7 a 15 dígitos.",
    fecha: v => {
      if (v === "") return "Elige una fecha.";
      if (v < hoyStr) return "La fecha no puede ser anterior a hoy.";
      if (new Date(v + "T00:00:00").getDay() === 1) return "Los lunes estamos cerrados. Elige otro día.";
      return true;
    },
    hora: v => v !== "" || "Elige una hora.",
    personas: v => (parseInt(v, 10) >= 1 && parseInt(v, 10) <= 10) || "Indica entre 1 y 10 personas. Para grupos mayores, escríbenos.",
    mensaje: v => v.length <= 300 || "El mensaje no puede pasar de 300 caracteres."
  };
  function validar(campo) {
    const res = reglas[campo.name](campo.value);
    const box = campo.closest(".field");
    const ok = res === true;
    box.classList.toggle("invalid", !ok);
    box.classList.toggle("valid", ok && campo.value !== "");
    box.querySelector(".err").textContent = ok ? "" : res;
    campo.setAttribute("aria-invalid", !ok);
    return ok;
  }
  const campos = [...form.querySelectorAll("[name]")];
  campos.forEach(c => {
    c.addEventListener("blur", () => validar(c));
    c.addEventListener("input", () => { if (c.closest(".field").classList.contains("invalid")) validar(c); });
    c.addEventListener("change", () => { if (c.closest(".field").classList.contains("invalid")) validar(c); });
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const todoOk = campos.map(validar).every(Boolean);
    const ok = document.getElementById("ok");
    if (todoOk) {
      ok.textContent = `¡Gracias, ${form.nombre.value.trim().split(" ")[0]}! Solicitaste mesa para ${form.personas.value} el ${form.fecha.value} a las ${form.hora.value}. Te confirmamos por correo.`;
      ok.classList.add("show");
      form.reset();
      campos.forEach(c => c.closest(".field").classList.remove("valid"));
    } else {
      ok.classList.remove("show");
      form.querySelector(".invalid input, .invalid select, .invalid textarea").focus();
    }
  });
}

/* ---------- 6. Efecto parallax (solo en el Inicio) ---------- */
/* Los elementos con data-speed se mueven a distinta velocidad que el scroll.
   Negativo = se queda atrás (parece más lejano). Positivo = se adelanta.
   data-anchor="top" mide desde el borde superior de su sección (hero). */
const pxItems = document.querySelectorAll("[data-speed]");
if (pxItems.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let ticking = false;
  function parallax() {
    const vh = window.innerHeight;
    const factor = window.innerWidth < 820 ? 0.55 : 1;
    pxItems.forEach(el => {
      const ref = el.closest("section, .band").getBoundingClientRect();
      if (ref.bottom < -300 || ref.top > vh + 300) return;
      const offset = el.dataset.anchor === "top" ? ref.top : ref.top + ref.height / 2 - vh / 2;
      el.style.translate = "0 " + (offset * parseFloat(el.dataset.speed) * factor).toFixed(1) + "px";
    });
    ticking = false;
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(parallax); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", parallax);
  parallax();
}
