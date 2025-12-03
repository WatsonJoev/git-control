import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Github, 
  Users, 
  Shield, 
  Zap, 
  GitBranch, 
  Lock, 
  BarChart3, 
  CheckCircle2,
  ArrowRight
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
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github className="h-6 w-6" />
            <span className="font-semibold text-lg">CollabManager</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Secure • Fast • Reliable
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Manage GitHub
                  <span className="block">Collaborators</span>
                  with Confidence
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
                  Streamline your team's access management with a powerful, intuitive dashboard. 
                  Control permissions, track activity, and collaborate seamlessly across all your repositories.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-card text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Free Forever</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-card text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>No Credit Card</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-border bg-card text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Open Source</span>
                </div>
              </div>
            </div>

            {/* Auth Card */}
            <div className="w-full">
              <Card className="border-border shadow-lg">
                <CardHeader className="text-center space-y-2 pb-6">
                  <div className="mx-auto w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Github className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl">Get Started</CardTitle>
                  <CardDescription className="text-base">
                    Sign in or create an account to start managing your GitHub collaborators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="signin" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="signin">Sign In</TabsTrigger>
                      <TabsTrigger value="signup">Sign Up</TabsTrigger>
                    </TabsList>

                    <TabsContent value="signin" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="signin-email">Email</Label>
                        <Input
                          id="signin-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signin-password">Password</Label>
                        <Input
                          id="signin-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <Button
                        className="w-full h-11 mt-6"
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
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <Button
                        className="w-full h-11 mt-6"
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
        <section className="container mx-auto px-4 py-16 lg:py-24 border-t border-border">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need
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
                  className="border-border hover:border-foreground/20 transition-colors"
                >
                  <CardHeader>
                    <div className="w-10 h-10 rounded border border-border bg-muted flex items-center justify-center mb-4">
                      <Icon className="h-5 w-5" />
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
          <Card className="border-border bg-muted/50">
            <CardContent className="p-12 text-center space-y-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-background border border-border mb-4">
                <Github className="h-8 w-8" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Get Started?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of developers who trust CollabManager to manage their GitHub teams
              </p>
              <div className="pt-4">
                <Button size="lg" className="h-12 px-8 text-lg">
                  Start Managing Your Team
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Github className="h-4 w-4" />
              <span className="text-sm">CollabManager</span>
            </div>
            <div className="text-center md:text-right text-sm text-muted-foreground space-y-1">
              <p>Secure GitHub OAuth integration</p>
              <p>Your tokens are encrypted and secure</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}