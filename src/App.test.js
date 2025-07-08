import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// Mock the useLocation hook to avoid location API calls in tests
jest.mock('./hooks/useLocation', () => ({
  useLocation: () => ({
    userLocation: null,
    locationLoading: false,
    locationError: null,
    requestLocation: jest.fn(),
    clearLocation: jest.fn(),
    hasLocation: false
  })
}));

describe('App', () => {
  test('renders app title', () => {
    render(<App />);
    expect(screen.getByText(/SEATTLE COFFEE/i)).toBeInTheDocument();
  });

  test('renders store locator text', () => {
    render(<App />);
    expect(screen.getByText(/Store Locator/i)).toBeInTheDocument();
  });

  test('renders search input', () => {
    render(<App />);
    expect(screen.getByPlaceholderText(/Search by store name/i)).toBeInTheDocument();
  });

  test('renders location button', () => {
    render(<App />);
    expect(screen.getByText(/Share My Location/i)).toBeInTheDocument();
  });

  test('search input is functional', () => {
    render(<App />);
    const searchInput = screen.getByPlaceholderText(/Search by store name/i);
    fireEvent.change(searchInput, { target: { value: 'test store' } });
    expect(searchInput.value).toBe('test store');
  });
});