import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';

function AliasesTab({ aliases, onUpdate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    command: '',
    description: ''
  });
  const [testResult, setTestResult] = useState(null);

  const handleAdd = () => {
    setEditingIndex(-1);
    setFormData({ name: '', command: '', description: '' });
    setTestResult(null);
    setDialogOpen(true);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData(aliases[index]);
    setTestResult(null);
    setDialogOpen(true);
  };

  const handleDelete = (index) => {
    const newAliases = aliases.filter((_, i) => i !== index);
    onUpdate(newAliases);
  };

  const handleSave = () => {
    if (!formData.name || !formData.command) return;

    const newAliases = [...aliases];
    if (editingIndex === -1) {
      newAliases.push(formData);
    } else {
      newAliases[editingIndex] = formData;
    }
    
    onUpdate(newAliases);
    setDialogOpen(false);
  };

  const handleTest = async () => {
    try {
      const result = await window.electronAPI.testAlias(formData.command);
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Shell Aliases</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Alias
        </Button>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Command</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center" width={120}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {aliases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="textSecondary">
                    No aliases configured. Click "Add Alias" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              aliases.map((alias, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <code>{alias.name}</code>
                  </TableCell>
                  <TableCell>
                    <code>{alias.command}</code>
                  </TableCell>
                  <TableCell>{alias.description || '-'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(index)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(index)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingIndex === -1 ? 'Add New Alias' : 'Edit Alias'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Alias Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
              helperText="e.g., ll"
            />
            <TextField
              label="Command"
              value={formData.command}
              onChange={(e) => setFormData({ ...formData, command: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
              helperText="e.g., ls -la"
            />
            <TextField
              label="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              helperText="Brief description of what this alias does"
            />
            
            <Box>
              <Button
                variant="outlined"
                startIcon={<PlayIcon />}
                onClick={handleTest}
                disabled={!formData.command}
              >
                Test Command
              </Button>
            </Box>

            {testResult && (
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 2, 
                  bgcolor: testResult.success ? 'success.light' : 'error.light',
                  opacity: 0.1
                }}
              >
                <Typography variant="body2" component="pre" style={{ whiteSpace: 'pre-wrap' }}>
                  {testResult.success ? testResult.output : testResult.error}
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || !formData.command}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AliasesTab;