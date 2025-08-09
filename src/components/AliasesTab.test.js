import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AliasesTab from './AliasesTab';

// Mock the electron API
global.window.electronAPI = {
  testAlias: jest.fn(),
};

describe('AliasesTab Component', () => {
  const mockOnUpdate = jest.fn();
  const mockAliases = [
    { name: 'll', command: 'ls -la', description: 'List all files' },
    { name: 'gs', command: 'git status', description: 'Git status' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    window.electronAPI.testAlias.mockResolvedValue({
      success: true,
      output: 'Command executed successfully'
    });
  });

  test('renders aliases table with correct data', () => {
    render(<AliasesTab aliases={mockAliases} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Shell Aliases')).toBeInTheDocument();
    expect(screen.getByText('ll')).toBeInTheDocument();
    expect(screen.getByText('ls -la')).toBeInTheDocument();
    expect(screen.getByText('List all files')).toBeInTheDocument();
  });

  test('shows empty state when no aliases', () => {
    render(<AliasesTab aliases={[]} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/No aliases configured/)).toBeInTheDocument();
  });

  test('opens dialog when Add Alias button is clicked', async () => {
    render(<AliasesTab aliases={[]} onUpdate={mockOnUpdate} />);
    
    const addButton = screen.getByText('Add Alias');
    fireEvent.click(addButton);
    
    await waitFor(() => {
      expect(screen.getByText('Add New Alias')).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText('Alias Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Command')).toBeInTheDocument();
  });

  test('can add a new alias', async () => {
    render(<AliasesTab aliases={[]} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Add Alias'));
    
    await waitFor(() => {
      expect(screen.getByText('Add New Alias')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText('Alias Name');
    const commandInput = screen.getByLabelText('Command');
    
    fireEvent.change(nameInput, { target: { value: 'newtest' } });
    fireEvent.change(commandInput, { target: { value: 'echo test' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    expect(mockOnUpdate).toHaveBeenCalledWith([
      { name: 'newtest', command: 'echo test', description: '' }
    ]);
  });

  test('can delete an alias', () => {
    render(<AliasesTab aliases={mockAliases} onUpdate={mockOnUpdate} />);
    
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnUpdate).toHaveBeenCalledWith([mockAliases[1]]);
  });

  test('can test a command', async () => {
    render(<AliasesTab aliases={[]} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Add Alias'));
    
    await waitFor(() => {
      expect(screen.getByText('Add New Alias')).toBeInTheDocument();
    });
    
    const commandInput = screen.getByLabelText('Command');
    fireEvent.change(commandInput, { target: { value: 'echo test' } });
    
    const testButton = screen.getByText('Test Command');
    fireEvent.click(testButton);
    
    await waitFor(() => {
      expect(window.electronAPI.testAlias).toHaveBeenCalledWith('echo test');
    });
  });
});