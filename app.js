// =========================
// CONFIGURACIÓN
// =========================

// Pon aquí la ruta de tu CSV.
// Si lo tienes en la raíz del repo con este nombre:
const CSV_URL = "inventario.csv";

// Máximo de filas que se pintan en la tabla cuando el límite está activo
const MAX_ROWS_RENDER = 1000;

// Datos en memoria
let rawData = []; // todos los registros
let filteredData = []; // registros filtrados (último resultado de filtros)

let sortConfig = {
  key: null,
  direction: "asc", // "asc" o "desc"
};

const state = {
  search: "",
  filtroCobertura: "all", // all | critico | medio | alto
  onlyCriticalDays: false, // Cobertura Días (30) <= 30
  onlyNoMovement: false, // Promedio Vta Mes = 0
  limitRows: true, // limitar filas pintadas
};

// =========================
// INICIALIZACIÓN
// =========================

document.addEventListener("DOMContentLoaded", () => {
  // Cargar CSV automáticamente
  cargarCSVDesdeRepositorio();

  const fileInput = document.getElementById("fileInput");
  const searchInput = document.getElementById("searchInput");
  const coberturaSelect = document.getElementById("coberturaSelect");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");
  const onlyCriticalDays = document.getElementById("onlyCriticalDays");
  const onlyNoMovement = document.getElementById("onlyNoMovement");
  const limitRowsToggle = document.getElementById("limitRowsToggle");
  const exportCsvButton = document.getElementById("exportCsvButton");
  const headerCells = document.querySelectorAll("#dataTable thead th");

  // Guardar etiqueta original de cada encabezado (para mostrar ▲▼)
  headerCells.forEach((th) => {
    th.dataset.label = th.textContent.trim();
  });

  // Subir CSV manual (opcional)
  if (fileInput) {
    fileInput.addEventListener("change", handleFileUpload);
  }

  // Buscador con debounce para que sea más rápido
  if (searchInput) {
    const debouncedSearch = debounce((value) => {
      state.search = value.toLowerCase();
      aplicarFiltrosYRender();
    }, 250);

    searchInput.addEventListener("input", (e) => {
      debouncedSearch(e.target.value || "");
    });
  }

  if (coberturaSelect) {
    coberturaSelect.addEventListener("change", (e) => {
      state.filtroCobertura = e.target.value;
      aplicarFiltrosYRender();
    });
  }

  if (onlyCriticalDays) {
    onlyCriticalDays.addEventListener("change", (e) => {
      state.onlyCriticalDays = e.target.checked;
      aplicarFiltrosYRender();
    });
  }

  if (onlyNoMovement) {
    onlyNoMovement.addEventListener("change", (e) => {
      state.onlyNoMovement = e.target.checked;
      aplicarFiltrosYRender();
    });
  }

  if (limitRowsToggle) {
    limitRowsToggle.addEventListener("change", (e) => {
      state.limitRows = e.target.checked;
      // Solo re-renderizamos tabla, los datos filtrados ya están calculados
      renderTable(filteredData);
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      state.search = "";
      state.filtroCobertura = "all";
      state.onlyCriticalDays = false;
      state.onlyNoMovement = false;

      if (coberturaSelect) coberturaSelect.value = "all";
      if (onlyCriticalDays) onlyCriticalDays.checked = false;
      if (onlyNoMovement) onlyNoMovement.checked = false;

      aplicarFiltrosYRender();
    });
  }

  if (exportCsvButton) {
    exportCsvButton.addEventListener("click", exportFilteredCSV);
  }

  headerCells.forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.getAttribute("data-key");
      if (!key) return;
      sortByColumn(key, th.classList.contains("is-numeric"), th);
    });
  });
});

// =========================
// DEBOUNCE
// =========================

function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// =========================
// CARGA AUTOMÁTICA DESDE EL REPO
// =========================

async function cargarCSVDesdeRepositorio() {
  const statusEl = document.getElementById("fileStatus");

  try {
    if (statusEl) statusEl.textContent = `Cargando CSV (${CSV_URL})…`;

    const resp = await fetch(CSV_URL);
    if (!resp.ok) {
      throw new Error("HTTP " + resp.status + " al leer " + CSV_URL);
    }

    const text = await resp.text();

    rawData = parseCSV(text);
    filteredData = [...rawData];

    if (statusEl) {
      statusEl.textContent = `CSV cargado automáticamente (${rawData.length} filas).`;
    }

    aplicarFiltrosYRender(true);
  } catch (err) {
    console.error("Error al cargar CSV desde el repositorio:", err);
    if (statusEl) {
      statusEl.textContent =
        "Error al cargar el CSV desde GitHub. Verifica la ruta en CSV_URL y que el archivo exista.";
    }
  }
}

