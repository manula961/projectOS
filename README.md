# ProjectOS — Personal Project Dashboard

ProjectOS is a private, single-user personal project dashboard built with Next.js, TypeScript and Supabase.

## Single-user security model

ProjectOS has no public signup UI and no social-login buttons. Only the email configured in `PROJECTOS_ADMIN_EMAIL` can access protected dashboard routes. Supabase authentication still validates the password and session, while ProjectOS performs an additional server-side email allowlist check.

For the strongest single-user setup, create exactly one Supabase Auth user and disable new-user signups in Supabase after creating that account.

## Local setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL Editor.
3. In Supabase Authentication, create your one owner account manually.
4. Disable new-user signups in Supabase Authentication settings.
5. Copy `.env.example` to `.env.local`.
6. Fill in the values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
NEXT_PUBLIC_APP_URL=http://localhost:3000
PROJECTOS_ADMIN_EMAIL=your-real-login-email@example.com
```

`PROJECTOS_ADMIN_EMAIL` is server-only and must not be prefixed with `NEXT_PUBLIC_`.

7. Install and run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Vercel environment variables

Add all four variables from `.env.local` to Vercel Project Settings → Environment Variables. Set `NEXT_PUBLIC_APP_URL` to the final production URL, for example `https://projectos.example.com`.

## Supabase Auth configuration

Use Email/Password authentication. Create the single owner account yourself, then disable public new-user registration. Google and GitHub OAuth are not required by this ProjectOS build.

## Important security notes

- Never commit `.env.local`.
- Never expose a Supabase `service_role` key in the frontend.
- Keep the `project-files` storage bucket private.
- Keep Row Level Security enabled.
- Store secret names/references in ProjectOS, not raw API keys or passwords.

## Automatic GitHub timeline import

1. Set each project's **GitHub URL** to a repository URL such as `https://github.com/owner/repository`.
2. Create a GitHub fine-grained personal access token. For private repositories grant read-only access to **Contents** and **Metadata** for only the repositories ProjectOS should read.
3. Add the token to `.env.local` and to Vercel as a server-only environment variable:
   `GITHUB_TOKEN=github_pat_...`
4. If your database already exists, run `supabase/github-timeline-migration.sql` once in Supabase SQL Editor. New databases can simply use the full `supabase/schema.sql`.
5. Open **Timeline**. ProjectOS automatically imports new commits when the Timeline page opens. The **Sync GitHub** button is also available for an immediate manual refresh. Commits are deduplicated by repository + commit SHA.

The GitHub token is never sent to the browser. Public repositories can sync without a token, but a token is recommended to avoid anonymous API rate limits.

## Project status values
ProjectOS uses exactly four project statuses: `idea`, `development`, `deployed`, and `completed`.

For an existing Supabase deployment created from an older schema, run `supabase/status-simplification-migration.sql` once in the Supabase SQL Editor before using the updated app.


## Final feature pack (v3)

ProjectOS now includes:
- Single-user Supabase authentication with server-side admin allowlist
- Project CRUD and the simplified statuses: Idea, Development, Deployed, Completed
- GitHub repository import and automatic commit timeline synchronization
- GitHub Sync Center for stars, branches, issues, PR approximation, releases, language, repo size and last push
- Project health scoring for stale activity, overdue tasks, missing repository/live links and incomplete metadata
- Milestones, releases/updates, notes, links, technologies and private files
- Deployment history tracking
- Architecture/setup/environment documentation
- Secret references (names and storage locations only — never values)
- Global Ctrl/Cmd+K command palette
- Global project search/filtering, public project pages and responsive UI
- PWA manifest for installable-app support

### Existing database upgrade
Run these migrations in order if you are upgrading an existing ProjectOS database:
1. `supabase/github-timeline-migration.sql`
2. `supabase/status-simplification-migration.sql`
3. `supabase/final-features-migration.sql`

For a brand-new Supabase project, run only `supabase/schema.sql`.

### Security
Keep `GITHUB_TOKEN`, `PROJECTOS_ADMIN_EMAIL` and any future provider secrets server-side. Never prefix secret values with `NEXT_PUBLIC_`.


## UI Remodel v4

The interface has been fully rebuilt around a compact developer-command-center design:
- New responsive sidebar/navigation and sticky workspace header
- New overview hero, activity rail, metrics and project library composition
- New project cards and status filtering
- New two-column project editor with sticky state controls
- New single-owner login experience
- Redesigned GitHub, Timeline, Health, Alerts, Technologies, Files and Settings surfaces
- Compact typography, denser information hierarchy and consistent interaction states
- Responsive tablet/mobile navigation with no removed core functionality
- Ctrl/Cmd+K command palette retained
- Analytics, Tasks and Backup remain removed

No database migration is required solely for this UI remodel.


## UI Fix v4.1

This pass fixes the production UI issues visible in the GitHub Sync Center and Project detail workspace:
- GitHub cards no longer overflow or wrap the Open Project action incorrectly
- Repository metadata, metrics, tags, dependencies and README previews use bounded responsive layouts
- Project detail hero has compact GitHub / Live / Delete actions instead of the oversized delete region
- Long project names, repository names, paths and URLs safely truncate or wrap
- Project overview uses a balanced responsive grid
- Tabs remain horizontally usable at narrow widths
- Mobile GitHub and project layouts reflow cleanly
- Removed the CSS `align-items: end` compatibility warning by using `flex-end`
- Existing authentication, GitHub sync/import, project CRUD and database functionality are unchanged

No Supabase migration is required for this UI-only update.
