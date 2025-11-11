import React from 'react';
import { render, screen } from '@testing-library/react';
import EnhancedTikTokBattle from './EnhancedTikTokBattle';
import test, { describe } from 'node:test';

// Mock framer-motion since it's not compatible with jsdom
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('EnhancedTikTokBattle', () => {
  test('renders without crashing', () => {
    render(<EnhancedTikTokBattle />);
    expect(screen.getByText('creator_red')).toBeInTheDocument();
    expect(screen.getByText('creator_blue')).toBeInTheDocument();
  });

  test('displays initial scores', () => {
    render(<EnhancedTikTokBattle />);
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('980')).toBeInTheDocument();
  });

  test('displays timer', () => {
    render(<EnhancedTikTokBattle />);
    expect(screen.getByText('05:00')).toBeInTheDocument();
  });
});

function expect(arg0: any) {
    throw new Error('Function not implemented.');
}
