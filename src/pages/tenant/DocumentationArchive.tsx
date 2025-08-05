import React, { useState, useEffect } from 'react';
import { BarChart3, Book, Bookmark, BookmarkCheck, ChevronDown, ChevronRight, Clock, Calendar, Download, ExternalLink, Home, PlayCircle, Code, GraduationCap, Search, Lightbulb, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator} from '@/components/ui/breadcrumb';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue} from '@/components/ui/select';
// import {
//   DropdownMenuTrigger
// } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Types
interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  items: DocItem[];
  expanded?: boolean;
}

interface DocItem {
  id: string;
  title: string;
  path: string;
  description?: string;
  updated: Date;
  readTime?: string;
  tags?: string[];
  bookmarked?: boolean;
  type?: 'guide' | 'api' | 'tutorial' | 'reference';
}

interface SearchResult {
  item: DocItem;
  section: string;
  relevance: number;
  snippet: string;
}

// Documentation Section Component
const DocSection: React.FC<{
  section: DocSection;
  onToggle: () => void;
  onSelectItem: (item: DocItem) => void;
  selectedItem?: DocItem;
}> = ({ section, onToggle, onSelectItem, selectedItem }) => {
  const Icon = section.icon;

  return (
    <div className="border rounded-lg">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-accent transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <div className="text-left">
            <h3 className="font-medium">{section.title}</h3>
            <p className="text-xs text-muted-foreground">{section.description}</p>
          </div>
        </div>
        {section.expanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {section.expanded && (
        <div className="border-t">
          {section.items.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectItem(item)}
              className={cn(
                "w-full flex items-center justify-between p-3 px-4 hover:bg-accent transition-colors text-left",
                selectedItem?.id === item.id && "bg-accent"
              )}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.title}</span>
                  {item.type && (
                    <Badge variant="outline" className="text-xs">
                      {item.type}
                    </Badge>
                  )}
                  {item.bookmarked && <BookmarkCheck className="h-3 w-3 text-primary" />}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                )}
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Documentation Viewer Component
const DocViewer: React.FC<{ item: DocItem | null }> = ({ item }) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setLoading(true);
      // Simulate loading documentation content
      setTimeout(() => {
        setContent(generateMockContent(item));
        setLoading(false);
      }, 500);
    }
  }, [item]);

  // const __copyCodeBlock = (code: string) => {
  //   navigator.clipboard.writeText(code);
  //   toast({
  //     title: "Copied to clipboard",
  //     description: "Code block copied successfully"});
  // };

  const generateMockContent = (doc: DocItem) => {
    return `
# ${doc.title}

${doc.description || 'Welcome to the documentation for ' + doc.title}

## Overview

This documentation provides comprehensive information about ${doc.title.toLowerCase()}. 
You'll learn how to implement, configure, and optimize this feature for your streaming platform.

## Quick Start

\`\`\`bash
# Install dependencies
npm install @bigfootlive/streaming-sdk

# Initialize the client
npx bigfoot init
\`\`\`

## Configuration

Configure your streaming settings in the \`bigfoot.config.js\` file:

\`\`\`javascript
module.exports = {
  streaming: {
    quality: '1080p',
    bitrate: 6000,
    latency: 'normal'
  },
  features: {
    polls: true,
    qa: true,
    reactions: true
  }
};
\`\`\`

## Best Practices

1. **Performance**: Always use adaptive bitrate streaming for optimal viewer experience
2. **Security**: Enable token authentication for all streams
3. **Analytics**: Track viewer engagement metrics regularly
4. **Scaling**: Use CDN for global content delivery

## API Reference

### Start Stream

\`\`\`http
POST /api/v1/streams/start
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "title": "My Live Stream",
  "quality": "1080p",
  "recordEnabled": true
}
\`\`\`

### Response

\`\`\`json
{
  "streamId": "str_abc123",
  "streamKey": "live_xyz789",
  "ingestUrl": "rtmp://ingest.bigfootlive.io/live",
  "playbackUrl": "https://cdn.bigfootlive.io/str_abc123/index.m3u8"
}
\`\`\`

## Troubleshooting

### Common Issues

**Stream not starting?**
- Check your stream key is correct
- Verify your encoder settings match our requirements
- Ensure your firewall allows RTMP traffic on port 1935

**Poor stream quality?**
- Check your upload bandwidth (minimum 5 Mbps recommended)
- Reduce bitrate or resolution in encoder settings
- Enable adaptive bitrate streaming

## Related Documentation

- [Live Streaming Guide](/docs/streaming/live)
- [Interactive Features](/docs/features/interactive)
- [Analytics & Reporting](/docs/analytics)

---

Last updated: ${doc.updated.toLocaleDateString()}
    `;
  };

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <Book className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a Document</h3>
        <p className="text-sm text-muted-foreground">
          Choose a document from the sidebar to start reading
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tenant/docs">Documentation</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{item.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {item.readTime || '5 min read'}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Updated {item.updated.toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bookmark className="h-4 w-4 mr-2" />
            Bookmark
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open in New Tab
          </Button>
        </div>
      </div>

      {item.tags && (
        <div className="flex items-center gap-2 mb-6">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="prose prose-sm max-w-none dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: marked.parse(content) }} />
      </div>
    </div>
  );
};

