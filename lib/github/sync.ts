import type { SupabaseClient } from '@supabase/supabase-js';

type Repo = { owner: string; repo: string };
type Commit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string } | null;
  };
  author?: { login?: string | null } | null;
};

export function parseGitHubRepo(url?: string | null): Repo | null {
  if (!url) return null;
  try {
    const normalized = url.trim().replace(/\.git$/, '');
    const match = normalized.match(/github\.com[/:]([^/]+)\/([^/#?]+)/i);
    if (!match) return null;
    return { owner: match[1], repo: match[2] };
  } catch {
    return null;
  }
}

function commitTitle(message: string) {
  const first = message.split('\n')[0].trim();
  return first || 'GitHub commit';
}

export async function syncGitHubTimeline(
  supabase: SupabaseClient,
  userId: string,
  options: { limitPerRepo?: number } = {},
) {
  const limit = Math.min(Math.max(options.limitPerRepo ?? 30, 1), 100);
  const { data: projects, error: projectError } = await supabase
    .from('projects')
    .select('id,name,github_url,github_synced_at')
    .eq('user_id', userId)
    .not('github_url', 'is', null);

  if (projectError) throw projectError;

  let imported = 0;
  let skipped = 0;
  const errors: string[] = [];
  const token = process.env.GITHUB_TOKEN;

  for (const project of projects ?? []) {
    const parsed = parseGitHubRepo(project.github_url);
    if (!parsed) {
      skipped++;
      continue;
    }

    const endpoint = new URL(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/commits`);
    endpoint.searchParams.set('per_page', String(limit));
    if (project.github_synced_at) endpoint.searchParams.set('since', project.github_synced_at);

    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const text = await response.text();
        errors.push(`${project.name}: GitHub ${response.status} ${text.slice(0, 120)}`);
        continue;
      }

      const commits = (await response.json()) as Commit[];
      if (commits.length) {
        const rows = commits.map((commit) => ({
          project_id: project.id,
          user_id: userId,
          title: commitTitle(commit.commit.message),
          body: commit.commit.message.includes('\n')
            ? commit.commit.message.split('\n').slice(1).join('\n').trim() || null
            : null,
          source: 'github',
          external_id: `github:${parsed.owner}/${parsed.repo}:${commit.sha}`,
          external_url: commit.html_url,
          author_name: commit.author?.login || commit.commit.author?.name || null,
          commit_sha: commit.sha,
          created_at: commit.commit.author?.date || new Date().toISOString(),
        }));

        const { error } = await supabase
          .from('project_updates')
          .upsert(rows, { onConflict: 'project_id,external_id', ignoreDuplicates: true });
        if (error) throw error;
        imported += rows.length;
      }

      await supabase
        .from('projects')
        .update({ github_synced_at: new Date().toISOString() })
        .eq('id', project.id)
        .eq('user_id', userId);
    } catch (error) {
      errors.push(`${project.name}: ${error instanceof Error ? error.message : 'sync failed'}`);
    }
  }

  return { imported, skipped, projects: projects?.length ?? 0, errors };
}
