import AppShell from '@/components/AppShell';
import GitHubSyncButton from '@/components/GitHubSyncButton';
import { createClient } from '@/lib/supabase/server';
import { syncGitHubTimeline } from '@/lib/github/sync';
import { ExternalLink, GitCommitHorizontal } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function Timeline() {
  const s = await createClient();
  const { data: { user } } = await s.auth.getUser();
  let syncWarnings = 0;

  if (user) {
    const sync = await syncGitHubTimeline(s, user.id).catch(() => null);
    syncWarnings = sync?.errors.length ?? 0;
  }

  const { data = [] } = await s
    .from('project_updates')
    .select('*,projects(name)')
    .order('created_at', { ascending: false })
    .limit(250);

  return <AppShell title="Timeline" subtitle="GitHub commits are imported automatically when this page opens">
    <div className="timeline-toolbar">
      <p>{syncWarnings ? `Automatic sync completed with ${syncWarnings} warning(s).` : 'Automatic GitHub sync is active for every project that has a GitHub URL.'}</p>
      <GitHubSyncButton />
    </div>
    <div className="timeline">
      {(data || []).map((x:any) => <article key={x.id}>
        <time>{new Date(x.created_at).toLocaleDateString()}</time>
        <div>
          <span>{x.projects?.name}</span>
          <h2>{x.title}</h2>
          {x.body && <p>{x.body}</p>}
          <div className="timeline-meta">
            {x.source === 'github' && <b className="source github"><GitCommitHorizontal size={13}/>GitHub{x.commit_sha ? ` · ${x.commit_sha.slice(0,7)}` : ''}</b>}
            {x.version && <b>v{x.version.replace(/^v/, '')}</b>}
            {x.author_name && <small>by {x.author_name}</small>}
            {x.external_url && <a href={x.external_url} target="_blank" rel="noreferrer">Open commit <ExternalLink size={13}/></a>}
          </div>
        </div>
      </article>)}
      {!data?.length && <div className="empty">No timeline activity yet. Add a GitHub URL to a project and reopen Timeline.</div>}
    </div>
  </AppShell>;
}
