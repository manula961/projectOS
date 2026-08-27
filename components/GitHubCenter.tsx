'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {
  GitBranch, Star, GitPullRequest, CircleDot, RefreshCw,
  ExternalLink, Package, Github, ArrowUpRight
} from 'lucide-react';

export default function GitHubCenter(){
  const [data,setData]=useState<any[]>([]);
  const [busy,setBusy]=useState(true);
  const [err,setErr]=useState('');

  async function load(){
    setBusy(true);
    setErr('');
    try{
      const response=await fetch('/api/github/overview',{cache:'no-store'});
      const json=await response.json();
      if(!response.ok) throw new Error(json.error||'GitHub request failed');
      setData(json.repositories||[]);
    }catch(error){
      setErr(error instanceof Error?error.message:'Failed to load GitHub data');
    }finally{
      setBusy(false);
    }
  }

  useEffect(()=>{load()},[]);

  return <>
    <section className="github-toolbar">
      <div>
        <span className="section-kicker">CONNECTED REPOSITORIES</span>
        <h2>Repository overview</h2>
        <p>Live metadata, releases, dependencies and repository health from GitHub.</p>
      </div>
      <button className="secondary compact" onClick={load} disabled={busy}>
        <RefreshCw size={15} className={busy?'spin':''}/>
        {busy?'Refreshing…':'Refresh GitHub'}
      </button>
    </section>

    {err&&<div className="notice error">{err}</div>}

    <div className="repo-grid">
      {data.map(repo=><article className="repo-card-v2" key={repo.projectId}>
        <header className="repo-header">
          <div className="repo-logo"><Github size={18}/></div>
          <div className="repo-title">
            <h3>{repo.name}</h3>
            <p>{repo.fullName||repo.error}</p>
          </div>
          {repo.url&&<a className="repo-external" href={repo.url} target="_blank" rel="noreferrer" aria-label="Open GitHub repository"><ExternalLink size={15}/></a>}
        </header>

        {repo.error ? <div className="notice error">{repo.error}</div> : <>
          <div className="repo-metrics-v2">
            <div><Star size={15}/><strong>{repo.stars}</strong><span>Stars</span></div>
            <div><GitBranch size={15}/><strong>{repo.branches}</strong><span>Branches</span></div>
            <div><GitPullRequest size={15}/><strong>{repo.pullsApprox}</strong><span>PRs</span></div>
            <div><CircleDot size={15}/><strong>{repo.openIssues}</strong><span>Issues</span></div>
          </div>

          <div className="repo-tags">
            <span>{repo.language||'No primary language'}</span>
            <span>{repo.defaultBranch||'main'}</span>
            <span>{Math.round((repo.sizeKb||0)/1024*10)/10} MB</span>
          </div>

          {repo.lastRelease&&<a className="release-row-v2" href={repo.lastRelease.url} target="_blank" rel="noreferrer">
            <Package size={15}/>
            <div><b>{repo.lastRelease.name}</b><small>{repo.lastRelease.tag} · {new Date(repo.lastRelease.date).toLocaleDateString()}</small></div>
            <ArrowUpRight size={14}/>
          </a>}

          <div className="repo-expandables">
            {repo.dependencies?.length>0&&<details>
              <summary>Dependencies <span>{repo.dependencies.length}</span></summary>
              <div className="repo-chip-list">{repo.dependencies.map((x:string)=><span key={x}>{x}</span>)}</div>
            </details>}
            {repo.readme&&<details>
              <summary>README preview</summary>
              <pre>{repo.readme}</pre>
            </details>}
          </div>

          <footer className="repo-footer">
            <span>Last push {repo.lastPush?new Date(repo.lastPush).toLocaleString():'—'}</span>
            <Link href={`/projects/${repo.projectId}`}>Open project <ArrowUpRight size={14}/></Link>
          </footer>
        </>}
      </article>)}

      {!busy&&!data.length&&<div className="empty"><b>No connected repositories</b><span>Import a GitHub repository or add a GitHub URL to a project.</span></div>}
    </div>
  </>;
}