// =========================
// SUBIR CSV MANUAL (OPCIONAL)
// =========================

function handleFileUpload(ev) {
  const file = ev.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;

    rawData = parseCSV(text);
    filteredData = [...rawData];

    const statusEl = document.getElementById("fileStatus");
    if (statusEl) {
      statusEl.textContent = `Archivo cargado manualmente (${rawData.length} filas).`;
    }

    aplicarFiltrosYRender(true);
  };

  reader.readAsText(file, "UTF-8");
}

// =========================
// PARSE CSV
// =========================

function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length <= 1) return [];

  const firstLine = lines[0];
  const delimiter =
    firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";

  const headers = firstLine.split(delimiter).map((h) => h.trim().toLowerCase());

  const idx = {
    codigo: headers.indexOf("codigo"),
    clave: headers.indexOf("clave"),
    desc_prod: headers.indexOf("desc_prod"),
    inv: headers.indexOf("inv"),
    clasificacion: headers.indexOf("clasificacion"),
    promedio_vta_mes: headers.indexOf("promedio vta mes"),
    cobertura_mes: headers.indexOf("cobertura (mes)"),
    cobertura_dias_30: headers.indexOf("cobertura dias (30)"),
  };

  return lines.slice(1).reduce((acc, line) => {
    if (!line.trim()) return acc;

    const cols = line.split(delimiter);

    const record = {
      codigo: getCell(cols, idx.codigo),
      clave: getCell(cols, idx.clave),
      desc_prod: getCell(cols, idx.desc_prod),
      inv: parseNumber(getCell(cols, idx.inv)),
      clasificacion: getCell(cols, idx.clasificacion),
      promedio_vta_mes: parseNumber(getCell(cols, idx.promedio_vta_mes)),
      cobertura_mes: parseNumber(getCell(cols, idx.cobertura_mes)),
      cobertura_dias_30: parseNumber(getCell(cols, idx.cobertura_dias_30)),
    };

    // Índice de búsqueda (para no recalcular toLowerCase en cada filtro)
    record._search = (
      (record.codigo || "") +
      " " +
      (record.clave || "") +
      " " +
      (record.desc_prod || "")
    )
      .toString()
      .toLowerCase();

    acc.push(record);
    return acc;
  }, []);
}

function getCell(cols, index) {
  if (index === -1 || index == null) return "";
  return (cols[index] || "").trim();
}

function parseNumber(v) {
  if (!v) return 0;
  const normalized = v.replace(/,/g, "");
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
}

// =========================
// FILTROS
// =========================

function aplicarFiltrosYRender(resetSort = false) {
  if (!rawData.length) {
    renderTable([]);
    renderKPIs([]);
    return;
  }

  let data = [...rawData];

  // Búsqueda
  if (state.search) {
    const term = state.search;
    data = data.filter((row) => row._search && row._search.includes(term));
  }

  // Filtro por cobertura (Mes)
  if (state.filtroCobertura !== "all") {
    data = data.filter((row) => {
      const c = row.cobertura_mes;
      if (state.filtroCobertura === "critico") return c >= 0 && c <= 1;
      if (state.filtroCobertura === "medio") return c > 1 && c <= 3;
      if (state.filtroCobertura === "alto") return c > 3;
      return true;
    });
  }

  // Solo cobertura <= 30 días
  if (state.onlyCriticalDays) {
    data = data.filter((row) => (row.cobertura_dias_30 || 0) <= 30);
  }

  // Solo sin movimiento (Promedio Vta Mes = 0)
  if (state.onlyNoMovement) {
    data = data.filter((row) => (row.promedio_vta_mes || 0) === 0);
  }

  filteredData = data;

  if (resetSort) {
    sortConfig.key = null;
    sortConfig.direction = "asc";
  }

  if (sortConfig.key) {
    data = sortData([...data], sortConfig.key);
  }

  renderKPIs(data);
  renderTable(data);
}

