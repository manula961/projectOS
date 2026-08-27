'use client';
import {useMemo,useState} from 'react';
import ProjectCard from './ProjectCard';
import type {Project} from '@/types/project';
import {Search, SlidersHorizontal} from 'lucide-react';
import GitHubImportButton from './GitHubImportButton';

const statuses=['all','idea','development','deployed','completed'];

export default function DashboardClient({projects}:{projects:Project[]}){
  const [q,setQ]=useState('');
  const [status,setStatus]=useState('all');
  const filtered=useMemo(()=>projects.filter(p=>
    (status==='all'||p.status===status)&&
    (`${p.name} ${p.category||''} ${p.short_description||''}`.toLowerCase().includes(q.toLowerCase()))
  ),[projects,q,status]);

  return <>
    <div className="project-tools">
      <label className="search"><Search size={16}/><input placeholder="Search your projects" value={q} onChange={e=>setQ(e.target.value)}/><kbd>/</kbd></label>
      <div className="status-segment" aria-label="Project status filter">
        {statuses.map(x=><button type="button" key={x} className={status===x?'active':''} onClick={()=>setStatus(x)}>{x}</button>)}
      </div>
      <GitHubImportButton/>
    </div>
    <div className="result-line"><SlidersHorizontal size={13}/><span>{filtered.length} of {projects.length} projects</span></div>
    <div className="project-grid">
      {filtered.map(p=><ProjectCard key={p.id} p={p}/>)}
      {!filtered.length&&<div className="empty"><b>No matching projects</b><span>Try a different search or status.</span></div>}
    </div>
  </>
}