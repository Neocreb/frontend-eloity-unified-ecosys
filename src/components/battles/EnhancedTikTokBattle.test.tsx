import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EnhancedTikTokBattle from './EnhancedTikTokBattle';

// Mock framer-motion since it's not compatible with jsdom
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('EnhancedTikTokBattle', () => {
  it('renders without crashing', () => {
    render(<EnhancedTikTokBattle />);
    expect(screen.getByText('creator_red')).toBeInTheDocument();
    expect(screen.getByText('creator_blue')).toBeInTheDocument();
  });

  it('displays initial scores', () => {
    render(<EnhancedTikTokBattle />);
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('980')).toBeInTheDocument();
  });

  it('displays timer', () => {
    render(<EnhancedTikTokBattle />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });
});