// =========================
// ORDENAR TABLA
// =========================

function sortByColumn(key, isNumericOverride, clickedTh) {
  if (!key) return;

  if (sortConfig.key === key) {
    sortConfig.direction = sortConfig.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.key = key;
    sortConfig.direction = "asc";
  }

  const data = sortData([...filteredData], key, isNumericOverride);

  // Actualizar flechitas en encabezados
  const headerCells = document.querySelectorAll("#dataTable thead th");
  headerCells.forEach((th) => {
    const baseLabel = th.dataset.label || th.textContent.trim();
    th.textContent = baseLabel;
  });

  if (clickedTh) {
    const baseLabel = clickedTh.dataset.label || clickedTh.textContent.trim();
    const arrow = sortConfig.direction === "asc" ? " ▲" : " ▼";
    clickedTh.textContent = baseLabel + arrow;
  }

  renderTable(data);
}

function sortData(data, key, isNumericOverride = false) {
  const dir = sortConfig.direction === "asc" ? 1 : -1;

  return data.sort((a, b) => {
    const va = a[key];
    const vb = b[key];

    const isNumeric =
      isNumericOverride || typeof va === "number" || typeof vb === "number";

    if (isNumeric) {
      return (va - vb) * dir;
    }
    return String(va).localeCompare(String(vb)) * dir;
  });
}

// =========================
// KPIs
// =========================

