import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface AppShellProps {
  children: ReactNode;
  searchPlaceholder?: string;
}

export function AppShell({ children, searchPlaceholder }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F0F0F0]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header searchPlaceholder={searchPlaceholder} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

