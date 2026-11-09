"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn, signOut } from "next-auth/react";
import type { SheetProduct } from "../../../lib/menu-sheet-admin";
import { getMessages } from "../../../i18n";
import "./admin.css";

const blank = () => ["", "", "", "", "", "", "", "", false, true] as (string | number | boolean)[];
const categoryNames = getMessages("es").menu.categoryLabels;
const categoryName = (value: string) => categoryNames[value] ?? value;
const visible = (value: unknown) => value === true || String(value).toLowerCase() === "true";
const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const currency = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });
const money = (value: unknown) => value === "" || value === undefined ? "Sin precio" : currency.format(Number(value));

function Arrow({ back = false }: { back?: boolean }) { return <span aria-hidden="true">{back ? "←" : "→"}</span>; }

export default function MenuEditor({ initialProducts, email, initialError = "" }: { initialProducts: SheetProduct[]; email: string; initialError?: string }) {
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
  const categories = [...new Set(products.map(product => String(product.values[0])))];
  const subcategories = [...new Set(products.filter(product => product.values[0] === values[0]).map(product => String(product.values[1] ?? "")).filter(Boolean))];
  const query = normalize(search.trim());
  const filtered = products.filter(product => (!category || product.values[0] === category) &&
    (status === "all" || visible(product.values[8]) === (status === "visible")) &&
    normalize(`${product.values[2]} ${categoryName(String(product.values[0]))} ${product.values[1] ?? ""}`).includes(query));
  const dirty = values.some((value, index) => value !== initialValues[index]);

  async function call(body: object) {
    const response = await fetch("/api/admin-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json();
    if (response.status === 401) setSessionExpired(true);
    if (!response.ok) throw new Error(data.error);
    return data;
  }
  async function refresh() {
    setBusy(true); setError(""); setNotice("");
    try { const data = await call({ action: "list" }); setProducts(data.products); }
    catch (error) { setError(error instanceof Error ? error.message : "No se pudo conectar. Vuelve a intentarlo."); }
    finally { setBusy(false); }
  }
  function change(index: number, value: string | number | boolean) { setValues(current => current.map((entry, i) => i === index ? value : entry)); }
  function edit(product?: SheetProduct) {
    const next = product ? blank().map((fallback, index) => {
      const value = product.values[index] ?? fallback;
      if (index >= 8) return visible(value);
      return String(value);
    }) : blank();
    if (!product && category) next[0] = category;
    setSelected(product); setValues(next); setInitialValues([...next]); setEditing(true); setError(""); setNotice("");
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function back() {
    if (dirty && !window.confirm("Tienes cambios sin guardar. ¿Quieres descartarlos?")) return;
    setEditing(false); setError(""); window.scrollTo({ top: 0, behavior: "instant" });
  }
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      // Keep decimal input as text while typing; Sheets receives actual numbers.
      const cells = values.map((value, index) => index >= 4 && index <= 6 && value !== "" ? Number(value) : value);
      await call({ action: "save", row: selected?.row, version: selected?.version, values: cells });
      // Keep the editor session; only the product list needs refreshing after a save.
      setEditing(false); setSelected(undefined); setValues(blank()); setInitialValues(blank());
      setNotice(`“${values[2]}” guardado. Las traducciones y la web pueden tardar unos minutos en actualizarse.`);
      try { const data = await call({ action: "list" }); setProducts(data.products); }
      catch { setNotice("Producto guardado. Pulsa Actualizar para volver a cargar la carta."); }
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "No se pudo guardar. Tus cambios siguen en el formulario.");
      window.scrollTo({ top: 0, behavior: "instant" });
    }
    finally { setBusy(false); }
  }

  return <div className="menu-admin">
    <header className="admin-header"><div className="admin-header-inner">
      <div className="admin-brand"><Image src="/brand/mundus-mark.svg" width={36} height={36} alt="" unoptimized /><div><strong>Mundus Lounge</strong><span>Gestión de carta</span></div></div>
      {!editing && <button type="button" className="admin-text-button" onClick={() => void signOut({ callbackUrl: "/admin" })} disabled={busy}>Salir</button>}

    </div></header>
    <main className="admin-main">
      <nav aria-label="Gestión"><Link className="admin-text-button" href="/admin/loyalty" prefetch={false}>Tarjetas VIP →</Link></nav>
      <p className="admin-footnote">Sesión: {email}</p>
      {sessionExpired && <div className="admin-feedback is-error" role="alert"><p>Tu sesión ha caducado. Copia tus cambios antes de volver a entrar.</p><button type="button" className="admin-text-button" onClick={() => void signIn("google", { callbackUrl: "/admin" })}>Volver a iniciar sesión</button></div>}
      {(error || notice) && <div className={`admin-feedback ${error ? "is-error" : ""}`} role={error ? "alert" : "status"}><strong>{error ? "No se pudo completar" : "Guardado"}</strong><p>{error || notice}</p></div>}
      {editing ? <>
        <button className="admin-back" onClick={back} disabled={busy}><Arrow back /> Volver a productos</button>
        <div className="admin-heading"><div><p className="admin-eyebrow">{selected ? "EDITAR PRODUCTO" : "NUEVO EN LA CARTA"}</p><h1>{selected ? String(selected.values[2]) : "Añadir producto"}</h1></div><span className={`admin-status ${values[8] ? "is-visible" : ""}`}>{values[8] ? "Visible" : "Oculto"}</span></div>
        <p className="admin-intro">Edita en español. Las traducciones se actualizan automáticamente.</p>
        <form onSubmit={save}>
          <fieldset className="admin-section" disabled={busy}><legend>Información del producto</legend>
            <label className="admin-label" htmlFor="product-name">Nombre <span>Obligatorio</span></label>
            <input id="product-name" className="admin-input" required maxLength={2000} value={String(values[2])} onChange={event => change(2,event.target.value)} placeholder="Ej. Mojito de fresa" />
            <div className="admin-two-columns"><div><label className="admin-label" htmlFor="category">Categoría <span>Obligatoria</span></label>
              <select id="category" className="admin-input" required value={String(values[0])} onChange={event => { change(0,event.target.value); change(1,""); }}><option value="">Elige una categoría</option>{categories.map(item => <option key={item} value={item}>{categoryName(item)}</option>)}</select></div>
              <div><label className="admin-label" htmlFor="subcategory">Subcategoría <span>Opcional</span></label><input id="subcategory" className="admin-input" list="subcategories" maxLength={2000} value={String(values[1])} onChange={event => change(1,event.target.value)} placeholder="Elige o escribe una" /><datalist id="subcategories">{subcategories.map(item => <option key={item} value={item} />)}</datalist></div></div>
            <label className="admin-label" htmlFor="description">Descripción <span>Opcional</span></label>
            <textarea id="description" className="admin-input" rows={4} maxLength={2000} value={String(values[3])} onChange={event => change(3,event.target.value)} placeholder="Ingredientes o detalles que el cliente debe conocer" />
          </fieldset>
          <fieldset className="admin-section" disabled={busy}><legend>Precios y suplementos</legend><p className="admin-help">Importes en euros. Deja vacíos los precios que no correspondan.</p>
            <div className="admin-prices">{["Precio", "Botella", "Chupito"].map((label,offset) => <div key={label}><label className="admin-label" htmlFor={`price-${offset}`}>{label}</label><div className="admin-price-input"><input id={`price-${offset}`} className="admin-input" type="number" inputMode="decimal" min={0} max={10000} step="0.01" value={String(values[offset+4])} onChange={event => change(offset+4,event.target.value)} placeholder="0,00" /><span aria-hidden="true">€</span></div></div>)}</div>
            <label className="admin-label" htmlFor="supplement">Suplemento <span>Opcional</span></label><input id="supplement" className="admin-input" maxLength={2000} value={String(values[7])} onChange={event => change(7,event.target.value)} placeholder="Ej. Red Bull +1 €" />
          </fieldset>
          <fieldset className="admin-section admin-settings" disabled={busy}><legend>Publicación</legend>
            {[{ title: "Visible en la carta", description: "Desactívalo si está agotado o aún no está listo.", index: 8 }, { title: "Conservar nombre original", description: "Para marcas y nombres como Coca-Cola o Mojito.", index: 9 }].map(setting => <label className="admin-switch-row" key={setting.index}><span><strong>{setting.title}</strong><small>{setting.description}</small></span><input type="checkbox" role="switch" checked={Boolean(values[setting.index])} onChange={event => change(setting.index,event.target.checked)} /><span className="admin-switch" aria-hidden="true" /></label>)}
          </fieldset>
          <div className="admin-save-bar"><div><p>{dirty ? "Cambios sin guardar" : selected ? "Sin cambios" : "Empieza con los datos del producto"}</p><button type="submit" className="admin-button admin-button-primary" disabled={busy || !dirty}>{busy ? "Guardando…" : <>Guardar producto <Arrow /></>}</button></div></div>
        </form>
      </> : <>
        <div className="admin-heading"><div><p className="admin-eyebrow">TU CARTA</p><h1>Productos</h1><p className="admin-intro">{products.length} productos · {products.filter(product => visible(product.values[8])).length} visibles</p></div><button className="admin-button admin-button-primary admin-add" disabled={busy} onClick={() => edit()}><span aria-hidden="true">+</span> Añadir producto</button></div>
        <section className="admin-filters" aria-label="Buscar y filtrar productos">
          <label className="admin-search"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></svg><input aria-label="Buscar producto" placeholder="Busca un producto…" value={search} onChange={event => setSearch(event.target.value)} /></label>
          <div className="admin-filter-row"><select className="admin-input" aria-label="Filtrar por categoría" value={category} onChange={event => setCategory(event.target.value)}><option value="">Todas las categorías</option>{categories.map(item => <option key={item} value={item}>{categoryName(item)}</option>)}</select><select className="admin-input" aria-label="Filtrar por disponibilidad" value={status} onChange={event => setStatus(event.target.value)}><option value="all">Todos los estados</option><option value="visible">Visibles</option><option value="hidden">Ocultos</option></select></div>
        </section>
        <div className="admin-list-heading"><h2>{search || category || status !== "all" ? `${filtered.length} resultados` : "Todos los productos"}</h2><button className="admin-text-button" disabled={busy} onClick={() => void refresh()}>{busy ? "Actualizando…" : "Actualizar"}</button></div>
        <div className="admin-product-list" aria-busy={busy}>{filtered.map(product => <button className="admin-product" key={product.row} disabled={busy} onClick={() => edit(product)}><span className="admin-product-body"><span className="admin-product-category">{categoryName(String(product.values[0]))}</span><strong>{String(product.values[2])}</strong><span className="admin-product-description">{String(product.values[3] || product.values[1] || "Sin descripción")}</span></span><span className="admin-product-meta"><span className={`admin-status ${visible(product.values[8]) ? "is-visible" : ""}`}>{visible(product.values[8]) ? "Visible" : "Oculto"}</span><strong>{money([product.values[4], product.values[5], product.values[6]].find(value => value !== "" && value !== undefined))}</strong><Arrow /></span></button>)}</div>
        {!filtered.length && <div className="admin-empty"><h2>No hay productos que coincidan</h2><p>Prueba con otro nombre o cambia los filtros.</p><button className="admin-text-button" onClick={() => { setSearch(""); setCategory(""); setStatus("all"); }}>Limpiar filtros</button></div>}
        <p className="admin-footnote">Los cambios se guardan en Google Sheets. Las traducciones son automáticas.</p>
      </>}

    </main>
  </div>;
}
