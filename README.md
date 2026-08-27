# ProjectOS — Personal Project Dashboard

A private, deployment-ready personal project database built with Next.js, TypeScript and Supabase.

## Included
- Supabase email/password authentication
- Google and GitHub OAuth hooks
- Protected application routes
- PostgreSQL relational project database
- Row Level Security for all private user data
- Main dashboard project previews
- Project create/edit/delete
- Project status, priority, progress, visibility and featured state
- Tasks and milestones
- Releases / project updates and timeline
- Notes and custom links
- Private Supabase Storage file uploads
- Technology catalog and per-project technology assignment
- Search and status filtering
- Cross-project task board
- Analytics overview
- Profile/settings
- Public project page for projects marked `public`
- Responsive desktop/mobile UI

## Setup
1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env.local`.
4. Paste the Project URL and anon/publishable key from Supabase.
5. Run `npm install` then `npm run dev`.
6. For OAuth, enable Google/GitHub in Supabase Authentication > Providers and add `http://localhost:3000/auth/callback` plus your production callback URL.

## Deploy to Vercel
Import the repository into Vercel, add the three variables from `.env.example`, and deploy. Add the Vercel callback URL in Supabase Auth URL configuration.

## Security notes
Never store passwords, API secrets, service-role keys, private tokens or `.env` contents in project notes. Store secret *names/references* here and keep actual secrets in Vercel/Supabase/GitHub secret managers.
