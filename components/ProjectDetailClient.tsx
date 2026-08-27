'use client';

import {useState} from 'react';
import {createClient} from '@/lib/supabase/client';
import type {Project,Milestone,Update,Technology} from '@/types/project';
import {useRouter} from 'next/navigation';
import ProjectForm from './ProjectForm';
import {
  CheckCircle2,Circle,Trash2,Plus,Upload,ExternalLink,Github,
  CalendarDays,Server,Flag,Shield,FileText,Link2,Code2,Rocket
} from 'lucide-react';

type Props={
  project:Project;
  milestones:Milestone[];
  updates:Update[];
  notes:any[];
  links:any[];
  files:any[];
  technologies:Technology[];
  assignedTech:string[];
  deployments:any[];
  secrets:any[];
};

const tabs=[
  ['overview','Overview'],
  ['milestones','Milestones'],
  ['updates','Updates'],
  ['deployments','Deployments'],
  ['docs','Docs'],
  ['secrets','Secrets'],
  ['notes','Notes'],
  ['links','Links'],
  ['files','Files'],
  ['technology','Technology'],
  ['edit','Edit'],
] as const;

export default function ProjectDetailClient(props:Props){
  const {project}=props;
  const supabase=createClient();
  const router=useRouter();
  const [tab,setTab]=useState('overview');
  const [busy,setBusy]=useState(false);

  const refresh=()=>router.refresh();

  async function uid(){
    return (await supabase.auth.getUser()).data.user?.id;
  }

  async function add(table:string,payload:any){
    const user_id=await uid();
    if(!user_id)return;
    await supabase.from(table).insert({...payload,user_id,project_id:project.id});
    refresh();
  }

  async function del(table:string,id:string){
    await supabase.from(table).delete().eq('id',id);
    refresh();
  }

  async function deleteProject(){
    if(!confirm(`Delete "${project.name}" and all related data?`))return;
    await supabase.from('projects').delete().eq('id',project.id);
    router.push('/projects');
    router.refresh();
  }

  async function upload(e:React.ChangeEvent<HTMLInputElement>){
    const file=e.target.files?.[0];
    if(!file)return;
    setBusy(true);
    const user_id=await uid();
    if(!user_id){setBusy(false);return}
    const path=`${user_id}/${project.id}/${Date.now()}-${file.name}`;
    const uploadResult=await supabase.storage.from('project-files').upload(path,file);
    if(!uploadResult.error){
      await supabase.from('project_files').insert({
        user_id,project_id:project.id,name:file.name,path,
        mime_type:file.type,size_bytes:file.size
      });
    }
    setBusy(false);
    refresh();
  }

  async function toggleMilestone(m:Milestone){
    await supabase.from('project_milestones').update({completed:!m.completed}).eq('id',m.id);
    refresh();
  }

  async function assignTech(id:string){
    const user_id=await uid();
    if(!user_id)return;
    if(props.assignedTech.includes(id)){
      await supabase.from('project_technologies').delete().eq('project_id',project.id).eq('technology_id',id);
    }else{
      await supabase.from('project_technologies').insert({project_id:project.id,technology_id:id,user_id});
    }
    refresh();
  }

  return <>
    <section className="project-hero-v2">
      <div className="project-hero-main">
        <div className="project-hero-topline">
          <span className={`status ${project.status}`}>{project.status}</span>
          <span>{project.visibility}</span>
          <span>{project.category||'Uncategorized'}</span>
        </div>

        <h2>{project.name}</h2>
        <p>{project.short_description||'No short description yet.'}</p>

        <div className="project-hero-stats">
          <div><Flag size={14}/><span><b>{project.priority}</b><small>Priority</small></span></div>
          <div><Rocket size={14}/><span><b>{project.progress}%</b><small>Progress</small></span></div>
          <div><CalendarDays size={14}/><span><b>{project.start_date||'—'}</b><small>Started</small></span></div>
          <div><Server size={14}/><span><b>{project.hosting_provider||'—'}</b><small>Hosting</small></span></div>
        </div>
      </div>

      <div className="project-hero-actions">
        {project.github_url&&<a className="secondary compact" href={project.github_url} target="_blank" rel="noreferrer"><Github size={15}/>GitHub</a>}
        {project.live_url&&<a className="primary compact" href={project.live_url} target="_blank" rel="noreferrer">Open live <ExternalLink size={14}/></a>}
        <button className="delete-project-btn" onClick={deleteProject}><Trash2 size={15}/>Delete</button>
      </div>
    </section>

    <nav className="project-tabs" aria-label="Project sections">
      {tabs.map(([key,label])=><button type="button" key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}
    </nav>

    {tab==='overview'&&<div className="project-overview-grid">
      <section className="panel overview-about">
        <div className="panel-title-row"><FileText size={16}/><div><h2>About</h2><p>Project summary and context</p></div></div>
        <p className="prose">{project.full_description||'No detailed description yet.'}</p>
      </section>

      <section className="panel overview-progress">
        <div className="panel-title-row"><Rocket size={16}/><div><h2>Progress</h2><p>Current completion</p></div></div>
        <div className="progress-display"><strong>{project.progress}%</strong><span>{project.status}</span></div>
        <div className="progress large"><i style={{width:`${project.progress}%`}}/></div>
      </section>

      <section className="panel overview-meta">
        <div className="panel-title-row"><CalendarDays size={16}/><div><h2>Project details</h2><p>Planning and delivery</p></div></div>
        <dl>
          <dt>Start date</dt><dd>{project.start_date||'—'}</dd>
          <dt>Target date</dt><dd>{project.target_date||'—'}</dd>
          <dt>Hosting</dt><dd>{project.hosting_provider||'—'}</dd>
          <dt>Visibility</dt><dd>{project.visibility}</dd>
        </dl>
      </section>

      <section className="panel overview-links">
        <div className="panel-title-row"><Link2 size={16}/><div><h2>Primary links</h2><p>Connected project destinations</p></div></div>
        <div className="quick-links">
          {project.github_url&&<a href={project.github_url} target="_blank" rel="noreferrer"><Github size={15}/><span>GitHub repository</span><ExternalLink size={13}/></a>}
          {project.live_url&&<a href={project.live_url} target="_blank" rel="noreferrer"><Rocket size={15}/><span>Live project</span><ExternalLink size={13}/></a>}
          {project.docs_url&&<a href={project.docs_url} target="_blank" rel="noreferrer"><FileText size={15}/><span>Documentation</span><ExternalLink size={13}/></a>}
          {!project.github_url&&!project.live_url&&!project.docs_url&&<div className="mini-empty">No primary links added yet.</div>}
        </div>
      </section>
    </div>}

    {tab==='milestones'&&<Collection title="Milestones" subtitle="Important delivery checkpoints" fields={[['title','Milestone'],['due_date','Due date','date']]} onAdd={x=>add('project_milestones',{title:x.title,due_date:x.due_date||null})}>
      {props.milestones.map(m=><div className="listrow" key={m.id}>
        <button className="iconbtn" onClick={()=>toggleMilestone(m)}>{m.completed?<CheckCircle2/>:<Circle/>}</button>
        <div><b>{m.title}</b><small>{m.due_date||'No target date'}</small></div>
        <button className="iconbtn push" onClick={()=>del('project_milestones',m.id)}><Trash2/></button>
      </div>)}
    </Collection>}

    {tab==='updates'&&<Collection title="Releases & updates" subtitle="Manual updates and release notes" fields={[['title','Update title'],['version','Version'],['body','What changed?']]} onAdd={x=>add('project_updates',x)}>
      {props.updates.map(u=><div className="feed" key={u.id}>
        <span>{u.version||'Update'}</span>
        <div><b>{u.title}</b><p>{u.body}</p><small>{new Date(u.created_at).toLocaleString()}</small></div>
        <button className="iconbtn push" onClick={()=>del('project_updates',u.id)}><Trash2/></button>
      </div>)}
    </Collection>}

    {tab==='deployments'&&<Collection title="Deployments" subtitle="Production and preview deployment history" fields={[
      ['provider','Provider'],['environment','Environment'],['status','Status: ready/building/failed/unknown'],['url','Deployment URL','url'],['version','Version']
    ]} onAdd={x=>add('project_deployments',{...x,status:['ready','building','failed','unknown'].includes(x.status)?x.status:'unknown',deployed_at:new Date().toISOString()})}>
      {props.deployments.map(d=><div className="listrow" key={d.id}>
        <div><b>{d.provider} · {d.environment}</b><small>{d.status} · {d.version||'no version'} · {d.deployed_at?new Date(d.deployed_at).toLocaleString():''}</small>{d.url&&<a href={d.url} target="_blank" rel="noreferrer">{d.url}</a>}</div>
        <button className="iconbtn push" onClick={()=>del('project_deployments',d.id)}><Trash2/></button>
      </div>)}
    </Collection>}

    {tab==='docs'&&<section className="panel docs-panel">
      <div className="panel-title-row"><FileText size={16}/><div><h2>Project documentation</h2><p>Architecture, setup and environment references</p></div></div>
      <div className="docs-grid">
        <article><span>ARCHITECTURE</span><p>{project.architecture_notes||'Add architecture notes from Edit.'}</p></article>
        <article><span>SETUP</span><p>{project.setup_notes||'Add setup instructions from Edit.'}</p></article>
        <article><span>ENVIRONMENT</span><p>{project.environment_notes||'Document environment-variable names only; never secret values.'}</p></article>
      </div>
      {project.docs_url&&<a className="secondary compact" href={project.docs_url} target="_blank" rel="noreferrer">Open documentation <ExternalLink size={14}/></a>}
    </section>}

    {tab==='secrets'&&<Collection title="Secret references" subtitle="References only — never store secret values" fields={[
      ['name','Variable name, e.g. OPENAI_API_KEY'],['location','Stored in, e.g. Vercel'],['notes','Notes (never secret value)']
    ]} onAdd={x=>add('project_secret_refs',x)}>
      {props.secrets.map(x=><div className="listrow" key={x.id}><div><b>{x.name}</b><small>{x.location} · {x.notes||'No notes'}</small></div><button className="iconbtn push" onClick={()=>del('project_secret_refs',x.id)}><Trash2/></button></div>)}
    </Collection>}

    {tab==='notes'&&<Collection title="Notes" subtitle="Project-specific notes and reminders" fields={[['title','Note title'],['content','Note content']]} onAdd={x=>add('project_notes',x)}>
      {props.notes.map(n=><div className="feed" key={n.id}><div><b>{n.title}</b><p>{n.content}</p></div><button className="iconbtn push" onClick={()=>del('project_notes',n.id)}><Trash2/></button></div>)}
    </Collection>}

    {tab==='links'&&<Collection title="Links" subtitle="Useful project destinations" fields={[['label','Label'],['url','https://…','url'],['kind','Type']]} onAdd={x=>add('project_links',x)}>
      {props.links.map(l=><div className="listrow" key={l.id}><a href={l.url} target="_blank" rel="noreferrer"><b>{l.label}</b><small>{l.kind} · {l.url}</small></a><button className="iconbtn push" onClick={()=>del('project_links',l.id)}><Trash2/></button></div>)}
    </Collection>}

    {tab==='files'&&<section className="panel">
      <div className="panel-head">
        <div><h2>Files</h2><p>Private Supabase Storage bucket</p></div>
        <label className="primary compact upload"><Upload size={15}/>{busy?'Uploading…':'Upload file'}<input type="file" disabled={busy} onChange={upload}/></label>
      </div>
      <div className="collection">
        {props.files.map(f=><div className="listrow" key={f.id}><div><b>{f.name}</b><small>{f.mime_type||'file'} · {f.size_bytes?Math.round(f.size_bytes/1024)+' KB':''}</small></div><button className="iconbtn push" onClick={async()=>{await supabase.storage.from('project-files').remove([f.path]);await del('project_files',f.id)}}><Trash2/></button></div>)}
        {!props.files.length&&<div className="mini-empty">No files uploaded yet.</div>}
      </div>
    </section>}

    {tab==='technology'&&<section className="panel">
      <div className="panel-title-row"><Code2 size={16}/><div><h2>Technology stack</h2><p>Select technologies used by this project</p></div></div>
      <div className="chips">{props.technologies.map(t=><button key={t.id} onClick={()=>assignTech(t.id)} className={props.assignedTech.includes(t.id)?'chip selected':'chip'}>{t.name}<small>{t.category}</small></button>)}</div>
    </section>}

    {tab==='edit'&&<ProjectForm project={project}/>}
  </>;
}

function Collection({
  title,subtitle,fields,onAdd,children
}:{
  title:string;
  subtitle?:string;
  fields:string[][];
  onAdd:(x:any)=>void;
  children:React.ReactNode
}){
  const [value,setValue]=useState<Record<string,string>>({});
  return <section className="panel collection-panel">
    <div className="panel-head"><div><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div></div>
    <form className="inline-form" onSubmit={e=>{
      e.preventDefault();
      if(!value[fields[0][0]])return;
      onAdd(value);
      setValue({});
    }}>
      {fields.map(([key,placeholder,type])=><input key={key} type={type||'text'} placeholder={placeholder} value={value[key]||''} onChange={e=>setValue({...value,[key]:e.target.value})}/>)}
      <button className="primary compact"><Plus size={15}/>Add</button>
    </form>
    <div className="collection">{children}</div>
  </section>;
}