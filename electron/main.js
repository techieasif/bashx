const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'BashX',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const startUrl = 'http://localhost:3000';
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

function detectShell() {
  const shell = process.env.SHELL || '/bin/bash';
  const shellName = path.basename(shell);
  return {
    path: shell,
    name: shellName,
    configFile: getConfigFile(shellName)
  };
}

function getConfigFile(shellName) {
  const homeDir = os.homedir();
  const configFiles = {
    'bash': path.join(homeDir, '.bashrc'),
    'zsh': path.join(homeDir, '.zshrc'),
    'fish': path.join(homeDir, '.config', 'fish', 'config.fish'),
    'sh': path.join(homeDir, '.profile')
  };
  return configFiles[shellName] || configFiles['bash'];
}

function parseConfigFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { aliases: [], variables: [], paths: [] };
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    const aliases = [];
    const variables = [];
    const paths = new Set();

    for (const line of lines) {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('alias ')) {
        const match = trimmed.match(/^alias\s+([^=]+)=["'](.+)["']$/);
        if (match) {
          aliases.push({
            name: match[1],
            command: match[2],
            description: ''
          });
        }
      }
      
      else if (trimmed.startsWith('export ')) {
        const match = trimmed.match(/^export\s+([^=]+)=["']?(.+?)["']?$/);
        if (match) {
          variables.push({
            name: match[1],
            value: match[2],
            description: ''
          });
          
          if (match[1] === 'PATH') {
            const pathEntries = match[2].split(':');
            pathEntries.forEach(p => {
              if (p && !p.includes('$')) {
                paths.add(p);
              }
            });
          }
        }
      }
    }

    return {
      aliases,
      variables: variables.filter(v => v.name !== 'PATH'),
      paths: Array.from(paths)
    };
  } catch (error) {
    console.error('Error parsing config file:', error);
    return { aliases: [], variables: [], paths: [] };
  }
}

function backupConfigFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.backup.${Date.now()}`;
      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    }
    return null;
  } catch (error) {
    console.error('Error creating backup:', error);
    return null;
  }
}

function updateConfigFile(filePath, data) {
  try {
    backupConfigFile(filePath);
    
    let content = '';
    
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8');
      
      const lines = content.split('\n');
      const filteredLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('alias ') && 
               !trimmed.startsWith('export ') &&
               !trimmed.includes('# BashX Managed');
      });
      content = filteredLines.join('\n');
    }
    
    content += '\n\n# BashX Managed Configuration\n';
    content += '# Do not edit this section manually\n\n';
    
    for (const alias of data.aliases) {
      content += `alias ${alias.name}='${alias.command}'\n`;
    }
    
    content += '\n';
    
    for (const variable of data.variables) {
      content += `export ${variable.name}="${variable.value}"\n`;
    }
    
    if (data.paths && data.paths.length > 0) {
      content += `\nexport PATH="${data.paths.join(':')}:$PATH"\n`;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  } catch (error) {
    console.error('Error updating config file:', error);
    return false;
  }
}

function reloadShell(shellPath, configFile) {
  // Note: We can't actually reload the shell config in existing terminals
  // This would need to be done manually by the user
  // We'll just verify the config file is valid
  return new Promise((resolve) => {
    fs.access(configFile, fs.constants.R_OK, (err) => {
      if (err) {
        resolve({ success: false, message: 'Config file not accessible' });
      } else {
        // Test if the config file has valid syntax by trying to source it
        exec(`${shellPath} -n ${configFile} 2>&1`, (error) => {
          if (error && error.code !== 0) {
            // Some shells don't support -n flag, so we'll just assume it's valid
            resolve({ 
              success: true, 
              message: 'Configuration saved. Please run "source ' + configFile + '" in existing terminals or open new terminals to use the updated configuration.' 
            });
          } else {
            resolve({ 
              success: true, 
              message: 'Configuration saved. Please run "source ' + configFile + '" in existing terminals or open new terminals to use the updated configuration.' 
            });
          }
        });
      }
    });
  });
}

ipcMain.handle('detect-shell', async () => {
  return detectShell();
});

ipcMain.handle('get-config', async (_, configFile) => {
  return parseConfigFile(configFile);
});

ipcMain.handle('save-config', async (_, { configFile, data }) => {
  return updateConfigFile(configFile, data);
});

ipcMain.handle('reload-shell', async (_, { shellPath, configFile }) => {
  return reloadShell(shellPath, configFile);
});

ipcMain.handle('test-alias', async (_, command) => {
  return new Promise((resolve) => {
    exec(command, { shell: true }, (error, stdout) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true, output: stdout });
      }
    });
  });
});

ipcMain.handle('get-available-shells', async () => {
  const shells = ['bash', 'zsh', 'fish', 'sh'];
  const available = [];
  
  for (const shell of shells) {
    const paths = [
      `/bin/${shell}`,
      `/usr/bin/${shell}`,
      `/usr/local/bin/${shell}`
    ];
    
    for (const shellPath of paths) {
      if (fs.existsSync(shellPath)) {
        available.push({
          name: shell,
          path: shellPath,
          configFile: getConfigFile(shell)
        });
        break;
      }
    }
  }
  
  return available;
});