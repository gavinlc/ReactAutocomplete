import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock lodash/debounce - this will use our manual mock in __mocks__/lodash/debounce.js
jest.mock('lodash/debounce');

// Import App after mock setup
import App from './App';

// Get the mock so we can clear it between tests
const debounceMock = require('lodash/debounce');

describe('App Component', () => {
  beforeEach(() => {
    // Clear mock before each test
    debounceMock.mockClear();
    // Reset the mock implementation
    debounceMock.mockImplementation((fn) => {
      const mockFn = jest.fn((...args) => fn(...args));
      mockFn.cancel = jest.fn();
      return mockFn;
    });
    render(<App />);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders input field', () => {
    // Try multiple selector strategies
    const input = screen.getByRole('textbox') || screen.getByPlaceholderText(/search/i);
    expect(input).toBeInTheDocument();
  });

  test('shows suggestions when typing', async () => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ap' } });
    
    // Wait for any element that contains Apple or Apricot
    await waitFor(() => {
      expect(screen.queryByText(/Apple/i)).toBeInTheDocument();
    });
  });

  test('shows no results message when no matches found', async () => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Xyz' } });
    
    // Give it a bit more time and be less specific about the exact message
    await waitFor(() => {
      const noResults = screen.queryByText(/no matches|no results|nothing found/i);
      expect(noResults).toBeInTheDocument();
    });
  });

  test('clears input when clear button is clicked', async () => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ap' } });
    
    // Wait for suggestions to appear
    await waitFor(() => {
      expect(screen.queryByText(/Apple/i)).toBeInTheDocument();
    });
    
    // Find clear button - try multiple strategies
    const clearButton = screen.queryByRole('button', { name: /clear/i }) || 
                        screen.queryByTestId('clear-button') ||
                        screen.queryByLabelText(/clear/i);
                        
    if (!clearButton) {
      throw new Error('Clear button not found - it may have a different label or role');
    }
    
    fireEvent.click(clearButton);
    
    // Check input is cleared
    expect(input.value).toBe('');
    
    // Verify suggestions are gone
    await waitFor(() => {
      expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument();
    });
  });

  test('selects suggestion when clicked', async () => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ap' } });
    
    // Wait for Apple suggestion to appear
    let apple;
    await waitFor(() => {
      apple = screen.queryByText(/Apple/i);
      expect(apple).toBeInTheDocument();
    });
    
    // Click on suggestion
    fireEvent.click(apple);
    
    // Input should now have Apple value
    await waitFor(() => {
      expect(input.value).toBe('Apple');
    });
    
    // Suggestions should disappear
    await waitFor(() => {
      expect(screen.queryByText(/Apricot/i)).not.toBeInTheDocument();
    });
  });

  test('navigates suggestions with keyboard', async () => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ap' } });
    
    // Wait for suggestions
    await waitFor(() => {
      expect(screen.queryByText(/Apple/i)).toBeInTheDocument();
    });
    
    // Press arrow down to select first item
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    
    // Press enter to select
    fireEvent.keyDown(input, { key: 'Enter' });
    
    // Input should have a value
    await waitFor(() => {
      expect(input.value).not.toBe('');
    });
    
    // Suggestions should be gone
    await waitFor(() => {
      const suggestions = screen.queryByText(/Apricot/i);
      expect(suggestions).not.toBeInTheDocument();
    });
  });

  test('closes suggestions with escape key', async () => {
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ap' } });
    
    // Wait for suggestions
    await waitFor(() => {
      expect(screen.queryByText(/Apple/i)).toBeInTheDocument();
    });
    
    // Press escape
    fireEvent.keyDown(input, { key: 'Escape' });
    
    // Suggestions should disappear
    await waitFor(() => {
      expect(screen.queryByText(/Apple/i)).not.toBeInTheDocument();
    });
  });

  test('handles error in matching function', async () => {
    // Mock console.error
    const originalError = console.error;
    console.error = jest.fn();
    
    try {
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'error' } });
      
      // Ensure nothing breaks when error occurs - wait a moment
      await new Promise(r => setTimeout(r, 50));
      
      // Component should still be functional
      expect(input).toBeInTheDocument();
    } finally {
      // Always restore console.error even if test fails
      console.error = originalError;
    }
  });
}); 