function renderKPIs(data) {
  const total = rawData.length;
  const filtrados = data.length;

  const kpiProductos = document.getElementById("kpiProductos");
  const kpiInventario = document.getElementById("kpiInventario");
  const kpiPromedioVenta = document.getElementById("kpiPromedioVenta");
  const kpiCobertura = document.getElementById("kpiCobertura");
  const kpiCriticos30 = document.getElementById("kpiCriticos30");
  const kpiMayor3Meses = document.getElementById("kpiMayor3Meses");
  const kpiPctCriticos = document.getElementById("kpiPctCriticos");

  if (!data.length) {
    if (kpiProductos) kpiProductos.textContent = `0 / ${total}`;
    if (kpiInventario) kpiInventario.textContent = "0";
    if (kpiPromedioVenta) kpiPromedioVenta.textContent = "0";
    if (kpiCobertura) kpiCobertura.textContent = "0";
    if (kpiCriticos30) kpiCriticos30.textContent = "0";
    if (kpiMayor3Meses) kpiMayor3Meses.textContent = "0";
    if (kpiPctCriticos) kpiPctCriticos.textContent = "0%";
    return;
  }

  const invTotal = data.reduce((acc, r) => acc + (r.inv || 0), 0);
  const promVenta = data.reduce(
    (acc, r) => acc + (r.promedio_vta_mes || 0),
    0
  );
  const promCobertura =
    data.reduce((acc, r) => acc + (r.cobertura_dias_30 || 0), 0) /
    data.length;

  const productosCriticos30 = data.filter(
    (r) => (r.cobertura_dias_30 || 0) <= 30
  ).length;

  // SKUs con inventario > 3 meses (cobertura_mes > 3)
  const skusMayor3Meses = data.filter(
    (r) => (r.cobertura_mes || 0) > 3
  ).length;

  const invCriticos30 = data.reduce((acc, r) => {
    if ((r.cobertura_dias_30 || 0) <= 30) {
      return acc + (r.inv || 0);
    }
    return acc;
  }, 0);

  const invTotalData = data.reduce((acc, r) => acc + (r.inv || 0), 0);
  const pctCriticosInv =
    invTotalData > 0 ? (invCriticos30 / invTotalData) * 100 : 0;

  if (kpiProductos) {
    kpiProductos.textContent = `${filtrados.toLocaleString()} / ${total.toLocaleString()}`;
  }

  if (kpiInventario) {
    kpiInventario.textContent = invTotal.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }

  if (kpiPromedioVenta) {
    kpiPromedioVenta.textContent = promVenta.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }

  if (kpiCobertura) {
    kpiCobertura.textContent = promCobertura.toLocaleString(undefined, {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  }

  if (kpiCriticos30) {
    kpiCriticos30.textContent =
      productosCriticos30.toLocaleString(undefined, {
        maximumFractionDigits: 0,
      });
  }

  if (kpiMayor3Meses) {
    kpiMayor3Meses.textContent = skusMayor3Meses.toLocaleString(undefined, {
      maximumFractionDigits: 0,
    });
  }

  if (kpiPctCriticos) {
    kpiPctCriticos.textContent = `${pctCriticosInv.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })}%`;
  }
}

// =========================
// TABLA
// =========================

function renderTable(data) {
  const tbody = document.querySelector("#dataTable tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  const rowsInfo = document.getElementById("rowsInfo");
  const totalRows = data.length;

  let rowsToRender = data;
  if (state.limitRows && data.length > MAX_ROWS_RENDER) {
    rowsToRender = data.slice(0, MAX_ROWS_RENDER);
  }

  if (rowsInfo) {
    if (state.limitRows && totalRows > MAX_ROWS_RENDER) {
      rowsInfo.textContent = `${rowsToRender.length.toLocaleString()} de ${totalRows.toLocaleString()} registros (limitado para mejor rendimiento)`;
    } else {
      rowsInfo.textContent = `${totalRows.toLocaleString()} registros`;
    }
  }

  if (!rowsToRender.length) return;

  const fragment = document.createDocumentFragment();

  rowsToRender.forEach((row) => {
    const tr = document.createElement("tr");

    const tdCodigo = document.createElement("td");
    tdCodigo.textContent = row.codigo;
    tr.appendChild(tdCodigo);

    const tdClave = document.createElement("td");
    tdClave.textContent = row.clave;
    tr.appendChild(tdClave);

    const tdDesc = document.createElement("td");
    tdDesc.textContent = row.desc_prod;
    tr.appendChild(tdDesc);

    const tdInv = document.createElement("td");
    tdInv.classList.add("is-numeric");
    tdInv.textContent = formatNumber(row.inv);
    tr.appendChild(tdInv);

    const tdClasif = document.createElement("td");
    const badge = document.createElement("span");
    const c = row.clasificacion || "Sin";
    badge.className = `badge-clasif ${c}`;
    badge.textContent = c;
    tdClasif.appendChild(badge);
    tr.appendChild(tdClasif);

    const tdProm = document.createElement("td");
    tdProm.classList.add("is-numeric");
    tdProm.textContent = formatNumber(row.promedio_vta_mes);
    tr.appendChild(tdProm);

    const tdCobMes = document.createElement("td");
    tdCobMes.classList.add("is-numeric");
    tdCobMes.textContent = formatNumber(row.cobertura_mes, 1);
    tr.appendChild(tdCobMes);

    const tdCobDias = document.createElement("td");
    tdCobDias.classList.add("is-numeric");
    tdCobDias.textContent = formatNumber(row.cobertura_dias_30);

    const d = row.cobertura_dias_30;
    if (d <= 30) tdCobDias.classList.add("heat-low");
    else if (d > 30 && d <= 90) tdCobDias.classList.add("heat-mid");
    else if (d > 90) tdCobDias.classList.add("heat-high");

    tr.appendChild(tdCobDias);

    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

function formatNumber(n, decimals = 0) {
  if (typeof n !== "number") return "";
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// =========================
// EXPORTAR CSV FILTRADO
// =========================

function exportFilteredCSV() {
  if (!filteredData.length) {
    alert("No hay datos filtrados para exportar.");
    return;
  }

  const headers = [
    "Codigo",
    "Clave",
    "Descripcion",
    "Inv",
    "Clasificacion",
    "Promedio Vta Mes",
    "Cobertura (Mes)",
    "Cobertura Dias (30)",
  ];

  const rows = filteredData.map((r) => [
    r.codigo ?? "",
    r.clave ?? "",
    (r.desc_prod ?? "").replace(/"/g, '""'),
    r.inv ?? "",
    r.clasificacion ?? "",
    r.promedio_vta_mes ?? "",
    r.cobertura_mes ?? "",
    r.cobertura_dias_30 ?? "",
  ]);

  const csvLines = [headers.join(",")].concat(
    rows.map((row) =>
      row
        .map((val) => {
          const s = String(val);
          if (s.includes(",") || s.includes('"')) {
            return `"${s.replace(/"/g, '""')}"`;
          }
          return s;
        })
        .join(",")
    )
  );

  const blob = new Blob([csvLines.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inventario_filtrado.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
