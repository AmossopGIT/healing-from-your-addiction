export function CmsSyncStatus() {
  return (
    <div className="dashboard-panel cms-sync-status">
      <h2>Static content sync</h2>
      <p>
        Live blog posts and case studies from TypeScript content files sync into Supabase automatically on each deploy
        via <code>npm run cms:backfill</code> (runs in <code>prebuild</code>). Insert-missing mode preserves existing CMS
        rows and drafts.
      </p>
      <p className="cms-inline-status">
        Last sync: runs on deploy · requires <code>SUPABASE_SERVICE_ROLE_KEY</code> on the build host (never exposed to
        the browser).
      </p>
    </div>
  );
}
