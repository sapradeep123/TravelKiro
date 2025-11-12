import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">🦋</span>
            </div>
            <span className="text-2xl font-bold">Butterfliy</span>
          </div>

          {/* Content */}
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">
              Discover Amazing Destinations
            </h1>
            <p className="text-lg opacity-90">
              Your comprehensive travel guide to explore locations, events, packages, and accommodations across India.
            </p>
          </div>

          {/* Footer */}
          <div className="text-sm opacity-75">
            © 2024 Butterfliy. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-2xl">🦋</span>
            </div>
            <span className="text-2xl font-bold text-gradient">Butterfliy</span>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
