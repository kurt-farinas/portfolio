import { describe, it, expect } from 'vitest';
import React from 'react';
import App from '../src/App.jsx';

describe('App Smoke Test', () => {
  it('loads and defines the root App component without errors', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });
});
