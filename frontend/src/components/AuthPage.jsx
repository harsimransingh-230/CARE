import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', farmName: '', address: '', phone: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') {
        await register(form);
      } else {
        await login({ email: form.email, password: form.password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-art">
        <div className="brand-lockup"><div className="brand-mark">BC</div><span>Buffalo<span className="brand-green">Care</span></span></div>
        <div className="auth-art-copy">
          <span className="eyebrow">SMART FARM MANAGEMENT</span>
          <h1>Better care.<br />Healthier herds.</h1>
          <p>Keep farm, pregnancy, vaccination and medical records together in one secure place.</p>
        </div>
        <div className="auth-art-footer"><ShieldCheck size={17} /> Private farm records with role-based access</div>
      </section>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="mobile-brand brand-lockup"><div className="brand-mark">BC</div><span>Buffalo<span className="brand-green">Care</span></span></div>
          <span className="eyebrow">WELCOME TO BUFFALOCARE</span>
          <h2>{mode === 'login' ? 'Sign in to your account' : 'Create your farmer account'}</h2>
          <p className="muted">{mode === 'login' ? 'Access your farms and animal records.' : 'Your first farm will be created with your account.'}</p>
          <form className="auth-form" onSubmit={submit}>
            {mode === 'register' && <>
              <label>Full name<input name="name" value={form.name} onChange={update} placeholder="Your name" required maxLength="100" /></label>
              <label>First farm name<input name="farmName" value={form.farmName} onChange={update} placeholder="e.g. Green Valley Dairy Farm" required maxLength="120" /></label>
              <label>Farm address <span className="optional">Optional</span><input name="address" value={form.address} onChange={update} placeholder="Village, district, state" /></label>
              <label>Phone <span className="optional">Optional</span><input name="phone" value={form.phone} onChange={update} placeholder="Phone number" /></label>
            </>}
            <label>Email address<input type="email" name="email" value={form.email} onChange={update} placeholder="you@example.com" required autoComplete="email" /></label>
            <label>Password<div className="password-wrap"><input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={update} placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'} minLength="8" required autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" className="icon-button password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label="Toggle password visibility">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {error && <div className="alert error-alert">{error}</div>}
            <button className="primary-button full-button" type="submit" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-switch">{mode === 'login' ? 'New to BuffaloCare?' : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          <p className="auth-footnote">Your farm data is stored in your own account and is not shared with other farmers.</p>
        </div>
      </section>
    </main>
  );
}
