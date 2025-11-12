export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Hero Section */}
      <div className="gradient-primary text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Welcome to Travel Encyclopedia
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Discover amazing destinations, events, and experiences across India
            </p>
            <div className="flex gap-4 justify-center">
              <button className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold shadow-lg">
                Explore Locations
              </button>
              <button className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-lg font-semibold">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Design System Preview */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Design System Preview</h2>
        
        {/* Color Palette */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Color Palette</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="card">
              <div className="w-full h-20 rounded-md mb-2" style={{backgroundColor: 'var(--color-primary)'}}></div>
              <p className="text-sm font-medium">Primary</p>
              <p className="text-xs text-secondary">#667eea</p>
            </div>
            <div className="card">
              <div className="w-full h-20 rounded-md mb-2" style={{backgroundColor: 'var(--color-secondary)'}}></div>
              <p className="text-sm font-medium">Secondary</p>
              <p className="text-xs text-secondary">#764ba2</p>
            </div>
            <div className="card">
              <div className="w-full h-20 rounded-md mb-2" style={{backgroundColor: 'var(--color-success)'}}></div>
              <p className="text-sm font-medium">Success</p>
              <p className="text-xs text-secondary">#10b981</p>
            </div>
            <div className="card">
              <div className="w-full h-20 rounded-md mb-2" style={{backgroundColor: 'var(--color-warning)'}}></div>
              <p className="text-sm font-medium">Warning</p>
              <p className="text-xs text-secondary">#f59e0b</p>
            </div>
            <div className="card">
              <div className="w-full h-20 rounded-md mb-2" style={{backgroundColor: 'var(--color-error)'}}></div>
              <p className="text-sm font-medium">Error</p>
              <p className="text-xs text-secondary">#ef4444</p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Typography</h3>
          <div className="card space-y-4">
            <h1 className="text-4xl font-bold">Heading 1 - 2.25rem</h1>
            <h2 className="text-3xl font-bold">Heading 2 - 1.875rem</h2>
            <h3 className="text-2xl font-semibold">Heading 3 - 1.5rem</h3>
            <p className="text-base">Body text - 1rem. The quick brown fox jumps over the lazy dog.</p>
            <p className="text-sm text-secondary">Small text - 0.875rem. Secondary color for less emphasis.</p>
          </div>
        </div>

        {/* Components */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Components</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <h4 className="font-semibold mb-2">Card Component</h4>
              <p className="text-sm text-secondary">This is a card with hover effect. Try hovering over it!</p>
            </div>
            <div className="glass p-6 rounded-lg">
              <h4 className="font-semibold mb-2">Glass Morphism</h4>
              <p className="text-sm text-secondary">Frosted glass effect with backdrop blur</p>
            </div>
            <div className="card">
              <div className="skeleton h-4 w-3/4 mb-2"></div>
              <div className="skeleton h-4 w-1/2"></div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mb-12">
          <h3 className="text-xl font-semibold mb-4">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <button className="btn gradient-primary text-white px-6 py-2 rounded-lg">
              Primary Button
            </button>
            <button className="btn bg-surface text-primary border border-border px-6 py-2 rounded-lg hover:bg-gray-100">
              Secondary Button
            </button>
            <button className="btn bg-success text-white px-6 py-2 rounded-lg">
              Success Button
            </button>
            <button className="btn bg-error text-white px-6 py-2 rounded-lg">
              Error Button
            </button>
            <button className="btn bg-gray-300 text-gray-500 px-6 py-2 rounded-lg" disabled>
              Disabled Button
            </button>
          </div>
        </div>

        {/* Status Message */}
        <div className="card bg-success/10 border-success text-center">
          <p className="text-lg font-medium mb-4">
            ✅ Design system and layouts are ready!
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/login" className="btn bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600">
              View Login Page
            </a>
            <a href="/dashboard" className="btn bg-surface border border-border px-6 py-2 rounded-lg hover:bg-gray-100">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
