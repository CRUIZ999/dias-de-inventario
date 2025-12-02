/* =========
   Layout base
   ========= */

:root {
  --bg-body: #050816;
  --bg-panel: #080f1f;
  --bg-panel-soft: #101827;
  --accent: #38bdf8;
  --accent-soft: rgba(56, 189, 248, 0.1);
  --text-main: #f9fafb;
  --text-muted: #9ca3af;
  --border-subtle: #1f2933;
  --danger: #f97373;
  --warning: #facc15;
  --success: #22c55e;
  --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: var(--font-sans);
  background: radial-gradient(circle at top, #111827 0, #020617 55%);
  color: var(--text-main);
}

body {
  display: flex;
  justify-content: center;
}

/* =========
   App shell
   ========= */

.app-shell {
  width: 100%;
  max-width: 1440px;
  min-height: 100vh;
  padding: 16px;
}

/* Topbar */

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  border-radius: 999px;
  background: linear-gradient(120deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.9));
  border: 1px solid rgba(148, 163, 184, 0.2);
  box-shadow: 0 18px 50px rgba(15, 23, 42, 0.9);
  margin-bottom: 18px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--success);
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.8);
}

.app-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.app-subtitle {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}

.topbar-right {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Botones */

.btn {
  border-radius: 999px;
  border: 1px solid transparent;
  padding: 8px 16px;
  font-size: 13px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  color: var(--text-main);
  transition: all 0.15s ease-out;
}

.btn.primary {
  background: linear-gradient(135deg, var(--accent), #0ea5e9);
  color: #0b1120;
  font-weight: 600;
}

.btn.primary:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.btn.ghost {
  border-color: rgba(148, 163, 184, 0.35);
  background: radial-gradient(circle at top left, rgba(148, 163, 184, 0.16), transparent 55%);
}

.btn.ghost:hover {
  border-color: rgba(148, 163, 184, 0.7);
  background-color: rgba(15, 23, 42, 0.9);
}

.btn.full {
  width: 100%;
}

/* =========
   Layout principal
   ========= */

.layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
}

/* Sidebar */

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Panel genérico */

.panel {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.96));
  border-radius: 18px;
  padding: 14px 16px;
  border: 1px solid rgba(31, 41, 55, 0.9);
  box-shadow: 0 12px 35px rgba(15, 23, 42, 0.85);
}

.panel-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
}

/* Form / campos */

.field {
  margin-bottom: 12px;
}

.field-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 4px;
  display: block;
}

input[type="text"],
select {
  width: 100%;
  background: #020617;
  border-radius: 999px;
  border: 1px solid rgba(31, 41, 55, 0.85);
  padding: 7px 11px;
  color: var(--text-main);
  font-size: 13px;
  outline: none;
  transition: all 0.12s ease-out;
}

input[type="text"]:focus,
select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 1px rgba(56, 189, 248, 0.4);
}

.field-checkbox {
  margin-top: 4px;
  margin-bottom: 10px;
}

.field-checkbox label {
  font-size: 13px;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 8px;
}

.field-checkbox input[type="checkbox"] {
  width: 14px;
  height: 14px;
}

.file-status {
  font-size: 12px;
  color: var(--text-muted);
}

.hint {
  font-size: 11px;
  color: var(--text-muted);
  line-height: 1.4;
}

/* =========
   Main content
   ========= */

.main {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* KPIs */

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.kpi-grid-secondary {
  margin-top: 4px;
}

.kpi-card {
  background: radial-gradient(circle at top left, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.9));
  border-radius: 20px;
  padding: 10px 12px;
  border: 1px solid rgba(31, 41, 55, 0.9);
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.9);
}

.kpi-card.kpi-small {
  border-radius: 16px;
  padding: 8px 10px;
}

.kpi-card h3 {
  margin: 0 0 4px;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
}

.kpi-value {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.kpi-caption {
  margin: 2px 0 0;
  font-size: 11px;
  color: var(--text-muted);
}

/* Tabla */

.panel-table {
  margin-top: 4px;
}

.panel-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 6px;
}

.panel-header h2 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.panel-subtitle {
  margin: 0;
  font-size: 11px;
  color: var(--text-muted);
}

.rows-info {
  font-size: 11px;
  color: var(--text-muted);
}

.table-wrapper {
  max-height: calc(100vh - 260px);
  overflow: auto;
  border-radius: 16px;
  border: 1px solid rgba(31, 41, 55, 0.95);
}

/* Forzar que no se vean chips si existiera algún HTML viejo */
.chips-container,
label.field-label + .chips-container {
  display: none !important;
}

/* Tabla base */

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

thead {
  position: sticky;
  top: 0;
  z-index: 2;
}

thead th {
  background: #020617;
  color: var(--text-muted);
  text-align: left;
  padding: 7px 8px;
  font-weight: 500;
  border-bottom: 1px solid rgba(31, 41, 55, 0.9);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

thead th.is-numeric {
  text-align: right;
}

thead th:hover {
  background: #020617;
  color: var(--text-main);
}

tbody tr:nth-child(even) {
  background-color: #020617;
}

tbody tr:nth-child(odd) {
  background-color: #020818;
}

tbody tr:hover {
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 1));
}

td {
  padding: 6px 8px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.9);
}

td.is-numeric {
  text-align: right;
}

/* Clasificación badge */

.badge-clasif {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(75, 85, 99, 0.9);
}

.badge-clasif.A {
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.8);
}

.badge-clasif.B {
  background: rgba(234, 179, 8, 0.12);
  border-color: rgba(234, 179, 8, 0.8);
}

.badge-clasif.C,
.badge-clasif["C"] {
  background: rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.8);
}

/* Heatmap cobertura días */

.heat-low {
  background: radial-gradient(circle at left, rgba(34, 197, 94, 0.32), transparent 70%);
}

.heat-mid {
  background: radial-gradient(circle at left, rgba(234, 179, 8, 0.32), transparent 70%);
}

.heat-high {
  background: radial-gradient(circle at left, rgba(239, 68, 68, 0.45), transparent 70%);
}

/* Footer */

.footer {
  margin-top: 4px;
  font-size: 11px;
  color: var(--text-muted);
  text-align: right;
}

/* Responsive */

@media (max-width: 1024px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
    overflow-x: auto;
  }

  .sidebar .panel {
    min-width: 260px;
  }

  .table-wrapper {
    max-height: 60vh;
  }
}

@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .kpi-grid-secondary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
