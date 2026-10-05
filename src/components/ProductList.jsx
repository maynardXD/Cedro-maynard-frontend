import { useCallback, useEffect, useState } from 'react';
import { getProducts, deleteProduct, errorMessage } from '../api.js';
import ProductForm from './ProductForm.jsx';

const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

export default function ProductList({ user, onLogout }) {
  const canManageProducts = user.role === 'admin';
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [formFor, setFormFor] = useState(null); // null = closed, {} = add, product = edit

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await getProducts());
      setError('');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.product_name}"?`)) return;
    try {
      await deleteProduct(p.id);
      setNotice('Product deleted.');
      load();
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const handleSaved = (msg) => {
    setFormFor(null);
    setNotice(msg);
    load();
  };

  const filteredProducts = products.filter((product) =>
    `${product.product_name} ${product.description ?? ''} ${product.id}`
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );
  const totalUnits = products.reduce((sum, product) => sum + Number(product.quantity || 0), 0);
  const stockValue = products.reduce((sum, product) => sum + Number(product.price || 0) * Number(product.quantity || 0), 0);
  const lowStock = products.filter((product) => Number(product.quantity) <= 5).length;

  return (
    <div className="workspace">
      <aside className="sidebar">
        <div className="brand-lockup">
          <span className="brand-glyph">c</span>
          <span className="brand-name">CEDRO<small>SUPPLY CO.</small></span>
        </div>
        <p className="side-label">Workspace</p>
        <div className="side-link active"><span className="side-icon">▦</span>Products</div>
        <div className="sidebar-spacer" />
        <div className="account-block">
          <span className="avatar">{user.username?.charAt(0).toUpperCase()}</span>
          <div className="account-meta"><strong>{user.username}</strong><small>{user.role || 'user'} account</small></div>
        </div>
        <button className="logout-button" onClick={onLogout}>Sign out</button>
      </aside>

      <main className="main-content">
        <div className="page-topline"><span>Inventory / Catalog</span><span>CEDRO · 01</span></div>
        <div className="page-heading">
          <div><h1>Products</h1><p className="page-caption">Catalog overview</p></div>
          {canManageProducts && <button className="button-primary" onClick={() => setFormFor({})}><span>+</span>Add product</button>}
        </div>

        {error && <div className="alert error">{error}</div>}
        {notice && <div className="alert success" onClick={() => setNotice('')}>{notice}</div>}

        <section className="metrics" aria-label="Inventory summary">
          <div className="metric"><span className="metric-label">Products</span><strong className="metric-value">{products.length}</strong></div>
          <div className="metric"><span className="metric-label">Units on hand</span><strong className="metric-value">{totalUnits.toLocaleString()}</strong></div>
          <div className="metric"><span className="metric-label">Stock value</span><strong className="metric-value">{peso.format(stockValue)}</strong></div>
          <div className="metric"><span className="metric-label">Low stock · 5 or fewer</span><strong className={`metric-value${lowStock ? ' warn' : ''}`}>{lowStock}</strong></div>
        </section>

        <div className="inventory-tools">
          <label className="search-field">
            <span aria-hidden="true">⌕</span>
            <input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search products" />
          </label>
          <span className="result-count">{filteredProducts.length} {filteredProducts.length === 1 ? 'record' : 'records'}</span>
        </div>

        <section className="table-panel" aria-label="Products">
          {loading ? <div className="loading-state">Loading inventory…</div> : (
            <div className="table-scroll">
              <table>
                <thead><tr><th>Product</th><th>Description</th><th className="num">Price</th><th className="num">Quantity</th><th>Added</th>{canManageProducts && <th></th>}</tr></thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr><td colSpan={canManageProducts ? 6 : 5} className="empty-state"><strong>{search ? 'No matching products' : 'No products yet'}</strong>{search ? 'Try a different search.' : 'Products will appear here once they are added.'}</td></tr>
                  ) : filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td><strong className="product-name">{product.product_name}</strong><span className="product-id">SKU · {product.id}</span></td>
                      <td className="description-cell">{product.description || '—'}</td>
                      <td className="num">{peso.format(product.price)}</td>
                      <td className="num"><span className="stock-value"><span className={`stock-dot${Number(product.quantity) <= 5 ? ' low' : ''}`} />{product.quantity}</span></td>
                      <td className="date-cell">{product.created_at ? new Date(product.created_at).toLocaleDateString() : '—'}</td>
                      {canManageProducts && <td className="actions"><button className="button-quiet" onClick={() => setFormFor(product)}>Edit</button><button className="button-delete" onClick={() => handleDelete(product)}>Delete</button></td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {canManageProducts && formFor && <ProductForm product={formFor.id ? formFor : null} onSaved={handleSaved} onCancel={() => setFormFor(null)} />}
      </main>
    </div>
  );
}
