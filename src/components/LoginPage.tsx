import { useEffect, useCallback } from 'react';
import { Factory, ShieldCheck, Truck, BarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../types/auth';
import { useAuth } from '../hooks/useAuth';

const roleIcons: Record<UserRole, typeof Factory> = {
  Operator: Factory,
  QC: ShieldCheck,
  Shipping: Truck,
  Supervisor: BarChart,
};

const roleConfig: Record<UserRole, { color: string; lightColor: string; description: string }> = {
  Operator: { color: 'bg-blue-600', lightColor: 'bg-blue-50', description: 'Machine Operations' },
  QC: { color: 'bg-purple-600', lightColor: 'bg-purple-50', description: 'Quality Control' },
  Shipping: { color: 'bg-green-600', lightColor: 'bg-green-50', description: 'Warehouse & Shipping' },
  Supervisor: { color: 'bg-orange-600', lightColor: 'bg-orange-50', description: 'Floor Management' },
};

const mockNames: Record<UserRole, string> = {
  Operator: 'Marcus',
  QC: 'Jennifer',
  Shipping: 'David',
  Supervisor: 'Tiffany',
};

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleRoleSelect = useCallback((role: UserRole) => {
    // Create a mock user for this role
    const mockUser = {
      id: `DEMO-${role}`,
      badgeId: role.charAt(0).toUpperCase() + Math.random().toString(36).slice(-3).toUpperCase(),
      name: mockNames[role],
      role,
      department: roleConfig[role].description,
    };
    login(mockUser);
    navigate('/dashboard');
  }, [login, navigate]);

  const roles: UserRole[] = ['Operator', 'QC', 'Shipping', 'Supervisor'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur border-b border-gray-700/50 px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center gap-6">
          <div className="flex-1">
            <img 
              width="200" 
              height="70" 
              src="https://www.cyclonebolt.com/wp-content/uploads/2025/06/cylone-bolt-logo.png" 
              alt="Cyclone Bolt" 
              className="h-16 w-auto"
            />
            <p className="text-sm text-gray-400 mt-2">Manufacturing Workflow Control</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">Select Your Station</p>
            <p className="text-sm text-gray-400 mt-1">Begin your shift</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-6xl">
          {/* Role Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {roles.map((role) => {
              const Icon = roleIcons[role];
              const config = roleConfig[role];

              return (
                <button
                  key={role}
                  onClick={() => handleRoleSelect(role)}
                  className={`
                    group relative h-64 rounded-2xl overflow-hidden
                    transition-all duration-300 transform hover:scale-105 active:scale-95
                    border-2 border-gray-700 hover:border-gray-600
                  `}
                >
                  {/* Background gradient */}
                  <div className={`
                    absolute inset-0 ${config.color} opacity-10 group-hover:opacity-20
                    transition-opacity duration-300
                  `} />

                  {/* Content */}
                  <div className="relative h-full flex flex-col items-center justify-center p-6">
                    {/* Icon Container */}
                    <div className={`
                      w-24 h-24 rounded-full ${config.color}
                      flex items-center justify-center mb-4
                      transition-transform duration-300 group-hover:scale-110
                      shadow-lg shadow-gray-900/50
                    `}>
                      <Icon className="w-12 h-12 text-white" />
                    </div>

                    {/* Text */}
                    <h3 className="text-2xl font-bold text-white mb-2 text-center">{role}</h3>
                    <p className="text-sm text-gray-300 text-center">{config.description}</p>

                    {/* Bottom Badge */}
                    <div className="mt-6 px-3 py-1 rounded-full bg-gray-800 border border-gray-700">
                      <p className="text-xs text-gray-400 font-mono">Click to start</p>
                    </div>
                  </div>

                  {/* Top Border Accent */}
                  <div className={`
                    absolute top-0 left-0 right-0 h-1 ${config.color}
                    transform origin-left scale-x-0 group-hover:scale-x-100
                    transition-transform duration-300
                  `} />
                </button>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="bg-gray-900/40 backdrop-blur border border-gray-700/50 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Quick Start</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Select your station role above to access your workflow. Each role provides a tailored interface for your specific manufacturing station responsibilities.
                </p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Demo Mode</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  This demo allows instant login by role selection. In production, this would integrate with your badge ID system and user management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900/50 backdrop-blur border-t border-gray-700/50 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-gray-500">
            Cyclone Manufacturing Workflow Control • Version 1.0
          </p>
        </div>
      </footer>
    </div>
  );
}
