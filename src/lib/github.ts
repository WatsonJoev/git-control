import { supabase } from "@/integrations/supabase/client";

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  description: string | null;
  html_url: string;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}

export interface Collaborator {
  id: number;
  login: string;
  avatar_url: string;
  permissions: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
  role_name?: string;
}

export interface AggregatedUser {
  id: number;
  login: string;
  avatar_url: string;
  repos: {
    name: string;
    full_name: string;
    owner: string;
    permissions: {
      admin: boolean;
      push: boolean;
      pull: boolean;
    };
  }[];
}

export interface Invitation {
  id: number;
  invitee: {
    login: string;
    avatar_url: string;
  };
  permissions: string;
  created_at: string;
}

export async function getGitHubAuthUrl(userId: string, redirectUri: string) {
  const { data, error } = await supabase.functions.invoke('github-oauth', {
    body: { action: 'get_auth_url', user_id: userId, redirect_uri: redirectUri },
  });

  if (error) throw error;
  return data.url;
}

export async function exchangeCodeForToken(code: string, userId: string, redirectUri: string) {
  const { data, error } = await supabase.functions.invoke('github-oauth', {
    body: { action: 'exchange_code', code, user_id: userId, redirect_uri: redirectUri },
  });

  if (error) throw error;
  return data;
}

export async function listRepositories(userId: string): Promise<Repository[]> {
  const { data, error } = await supabase.functions.invoke('github-api', {
    body: { action: 'list_repos', user_id: userId },
  });

  if (error) throw error;
  return data.repos;
}

export async function listCollaborators(userId: string, owner: string, repo: string) {
  const { data, error } = await supabase.functions.invoke('github-api', {
    body: { action: 'list_collaborators', user_id: userId, owner, repo },
  });

  if (error) throw error;
  return {
    collaborators: data.collaborators as Collaborator[],
    invitations: data.invitations as Invitation[],
  };
}

export async function addCollaborator(userId: string, owner: string, repo: string, invitee: string, permission: string = 'push') {
  const { data, error } = await supabase.functions.invoke('github-api', {
    body: { action: 'add_collaborator', user_id: userId, owner, repo, invitee, permission },
  });

  if (error) throw error;
  return data;
}

export async function removeCollaborator(userId: string, owner: string, repo: string, username: string) {
  const { data, error } = await supabase.functions.invoke('github-api', {
    body: { action: 'remove_collaborator', user_id: userId, owner, repo, username },
  });

  if (error) throw error;
  return data;
}

export async function getGitHubToken(userId: string) {
  const { data, error } = await supabase
    .from('github_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function disconnectGitHub(userId: string) {
  const { error } = await supabase
    .from('github_tokens')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

export async function listAllCollaborators(userId: string, repos: Repository[]): Promise<AggregatedUser[]> {
  const userMap = new Map<string, AggregatedUser>();

  // Fetch collaborators for each repo in parallel (batch of 5 to avoid rate limiting)
  const batchSize = 5;
  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map(async (repo) => {
        try {
          const { collaborators } = await listCollaborators(userId, repo.owner.login, repo.name);
          return { repo, collaborators };
        } catch {
          return { repo, collaborators: [] };
        }
      })
    );

    for (const { repo, collaborators } of results) {
      for (const collab of collaborators) {
        const existing = userMap.get(collab.login);
        const repoInfo = {
          name: repo.name,
          full_name: repo.full_name,
          owner: repo.owner.login,
          permissions: collab.permissions,
        };

        if (existing) {
          existing.repos.push(repoInfo);
        } else {
          userMap.set(collab.login, {
            id: collab.id,
            login: collab.login,
            avatar_url: collab.avatar_url,
            repos: [repoInfo],
          });
        }
      }
    }
  }

  return Array.from(userMap.values()).sort((a, b) => b.repos.length - a.repos.length);
}

export async function removeCollaboratorFromAllRepos(
  userId: string,
  username: string,
  repos: { owner: string; name: string }[]
): Promise<{ success: string[]; failed: string[] }> {
  const success: string[] = [];
  const failed: string[] = [];

  // Remove from repos sequentially to avoid rate limiting
  for (const repo of repos) {
    try {
      await removeCollaborator(userId, repo.owner, repo.name, username);
      success.push(`${repo.owner}/${repo.name}`);
    } catch {
      failed.push(`${repo.owner}/${repo.name}`);
    }
  }

  return { success, failed };
}
