import AppShell from '@/components/AppShell';
import DashboardClient from '@/components/DashboardClient';
import { createClient } from '@/lib/supabase/server';
import { ArrowUpRight, Github, Rocket, Sparkles } from 'lucide-react';

export default async function Dashboard(){
  const s=await createClient();
  const [{data:projects=[]},{data:updates=[]}] = await Promise.all([
    s.from('projects').select('*').order('featured',{ascending:false}).order('updated_at',{ascending:false}),
    s.from('project_updates').select('id,title,source,created_at,project_id,projects(name)').order('created_at',{ascending:false}).limit(5)
  ]);
  const p=projects||[];
  const active=p.filter(x=>x.status==='development').length;
  const deployed=p.filter(x=>x.status==='deployed').length;
  const ideas=p.filter(x=>x.status==='idea').length;
  const avg=p.length?Math.round(p.reduce((a,x)=>a+x.progress,0)/p.length):0;
  const latest=p[0];

  return <AppShell title="Overview" subtitle="A quiet command center for everything you build.">
    <section className="dashboard-hero">
      <div className="hero-copy">
        <span className="hero-badge"><Sparkles size={14}/> Developer workspace</span>
        <h2>{p.length ? `${p.length} projects, one source of truth.` : 'Your next build starts here.'}</h2>
        <p>Track projects, GitHub activity, deployments, documentation, files and milestones without the noise of a traditional admin panel.</p>
        <div className="hero-actions">
          <a href="/projects" className="primary">Browse projects <ArrowUpRight size={16}/></a>
          <a href="/github" className="secondary"><Github size={16}/>GitHub center</a>
        </div>
      </div>
      <div className="hero-orbit" aria-hidden="true">
        <div className="orbit-ring"></div>
        <div className="orbit-core">P</div>
        <span className="orbit-dot d1"></span><span className="orbit-dot d2"></span><span className="orbit-dot d3"></span>
      </div>
    </section>

    <section className="metric-grid">
      <div className="metric-card"><span>Development</span><strong>{active}</strong><small>actively building</small></div>
      <div className="metric-card"><span>Deployed</span><strong>{deployed}</strong><small>live projects</small></div>
      <div className="metric-card"><span>Ideas</span><strong>{ideas}</strong><small>waiting to start</small></div>
      <div className="metric-card"><span>Average progress</span><strong>{avg}%</strong><small>across all projects</small></div>
    </section>

    <div className="dashboard-split">
      <section className="dashboard-main">
        <div className="section-heading">
          <div><span className="section-kicker">LIBRARY</span><h2>Projects</h2><p>Search, filter and jump back into your work.</p></div>
        </div>
        <DashboardClient projects={p}/>
      </section>

      <aside className="activity-panel">
        <div className="section-heading compact-heading"><div><span className="section-kicker">NOW</span><h2>Activity</h2></div></div>
        {latest&&<a className="focus-card" href={`/projects/${latest.id}`}>
          <span className={`status ${latest.status}`}>{latest.status}</span>
          <b>{latest.name}</b>
          <small>{latest.progress}% complete · updated {new Date(latest.updated_at).toLocaleDateString()}</small>
          <div className="focus-progress"><i style={{width:`${latest.progress}%`}}/></div>
        </a>}
        <div className="activity-list">
          {(updates||[]).map((u:any)=><a href={`/projects/${u.project_id}`} key={u.id}>
            <span className="activity-icon">{u.source==='github'?<Github size={14}/>:<Rocket size={14}/>}</span>
            <span><b>{u.title}</b><small>{u.projects?.name||'Project'} · {new Date(u.created_at).toLocaleDateString()}</small></span>
          </a>)}
          {!updates?.length&&<div className="mini-empty">No recent activity yet.</div>}
        </div>
      </aside>
    </div>
  </AppShell>
}