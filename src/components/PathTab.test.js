import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PathTab from './PathTab';

describe('PathTab Component', () => {
  const mockOnUpdate = jest.fn();
  const mockPaths = [
    '/usr/local/bin',
    '/usr/bin',
    '/bin'
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders PATH directories list', () => {
    render(<PathTab paths={mockPaths} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('PATH Directories')).toBeInTheDocument();
    // Use getAllByText since paths may appear in both list and quick add
    const pathElements = screen.getAllByText('/usr/local/bin');
    expect(pathElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Priority: 1')).toBeInTheDocument();
  });

  test('shows empty state when no paths', () => {
    render(<PathTab paths={[]} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText(/No PATH directories configured/)).toBeInTheDocument();
  });

  test('displays quick add common paths', () => {
    render(<PathTab paths={[]} onUpdate={mockOnUpdate} />);
    
    expect(screen.getByText('Quick add common paths:')).toBeInTheDocument();
    expect(screen.getByText('/opt/homebrew/bin')).toBeInTheDocument();
    expect(screen.getByText('~/.local/bin')).toBeInTheDocument();
  });

  test('can add a new path', async () => {
    render(<PathTab paths={[]} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Add Path'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Directory to PATH')).toBeInTheDocument();
    });
    
    const pathInput = screen.getByLabelText('Directory Path');
    fireEvent.change(pathInput, { target: { value: '/test/path' } });
    
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));
    
    expect(mockOnUpdate).toHaveBeenCalledWith(['/test/path']);
  });

  test('validates path format', async () => {
    render(<PathTab paths={[]} onUpdate={mockOnUpdate} />);
    
    fireEvent.click(screen.getByText('Add Path'));
    
    await waitFor(() => {
      expect(screen.getByText('Add Directory to PATH')).toBeInTheDocument();
    });
    
    const pathInput = screen.getByLabelText('Directory Path');
    fireEvent.change(pathInput, { target: { value: 'invalid-path' } });
    
    const addButton = screen.getByRole('button', { name: 'Add' });
    expect(addButton).toBeDisabled();
  });

  test('quick add path works', () => {
    render(<PathTab paths={[]} onUpdate={mockOnUpdate} />);
    
    // Click on a quick add chip
    fireEvent.click(screen.getByText('/opt/homebrew/bin'));
    
    expect(mockOnUpdate).toHaveBeenCalledWith(['/opt/homebrew/bin']);
  });
});