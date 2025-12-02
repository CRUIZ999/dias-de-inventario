// Cargar CSV automáticamente desde GitHub RAW
const CSV_URL = "https://raw.githubusercontent.com/CRUIZ999/dias-de-inventario/main/D%C3%ADas%20de%20Inventario.csv";

document.addEventListener("DOMContentLoaded", () => {
  cargarCSV();

  const searchInput = document.getElementById("searchInput");
  const coberturaSelect = document.getElementById("coberturaSelect");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const headerCells = document.querySelectorAll("#dataTable thead th");

  searchInput.addEventListener("input", (e) => {
    state.search = e.target.value.toLowerCase();
    aplicarFiltrosYRender();
  });

  coberturaSelect.addEventListener("change", (e) => {
    state.filtroCobertura = e.target.value;
    aplicarFiltrosYRender();
  });

  clearFiltersBtn.addEventListener("click", () => {
    document.getElementById("searchInput").value = "";
    state.search = "";
    state.clasifActivas.clear();
    state.filtroCobertura = "all";
    document.getElementById("coberturaSelect").value = "all";
    sincronizarChipsUI();
    aplicarFiltrosYRender();
  });

  headerCells.forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.getAttribute("data-key");
      sortByColumn(key, th.classList.contains("is-numeric"));
    });
  });
});

// DESCARGA AUTOMÁTICA DEL CSV
async function cargarCSV() {
  try {
    const response = await fetch(CSV_URL);
    const text = await response.text();

    rawData = parseCSV(text);
    filteredData = [...rawData];

    document.getElementById("fileStatus").textContent =
      `CSV cargado automáticamente (${rawData.length} filas).`;

    construirChipsClasificacion(rawData);
    aplicarFiltrosYRender(true);
  } catch (error) {
    document.getElementById("fileStatus").textContent =
      "Error al cargar el CSV desde GitHub.";
    console.error("Error cargando CSV:", error);
  }
}
