import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  LogOut, 
  Users, 
  UserPlus, 
  UserMinus, 
  RefreshCw, 
  Search, 
  Lock, 
  Unlock, 
  AlertCircle,
  GitBranch,
  User,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sparkles,
  UsersRound,
  CheckCircle2,
  XCircle
} from 'lucide-react';
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
  listAllCollaborators,
  removeCollaboratorFromAllRepos,
  addCollaboratorToMultipleRepos,
  Repository,
  Collaborator,
  Invitation,
  AggregatedUser,
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
  
  // Bulk invite state
  const [bulkInviteDialogOpen, setBulkInviteDialogOpen] = useState(false);
  const [bulkInviteUsername, setBulkInviteUsername] = useState('');
  const [bulkInvitePermission, setBulkInvitePermission] = useState('push');
  const [selectedReposForBulk, setSelectedReposForBulk] = useState<Set<number>>(new Set());
  const [bulkInviting, setBulkInviting] = useState(false);
  const [bulkInviteResults, setBulkInviteResults] = useState<{ success: string[]; failed: Array<{ repo: string; error: string }> } | null>(null);
  
  // User-based view state
  const [accessMode, setAccessMode] = useState<'repo' | 'user'>('repo');
  const [aggregatedUsers, setAggregatedUsers] = useState<AggregatedUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [removingUser, setRemovingUser] = useState<string | null>(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [selectedUserToRemove, setSelectedUserToRemove] = useState<AggregatedUser | null>(null);

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
      setAggregatedUsers([]);
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

  const loadAllCollaborators = async () => {
    if (!user || repos.length === 0) return;
    
    try {
      setLoadingUsers(true);
      const users = await listAllCollaborators(user.id, repos);
      setAggregatedUsers(users);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
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

  const handleBulkInvite = async () => {
    if (!user || !bulkInviteUsername.trim() || selectedReposForBulk.size === 0) return;
    
    try {
      setBulkInviting(true);
      setBulkInviteResults(null);
      
      const reposToInvite = repos
        .filter(repo => selectedReposForBulk.has(repo.id))
        .map(repo => ({ owner: repo.owner.login, name: repo.name }));
      
      const results = await addCollaboratorToMultipleRepos(
        user.id,
        bulkInviteUsername.trim(),
        reposToInvite,
        bulkInvitePermission
      );
      
      setBulkInviteResults(results);
      
      if (results.success.length > 0) {
        toast.success(`Successfully invited ${bulkInviteUsername} to ${results.success.length} repository${results.success.length !== 1 ? 'ies' : 'y'}`);
      }
      if (results.failed.length > 0) {
        toast.error(`Failed to invite to ${results.failed.length} repository${results.failed.length !== 1 ? 'ies' : 'y'}`);
      }
      
      // Refresh collaborators if a selected repo was in the list
      if (selectedRepo && selectedReposForBulk.has(selectedRepo.id)) {
        loadCollaborators(selectedRepo);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send bulk invitations');
    } finally {
      setBulkInviting(false);
    }
  };

  const toggleRepoSelection = (repoId: number) => {
    setSelectedReposForBulk(prev => {
      const next = new Set(prev);
      if (next.has(repoId)) {
        next.delete(repoId);
      } else {
        next.add(repoId);
      }
      return next;
    });
  };

  const selectAllRepos = () => {
    setSelectedReposForBulk(new Set(repos.map(r => r.id)));
  };

  const deselectAllRepos = () => {
    setSelectedReposForBulk(new Set());
  };

  const handleRemoveFromAllRepos = async () => {
    if (!user || !selectedUserToRemove) return;
    
    try {
      setRemovingUser(selectedUserToRemove.login);
      const reposToRemove = selectedUserToRemove.repos.map(r => ({
        owner: r.owner,
        name: r.name,
      }));
      
      const { success, failed } = await removeCollaboratorFromAllRepos(user.id, selectedUserToRemove.login, reposToRemove);
      
      if (success.length > 0) {
        toast.success(`Removed ${selectedUserToRemove.login} from ${success.length} repositories`);
      }
      if (failed.length > 0) {
        toast.error(`Failed to remove from ${failed.length} repositories`);
      }
      
      setRemoveDialogOpen(false);
      setSelectedUserToRemove(null);
      loadAllCollaborators();
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove collaborator');
    } finally {
      setRemovingUser(null);
    }
  };

  const toggleUserExpanded = (login: string) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(login)) {
        next.delete(login);
      } else {
        next.add(login);
      }
      return next;
    });
  };

  const openRemoveDialog = (user: AggregatedUser) => {
    setSelectedUserToRemove(user);
    setRemoveDialogOpen(true);
  };

  const filteredRepos = repos.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    repo.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = aggregatedUsers.filter(user =>
    user.login.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  // Load users when switching to user mode
  useEffect(() => {
    if (accessMode === 'user' && aggregatedUsers.length === 0 && repos.length > 0) {
      loadAllCollaborators();
    }
  }, [accessMode, repos]);

  if (loading && !githubConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <RefreshCw className="h-8 w-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background bg-gradient-subtle">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-dot-pattern opacity-30 pointer-events-none" />
      
      <header className="border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CollabManager" className="h-8 w-8" />
            <span className="font-semibold font-mono text-gradient">CollabManager</span>
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
          <Card className="max-w-md mx-auto border-border/50 glass-effect shadow-golden-lg animate-fade-in">
            <CardHeader className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-golden flex items-center justify-center mx-auto mb-4 shadow-golden animate-glow">
                <img src="/logo.png" alt="CollabManager" className="h-12 w-12" />
              </div>
              <CardTitle className="text-2xl">Connect GitHub</CardTitle>
              <CardDescription className="text-base">
                Connect your GitHub account to manage repository collaborators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full h-12 bg-gradient-golden hover:opacity-90 text-primary-foreground font-semibold shadow-golden transition-all duration-300" onClick={connectGitHub}>
                <Sparkles className="h-5 w-5 mr-2" />
                Connect with GitHub
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-4">
                We'll request access to your repositories and organizations
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="animate-fade-in">
            {/* Access Mode Tabs */}
            <Tabs value={accessMode} onValueChange={(v) => setAccessMode(v as 'repo' | 'user')} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger value="repo" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <GitBranch className="h-4 w-4" />
                  Repository Access
                </TabsTrigger>
                <TabsTrigger value="user" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <User className="h-4 w-4" />
                  User Access
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Repo-based View */}
            {accessMode === 'repo' && (
              <div className="space-y-6">
                {/* Bulk Invite Button */}
                <div className="flex justify-end">
                  <Dialog open={bulkInviteDialogOpen} onOpenChange={setBulkInviteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-golden hover:opacity-90 text-primary-foreground shadow-golden">
                        <UsersRound className="h-4 w-4 mr-2" />
                        Bulk Invite
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Bulk Invite Collaborator</DialogTitle>
                        <DialogDescription>
                          Invite a GitHub user to multiple repositories at once
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="flex-1 overflow-y-auto space-y-6 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="bulk-invite-username" className="text-sm font-medium">GitHub Username</Label>
                          <Input
                            id="bulk-invite-username"
                            placeholder="username"
                            value={bulkInviteUsername}
                            onChange={(e) => {
                              setBulkInviteUsername(e.target.value);
                              setBulkInviteResults(null);
                            }}
                            className="h-11"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="bulk-invite-permission" className="text-sm font-medium">Permission Level</Label>
                          <Select value={bulkInvitePermission} onValueChange={setBulkInvitePermission}>
                            <SelectTrigger id="bulk-invite-permission" className="h-11">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pull">Read</SelectItem>
                              <SelectItem value="push">Write</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">Select Repositories</Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={selectAllRepos}
                                disabled={repos.length === 0}
                              >
                                Select All
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={deselectAllRepos}
                                disabled={selectedReposForBulk.size === 0}
                              >
                                Deselect All
                              </Button>
                            </div>
                          </div>
                          <div className="border border-border/50 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                            {repos.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No repositories available
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {repos.map((repo) => (
                                  <div
                                    key={repo.id}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-accent/50 transition-colors"
                                  >
                                    <Checkbox
                                      id={`repo-${repo.id}`}
                                      checked={selectedReposForBulk.has(repo.id)}
                                      onCheckedChange={() => toggleRepoSelection(repo.id)}
                                    />
                                    <label
                                      htmlFor={`repo-${repo.id}`}
                                      className="flex-1 cursor-pointer flex items-center gap-2"
                                    >
                                      <GitBranch className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-mono text-sm">{repo.full_name}</span>
                                      {repo.private && (
                                        <Lock className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {selectedReposForBulk.size} of {repos.length} repository{repos.length !== 1 ? 'ies' : 'y'} selected
                          </p>
                        </div>

                        {bulkInviteResults && (
                          <div className="space-y-3 border-t border-border pt-4">
                            <h4 className="text-sm font-medium">Invitation Results</h4>
                            {bulkInviteResults.success.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-success">
                                  <CheckCircle2 className="h-4 w-4" />
                                  <span className="font-medium">Successfully invited ({bulkInviteResults.success.length})</span>
                                </div>
                                <ScrollArea className="h-24 border border-border/50 rounded p-2">
                                  <div className="space-y-1">
                                    {bulkInviteResults.success.map((repo) => (
                                      <div key={repo} className="text-xs font-mono text-muted-foreground">
                                        {repo}
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}
                            {bulkInviteResults.failed.length > 0 && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                  <XCircle className="h-4 w-4" />
                                  <span className="font-medium">Failed ({bulkInviteResults.failed.length})</span>
                                </div>
                                <ScrollArea className="h-24 border border-border/50 rounded p-2">
                                  <div className="space-y-1">
                                    {bulkInviteResults.failed.map((item, idx) => (
                                      <div key={idx} className="text-xs">
                                        <span className="font-mono">{item.repo}</span>
                                        <span className="text-muted-foreground ml-2">- {item.error}</span>
                                      </div>
                                    ))}
                                  </div>
                                </ScrollArea>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setBulkInviteDialogOpen(false);
                            setBulkInviteUsername('');
                            setSelectedReposForBulk(new Set());
                            setBulkInviteResults(null);
                          }}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={handleBulkInvite}
                          disabled={bulkInviting || !bulkInviteUsername.trim() || selectedReposForBulk.size === 0}
                          className="bg-gradient-golden hover:opacity-90 text-primary-foreground"
                        >
                          {bulkInviting ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Inviting...
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Invite to {selectedReposForBulk.size} Repository{selectedReposForBulk.size !== 1 ? 'ies' : 'y'}
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Repositories Panel */}
                  <Card className="lg:col-span-1 border-border/50 glass-effect">
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
                        <div className="divide-y divide-border">
                          {filteredRepos.map((repo) => (
                            <button
                              key={repo.id}
                              className={`w-full p-4 text-left hover:bg-primary/10 transition-all duration-200 ${
                                selectedRepo?.id === repo.id ? 'bg-primary/15 border-l-2 border-primary' : ''
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
                <Card className="lg:col-span-2 border-border/50 glass-effect">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Users className="h-5 w-5" />
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
                            <Button size="sm" className="bg-gradient-golden hover:opacity-90 text-primary-foreground shadow-golden">
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
                              <Button onClick={handleInvite} disabled={inviting || !inviteUsername.trim()} className="bg-gradient-golden hover:opacity-90 text-primary-foreground">
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
                                className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border"
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
                                className="flex items-center justify-between p-3 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-200"
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
              </div>
            )}

            {/* User-based View */}
            {accessMode === 'user' && (
              <Card className="border-border/50 glass-effect">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Collaborators
                      </CardTitle>
                      <CardDescription>
                        {aggregatedUsers.length} unique collaborator{aggregatedUsers.length !== 1 ? 's' : ''} across {repos.length} repositories
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={loadAllCollaborators} disabled={loadingUsers}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${loadingUsers ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      className="pl-9"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingUsers ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>No collaborators found</p>
                      <p className="text-sm mt-1">Collaborators will appear here once they have access to your repos</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredUsers.map((aggUser) => {
                        const isExpanded = expandedUsers.has(aggUser.login);
                        return (
                          <div key={aggUser.login} className="border border-border/50 rounded-xl overflow-hidden golden-border-hover transition-all duration-200">
                            <div className="flex items-center justify-between p-4 bg-card/50 hover:bg-primary/5 transition-colors">
                              <button 
                                className="flex items-center gap-3 flex-1 text-left"
                                onClick={() => toggleUserExpanded(aggUser.login)}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={aggUser.avatar_url} />
                                  <AvatarFallback>{aggUser.login[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <span className="font-mono font-medium">{aggUser.login}</span>
                                  <p className="text-sm text-muted-foreground">
                                    Access to {aggUser.repos.length} repositor{aggUser.repos.length !== 1 ? 'ies' : 'y'}
                                  </p>
                                </div>
                              </button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => openRemoveDialog(aggUser)}
                                disabled={removingUser === aggUser.login}
                              >
                                {removingUser === aggUser.login ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                <span className="ml-2 hidden sm:inline">Remove from all</span>
                              </Button>
                            </div>
                            
                            {isExpanded && (
                              <div className="border-t border-border bg-card">
                                <div className="p-4 space-y-2">
                                  <h4 className="text-sm font-medium text-muted-foreground mb-3">Repository Access</h4>
                                  {aggUser.repos.map((repo) => (
                                    <div 
                                      key={repo.full_name}
                                      className="flex items-center justify-between p-2 rounded bg-muted"
                                    >
                                      <div className="flex items-center gap-2">
                                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-mono text-sm">{repo.full_name}</span>
                                      </div>
                                      <Badge variant="secondary" className="text-xs">
                                        {repo.permissions.admin 
                                          ? 'Admin' 
                                          : repo.permissions.push 
                                            ? 'Write' 
                                            : 'Read'}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Remove from All Confirmation Dialog */}
            <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Remove Collaborator from All Repositories</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to remove <strong className="font-mono">{selectedUserToRemove?.login}</strong> from all {selectedUserToRemove?.repos.length} repositories?
                  </DialogDescription>
                </DialogHeader>
                {selectedUserToRemove && (
                  <div className="py-4">
                    <p className="text-sm text-muted-foreground mb-2">This will remove access from:</p>
                    <ScrollArea className="h-40 border border-border rounded-lg">
                      <div className="p-2 space-y-1">
                        {selectedUserToRemove.repos.map((repo) => (
                          <div key={repo.full_name} className="flex items-center gap-2 text-sm p-1">
                            <GitBranch className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono">{repo.full_name}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRemoveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleRemoveFromAllRepos}
                    disabled={removingUser !== null}
                  >
                    {removingUser ? 'Removing...' : 'Remove from All'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {githubConnected && (
          <div className="mt-6 text-center">
            <Button variant="destructive" size="sm" onClick={disconnectGitHubAccount}>
              Disconnect GitHub
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}