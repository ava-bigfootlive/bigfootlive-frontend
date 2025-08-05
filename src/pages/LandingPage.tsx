import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  Camera, 
  ArrowRight
} from 'lucide-react';

const LandingPage = () => {

  const features = [
    {
      icon: Camera,
      title: 'Professional Live Streaming',
      description: 'Broadcast high-quality live streams with advanced encoding and adaptive bitrate streaming.',
      details: 'Stream in up to 4K resolution with professional-grade encoding, multi-bitrate streaming, and global CDN delivery.'
    },
    {
      icon: Users,
      title: 'Audience Engagement',
      description: 'Interactive chat, polls, and real-time engagement tools to connect with your viewers.',
      details: 'Build community with moderated chat, live polls, Q&A sessions, and viewer analytics.'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Comprehensive insights into viewer behavior, engagement metrics, and stream performance.',
      details: 'Track viewer demographics, engagement rates, peak viewing times, and revenue metrics.'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade security with encrypted streams, access controls, and compliance features.',
      details: 'End-to-end encryption, role-based access control, audit logs, and compliance certifications.'
    },
    {
      icon: Zap,
      title: 'Instant Scalability',
      description: 'Scale from hundreds to millions of viewers with our cloud-native infrastructure.',
      details: 'Auto-scaling infrastructure, global edge locations, and 99.9% uptime SLA.'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Deliver content worldwide with our distributed edge network and regional optimization.',
      details: 'Multi-region deployment, intelligent routing, and localized content delivery.'
    }
  ];


  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <header>
        <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b z-50" role="navigation" aria-label="Main navigation">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Play className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">BigfootLive</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Link to="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link to="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-br from-background via-background to-muted/20" aria-labelledby="hero-heading">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-6">
              Professional Streaming Platform
            </Badge>
            <h1 id="hero-heading" className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Stream Like a Pro with BigfootLive
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Professional live streaming platform with enterprise-grade features, 
              real-time analytics, and global scalability for creators and businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/login">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Streaming Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Watch Demo
                <Play className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-muted/10" aria-labelledby="features-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold mb-4">
                Everything You Need to Stream Professionally
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Built for creators, trusted by enterprises. Our platform scales with your ambitions.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                >
                  <CardHeader>
                    <feature.icon className="h-12 w-12 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {feature.details}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-muted/10" aria-labelledby="pricing-heading">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 id="pricing-heading" className="text-3xl font-bold mb-4">Pricing Plans</h2>
              <p className="text-xl text-muted-foreground">
                Flexible pricing for creators of all sizes
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <Card className="text-center py-16">
                <CardHeader>
                  <CardTitle className="text-2xl mb-4">Pricing Coming Soon</CardTitle>
                  <CardDescription className="text-lg">
                    We're finalizing our pricing structure to offer the best value for creators and businesses.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      TBD
                    </Badge>
                    <p className="text-muted-foreground max-w-md">
                      Sign up for early access and be the first to know when pricing is announced. 
                      Early adopters will receive exclusive benefits.
                    </p>
                    <Link to="/login">
                      <Button size="lg" className="mt-4">
                        Join Early Access
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 text-center">
            <h2 id="cta-heading" className="text-3xl font-bold mb-4">Ready to Start Streaming?</h2>
            <p className="text-xl mb-8 opacity-90">
              Experience professional live streaming with BigfootLive
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t" role="contentinfo">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Play className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">BigfootLive</span>
              </div>
              <p className="text-muted-foreground">
                Professional streaming platform for creators and businesses worldwide.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 BigfootLive. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
