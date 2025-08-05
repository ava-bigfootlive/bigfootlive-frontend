import { Button } from '@/components/ui/button';

export default function ColorTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Color Test Page</h1>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Primary Buttons</h2>
        <Button>Default Primary Button</Button>
        <Button variant="secondary">Secondary Button</Button>
        <Button variant="destructive">Destructive Button</Button>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Color Values</h2>
        <div className="space-y-1 text-sm font-mono">
          <div>Primary: <span style={{backgroundColor: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))', padding: '2px 8px', borderRadius: '4px'}}>hsl(var(--primary))</span></div>
          <div>Primary Foreground: <span style={{backgroundColor: 'hsl(var(--primary-foreground))', color: 'hsl(var(--primary))', padding: '2px 8px', borderRadius: '4px'}}>hsl(var(--primary-foreground))</span></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">CSS Variable Debug</h2>
        <div className="text-sm font-mono space-y-1">
          <div>Current --primary value: <span id="primary-value"></span></div>
          <div>Current --primary-foreground value: <span id="primary-fg-value"></span></div>
          <div>Theme class on html: <span id="theme-class"></span></div>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          // Debug current CSS variable values
          const root = document.documentElement;
          const primaryValue = getComputedStyle(root).getPropertyValue('--primary');
          const primaryFgValue = getComputedStyle(root).getPropertyValue('--primary-foreground');
          const themeClass = root.className;
          
          document.getElementById('primary-value').textContent = primaryValue;
          document.getElementById('primary-fg-value').textContent = primaryFgValue;
          document.getElementById('theme-class').textContent = themeClass;
        `
      }} />
    </div>
  );
}
