import { useState, type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface MasterDetailLayoutProps {
  master: ReactNode;
  detail: ReactNode;
  showDetail: boolean;
  onBack?: () => void;
  className?: string;
}

export function MasterDetailLayout({
  master,
  detail,
  showDetail,
  onBack,
  className = '',
}: MasterDetailLayoutProps) {
  return (
    <div
      className={`flex-1 overflow-hidden ${className} ${
        showDetail ? 'show-detail' : 'show-list'
      }`}
    >
      {/* List Section */}
      <section
        className={`flex flex-col overflow-hidden border-r border-[#E6E6E6] bg-[#F0F0F0] ${
          showDetail ? 'hidden xl:flex' : 'flex'
        }`}
      >
        {master}
      </section>

      {/* Detail Section */}
      <section
        className={`flex flex-col overflow-hidden bg-[#F0F0F0] ${
          showDetail ? 'flex' : 'hidden xl:flex'
        }`}
      >
        {onBack && (
          <div className="xl:hidden bg-white border-b border-[#E6E6E6] px-8 py-4">
            <Button variant="ghost" size="sm" icon="fa-arrow-left" onClick={onBack}>
              Back to List
            </Button>
          </div>
        )}
        {detail}
      </section>
    </div>
  );
}

