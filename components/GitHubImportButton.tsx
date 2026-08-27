'use client';

import { FormEvent, useState } from 'react';
import { Github, Download, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GitHubImportButton() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function importRepo(event: FormEvent) {
    event.preventDefault();
    const value = url.trim();
    if (!value) return;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: value }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.projectId) {
          router.push(`/projects/${data.projectId}`);
          return;
        }
        throw new Error(data.error || 'Could not import repository');
      }
      setOpen(false);
      setUrl('');
      router.push(`/projects/${data.projectId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not import repository');
    } finally {
      setBusy(false);
    }
  }

  return <>
    <button type="button" className="secondary compact" onClick={() => { setError(''); setOpen(true); }}>
      <Github size={17}/>Import from GitHub
    </button>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.currentTarget === event.target && !busy) setOpen(false);
    }}>
      <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby="github-import-title">
        <div className="panel-head">
          <div>
            <h2 id="github-import-title">Import from GitHub</h2>
            <p>Paste a repository URL. ProjectOS will create the project and import its commit timeline.</p>
          </div>
          <button type="button" className="iconbtn" aria-label="Close" disabled={busy} onClick={() => setOpen(false)}><X/></button>
        </div>
        <form className="github-import-form" onSubmit={importRepo}>
          <label>Repository URL
            <input
              type="url"
              required
              autoFocus
              placeholder="https://github.com/owner/repository"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </label>
          {error && <div className="error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="secondary" disabled={busy} onClick={() => setOpen(false)}>Cancel</button>
            <button type="submit" className="primary" disabled={busy || !url.trim()}>
              <Download size={17}/>{busy ? 'Importing…' : 'Import repository'}
            </button>
          </div>
        </form>
      </section>
    </div>}
  </>;
}
