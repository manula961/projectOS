'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, FolderKanban, Clock3, Code2, Files, Settings,
  LogOut, Plus, Github, HeartPulse, Bell, Sparkles, PanelLeftClose
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import CommandPalette from './CommandPalette';

const links = [
  ['/dashboard','Overview',LayoutGrid],
  ['/projects','Projects',FolderKanban],
  ['/github','GitHub',Github],
  ['/timeline','Timeline',Clock3],
  ['/health','Health',HeartPulse],
  ['/notifications','Alerts',Bell],
  ['/technologies','Stack',Code2],
  ['/files','Files',Files],
  ['/settings','Settings',Settings],
] as const;

export default function AppShell({
  children,title,subtitle
}:{children:React.ReactNode,title:string,subtitle?:string}) {
  const path = usePathname();

  async function signout(){
    await createClient().auth.signOut();
    location.href='/login';
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/dashboard" className="brand">
        <span className="brandmark"><Sparkles size={17}/></span>
        <span className="brandcopy"><b>ProjectOS</b><small>personal workspace</small></span>
      </Link>

      <div className="nav-label">Workspace</div>
      <nav className="side-nav">
        {links.map(([href,label,Icon])=>{
          const active = path === href || (href !== '/dashboard' && path.startsWith(href));
          return <Link key={href} href={href} className={active?'active':''}>
            <Icon size={17}/>
            <span>{label}</span>
          </Link>
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-tip">
          <PanelLeftClose size={16}/>
          <span><b>Private workspace</b><small>Single-user access</small></span>
        </div>
        <button className="signout" onClick={signout}><LogOut size={17}/><span>Sign out</span></button>
      </div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="page-heading">
          <span className="page-kicker">PROJECTOS / {title.toUpperCase()}</span>
          <h1>{title}</h1>
          {subtitle&&<p>{subtitle}</p>}
        </div>
        <div className="header-actions">
          <CommandPalette/>
          <Link className="primary compact" href="/projects/new"><Plus size={16}/>New project</Link>
        </div>
      </header>
      <div className="page-content">{children}</div>
    </main>
  </div>
}