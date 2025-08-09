import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
  Delete as DeleteIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  FolderOpen as FolderIcon
} from '@mui/icons-material';

function PathTab({ paths, onUpdate }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPath, setNewPath] = useState('');

  const commonPaths = [
    '/usr/local/bin',
    '/opt/homebrew/bin',
    '~/.local/bin',
    '/usr/local/sbin',
    '~/.cargo/bin',
    '~/.npm-global/bin'
  ];

  const handleAdd = () => {
    setNewPath('');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!newPath) return;
    
    const pathToAdd = newPath.trim();
    if (!paths.includes(pathToAdd)) {
      onUpdate([...paths, pathToAdd]);
    }
    setDialogOpen(false);
  };

  const handleDelete = (index) => {
    const newPaths = paths.filter((_, i) => i !== index);
    onUpdate(newPaths);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const newPaths = [...paths];
    [newPaths[index - 1], newPaths[index]] = [newPaths[index], newPaths[index - 1]];
    onUpdate(newPaths);
  };

  const handleMoveDown = (index) => {
    if (index === paths.length - 1) return;
    const newPaths = [...paths];
    [newPaths[index], newPaths[index + 1]] = [newPaths[index + 1], newPaths[index]];
    onUpdate(newPaths);
  };

  const handleQuickAdd = (path) => {
    if (!paths.includes(path)) {
      onUpdate([...paths, path]);
    }
  };

  const isValidPath = (path) => {
    return path && (path.startsWith('/') || path.startsWith('~'));
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h6">PATH Directories</Typography>
          <Typography variant="body2" color="textSecondary">
            Directories searched for executable programs (order matters)
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
        >
          Add Path
        </Button>
      </Box>

      <Box mb={2}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Quick add common paths:
        </Typography>
        <Box display="flex" gap={1} flexWrap="wrap">
          {commonPaths.map(path => (
            <Chip
              key={path}
              label={path}
              onClick={() => handleQuickAdd(path)}
              clickable
              size="small"
              disabled={paths.includes(path)}
            />
          ))}
        </Box>
      </Box>

      <Paper variant="outlined">
        <List>
          {paths.length === 0 ? (
            <ListItem>
              <ListItemText 
                primary={
                  <Typography color="textSecondary" align="center">
                    No PATH directories configured. Click "Add Path" to add one.
                  </Typography>
                }
              />
            </ListItem>
          ) : (
            paths.map((path, index) => (
              <ListItem key={index} divider={index < paths.length - 1}>
                <FolderIcon sx={{ mr: 2, color: 'action.active' }} />
                <ListItemText
                  primary={<code>{path}</code>}
                  secondary={`Priority: ${index + 1}`}
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Move Up">
                    <span>
                      <IconButton 
                        size="small" 
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        <ArrowUpIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Move Down">
                    <span>
                      <IconButton 
                        size="small" 
                        onClick={() => handleMoveDown(index)}
                        disabled={index === paths.length - 1}
                      >
                        <ArrowDownIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Remove">
                    <IconButton size="small" onClick={() => handleDelete(index)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Directory to PATH</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Directory Path"
              value={newPath}
              onChange={(e) => setNewPath(e.target.value)}
              fullWidth
              required
              helperText="Enter an absolute path (e.g., /usr/local/bin) or use ~ for home directory"
              error={!!newPath && !isValidPath(newPath)}
            />
            
            <Typography variant="body2" color="textSecondary">
              This directory will be added to your PATH environment variable. 
              Make sure it exists and contains executable files.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSave} 
            variant="contained"
            disabled={!newPath || !isValidPath(newPath) || paths.includes(newPath)}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PathTab;