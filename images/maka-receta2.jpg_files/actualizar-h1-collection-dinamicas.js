document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname === "/collections/premios-y-accesorios/perros") {
      const h1 = document.querySelector("h1");
      if (h1) h1.textContent = "Accesorios y premios para perros";
    }
    if (window.location.pathname === "/collections/todos-los-productos/perros") {
      const h1 = document.querySelector("h1");
      if (h1) h1.textContent = "Productos para perros";
    }
  });
  