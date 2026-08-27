'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react';

export default function LoginForm() {
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const supabase=createClient();

  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();
    if(loading)return;
    setLoading(true);setMessage('');
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error){setMessage('Invalid email or password.');setLoading(false);return}
    try{
      const response=await fetch('/api/auth/authorize',{method:'GET',cache:'no-store'});
      if(!response.ok){
        await supabase.auth.signOut();
        const body=await response.json().catch(()=>null);
        setMessage(body?.message||'This account is not authorized to access ProjectOS.');
        setLoading(false);return
      }
      window.location.assign('/dashboard');
    }catch{
      await supabase.auth.signOut();
      setMessage('Could not verify access. Please try again.');
      setLoading(false)
    }
  }

  return <div className="login-shell">
    <section className="login-intro">
      <div className="login-brand"><span><Sparkles size={18}/></span>ProjectOS</div>
      <div className="login-copy">
        <span className="hero-badge"><ShieldCheck size={14}/> Private workspace</span>
        <h1>Everything you build.<br/>One quiet place.</h1>
        <p>Your personal project database, GitHub activity, deployments, files and technical context — protected behind a single owner account.</p>
      </div>
      <div className="login-foot">Single-user mode · Supabase Auth · Row Level Security</div>
    </section>

    <section className="login-panel">
      <div className="auth-card">
        <div className="auth-symbol"><LockKeyhole/></div>
        <div><span className="section-kicker">OWNER ACCESS</span><h2>Welcome back</h2><p>Use your ProjectOS administrator account.</p></div>
        <form onSubmit={submit}>
          <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={e=>setEmail(e.target.value)} disabled={loading}/></label>
          <label>Password<input type="password" autoComplete="current-password" placeholder="••••••••" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} disabled={loading}/></label>
          <button className="primary auth-submit" type="submit" disabled={loading}>{loading?'Verifying…':<>Enter workspace <ArrowRight size={16}/></>}</button>
        </form>
        {message&&<div className="notice error" role="alert">{message}</div>}
      </div>
    </section>
  </div>
}