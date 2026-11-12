"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import AdminIcon from "../../../components/admin-icon";
import type { SheetProduct } from "../../../lib/menu-sheet-admin";
import "./admin.css";
import "./menu-mobile.css";

const blank = () =>
  ["", "", "", "", "", "", "", "", false, true] as (
    | string
    | number
    | boolean
  )[];
const visible = (value: unknown) =>
  value === true || String(value).toLowerCase() === "true";
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
});
const money = (value: unknown) =>
  value === "" || value === undefined
    ? "Sin precio"
    : currency.format(Number(value));

export default function MenuEditor({
  initialProducts,
  email,
  categoryLabels,
  initialError = "",
  showLoyaltyLink = true,
}: {
  initialProducts: SheetProduct[];
  email: string;
  categoryLabels: Record<string, string>;
  initialError?: string;
  showLoyaltyLink?: boolean;
}) {
  const categoryName = (value: string) => categoryLabels[value] ?? value;
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<SheetProduct>();
  const [values, setValues] = useState(blank);
  const [initialValues, setInitialValues] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("all");
  const categories = [
    ...new Set(products.map((product) => String(product.values[0]))),
  ];
  const subcategories = [
    ...new Set(
      products
        .filter((product) => product.values[0] === values[0])
        .map((product) => String(product.values[1] ?? ""))
        .filter(Boolean),
    ),
  ];
  const query = normalize(search.trim());
  const filtered = products.filter(
    (product) =>
      (!category || product.values[0] === category) &&
      (status === "all" ||
        visible(product.values[8]) === (status === "visible")) &&
      normalize(
        `${product.values[2]} ${categoryName(String(product.values[0]))} ${product.values[1] ?? ""}`,
      ).includes(query),
  );
  const dirty = values.some((value, index) => value !== initialValues[index]);

  async function call(body: object) {
    const response = await fetch("/api/admin-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    if (response.status === 401) setSessionExpired(true);
    if (!response.ok) throw new Error(data.error);
    return data;
  }
  async function refresh() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await call({ action: "list" });
      setProducts(data.products);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo conectar. Vuelve a intentarlo.",
      );
    } finally {
      setBusy(false);
    }
  }
  function change(index: number, value: string | number | boolean) {
    setValues((current) =>
      current.map((entry, i) => (i === index ? value : entry)),
    );
  }
  function edit(product?: SheetProduct) {
    const next = product
      ? blank().map((fallback, index) => {
          const value = product.values[index] ?? fallback;
          if (index >= 8) return visible(value);
          return String(value);
        })
      : blank();
    if (!product && category) next[0] = category;
    setSelected(product);
    setValues(next);
    setInitialValues([...next]);
    setEditing(true);
    setError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function canLeave() {
    return (
      !editing ||
      !dirty ||
      window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?")
    );
  }
  function back() {
    if (!canLeave()) return;
    setEditing(false);
    setError("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      // Keep decimal input as text while typing; Sheets receives actual numbers.
      const cells = values.map((value, index) =>
        index >= 4 && index <= 6 && value !== "" ? Number(value) : value,
      );
      await call({
        action: "save",
        row: selected?.row,
        version: selected?.version,
        values: cells,
      });
      // Keep the editor session; only the product list needs refreshing after a save.
      setEditing(false);
      setSelected(undefined);
      setValues(blank());
      setInitialValues(blank());
      setNotice(
        `“${values[2]}” guardado. Las traducciones y la web pueden tardar unos minutos en actualizarse.`,
      );
      try {
        const data = await call({ action: "list" });
        setProducts(data.products);
      } catch {
        setNotice(
          "Producto guardado. Pulsa Actualizar para volver a cargar la carta.",
        );
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "No se pudo guardar. Tus cambios siguen en el formulario.",
      );
      window.scrollTo({ top: 0, behavior: "instant" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="menu-admin menu-admin-mobile">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <Image
              src="/brand/mundus-mark.svg"
              width={32}
              height={32}
              alt=""
              unoptimized
            />
            <div>
              <strong>MUNDUS LOUNGE</strong>
              <span>GESTIÓN DE CARTA</span>
            </div>
          </div>
          <details className="menu-account">
            <summary aria-label="Cuenta y navegación">
              <AdminIcon name="more" />
            </summary>
            <div className="menu-account-panel">
              <small>Sesión iniciada</small>
              <p>{email}</p>
              {showLoyaltyLink && (
                <Link
                  href="/admin/loyalty"
                  prefetch={false}
                  onClick={(event) => {
                    if (busy || !canLeave()) event.preventDefault();
                  }}
                >
                  Tarjetas VIP <AdminIcon name="chevron" />
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  if (canLeave()) void signOut({ callbackUrl: "/admin" });
                }}
                disabled={busy}
              >
                Cerrar sesión
              </button>
            </div>
          </details>
        </div>
      </header>
      <main className="admin-main">
        {sessionExpired && (
          <div className="admin-feedback is-error" role="alert">
            <p>
              Tu sesión ha caducado. Copia tus cambios antes de volver a entrar.
            </p>
            <button
              type="button"
              className="admin-text-button"
              onClick={() => void signIn("google", { callbackUrl: "/admin" })}
            >
              Volver a iniciar sesión
            </button>
          </div>
        )}
        {(error || notice) && (
          <div
            className={`admin-feedback ${error ? "is-error" : ""}`}
            role={error ? "alert" : "status"}
          >
            <strong>{error ? "No se pudo completar" : "Guardado"}</strong>
            <p>{error || notice}</p>
          </div>
        )}
        {editing ? (
          <>
            <button className="admin-back" onClick={back} disabled={busy}>
              <AdminIcon name="back" /> Todos los productos
            </button>
            <div className="admin-heading">
              <div>
                <h1>{selected ? "Editar producto" : "Añadir producto"}</h1>
              </div>
              <span className={`admin-status ${values[8] ? "is-visible" : ""}`}>
                {values[8] ? "Visible" : "Oculto"}
              </span>
            </div>
            <p className="admin-intro">
              Escribe en español. Traducción automática.
            </p>
            <form
              id="menu-product-form"
              onSubmit={save}
              onInvalid={(event) => {
                const section = (event.target as HTMLElement).closest(
                  "details",
                );
                if (section) section.open = true;
              }}
            >
              <fieldset className="menu-basic-fields" disabled={busy}>
                <legend className="menu-sr-only">
                  Información del producto
                </legend>
                <label className="admin-label" htmlFor="product-name">
                  Nombre <span>Obligatorio</span>
                </label>
                <input
                  id="product-name"
                  className="admin-input"
                  required
                  maxLength={2000}
                  value={String(values[2])}
                  onChange={(event) => change(2, event.target.value)}
                  placeholder="Ej. Mojito de fresa"
                />
                <label className="admin-label" htmlFor="category">
                  Categoría <span>Obligatoria</span>
                </label>
                <select
                  id="category"
                  className="admin-input"
                  required
                  value={String(values[0])}
                  onChange={(event) => {
                    change(0, event.target.value);
                    change(1, "");
                  }}
                >
                  <option value="">Elige una categoría</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {categoryName(item)}
                    </option>
                  ))}
                </select>
                <label className="admin-label" htmlFor="price-0">
                  Precio <span>Euros · opcional</span>
                </label>
                <div className="admin-price-input">
                  <input
                    id="price-0"
                    className="admin-input"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={10000}
                    step="0.01"
                    value={String(values[4])}
                    onChange={(event) => change(4, event.target.value)}
                    placeholder="0,00"
                  />
                  <span aria-hidden="true">€</span>
                </div>
                <label className="admin-switch-row menu-visibility">
                  <span>
                    <strong>Visible en la carta</strong>
                    <small>
                      Desactívalo si está agotado o aún no está listo.
                    </small>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={Boolean(values[8])}
                    onChange={(event) => change(8, event.target.checked)}
                  />
                  <span className="admin-switch" aria-hidden="true" />
                </label>
              </fieldset>
              <div className="menu-optional-sections">
                <details className="menu-disclosure">
                  <summary>
                    <span>
                      Descripción y subcategoría
                      <small>Ingredientes y organización</small>
                    </span>
                    <AdminIcon name="chevron" />
                  </summary>
                  <fieldset disabled={busy}>
                    <legend className="menu-sr-only">
                      Descripción y subcategoría
                    </legend>
                    <label className="admin-label" htmlFor="subcategory">
                      Subcategoría <span>Opcional</span>
                    </label>
                    <input
                      id="subcategory"
                      className="admin-input"
                      list="subcategories"
                      maxLength={2000}
                      value={String(values[1])}
                      onChange={(event) => change(1, event.target.value)}
                      placeholder="Elige o escribe una"
                    />
                    <datalist id="subcategories">
                      {subcategories.map((item) => (
                        <option key={item} value={item} />
                      ))}
                    </datalist>
                    <label className="admin-label" htmlFor="description">
                      Descripción <span>Opcional</span>
                    </label>
                    <textarea
                      id="description"
                      className="admin-input"
                      rows={4}
                      maxLength={2000}
                      value={String(values[3])}
                      onChange={(event) => change(3, event.target.value)}
                      placeholder="Ingredientes o detalles del producto"
                    />
                  </fieldset>
                </details>
                <details
                  className="menu-disclosure"
                  open={Boolean(
                    selected &&
                      selected.values
                        .slice(5, 8)
                        .some((value) => value !== "" && value !== undefined),
                  )}
                >
                  <summary>
                    <span>
                      Otros precios y suplemento
                      <small>Botella, chupito y extras</small>
                    </span>
                    <AdminIcon name="chevron" />
                  </summary>
                  <fieldset disabled={busy}>
                    <legend className="menu-sr-only">
                      Otros precios y suplementos
                    </legend>
                    <div className="menu-extra-prices">
                      {["Botella", "Chupito"].map((label, offset) => (
                        <div key={label}>
                          <label
                            className="admin-label"
                            htmlFor={`price-${offset + 1}`}
                          >
                            {label}
                          </label>
                          <div className="admin-price-input">
                            <input
                              id={`price-${offset + 1}`}
                              className="admin-input"
                              type="number"
                              inputMode="decimal"
                              min={0}
                              max={10000}
                              step="0.01"
                              value={String(values[offset + 5])}
                              onChange={(event) =>
                                change(offset + 5, event.target.value)
                              }
                              placeholder="0,00"
                            />
                            <span aria-hidden="true">€</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <label className="admin-label" htmlFor="supplement">
                      Suplemento <span>Opcional</span>
                    </label>
                    <input
                      id="supplement"
                      className="admin-input"
                      maxLength={2000}
                      value={String(values[7])}
                      onChange={(event) => change(7, event.target.value)}
                      placeholder="Ej. Red Bull +1 €"
                    />
                  </fieldset>
                </details>
                <details className="menu-disclosure">
                  <summary>
                    <span>
                      Opciones de traducción
                      <small>Cómo aparece el nombre en otros idiomas</small>
                    </span>
                    <AdminIcon name="chevron" />
                  </summary>
                  <fieldset disabled={busy}>
                    <legend className="menu-sr-only">
                      Opciones de traducción
                    </legend>
                    <label className="admin-switch-row">
                      <span>
                        <strong>Conservar nombre original</strong>
                        <small>
                          Para marcas y nombres como Coca-Cola o Mojito.
                        </small>
                      </span>
                      <input
                        type="checkbox"
                        role="switch"
                        checked={Boolean(values[9])}
                        onChange={(event) => change(9, event.target.checked)}
                      />
                      <span className="admin-switch" aria-hidden="true" />
                    </label>
                  </fieldset>
                </details>
              </div>
            </form>
            <p className="admin-footnote">
              Las traducciones y la carta pueden tardar unos minutos en
              actualizarse.
            </p>
            <div className="menu-bottom-bar menu-save-bar">
              <div>
                <p>
                  {dirty
                    ? "Cambios sin guardar"
                    : selected
                      ? "Sin cambios"
                      : "Completa el nombre y la categoría"}
                </p>
                <button
                  type="submit"
                  form="menu-product-form"
                  className="admin-button admin-button-primary"
                  disabled={busy || !dirty}
                >
                  {busy
                    ? "Guardando…"
                    : selected
                      ? "Guardar cambios"
                      : "Crear producto"}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="admin-heading">
              <div>
                <h1>Carta</h1>
                <p className="admin-intro">
                  {products.length} productos ·{" "}
                  {
                    products.filter((product) => visible(product.values[8]))
                      .length
                  }{" "}
                  visibles
                </p>
              </div>
              <button
                className="menu-icon-button"
                aria-label="Actualizar productos"
                disabled={busy}
                onClick={() => void refresh()}
              >
                <AdminIcon name="refresh" />
              </button>
            </div>
            <section
              className="menu-filters"
              aria-label="Buscar y filtrar productos"
            >
              <label className="admin-search">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  aria-hidden="true"
                >
                  <circle cx="10.5" cy="10.5" r="6.5" />
                  <path d="m16 16 5 5" />
                </svg>
                <input
                  aria-label="Buscar producto"
                  placeholder="Buscar producto…"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <select
                className="admin-input menu-category-filter"
                aria-label="Filtrar por categoría"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {categoryName(item)}
                  </option>
                ))}
              </select>
              <div
                className="menu-status-filter"
                role="group"
                aria-label="Filtrar por disponibilidad"
              >
                {[
                  { value: "all", label: "Todos" },
                  { value: "visible", label: "Visibles" },
                  { value: "hidden", label: "Ocultos" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    aria-pressed={status === item.value}
                    onClick={() => setStatus(item.value)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>
            <div className="admin-list-heading">
              <h2>
                {search || category || status !== "all"
                  ? `${filtered.length} resultados`
                  : "Productos"}
              </h2>
              <span>{filtered.length}</span>
            </div>
            <div className="admin-product-list" aria-busy={busy}>
              {filtered.map((product) => (
                <button
                  className="admin-product"
                  key={product.row}
                  disabled={busy}
                  onClick={() => edit(product)}
                >
                  <span className="admin-product-body">
                    <strong>{String(product.values[2])}</strong>
                    <span className="admin-product-category">
                      {categoryName(String(product.values[0]))}
                      {product.values[1] ? ` · ${product.values[1]}` : ""}
                    </span>
                  </span>
                  <span className="admin-product-meta">
                    <strong>
                      {money(
                        [
                          product.values[4],
                          product.values[5],
                          product.values[6],
                        ].find((value) => value !== "" && value !== undefined),
                      )}
                    </strong>
                    <span
                      className={`admin-status ${visible(product.values[8]) ? "is-visible" : ""}`}
                    >
                      {visible(product.values[8]) ? "Visible" : "Oculto"}
                    </span>
                  </span>
                  <AdminIcon name="chevron" />
                </button>
              ))}
            </div>
            {!filtered.length && (
              <div className="admin-empty">
                <h2>
                  {products.length
                    ? "Sin resultados"
                    : "No hay productos para mostrar"}
                </h2>
                <p>
                  {products.length
                    ? "Prueba otro nombre o cambia los filtros."
                    : "Actualiza para volver a cargar la carta."}
                </p>
                {products.length > 0 && (
                  <button
                    className="admin-text-button"
                    onClick={() => {
                      setSearch("");
                      setCategory("");
                      setStatus("all");
                    }}
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
            <div className="menu-bottom-bar">
              <div>
                <Link
                  href="/es/menu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="menu-preview-link"
                >
                  Ver carta <AdminIcon name="book" />
                </Link>
                <button
                  className="admin-button admin-button-primary"
                  disabled={busy}
                  onClick={() => edit()}
                >
                  <AdminIcon name="plus" /> Añadir producto
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
