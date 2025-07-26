import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetMsg, setResetMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else if (data.user) onLogin(data.user);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setResetMsg('');
    setError('');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) setError(error.message);
    else setResetMsg('¡Revisa tu correo para cambiar la contraseña!');
  };

  return (
    <form onSubmit={handleLogin} style={{maxWidth: 400, margin: '3rem auto', padding: 24, background: 'var(--bg-secondary)', borderRadius: 12, boxShadow: '0 2px 12px var(--shadow-dark)'}}>
      <h2 style={{textAlign:'center',marginBottom:24}}>Login Admin</h2>
      <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required style={{width:'100%',margin:'8px 0',padding:10,borderRadius:8,border:'1.5px solid var(--border-color)'}} />
      {!showReset && (
        <>
          <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} required style={{width:'100%',margin:'8px 0',padding:10,borderRadius:8,border:'1.5px solid var(--border-color)'}} />
          {error && <div style={{color:'red',marginBottom:8}}>{error}</div>}
          <button type="submit" style={{width:'100%',padding:'10px',marginTop:8,borderRadius:8,background:'var(--accent-primary)',color:'#fff',fontWeight:700}} disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          <div style={{marginTop:12, textAlign:'right'}}>
            <button type="button" style={{background:'none',border:'none',color:'var(--accent-secondary)',cursor:'pointer',textDecoration:'underline'}} onClick={()=>setShowReset(true)}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </>
      )}
      {showReset && (
        <>
          <button type="button" style={{background:'none',border:'none',color:'var(--accent-secondary)',cursor:'pointer',marginBottom:8}} onClick={()=>setShowReset(false)}>
            ← Volver al login
          </button>
          <button type="button" style={{width:'100%',padding:'10px',marginTop:8,borderRadius:8,background:'var(--accent-primary)',color:'#fff',fontWeight:700}} onClick={handleReset}>
            Enviar correo de recuperación
          </button>
          {resetMsg && <div style={{color:'green',marginTop:8}}>{resetMsg}</div>}
          {error && <div style={{color:'red',marginTop:8}}>{error}</div>}
        </>
      )}
    </form>
  );
};

export default Login; 