// Mock markdown parser (in real app, use a proper markdown parser)
const marked = {
  parse: (content: string) => {
    return content
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*)\*/g, '<em>$1</em>')
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(.+)$/gm, '<p>$1</p>')
      .replace(/<p><\/p>/g, '');
  }
};

// Main Documentation Archive Component
export default function DocumentationArchive() {
  const [selectedItem, setSelectedItem] = useState<DocItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title');

  // Mock documentation structure
  const [docSections, setDocSections] = useState<DocSection[]>([
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Home,
      description: 'Quick start guides and setup',
      expanded: true,
      items: [
        {
          id: 'quickstart',
          title: 'Quick Start Guide',
          path: '/docs/quickstart',
          description: 'Get up and running in 5 minutes',
          updated: new Date('2024-01-15'),
          readTime: '5 min',
          tags: ['beginner', 'setup'],
          type: 'guide'
        },
        {
          id: 'installation',
          title: 'Installation & Setup',
          path: '/docs/installation',
          description: 'Detailed installation instructions',
          updated: new Date('2024-01-10'),
          readTime: '10 min',
          tags: ['setup', 'configuration'],
          type: 'guide'
        },
        {
          id: 'first-stream',
          title: 'Your First Stream',
          path: '/docs/first-stream',
          description: 'Create and manage your first live stream',
          updated: new Date('2024-01-12'),
          readTime: '15 min',
          tags: ['beginner', 'streaming'],
          type: 'tutorial'
        }
      ]
    },
    {
      id: 'streaming',
      title: 'Live Streaming',
      icon: PlayCircle,
      description: 'Everything about live streaming',
      expanded: false,
      items: [
        {
          id: 'stream-setup',
          title: 'Stream Configuration',
          path: '/docs/streaming/setup',
          description: 'Configure encoder settings and stream keys',
          updated: new Date('2024-01-18'),
          readTime: '20 min',
          tags: ['streaming', 'configuration'],
          type: 'guide'
        },
        {
          id: 'obs-guide',
          title: 'OBS Studio Guide',
          path: '/docs/streaming/obs',
          description: 'Stream with OBS Studio',
          updated: new Date('2024-01-17'),
          readTime: '15 min',
          tags: ['streaming', 'obs', 'encoder'],
          type: 'tutorial'
        },
        {
          id: 'rtmp-settings',
          title: 'RTMP Configuration',
          path: '/docs/streaming/rtmp',
          description: 'RTMP server settings and optimization',
          updated: new Date('2024-01-16'),
          readTime: '10 min',
          tags: ['streaming', 'rtmp', 'technical'],
          type: 'reference'
        }
      ]
    },
    {
      id: 'interactive',
      title: 'Interactive Features',
      icon: Zap,
      description: 'Polls, Q&A, reactions, and more',
      expanded: false,
      items: [
        {
          id: 'polls-guide',
          title: 'Creating Polls',
          path: '/docs/interactive/polls',
          description: 'Engage your audience with live polls',
          updated: new Date('2024-01-20'),
          readTime: '8 min',
          tags: ['interactive', 'engagement'],
          type: 'guide',
          bookmarked: true
        },
        {
          id: 'qa-setup',
          title: 'Q&A Sessions',
          path: '/docs/interactive/qa',
          description: 'Moderate and manage Q&A sessions',
          updated: new Date('2024-01-19'),
          readTime: '12 min',
          tags: ['interactive', 'moderation'],
          type: 'guide'
        },
        {
          id: 'reactions-api',
          title: 'Reactions API',
          path: '/docs/interactive/reactions-api',
          description: 'Implement custom reactions',
          updated: new Date('2024-01-18'),
          readTime: '15 min',
          tags: ['interactive', 'api', 'developer'],
          type: 'api'
        }
      ]
    },
    {
      id: 'api',
      title: 'API Reference',
      icon: Code,
      description: 'REST API documentation',
      expanded: false,
      items: [
        {
          id: 'api-overview',
          title: 'API Overview',
          path: '/docs/api/overview',
          description: 'Introduction to the BigfootLive API',
          updated: new Date('2024-01-15'),
          readTime: '10 min',
          tags: ['api', 'developer'],
          type: 'reference'
        },
        {
          id: 'authentication',
          title: 'Authentication',
          path: '/docs/api/auth',
          description: 'API authentication and security',
          updated: new Date('2024-01-14'),
          readTime: '8 min',
          tags: ['api', 'security', 'auth'],
          type: 'reference'
        },
        {
          id: 'endpoints',
          title: 'API Endpoints',
          path: '/docs/api/endpoints',
          description: 'Complete endpoint reference',
          updated: new Date('2024-01-20'),
          readTime: '30 min',
          tags: ['api', 'reference'],
          type: 'api'
        }
      ]
    },
    {
      id: 'analytics',
      title: 'Analytics & Reports',
      icon: BarChart3,
      description: 'Understanding your metrics',
      expanded: false,
      items: [
        {
          id: 'analytics-overview',
          title: 'Analytics Overview',
          path: '/docs/analytics/overview',
          description: 'Understanding viewer metrics',
          updated: new Date('2024-01-17'),
          readTime: '12 min',
          tags: ['analytics', 'metrics'],
          type: 'guide'
        },
        {
          id: 'custom-reports',
          title: 'Custom Reports',
          path: '/docs/analytics/reports',
          description: 'Create and export custom reports',
          updated: new Date('2024-01-16'),
          readTime: '15 min',
          tags: ['analytics', 'reporting'],
          type: 'tutorial'
        }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Topics',
      icon: GraduationCap,
      description: 'Advanced features and optimization',
      expanded: false,
      items: [
        {
          id: 'scaling',
          title: 'Scaling Your Platform',
          path: '/docs/advanced/scaling',
          description: 'Handle millions of viewers',
          updated: new Date('2024-01-19'),
          readTime: '25 min',
          tags: ['advanced', 'scaling', 'infrastructure'],
          type: 'guide'
        },
        {
          id: 'cdn-setup',
          title: 'CDN Configuration',
          path: '/docs/advanced/cdn',
          description: 'Global content delivery setup',
          updated: new Date('2024-01-18'),
          readTime: '20 min',
          tags: ['advanced', 'cdn', 'performance'],
          type: 'guide'
        },
        {
          id: 'security',
          title: 'Security Best Practices',
          path: '/docs/advanced/security',
          description: 'Secure your streaming platform',
          updated: new Date('2024-01-20'),
          readTime: '18 min',
          tags: ['advanced', 'security'],
          type: 'guide',
          bookmarked: true
        }
      ]
    }
  ]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    // Simple search implementation
    const results: SearchResult[] = [];
    docSections.forEach(section => {
      section.items.forEach(item => {
        const titleMatch = item.title.toLowerCase().includes(query.toLowerCase());
        const descMatch = item.description?.toLowerCase().includes(query.toLowerCase());
        const tagMatch = item.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()));
        
        if (titleMatch || descMatch || tagMatch) {
          results.push({
            item,
            section: section.title,
            relevance: titleMatch ? 1 : descMatch ? 0.7 : 0.5,
            snippet: item.description || ''
          });
        }
      });
    });

    results.sort((a, b) => b.relevance - a.relevance);
    setSearchResults(results);
  };

  const toggleSection = (sectionId: string) => {
    setDocSections(sections =>
      sections.map(section =>
        section.id === sectionId
          ? { ...section, expanded: !section.expanded }
          : section
      )
    );
  };

  // const __toggleBookmark = (itemId: string) => {
  //   setDocSections(sections =>
  //     sections.map(section => ({
  //       ...section,
  //       items: section.items.map(item =>
  //         item.id === itemId
  //           ? { ...item, bookmarked: !item.bookmarked }
  //           : item
  //       )
  //     }))
  //   );
  //   toast({
  //     title: "Bookmark Updated",
  //     description: "Document bookmark status changed"});
  // };

  const filteredSections = bookmarkedOnly
    ? docSections.map(section => ({
        ...section,
        items: section.items.filter(item => item.bookmarked)
      })).filter(section => section.items.length > 0)
    : docSections;

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Book className="h-5 w-5" />
              Documentation Archive
            </h2>
            <p className="text-sm text-muted-foreground">
              Comprehensive platform documentation
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={bookmarkedOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
            >
              <Bookmark className="h-3 w-3 mr-1" />
              Bookmarks
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="updated">Updated</SelectItem>
                <SelectItem value="readTime">Read Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        <ScrollArea className="flex-1 p-4">
          {searchQuery && searchResults.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-2">
                {searchResults.length} results for "{searchQuery}"
              </p>
              {searchResults.map((result) => (
                <button
                  key={result.item.id}
                  onClick={() => {
                    setSelectedItem(result.item);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="w-full text-left p-3 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="font-medium text-sm">{result.item.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {result.section} • {result.snippet}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSections.map((section) => (
                <DocSection
                  key={section.id}
                  section={section}
                  onToggle={() => toggleSection(section.id)}
                  onSelectItem={setSelectedItem}
                  selectedItem={selectedItem}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator />

        <div className="p-4">
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Pro Tip</AlertTitle>
            <AlertDescription className="text-xs">
              Press <kbd className="px-1 py-0.5 text-xs bg-muted rounded">Ctrl</kbd> + <kbd className="px-1 py-0.5 text-xs bg-muted rounded">K</kbd> to quickly search docs
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        <DocViewer item={selectedItem} />
      </div>
    </div>
  );
}