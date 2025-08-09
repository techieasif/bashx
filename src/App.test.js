import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the electron API
global.window.electronAPI = {
  detectShell: jest.fn(),
  getAvailableShells: jest.fn(),
  getConfig: jest.fn(),
  saveConfig: jest.fn(),
  reloadShell: jest.fn(),
  testAlias: jest.fn(),
};

describe('App Component', () => {
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup default mock responses
    window.electronAPI.detectShell.mockResolvedValue({
      path: '/bin/zsh',
      name: 'zsh',
      configFile: '/Users/test/.zshrc'
    });
    
    window.electronAPI.getAvailableShells.mockResolvedValue([
      { name: 'bash', path: '/bin/bash', configFile: '/Users/test/.bashrc' },
      { name: 'zsh', path: '/bin/zsh', configFile: '/Users/test/.zshrc' }
    ]);
    
    window.electronAPI.getConfig.mockResolvedValue({
      aliases: [],
      variables: [],
      paths: []
    });
  });

  test('renders BashX title', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('BashX')).toBeInTheDocument();
    });
  });

  test('loads and displays shell information', async () => {
    render(<App />);
    await waitFor(() => {
      expect(window.electronAPI.detectShell).toHaveBeenCalled();
      expect(window.electronAPI.getAvailableShells).toHaveBeenCalled();
    });
  });

  test('displays three tabs', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Aliases')).toBeInTheDocument();
      expect(screen.getByText('Environment Variables')).toBeInTheDocument();
      expect(screen.getByText('PATH')).toBeInTheDocument();
    });
  });

  test('displays save and verify config buttons', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Save Configuration')).toBeInTheDocument();
      expect(screen.getByText('Verify Config')).toBeInTheDocument();
    });
  });
});