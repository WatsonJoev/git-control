import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Shield, 
  Zap, 
  GitBranch, 
  Lock, 
  BarChart3, 
  ArrowRight,
  Sparkles,
  Globe,
  Puzzle
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const features = [
  {
    icon: Users,
    title: 'Team Management',
    description: 'Easily manage collaborators across all your repositories with a unified dashboard.',
  },
  {
    icon: Shield,
    title: 'Secure OAuth',
    description: 'Enterprise-grade security with encrypted tokens and secure GitHub OAuth integration.',
  },
  {
    icon: Zap,
    title: 'Instant Actions',
    description: 'Add or remove collaborators in seconds with real-time updates and notifications.',
  },
  {
    icon: GitBranch,
    title: 'Multi-Repo Control',
    description: 'Manage access across multiple repositories from a single, intuitive interface.',
  },
  {
    icon: BarChart3,
    title: 'Access Analytics',
    description: 'Track collaborator activity and permissions with detailed analytics and insights.',
  },
  {
    icon: Lock,
    title: 'Permission Control',
    description: 'Fine-grained permission management with role-based access control.',
  },
];

export function LandingPage() {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async (isSignUp: boolean) => {
    try {
      const validation = authSchema.safeParse({ email, password });
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      setLoading(true);
      const { error } = isSignUp
        ? await signUpWithEmail(email, password)
        : await signInWithEmail(email, password);

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('This email is already registered. Please sign in instead.');
        } else {
          toast.error(error.message);
        }
      } else if (isSignUp) {
        toast.success('Account created! You can now sign in.');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col bg-gradient-subtle">
      {/* Background pattern */}
      <div className="fixed inset-0 bg-dot-pattern opacity-50 pointer-events-none" />
      
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CollabManager" className="h-10 w-10" />
            <span className="font-semibold text-xl font-mono text-gradient">CollabManager</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Free & Open Source</span>
          </div>
        </div>
      </header>

      <main className="flex-1 relative">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
                <Puzzle className="h-4 w-4 text-primary" />
                <span className="text-primary font-medium">Simplified Collaboration</span>
              </div>
              
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                  Manage GitHub
                  <span className="block text-gradient">Collaborators</span>
                  with Confidence
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Streamline your team's access management with a powerful, intuitive dashboard. 
                  Control permissions, track activity, and collaborate seamlessly across all your repositories.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg golden-border bg-card/50 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg golden-border bg-card/50 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg golden-border bg-card/50 text-sm">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Open Source</span>
                </div>
              </div>
            </div>

            {/* Auth Card */}
            <div className="w-full animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Card className="border-border/50 shadow-golden-lg glass-effect">
                <CardHeader className="text-center space-y-4 pb-6">
                  <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-golden flex items-center justify-center shadow-golden animate-glow">
                    <img src="/logo.png" alt="CollabManager" className="h-12 w-12" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">Get Started</CardTitle>
                    <CardDescription className="text-base mt-2">
                      Sign in or create an account to start managing your GitHub collaborators
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                      <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign In</TabsTrigger>
                      <TabsTrigger value="signup" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password" className="text-sm font-medium">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <Button
                        className="w-full h-12 mt-6 bg-gradient-golden hover:opacity-90 text-primary-foreground font-semibold shadow-golden transition-all duration-300"
                        onClick={() => handleAuth(false)}
                        disabled={loading}
                      >
                        {loading ? 'Signing in...' : (
                          <>
                            Sign In
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    <TabsContent value="signup" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signup-email" className="text-sm font-medium">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password" className="text-sm font-medium">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-12 bg-background/50 border-border/50 focus:border-primary focus:ring-primary"
                        />
                      </div>
                      <Button
                        className="w-full h-12 mt-6 bg-gradient-golden hover:opacity-90 text-primary-foreground font-semibold shadow-golden transition-all duration-300"
                        onClick={() => handleAuth(true)}
                        disabled={loading}
                      >
                        {loading ? 'Creating account...' : (
                          <>
                            Create Account
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center space-y-4 mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You <span className="text-gradient">Need</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to make GitHub collaboration management effortless
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-border/50 bg-card/50 hover:bg-card/80 golden-border-hover transition-all duration-300 group animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-gradient-golden flex items-center justify-center mb-4 group-hover:shadow-golden transition-shadow duration-300">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <Card className="border-border/50 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
            <div className="absolute inset-0 bg-grid-pattern opacity-30" />
            <CardContent className="p-12 text-center space-y-6 relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-golden shadow-golden-lg animate-glow mb-4">
                <img src="/logo.png" alt="CollabManager" className="h-12 w-12" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get <span className="text-gradient">Started?</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join developers who trust CollabManager to manage their GitHub teams efficiently
              </p>
              <div className="pt-4">
                <Button size="lg" className="h-14 px-10 text-lg bg-gradient-golden hover:opacity-90 text-primary-foreground font-semibold shadow-golden transition-all duration-300">
                  Start Managing Your Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/50 py-8 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-muted-foreground">
              <img src="/logo.png" alt="CollabManager" className="h-8 w-8" />
              <span className="text-sm font-mono text-gradient">CollabManager</span>
            </div>
            <div className="text-center md:text-right text-sm text-muted-foreground space-y-1">
              <p className="flex items-center justify-center md:justify-end gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Secure GitHub OAuth integration
              </p>
              <p>Your tokens are encrypted and secure</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
