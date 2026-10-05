import { useState } from 'react';
import { login, register, errorMessage } from '../api.js';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
        setNotice('Account created. You can now log in.');
        setMode('login');
      } else {
        onLogin(await login(form.username, form.password));
      }
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-screen">
      <section className="auth-visual">
        <div className="brand-lockup">
          <span className="brand-glyph">c</span>
          <span className="brand-name">CEDRO<small>SUPPLY CO.</small></span>
        </div>
        <div className="visual-copy">
          <p className="visual-eyebrow">Inventory / 2026</p>
          <h1>Cedro<br />Supply</h1>
          <div className="visual-rule" />
        </div>
        <div className="visual-foot"><span>Operations</span><span>01 — Catalog</span></div>
      </section>

      <section className="auth-main">
        <div className="auth-form-wrap">
          <p className="auth-kicker">Account access</p>
          <h2>{mode === 'login' ? 'Welcome back' : 'Create account'}</h2>
          <p className="auth-intro">{mode === 'login' ? 'Sign in to continue.' : 'Register a new account.'}</p>
          {error && <div className="alert error">{error}</div>}
          {notice && <div className="alert success">{notice}</div>}

          <form className="auth-form" onSubmit={submit}>
            <label>Username
              <input value={form.username} onChange={set('username')} required autoFocus />
            </label>
            {mode === 'register' && (
              <label>Email
                <input type="email" value={form.email} onChange={set('email')} required />
              </label>
            )}
            <label>Password
              <input type="password" value={form.password} onChange={set('password')} required minLength={6} />
            </label>
            <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
          </form>

          <p className="auth-toggle">
            {mode === 'login' ? 'No account yet? ' : 'Already registered? '}
            <button type="button" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>
              {mode === 'login' ? 'Register' : 'Sign in'}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
