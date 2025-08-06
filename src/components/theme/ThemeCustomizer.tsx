import React, { useState, useRef } from 'react';
import { 
  Palette, 
  Type, 
  Layout, 
  Eye, 
  Download, 
  Upload, 
  Save, 
  RotateCcw, 
  Settings,
  Image,
  Brush,
  Monitor,
  Smartphone,
  Tablet,
  Sun,
  Moon,
  Contrast,
  Zap,
  Code,
  Copy,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ColorPalette, ThemeConfig, BrandingSettings } from '@/types/theme';
import { useTheme } from '@/hooks/useTheme';

interface ThemeCustomizerProps {
  className?: string;
  onThemeChange?: (theme: ThemeConfig) => void;
}

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange, label }) => {
  return (
    <div className="flex items-center space-x-3">
      <div className="flex items-center space-x-2">
        <div 
          className="w-8 h-8 rounded border-2 border-border cursor-pointer"
          style={{ backgroundColor: color }}
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'color';
            input.value = color;
            input.onchange = (e) => onChange((e.target as HTMLInputElement).value);
            input.click();
          }}
        />
        <Label className="text-sm font-medium">{label}</Label>
      </div>
      <Input 
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 h-8 text-xs"
        placeholder="#000000"
      />
    </div>
  );
};

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ 
  className = "",
  onThemeChange
}) => {
  const { 
    currentTheme, 
    availableThemes,
    branding,
    updateTheme,
    createCustomTheme,
    exportTheme,
    importTheme,
    resetToDefault,
    updateBranding,
    uploadAsset
  } = useTheme();

  const [customTheme, setCustomTheme] = useState<ThemeConfig>(currentTheme);
  const [customBranding, setCustomBranding] = useState<BrandingSettings>(branding);
  const [activePreview, setActivePreview] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportedTheme, setExportedTheme] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (category: keyof ColorPalette, shade: string | number, color: string) => {
    setCustomTheme(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [category]: typeof prev.colors[category] === 'object' && prev.colors[category] !== null
          ? { ...prev.colors[category], [shade]: color }
          : color
      }
    }));
  };

  const handleTypographyChange = (property: string, value: any) => {
    setCustomTheme(prev => ({
      ...prev,
      typography: {
        ...prev.typography,
        [property]: value
      }
    }));
  };

  const handleComponentChange = (component: string, property: string, value: any) => {
    setCustomTheme(prev => ({
      ...prev,
      components: {
        ...prev.components,
        [component]: {
          ...prev.components[component as keyof typeof prev.components],
          [property]: value
        }
      }
    }));
  };

  const handleBrandingChange = (section: string, field: string, value: any) => {
    setCustomBranding(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleAssetUpload = async (file: File, type: string) => {
    try {
      const url = await uploadAsset(file, type);
      
      if (type === 'logo') {
        setCustomTheme(prev => ({
          ...prev,
          branding: {
            ...prev.branding,
            logo: {
              ...prev.branding.logo,
              primary: url
            }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to upload asset:', error);
    }
  };

  const handleSaveTheme = async () => {
    try {
      if (customTheme.isCustom) {
        await updateTheme(customTheme.id, customTheme);
      } else {
        await createCustomTheme(currentTheme.id, customTheme);
      }
      
      await updateBranding(customBranding);
      onThemeChange?.(customTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const handleExportTheme = async () => {
    try {
      const exported = await exportTheme(customTheme.id);
      setExportedTheme(exported);
      setIsExportOpen(true);
    } catch (error) {
      console.error('Failed to export theme:', error);
    }
  };

  const handleImportTheme = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = await importTheme(text);
      setCustomTheme(imported);
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(exportedTheme);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const generateColorShades = (baseColor: string) => {
    // This is a simplified color generation - in production, use a proper color library
    const shades = {
      50: `${baseColor}0D`,
      100: `${baseColor}1A`,
      200: `${baseColor}33`,
      300: `${baseColor}4D`,
      400: `${baseColor}66`,
      500: baseColor,
      600: `${baseColor}CC`,
      700: `${baseColor}B3`,
      800: `${baseColor}99`,
      900: `${baseColor}80`,
      950: `${baseColor}66`
    };
    
    return shades;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Theme Customizer</h2>
          <p className="text-muted-foreground">
            Customize your platform's appearance and branding
          </p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} className="mr-2" />
            Import
          </Button>
          
          <Button variant="outline" onClick={handleExportTheme}>
            <Download size={16} className="mr-2" />
            Export
          </Button>
          
          <Button variant="outline" onClick={() => resetToDefault()}>
            <RotateCcw size={16} className="mr-2" />
            Reset
          </Button>
          
          <Button onClick={handleSaveTheme}>
            <Save size={16} className="mr-2" />
            Save Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Theme Controls */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="colors" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="colors">
                <Palette size={16} className="mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography">
                <Type size={16} className="mr-2" />
                Typography
              </TabsTrigger>
              <TabsTrigger value="layout">
                <Layout size={16} className="mr-2" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="branding">
                <Image size={16} className="mr-2" />
                Branding
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Code size={16} className="mr-2" />
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Primary Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      color={customTheme.colors.primary[500]}
                      onChange={(color) => {
                        const shades = generateColorShades(color);
                        setCustomTheme(prev => ({
                          ...prev,
                          colors: {
                            ...prev.colors,
                            primary: shades
                          }
                        }));
                      }}
                      label="Primary"
                    />
                    
                    <ColorPicker
                      color={customTheme.colors.secondary[500]}
                      onChange={(color) => {
                        const shades = generateColorShades(color);
                        setCustomTheme(prev => ({
                          ...prev,
                          colors: {
                            ...prev.colors,
                            secondary: shades
                          }
                        }));
                      }}
                      label="Secondary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      color={customTheme.colors.accent[500]}
                      onChange={(color) => {
                        const shades = generateColorShades(color);
                        setCustomTheme(prev => ({
                          ...prev,
                          colors: {
                            ...prev.colors,
                            accent: shades
                          }
                        }));
                      }}
                      label="Accent"
                    />
                    
                    <ColorPicker
                      color={customTheme.colors.background}
                      onChange={(color) => handleColorChange('background', '', color)}
                      label="Background"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Semantic Colors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <ColorPicker
                      color={customTheme.colors.success}
                      onChange={(color) => handleColorChange('success', '', color)}
                      label="Success"
                    />
                    
                    <ColorPicker
                      color={customTheme.colors.warning}
                      onChange={(color) => handleColorChange('warning', '', color)}
                      label="Warning"
                    />
                    
                    <ColorPicker
                      color={customTheme.colors.error}
                      onChange={(color) => handleColorChange('error', '', color)}
                      label="Error"
                    />
                    
                    <ColorPicker
                      color={customTheme.colors.info}
                      onChange={(color) => handleColorChange('info', '', color)}
                      label="Info"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Font Families</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Sans Serif Font</Label>
                    <Select
                      value={customTheme.typography.fontFamily.sans[0]}
                      onValueChange={(value) => 
                        handleTypographyChange('fontFamily', {
                          ...customTheme.typography.fontFamily,
                          sans: [value, ...customTheme.typography.fontFamily.sans.slice(1)]
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Serif Font</Label>
                    <Select
                      value={customTheme.typography.fontFamily.serif[0]}
                      onValueChange={(value) => 
                        handleTypographyChange('fontFamily', {
                          ...customTheme.typography.fontFamily,
                          serif: [value, ...customTheme.typography.fontFamily.serif.slice(1)]
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Georgia">Georgia</SelectItem>
                        <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                        <SelectItem value="Merriweather">Merriweather</SelectItem>
                        <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Font Sizes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Base Font Size</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Slider
                        value={[parseFloat(customTheme.typography.fontSize.base)]}
                        onValueChange={([value]) => 
                          handleTypographyChange('fontSize', {
                            ...customTheme.typography.fontSize,
                            base: `${value}rem`
                          })
                        }
                        max={2}
                        min={0.75}
                        step={0.125}
                        className="flex-1"
                      />
                      <span className="w-16 text-sm">
                        {customTheme.typography.fontSize.base}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Component Styling</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Button Border Radius</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Slider
                        value={[parseFloat(customTheme.components.button.borderRadius)]}
                        onValueChange={([value]) => 
                          handleComponentChange('button', 'borderRadius', `${value}rem`)
                        }
                        max={2}
                        min={0}
                        step={0.125}
                        className="flex-1"
                      />
                      <span className="w-16 text-sm">
                        {customTheme.components.button.borderRadius}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label>Card Border Radius</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      <Slider
                        value={[parseFloat(customTheme.components.card.borderRadius)]}
                        onValueChange={([value]) => 
                          handleComponentChange('card', 'borderRadius', `${value}rem`)
                        }
                        max={2}
                        min={0}
                        step={0.125}
                        className="flex-1"
                      />
                      <span className="w-16 text-sm">
                        {customTheme.components.card.borderRadius}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Company Name</Label>
                      <Input
                        value={customBranding.company.name}
                        onChange={(e) => handleBrandingChange('company', 'name', e.target.value)}
                        placeholder="Acme Corporation"
                      />
                    </div>
                    
                    <div>
                      <Label>Platform Name</Label>
                      <Input
                        value={customBranding.platform.name}
                        onChange={(e) => handleBrandingChange('platform', 'name', e.target.value)}
                        placeholder="Acme Live"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Tagline</Label>
                    <Input
                      value={customBranding.company.tagline || ''}
                      onChange={(e) => handleBrandingChange('company', 'tagline', e.target.value)}
                      placeholder="Your enterprise streaming solution"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={customBranding.company.description || ''}
                      onChange={(e) => handleBrandingChange('company', 'description', e.target.value)}
                      placeholder="Professional live streaming for modern organizations"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Logo & Assets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Primary Logo</Label>
                    <div className="flex items-center space-x-4 mt-2">
                      {customTheme.branding.logo.primary && (
                        <img 
                          src={customTheme.branding.logo.primary} 
                          alt="Logo"
                          className="h-12 w-auto border rounded"
                        />
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleAssetUpload(file, 'logo');
                          };
                          input.click();
                        }}
                      >
                        <Upload size={16} className="mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custom CSS</CardTitle>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label>Additional CSS</Label>
                    <Textarea
                      value={customTheme.customCSS || ''}
                      onChange={(e) => setCustomTheme(prev => ({ ...prev, customCSS: e.target.value }))}
                      placeholder="/* Add your custom CSS here */"
                      rows={10}
                      className="font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Preview</span>
                <div className="flex space-x-2">
                  <Button
                    variant={activePreview === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActivePreview('desktop')}
                  >
                    <Monitor size={16} />
                  </Button>
                  <Button
                    variant={activePreview === 'tablet' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActivePreview('tablet')}
                  >
                    <Tablet size={16} />
                  </Button>
                  <Button
                    variant={activePreview === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActivePreview('mobile')}
                  >
                    <Smartphone size={16} />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`
                border rounded-lg overflow-hidden
                ${activePreview === 'desktop' ? 'aspect-video' : ''}
                ${activePreview === 'tablet' ? 'aspect-[4/3]' : ''}
                ${activePreview === 'mobile' ? 'aspect-[9/16] max-w-xs mx-auto' : ''}
              `}>
                <div 
                  className="h-full w-full bg-background p-4 space-y-4"
                  style={{
                    backgroundColor: customTheme.colors.background,
                    color: customTheme.colors.foreground,
                    fontFamily: customTheme.typography.fontFamily.sans.join(', ')
                  }}
                >
                  {/* Preview Header */}
                  <div 
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: customTheme.colors.primary[500] }}
                  >
                    <h3 
                      className="text-white font-semibold"
                      style={{ fontSize: customTheme.typography.fontSize.lg }}
                    >
                      {customBranding.platform.name}
                    </h3>
                  </div>
                  
                  {/* Preview Card */}
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: customTheme.colors.card,
                      borderColor: customTheme.colors.border,
                      borderRadius: customTheme.components.card.borderRadius
                    }}
                  >
                    <h4 
                      className="font-medium mb-2"
                      style={{ fontSize: customTheme.typography.fontSize.base }}
                    >
                      Sample Content
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: customTheme.colors.mutedForeground }}
                    >
                      This is how your content will look with the current theme.
                    </p>
                  </div>
                  
                  {/* Preview Button */}
                  <button
                    className="px-4 py-2 text-white font-medium"
                    style={{
                      backgroundColor: customTheme.colors.primary[500],
                      borderRadius: customTheme.components.button.borderRadius
                    }}
                  >
                    Sample Button
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Info */}
          <Card>
            <CardHeader>
              <CardTitle>Theme Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">NAME</Label>
                <p className="text-sm font-medium">{customTheme.displayName}</p>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">VERSION</Label>
                <p className="text-sm">{customTheme.version}</p>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">TYPE</Label>
                <Badge variant={customTheme.isCustom ? 'default' : 'secondary'}>
                  {customTheme.isCustom ? 'Custom' : 'Default'}
                </Badge>
              </div>
              
              <div>
                <Label className="text-xs text-muted-foreground">LAST UPDATED</Label>
                <p className="text-sm">{customTheme.updatedAt.toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden file input for theme import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImportTheme}
        className="hidden"
      />

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Export Theme</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Theme Configuration</Label>
              <div className="relative">
                <Textarea
                  value={exportedTheme}
                  readOnly
                  rows={15}
                  className="font-mono text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2"
                  onClick={copyToClipboard}
                >
                  {isCopied ? (
                    <>
                      <Check size={16} className="mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} className="mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
