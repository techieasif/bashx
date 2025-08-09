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
  Typography,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

function VariablesTab({ variables, onUpdate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [formData, setFormData] = useState({
    name: '',
    value: '',
    description: ''
  });

  const commonVariables = [
    { name: 'EDITOR', description: 'Default text editor' },
    { name: 'BROWSER', description: 'Default web browser' },
    { name: 'LANG', description: 'System language' },
    { name: 'NODE_ENV', description: 'Node.js environment' },
    { name: 'JAVA_HOME', description: 'Java installation directory' }
  ];

  const handleAdd = () => {
    setEditingIndex(-1);
    setFormData({ name: '', value: '', description: '' });
    setDialogOpen(true);
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData(variables[index]);
    setDialogOpen(true);
  };

  const handleDelete = (index) => {
    const newVariables = variables.filter((_, i) => i !== index);
    onUpdate(newVariables);
  };

  const handleSave = () => {
    if (!formData.name || !formData.value) return;

    const newVariables = [...variables];
    if (editingIndex === -1) {
      newVariables.push(formData);
    } else {
      newVariables[editingIndex] = formData;
    }
    
    onUpdate(newVariables);
    setDialogOpen(false);
  };

  const handleQuickAdd = (varName, description) => {
    setFormData({ name: varName, value: '', description });
    setEditingIndex(-1);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Environment Variables</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Variable
        </Button>
      </Box>

      <Box mb={2}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Quick add common variables:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {commonVariables.map(v => (
            <Chip
              key={v.name}
              label={v.name}
              onClick={() => handleQuickAdd(v.name, v.description)}
              clickable
              size="small"
            />
          ))}
        </Box>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Variable Name</TableCell>
              <TableCell>Value</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center" width={120}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {variables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography color="textSecondary">
                    No environment variables configured. Click "Add Variable" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              variables.map((variable, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <code>{variable.name}</code>
                  </TableCell>
                  <TableCell>
                    <code>{variable.value}</code>
                  </TableCell>
                  <TableCell>{variable.description || '-'}</TableCell>
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
          {editingIndex === -1 ? 'Add Environment Variable' : 'Edit Environment Variable'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Variable Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
              fullWidth
              required
              helperText="e.g., EDITOR, JAVA_HOME"
            />
            <TextField
              label="Value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              fullWidth
              required
              multiline
              rows={2}
              helperText="The value to assign to this variable"
            />
            <TextField
              label="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              helperText="Brief description of what this variable is used for"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!formData.name || !formData.value}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default VariablesTab;