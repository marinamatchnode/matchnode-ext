const SUPABASE_URL = 'https://jppksimkphonnlsxkxxv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwcGtzaW1rcGhvbm5sc3hreHh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTgxMTMzMjksImV4cCI6MjAzMzY4OTMyOX0.WHyIIGuIT2ooJaWwGeQ6a9-oKiYLbawwNli3o301Xz8';

async function sbFetch(table, params = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}`, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  return res.json();
}

// Fetch active clients, ordered by name
async function getActiveClients() {
  return sbFetch('clients_new', 'active=eq.true&select=id,client_name,account_manager,media_buyer,creative_designer&order=client_name.asc');
}

// Fetch a single client by their Google Chat channel/space ID
async function getClientByGChatId(gchatId) {
  const results = await sbFetch('clients_new', `gchat_channel_id=eq.${encodeURIComponent(gchatId)}&select=*&limit=1`);
  return results[0] || null;
}

// Fetch all active teammates (for edit-panel dropdowns)
async function getActiveTeammates() {
  return sbFetch('teammates', 'active=eq.true&select=email,full_name,department&order=full_name.asc');
}

// Update a client record by id
async function updateClient(id, fields) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/clients_new?id=eq.${id}`, {
    method: 'PATCH',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) throw new Error(`Update failed: ${res.status}`);
  return res.json();
}

// Fetch full names for a list of emails from the teammates table
async function getTeammateNames(emails) {
  const filtered = emails.filter(Boolean);
  if (!filtered.length) return {};
  const params = filtered.map(e => `email=eq.${encodeURIComponent(e)}`).join('&');
  const rows = await sbFetch('teammates', `or=(${filtered.map(e => `email.eq.${encodeURIComponent(e)}`).join(',')})&select=email,full_name`);
  return Object.fromEntries(rows.map(r => [r.email, r.full_name]));
}
