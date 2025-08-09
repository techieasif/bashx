import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Box,
  Tab,
  Tabs,
  Paper,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  Terminal as TerminalIcon,
  ContentCopy as CopyIcon
} from '@mui/icons-material';
import AliasesTab from './components/AliasesTab';
import VariablesTab from './components/VariablesTab';
import PathTab from './components/PathTab';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#4A6FA5',
      light: '#7FA9D9',
      dark: '#2E4578',
    },
    secondary: {
      main: '#5B8BC6',
      light: '#A8C4E6',
      dark: '#3A5F8C',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E4578',
      secondary: '#5B8BC6',
    },
  },
  typography: {
    fontFamily: '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h6: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 20px rgba(46, 69, 120, 0.08)',
        },
      },
    },
  },
});

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ marginTop: 20 }}>
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [shellInfo, setShellInfo] = useState(null);
  const [availableShells, setAvailableShells] = useState([]);
  const [selectedShell, setSelectedShell] = useState('');
  const [configData, setConfigData] = useState({
    aliases: [],
    variables: [],
    paths: []
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedShell && availableShells.length > 0) {
      const shell = availableShells.find(s => s.name === selectedShell);
      if (shell) {
        loadConfigData(shell.configFile);
      }
    }
  }, [selectedShell]);

  const loadInitialData = async () => {
    try {
      const detected = await window.electronAPI.detectShell();
      setShellInfo(detected);
      setSelectedShell(detected.name);
      
      const shells = await window.electronAPI.getAvailableShells();
      setAvailableShells(shells);
      
      const config = await window.electronAPI.getConfig(detected.configFile);
      setConfigData(config);
      setLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      setMessage({ type: 'error', text: 'Failed to load shell configuration' });
      setLoading(false);
    }
  };

  const loadConfigData = async (configFile) => {
    try {
      const config = await window.electronAPI.getConfig(configFile);
      setConfigData(config);
    } catch (error) {
      console.error('Error loading config data:', error);
      setMessage({ type: 'error', text: 'Failed to load configuration file' });
    }
  };

  const handleShellChange = (event) => {
    const newShell = event.target.value;
    setSelectedShell(newShell);
    const shell = availableShells.find(s => s.name === newShell);
    if (shell) {
      setShellInfo(shell);
    }
  };

  const handleSave = async () => {
    try {
      const shell = availableShells.find(s => s.name === selectedShell);
      if (!shell) return;
      
      const success = await window.electronAPI.saveConfig(shell.configFile, configData);
      if (success) {
        const sourceCommand = `source ${shell.configFile}`;
        setMessage({ 
          type: 'success', 
          text: (
            <Box display="flex" alignItems="center" gap={1}>
              <span>Configuration saved! Run in terminal:</span>
              <code style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                {sourceCommand}
              </code>
              <IconButton 
                size="small" 
                onClick={() => {
                  navigator.clipboard.writeText(sourceCommand);
                  setSnackbarOpen(true);
                }}
                sx={{ ml: 1 }}
              >
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          )
        });
        setTimeout(() => setMessage(null), 10000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save configuration' });
      }
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error saving configuration' });
    }
  };

  const handleReload = async () => {
    try {
      const shell = availableShells.find(s => s.name === selectedShell);
      if (!shell) return;
      
      const result = await window.electronAPI.reloadShell(shell.path, shell.configFile);
      if (result.success) {
        setMessage({ type: 'info', text: result.message });
        setTimeout(() => setMessage(null), 8000);
      } else {
        setMessage({ type: 'warning', text: result.message });
        setTimeout(() => setMessage(null), 5000);
      }
    } catch (error) {
      console.error('Error reloading shell:', error);
      setMessage({ type: 'warning', text: 'Could not verify shell configuration. Please open a new terminal for changes to take effect.' });
    }
  };

  const updateConfigData = (key, value) => {
    setConfigData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Typography>Loading shell configuration...</Typography>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="static" sx={{ background: 'linear-gradient(135deg, #4A6FA5 0%, #2E4578 100%)' }}>
        <Toolbar>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            borderRadius: '8px', 
            padding: '4px 8px',
            marginRight: 2
          }}>
            <img src="/logo.svg" alt="BashX" style={{ width: 36, height: 36 }} />
          </Box>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            BashX
          </Typography>
          <Button
            color="inherit"
            startIcon={<RefreshIcon />}
            onClick={handleReload}
            sx={{ mr: 2 }}
          >
            Verify Config
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleSave}
          >
            Save Configuration
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        {message && (
          <Alert 
            severity={message.type} 
            onClose={() => setMessage(null)}
            sx={{ mb: 2 }}
          >
            {message.text}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Shell</InputLabel>
                <Select
                  value={selectedShell}
                  onChange={handleShellChange}
                  label="Shell"
                >
                  {availableShells.map(shell => (
                    <MenuItem key={shell.name} value={shell.name}>
                      {shell.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {shellInfo && (
                <Box display="flex" gap={1}>
                  <Chip 
                    label={`Config: ${shellInfo.configFile}`} 
                    color="primary" 
                    variant="outlined"
                  />
                  <Chip 
                    label={`Path: ${shellInfo.path}`} 
                    color="secondary" 
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
            <Tab label="Aliases" />
            <Tab label="Environment Variables" />
            <Tab label="PATH" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <AliasesTab 
              aliases={configData.aliases}
              onUpdate={(aliases) => updateConfigData('aliases', aliases)}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <VariablesTab
              variables={configData.variables}
              onUpdate={(variables) => updateConfigData('variables', variables)}
            />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <PathTab
              paths={configData.paths}
              onUpdate={(paths) => updateConfigData('paths', paths)}
            />
          </TabPanel>
        </Paper>
      </Container>
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message="Command copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </ThemeProvider>
  );
}

export default App;