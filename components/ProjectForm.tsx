'use client';
import {useState} from 'react'; import {useRouter} from 'next/navigation'; import {createClient} from '@/lib/supabase/client'; import type {Project} from '@/types/project';
export default function ProjectForm({project}:{project?:Project}){const r=useRouter();const s=createClient();const [saving,setSaving]=useState(false);const [err,setErr]=useState('');const [form,setForm]=useState({name:project?.name||'',slug:project?.slug||'',short_description:project?.short_description||'',full_description:project?.full_description||'',cover_url:project?.cover_url||'',category:project?.category||'',status:project?.status||'idea',priority:project?.priority||'medium',progress:project?.progress||0,github_url:project?.github_url||'',live_url:project?.live_url||'',docs_url:project?.docs_url||'',api_url:project?.api_url||'',hosting_provider:project?.hosting_provider||'',visibility:project?.visibility||'private',featured:project?.featured||false,start_date:project?.start_date||'',target_date:project?.target_date||'',architecture_notes:project?.architecture_notes||'',setup_notes:project?.setup_notes||'',environment_notes:project?.environment_notes||''});
function set(k:string,v:any){setForm(x=>({...x,[k]:v}))} async function save(e:React.FormEvent){e.preventDefault();setSaving(true);setErr('');const {data:{user}}=await s.auth.getUser();if(!user){setErr('Session expired');setSaving(false);return}const payload={...form,slug:form.slug||form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''),start_date:form.start_date||null,target_date:form.target_date||null,user_id:user.id};const q=project?await s.from('projects').update(payload).eq('id',project.id):await s.from('projects').insert(payload).select('id').single();if(q.error){setErr(q.error.message);setSaving(false);return}const id=project?.id||(q.data as any).id;await s.from('activity_logs').insert({user_id:user.id,project_id:id,action:project?'project.updated':'project.created'});r.push(`/projects/${id}`);r.refresh()}
return <form className="project-form" onSubmit={save}>
  <div className="form-column main-form-column">
    <section className="form-section">
      <div className="form-section-head"><span>01</span><div><h2>Identity</h2><p>The project information you will see everywhere.</p></div></div>
      <div className="fields two">
        <label>Name<input required value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Project name"/></label>
        <label>Slug<input value={form.slug} onChange={e=>set('slug',e.target.value)} placeholder="auto-generated"/></label>
        <label className="span2">Short description<input value={form.short_description} onChange={e=>set('short_description',e.target.value)} placeholder="A concise summary"/></label>
        <label className="span2">Full description<textarea rows={6} value={form.full_description} onChange={e=>set('full_description',e.target.value)} placeholder="What are you building and why?"/></label>
        <label className="span2">Cover image URL<input type="url" value={form.cover_url} onChange={e=>set('cover_url',e.target.value)} placeholder="https://…"/></label>
      </div>
    </section>

    <section className="form-section">
      <div className="form-section-head"><span>02</span><div><h2>Connections</h2><p>Link the places where this project lives.</p></div></div>
      <div className="fields two">
        <label>GitHub URL<input type="url" value={form.github_url} onChange={e=>set('github_url',e.target.value)} placeholder="https://github.com/…"/></label>
        <label>Live URL<input type="url" value={form.live_url} onChange={e=>set('live_url',e.target.value)} placeholder="https://…"/></label>
        <label>Documentation URL<input type="url" value={form.docs_url} onChange={e=>set('docs_url',e.target.value)} placeholder="https://…"/></label>
        <label>API URL<input type="url" value={form.api_url} onChange={e=>set('api_url',e.target.value)} placeholder="https://…"/></label>
      </div>
    </section>

    <section className="form-section">
      <div className="form-section-head"><span>03</span><div><h2>Documentation</h2><p>Keep the technical context attached to the project.</p></div></div>
      <div className="fields">
        <label>Architecture notes<textarea rows={4} value={form.architecture_notes} onChange={e=>set('architecture_notes',e.target.value)} placeholder="Architecture, services, data flow…"/></label>
        <label>Setup instructions<textarea rows={4} value={form.setup_notes} onChange={e=>set('setup_notes',e.target.value)} placeholder="Local setup and deployment notes…"/></label>
        <label>Environment variable references<textarea rows={3} value={form.environment_notes} onChange={e=>set('environment_notes',e.target.value)} placeholder="Names only — never secret values"/></label>
      </div>
    </section>
  </div>

  <aside className="form-column side-form-column">
    <section className="form-section sticky-form">
      <div className="form-section-head"><span>04</span><div><h2>Project state</h2><p>How this project should appear in ProjectOS.</p></div></div>
      <div className="fields">
        <label>Status<select value={form.status} onChange={e=>set('status',e.target.value)}>{['idea','development','deployed','completed'].map(x=><option key={x}>{x}</option>)}</select></label>
        <label>Priority<select value={form.priority} onChange={e=>set('priority',e.target.value)}><option>low</option><option>medium</option><option>high</option></select></label>
        <label className="range-label"><span>Progress <b>{form.progress}%</b></span><input type="range" min="0" max="100" value={form.progress} onChange={e=>set('progress',Number(e.target.value))}/></label>
        <label>Visibility<select value={form.visibility} onChange={e=>set('visibility',e.target.value)}><option>private</option><option>unlisted</option><option>public</option></select></label>
        <label>Category<input value={form.category} onChange={e=>set('category',e.target.value)} placeholder="Web, AI, Mobile…"/></label>
        <label>Hosting provider<input value={form.hosting_provider} onChange={e=>set('hosting_provider',e.target.value)} placeholder="Vercel, Cloudflare…"/></label>
        <div className="date-pair"><label>Start<input type="date" value={form.start_date} onChange={e=>set('start_date',e.target.value)}/></label><label>Target<input type="date" value={form.target_date} onChange={e=>set('target_date',e.target.value)}/></label></div>
        <label className="toggle-row"><input type="checkbox" checked={form.featured} onChange={e=>set('featured',e.target.checked)}/><span><b>Featured project</b><small>Pin this project prominently.</small></span></label>
      </div>
      {err&&<div className="notice error">{err}</div>}
      <button className="primary save-project" disabled={saving}>{saving?'Saving…':project?'Save changes':'Create project'}</button>
    </section>
  </aside>
</form>}