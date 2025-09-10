import { useState } from "react";
import { 
  LayoutDashboard, 
  Play, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

interface SidebarProps {
  activeTab: 'dashboard' | 'get-started' | 'manage-data';
  onTabChange: (tab: 'dashboard' | 'get-started' | 'manage-data') => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      id: 'get-started' as const,
      label: 'Get Started',
      icon: Play,
      description: 'Create your profile'
    },
    {
      id: 'manage-data' as const,
      label: 'Manage Data',
      icon: Settings,
      description: 'Edit your information'
    }
  ];

  return (
    <div className={`bg-white shadow-xl rounded-2xl transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    } h-fit`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-xl font-bold text-[#2D2D2D]">Navigation</h2>
              <p className="text-sm text-gray-500">Manage your profile</p>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="p-4">
        <nav className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-[#fa744c] text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-[#fa744c]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                
                {!isCollapsed && (
                  <div className="text-left">
                    <div className={`font-medium ${isActive ? 'text-white' : ''}`}>
                      {tab.label}
                    </div>
                    <div className={`text-sm ${
                      isActive ? 'text-white text-opacity-80' : 'text-gray-500'
                    }`}>
                      {tab.description}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-100 mt-4">
          <div className="text-xs text-gray-500 text-center">
            ConnectQ Dashboard
          </div>
        </div>
      )}
    </div>
  );
}
