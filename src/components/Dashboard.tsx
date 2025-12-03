import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, LogOut, Users, UserPlus, UserMinus, RefreshCw, Search, Lock, Unlock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  getGitHubAuthUrl,
  exchangeCodeForToken,
  getGitHubToken,
  disconnectGitHub,
  listRepositories,
  listCollaborators,
  addCollaborator,
  removeCollaborator,
  Repository,
  Collaborator,
  Invitation,
} from '@/lib/github';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState<{ username: string; avatar: string } | null>(null);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCollabs, setLoadingCollabs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inviteUsername, setInviteUsername] = useState('');
  const [invitePermission, setInvitePermission] = useState('push');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    checkGitHubConnection();
    handleOAuthCallback();
  }, [user]);

  const checkGitHubConnection = async () => {
    if (!user) return;
    
    try {
      const token = await getGitHubToken(user.id);
      if (token) {
        setGithubConnected(true);
        setGithubUser({
          username: token.github_username || 'Unknown',
          avatar: token.github_avatar_url || '',
        });
        loadRepositories();
      }
    } catch (error) {
      console.error('Error checking GitHub connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (code && state && user && state === user.id) {
      try {
        const redirectUri = `${window.location.origin}/`;
        const result = await exchangeCodeForToken(code, user.id, redirectUri);
        
        if (result.success) {
          setGithubConnected(true);
          setGithubUser({
            username: result.github_username,
            avatar: result.github_avatar_url,
          });
          toast.success('GitHub connected successfully!');
          window.history.replaceState({}, '', '/');
          loadRepositories();
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to connect GitHub');
      }
    }
  };

  const connectGitHub = async () => {
    if (!user) return;
    
    try {
      const redirectUri = `${window.location.origin}/`;
      const authUrl = await getGitHubAuthUrl(user.id, redirectUri);
      window.location.href = authUrl;
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate GitHub connection');
    }
  };

  const disconnectGitHubAccount = async () => {
    if (!user) return;
    
    try {
      await disconnectGitHub(user.id);
      setGithubConnected(false);
      setGithubUser(null);
      setRepos([]);
      setSelectedRepo(null);
      setCollaborators([]);
      toast.success('GitHub disconnected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect GitHub');
    }
  };

  const loadRepositories = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const repositories = await listRepositories(user.id);
      setRepos(repositories);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load repositories');
    } finally {
      setLoading(false);
    }
  };

  const loadCollaborators = async (repo: Repository) => {
    if (!user) return;
    
    try {
      setLoadingCollabs(true);
      setSelectedRepo(repo);
      const { collaborators, invitations } = await listCollaborators(user.id, repo.owner.login, repo.name);
      setCollaborators(collaborators);
      setInvitations(invitations);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load collaborators');
    } finally {
      setLoadingCollabs(false);
    }
  };

  const handleInvite = async () => {
    if (!user || !selectedRepo || !inviteUsername.trim()) return;
    
    try {
      setInviting(true);
      await addCollaborator(user.id, selectedRepo.owner.login, selectedRepo.name, inviteUsername.trim(), invitePermission);
      toast.success(`Invitation sent to ${inviteUsername}`);
      setInviteUsername('');
      setInviteDialogOpen(false);
      loadCollaborators(selectedRepo);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (username: string) => {
    if (!user || !selectedRepo) return;
    
    try {
      await removeCollaborator(user.id, selectedRepo.owner.login, selectedRepo.name, username);
      toast.success(`Removed ${username} from ${selectedRepo.name}`);
      loadCollaborators(selectedRepo);
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove collaborator');
    }
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !githubConnected) {
    return (
      <div className="min-h-screen gradient-dark flex items-center justify-center">
        <div className="animate-spin text-primary">
          <RefreshCw className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-dark">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-10 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Github className="h-6 w-6 text-primary" />
            <span className="font-semibold">CollabManager</span>
          </div>
          
          <div className="flex items-center gap-4">
            {githubUser && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={githubUser.avatar} />
                  <AvatarFallback>{githubUser.username[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-mono hidden sm:inline">{githubUser.username}</span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => signOut()}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!githubConnected ? (
          <Card className="max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur-sm animate-fade-in">
            <CardHeader className="text-center">
              <Github className="h-12 w-12 mx-auto mb-4 text-primary" />
              <CardTitle>Connect GitHub</CardTitle>
              <CardDescription>
                Connect your GitHub account to manage repository collaborators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="github" className="w-full" onClick={connectGitHub}>
                <Github className="h-5 w-5 mr-2" />
                Connect with GitHub
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                We'll request access to your repositories and organizations
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Repositories Panel */}
            <Card className="lg:col-span-1 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Repositories</CardTitle>
                  <Button variant="ghost" size="icon" onClick={loadRepositories}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search repos..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {loading ? (
                    <div className="p-4 space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No repositories found</p>
                      <p className="text-xs mt-1">Only repos with admin access are shown</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {filteredRepos.map((repo) => (
                        <button
                          key={repo.id}
                          className={`w-full p-4 text-left hover:bg-accent/50 transition-colors ${
                            selectedRepo?.id === repo.id ? 'bg-accent/50' : ''
                          }`}
                          onClick={() => loadCollaborators(repo)}
                        >
                          <div className="flex items-start gap-3">
                            <Avatar className="h-8 w-8 mt-0.5">
                              <AvatarImage src={repo.owner.avatar_url} />
                              <AvatarFallback>{repo.owner.login[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate">{repo.name}</span>
                                {repo.private ? (
                                  <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                                ) : (
                                  <Unlock className="h-3 w-3 text-muted-foreground shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate font-mono">
                                {repo.owner.login}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Collaborators Panel */}
            <Card className="lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {selectedRepo ? (
                        <span className="font-mono">{selectedRepo.full_name}</span>
                      ) : (
                        'Collaborators'
                      )}
                    </CardTitle>
                    <CardDescription>
                      {selectedRepo
                        ? `${collaborators.length} collaborator${collaborators.length !== 1 ? 's' : ''}`
                        : 'Select a repository to view collaborators'}
                    </CardDescription>
                  </div>
                  {selectedRepo && (
                    <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Invite Collaborator</DialogTitle>
                          <DialogDescription>
                            Send an invitation to collaborate on {selectedRepo.full_name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">GitHub Username</label>
                            <Input
                              placeholder="username"
                              value={inviteUsername}
                              onChange={(e) => setInviteUsername(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Permission</label>
                            <Select value={invitePermission} onValueChange={setInvitePermission}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pull">Read</SelectItem>
                                <SelectItem value="push">Write</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleInvite} disabled={inviting || !inviteUsername.trim()}>
                            {inviting ? 'Sending...' : 'Send Invitation'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedRepo ? (
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Select a repository to manage collaborators</p>
                    </div>
                  </div>
                ) : loadingCollabs ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invitations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Pending Invitations</h4>
                        {invitations.map((inv) => (
                          <div
                            key={inv.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-warning/10 border border-warning/20"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={inv.invitee.avatar_url} />
                                <AvatarFallback>{inv.invitee.login[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-mono font-medium">{inv.invitee.login}</span>
                                <Badge variant="outline" className="ml-2 text-xs">
                                  Pending
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      {collaborators.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No collaborators yet</p>
                        </div>
                      ) : (
                        collaborators.map((collab) => (
                          <div
                            key={collab.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={collab.avatar_url} />
                                <AvatarFallback>{collab.login[0]}</AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-mono font-medium">{collab.login}</span>
                                <div className="flex gap-1 mt-0.5">
                                  {collab.permissions.admin && (
                                    <Badge variant="secondary" className="text-xs">Admin</Badge>
                                  )}
                                  {collab.permissions.push && !collab.permissions.admin && (
                                    <Badge variant="secondary" className="text-xs">Write</Badge>
                                  )}
                                  {!collab.permissions.push && collab.permissions.pull && (
                                    <Badge variant="secondary" className="text-xs">Read</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleRemove(collab.login)}
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {githubConnected && (
          <div className="mt-6 text-center">
            <Button variant="outline" size="sm" onClick={disconnectGitHubAccount}>
              Disconnect GitHub
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
