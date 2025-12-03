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
