'use client';
import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GitHubSyncButton() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function sync() {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/github/sync', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'GitHub sync failed');
      setMessage(data.errors?.length ? `Synced with ${data.errors.length} warning(s)` : 'GitHub timeline synced');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'GitHub sync failed');
    } finally {
      setBusy(false);
    }
  }

  return <div className="github-sync">
    <button type="button" className="secondary compact" onClick={sync} disabled={busy}>
      <RefreshCw size={16} className={busy ? 'spin' : ''}/>{busy ? 'Syncing…' : 'Sync GitHub'}
    </button>
    {message && <small>{message}</small>}
  </div>;
}
