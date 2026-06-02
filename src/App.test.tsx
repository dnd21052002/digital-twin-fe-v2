import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders login by default when unauthenticated', () => {
    window.localStorage.clear();

    render(<App />);

    expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
  });
});
