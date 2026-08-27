import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { parseGitHubRepo, syncGitHubTimeline } from '@/lib/github/sync';

type GitHubRepository = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  homepage: string | null;
  archived: boolean;
  created_at: string;
  topics?: string[];
};

function githubHeaders() {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'github-project';
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const allowed = process.env.PROJECTOS_ADMIN_EMAIL?.trim().toLowerCase();
  if (allowed && user.email?.toLowerCase() !== allowed) {
    await supabase.auth.signOut();
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const parsed = parseGitHubRepo(body.url);
  if (!parsed) return NextResponse.json({ error: 'Enter a valid GitHub repository URL' }, { status: 400 });

  const canonicalUrl = `https://github.com/${parsed.owner}/${parsed.repo}`;
  const { data: existing } = await supabase
    .from('projects')
    .select('id,github_url')
    .eq('user_id', user.id)
    .ilike('github_url', `%github.com/${parsed.owner}/${parsed.repo}%`)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: 'This repository is already in ProjectOS', projectId: existing.id }, { status: 409 });
  }

  const repoResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}`, {
    headers: githubHeaders(),
    cache: 'no-store',
  });
  if (!repoResponse.ok) {
    if (repoResponse.status === 404) {
      return NextResponse.json({ error: 'Repository not found or your GitHub token cannot access it' }, { status: 404 });
    }
    return NextResponse.json({ error: `GitHub API returned ${repoResponse.status}` }, { status: 502 });
  }
  const repo = await repoResponse.json() as GitHubRepository;

  const languageResponse = await fetch(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/languages`, {
    headers: githubHeaders(),
    cache: 'no-store',
  });
  const languages = languageResponse.ok ? Object.keys(await languageResponse.json() as Record<string, number>) : [];

  const baseSlug = slugify(repo.name);
  let slug = baseSlug;
  for (let suffix = 2; suffix < 100; suffix++) {
    const { data: collision } = await supabase.from('projects').select('id').eq('user_id', user.id).eq('slug', slug).maybeSingle();
    if (!collision) break;
    slug = `${baseSlug}-${suffix}`;
  }

  const { data: project, error: projectError } = await supabase.from('projects').insert({
    user_id: user.id,
    name: repo.name,
    slug,
    short_description: repo.description,
    full_description: repo.description,
    category: 'GitHub',
    status: repo.archived ? 'completed' : 'development',
    priority: 'medium',
    progress: repo.archived ? 100 : 0,
    github_url: repo.html_url || canonicalUrl,
    live_url: repo.homepage || null,
    visibility: 'private',
    featured: false,
    start_date: repo.created_at ? repo.created_at.slice(0, 10) : null,
  }).select('id').single();

  if (projectError || !project) {
    return NextResponse.json({ error: projectError?.message || 'Could not create project' }, { status: 500 });
  }

  const technologyNames = Array.from(new Set([...languages, ...(repo.topics ?? [])])).slice(0, 20);
  for (const name of technologyNames) {
    const category = languages.includes(name) ? 'language' : 'github-topic';
    const { data: technology } = await supabase.from('technologies')
      .upsert({ user_id: user.id, name, category }, { onConflict: 'user_id,name' })
      .select('id').single();
    if (technology) {
      await supabase.from('project_technologies').upsert({
        project_id: project.id,
        technology_id: technology.id,
        user_id: user.id,
      }, { onConflict: 'project_id,technology_id', ignoreDuplicates: true });
    }
  }

  await supabase.from('activity_logs').insert({
    user_id: user.id,
    project_id: project.id,
    action: 'project.imported.github',
    details: { repository: repo.full_name },
  });

  let timeline = null;
  try {
    timeline = await syncGitHubTimeline(supabase, user.id, { limitPerRepo: 30 });
  } catch {
    // The project import remains successful even when timeline synchronization is temporarily unavailable.
  }

  return NextResponse.json({ projectId: project.id, repository: repo.full_name, timeline });
}
