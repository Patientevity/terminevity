import React from 'react';
import {
  Terminal,
  MessageSquare,
  FileText,
  Palette,
  FolderOpen,
  Brain,
  Search,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/stores/app-store';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import type { ViewType } from '@/types';

interface NavItem {
  id: ViewType;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'terminal', label: 'Terminal', icon: Terminal },
  { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  { id: 'markdown', label: 'Markdown', icon: FileText },
  { id: 'canvas', label: 'Canvas', icon: Palette },
  { id: 'explorer', label: 'Explorer', icon: FolderOpen },
  { id: 'memory', label: 'Memory', icon: Brain },
  { id: 'research', label: 'Research', icon: Search },
];

const bottomItems: NavItem[] = [
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          'flex flex-col h-full bg-background border-r border-border transition-all duration-200',
          sidebarCollapsed ? 'w-14' : 'w-48',
        )}
      >
        {/* Toggle button */}
        <div className="flex items-center justify-end p-2">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-muted-foreground" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 flex flex-col gap-1 px-2">
          {navItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              collapsed={sidebarCollapsed}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </nav>

        {/* Bottom nav */}
        <div className="flex flex-col gap-1 px-2 pb-3">
          {bottomItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={currentView === item.id}
              collapsed={sidebarCollapsed}
              onClick={() => setCurrentView(item.id)}
            />
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

function NavButton({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const button = (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors w-full',
        isActive
          ? 'bg-accent text-accent-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <item.icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
