import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import VariablesTab from './VariablesTab';

describe('VariablesTab Component', () => {
  const mockOnUpdate = jest.fn();
  const mockVariables = [
    { name: 'EDITOR', value: 'vim', description: 'Default editor' },
    { name: 'BROWSER', value: 'chrome', description: 'Default browser' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders environment variables table', () => {
    render(<VariablesTab variables={mockVariables} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Environment Variables')).toBeInTheDocument();
    // Use getAllByText since EDITOR appears in both table and quick add
    const editorElements = screen.getAllByText('EDITOR');
    expect(editorElements.length).toBeGreaterThan(0);
    expect(screen.getByText('vim')).toBeInTheDocument();
    expect(screen.getByText('Default editor')).toBeInTheDocument();
  });

  test('shows empty state when no variables', () => {
    render(<VariablesTab variables={[]} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/No environment variables configured/)).toBeInTheDocument();
  });

  test('displays quick add common variables', () => {
    render(<VariablesTab variables={[]} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Quick add common variables:')).toBeInTheDocument();
    expect(screen.getByText('EDITOR')).toBeInTheDocument();
    expect(screen.getByText('JAVA_HOME')).toBeInTheDocument();
    expect(screen.getByText('NODE_ENV')).toBeInTheDocument();
  });

  test('can add a new variable', async () => {
    render(<VariablesTab variables={[]} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Add Variable'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Environment Variable')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText('Variable Name');
    const valueInput = screen.getByLabelText('Value');
    
    fireEvent.change(nameInput, { target: { value: 'TEST_VAR' } });
    fireEvent.change(valueInput, { target: { value: 'test_value' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    
    expect(mockOnUpdate).toHaveBeenCalledWith([
      { name: 'TEST_VAR', value: 'test_value', description: '' }
    ]);
  });

  test('converts variable name to uppercase', async () => {
    render(<VariablesTab variables={[]} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Add Variable'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Environment Variable')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText('Variable Name');
    fireEvent.change(nameInput, { target: { value: 'test_var' } });
    
    expect(nameInput.value).toBe('TEST_VAR');
  });

  test('can delete a variable', () => {
    render(<VariablesTab variables={mockVariables} onUpdate={mockOnUpdate} />);
    
    const deleteButtons = screen.getAllByLabelText('Delete');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnUpdate).toHaveBeenCalledWith([mockVariables[1]]);
  });

  test('quick add opens dialog with pre-filled name', async () => {
    render(<VariablesTab variables={[]} onUpdate={mockOnUpdate} />);
    
    // Find the chip in the quick add section
    const quickAddSection = screen.getByText('Quick add common variables:').parentElement;
    const editorChip = within(quickAddSection).getByText('EDITOR');
    fireEvent.click(editorChip);
    
    await waitFor(() => {
      expect(screen.getByText('Add Environment Variable')).toBeInTheDocument();
    });
    
    const nameInput = screen.getByLabelText('Variable Name');
    expect(nameInput.value).toBe('EDITOR');
  });
});