import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

describe('App', () => {
  it('renders UNION is running banner', () => {
    render(<App />);
    expect(screen.getByText('UNION is running')).toBeInTheDocument();
  });
});

