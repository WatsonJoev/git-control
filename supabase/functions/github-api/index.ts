import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decrypt } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

async function getAccessToken(userId: string): Promise<string> {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
  const { data, error } = await supabase
    .from('github_tokens')
    .select('access_token')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new Error('GitHub token not found. Please reconnect your GitHub account.');
  }

  // Decrypt the token before returning
  try {
    const decryptedToken = await decrypt(data.access_token);
    return decryptedToken;
  } catch (decryptError) {
    console.error('Failed to decrypt token:', decryptError);
    throw new Error('Failed to decrypt GitHub token. Please reconnect your GitHub account.');
  }
}

async function githubRequest(endpoint: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`https://api.github.com${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(error.message || `GitHub API error: ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, user_id, owner, repo, username, permission, invitee } = await req.json();
    console.log('GitHub API action:', action);

    const accessToken = await getAccessToken(user_id);

    if (action === 'list_repos') {
      const repos = await githubRequest('/user/repos?per_page=100&affiliation=owner,organization_member&sort=updated', accessToken);
      
      // Filter to only repos where user has admin access
      const adminRepos = repos.filter((r: any) => r.permissions?.admin);
      
      return new Response(JSON.stringify({ repos: adminRepos }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list_collaborators') {
      const collaborators = await githubRequest(`/repos/${owner}/${repo}/collaborators?per_page=100`, accessToken);
      
      // Get pending invitations
      let invitations = [];
      try {
        invitations = await githubRequest(`/repos/${owner}/${repo}/invitations`, accessToken);
      } catch (e) {
        console.log('Could not fetch invitations:', e);
      }

      return new Response(JSON.stringify({ collaborators, invitations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'add_collaborator') {
      await githubRequest(`/repos/${owner}/${repo}/collaborators/${invitee}`, accessToken, {
        method: 'PUT',
        body: JSON.stringify({ permission: permission || 'push' }),
      });

      return new Response(JSON.stringify({ success: true, message: `Invitation sent to ${invitee}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'remove_collaborator') {
      await githubRequest(`/repos/${owner}/${repo}/collaborators/${username}`, accessToken, {
        method: 'DELETE',
      });

      return new Response(JSON.stringify({ success: true, message: `Removed ${username} from ${repo}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'cancel_invitation') {
      const { invitation_id } = await req.json();
      await githubRequest(`/repos/${owner}/${repo}/invitations/${invitation_id}`, accessToken, {
        method: 'DELETE',
      });

      return new Response(JSON.stringify({ success: true, message: 'Invitation cancelled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'get_user_info') {
      const userInfo = await githubRequest('/user', accessToken);
      return new Response(JSON.stringify(userInfo), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('GitHub API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
