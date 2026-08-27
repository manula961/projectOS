import Link from 'next/link';
import { ExternalLink, Github, Star, ArrowUpRight } from 'lucide-react';
import type { Project } from '@/types/project';

export default function ProjectCard({p}:{p:Project}){
  return <article className="project-card">
    <Link href={`/projects/${p.id}`} className="cover" style={p.cover_url?{backgroundImage:`url(${p.cover_url})`}:undefined}>
      <div className="cover-shade"></div>
      <span className={`status ${p.status}`}>{p.status}</span>
      {p.featured&&<span className="featured-chip"><Star size={12} fill="currentColor"/>Featured</span>}
      <div className="cover-monogram">{p.name.slice(0,2).toUpperCase()}</div>
    </Link>
    <div className="project-body">
      <div className="project-title">
        <div><span className="project-category">{p.category||'Project'}</span><h3>{p.name}</h3></div>
        <span className="progress-number">{p.progress}%</span>
      </div>
      <p>{p.short_description||'No description yet.'}</p>
      <div className="progress"><i style={{width:`${p.progress}%`}}/></div>
      <div className="card-footer">
        <Link className="open-link" href={`/projects/${p.id}`}>Open <ArrowUpRight size={14}/></Link>
        <div className="card-actions">
          {p.github_url&&<a aria-label="GitHub repository" href={p.github_url} target="_blank"><Github size={16}/></a>}
          {p.live_url&&<a aria-label="Live project" href={p.live_url} target="_blank"><ExternalLink size={16}/></a>}
        </div>
      </div>
    </div>
  </article>
}