# BashX - Shell Configuration Manager

A modern, user-friendly GUI application for managing shell configurations including aliases, environment variables, and PATH settings across different shells (bash, zsh, fish).

![BashX Logo](public/logo.svg)

## Features

- **Multi-Shell Support**: Works with bash, zsh, and fish shells
- **Visual Configuration Management**: 
  - Create, edit, and delete shell aliases
  - Manage environment variables
  - Modify PATH entries with drag-and-drop reordering
- **Auto-Detection**: Automatically detects your current shell and configuration file
- **Safe Editing**: Preview changes before applying them
- **Modern UI**: Clean, intuitive interface built with Material-UI

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- macOS, Linux, or Windows

## Installation

### From Source

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bashx.git
cd bashx
```

2. Install dependencies:
```bash
npm install
```

3. Start the application in development mode:
```bash
npm start
```

### Building for Production

To create a production build:

```bash
# Build the React app and Electron executable
npm run build
```

The built application will be available in the `dist` folder.

#### Platform-specific builds:

- **macOS**: Creates a .dmg file
- **Linux**: Creates an AppImage
- **Windows**: Creates an installer (requires Windows or Wine)

## Usage

1. **Launch the Application**: Start BashX using `npm start` or run the built executable

2. **Select Your Shell**: The app auto-detects your current shell, but you can switch between available shells using the dropdown

3. **Managing Aliases**:
   - Click "Add Alias" to create a new shell alias
   - Edit existing aliases inline
   - Delete aliases with the trash icon

4. **Managing Environment Variables**:
   - Add new environment variables with key-value pairs
   - Edit or remove existing variables
   - Variables are properly escaped for shell compatibility

5. **Managing PATH**:
   - Add new directories to your PATH
   - Reorder PATH entries using drag-and-drop
   - Remove unnecessary PATH entries
   - Toggle between append/prepend modes

6. **Saving Changes**:
   - Click "Save Configuration" to write changes to your shell config file
   - After saving, run the displayed source command in your terminal:
     ```bash
     source ~/.bashrc  # or ~/.zshrc, config.fish, etc.
     ```

7. **Verify Configuration**: Use the "Verify Config" button to check if your changes are valid

## Project Structure

```
bashx/
├── electron/           # Electron main process files
│   ├── main.js        # Main Electron entry point
│   └── preload.js     # Preload script for IPC
├── src/               # React application source
│   ├── App.js         # Main React component
│   └── components/    # React components
│       ├── AliasesTab.js
│       ├── VariablesTab.js
│       └── PathTab.js
├── public/            # Static assets
│   ├── index.html
│   └── logo.svg
└── package.json       # Project dependencies and scripts
```

## Development

### Available Scripts

- `npm start` - Start the app in development mode
- `npm run react:start` - Start only the React development server
- `npm run electron:start` - Start only the Electron app
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run react:build` - Build only the React app
- `npm run electron:build` - Package the Electron app

### Technology Stack

- **Frontend**: React 18, Material-UI 5
- **Desktop Framework**: Electron 28
- **Build Tools**: react-scripts, electron-builder
- **Language**: JavaScript (ES6+)

## Security Considerations

- The app runs with local file system access to read and modify shell configuration files
- All file operations are confined to user's home directory shell configs
- No network requests or external data transmission
- Configurations are stored locally in standard shell config files

## Known Issues

- Some npm packages have vulnerabilities in their dependencies (mostly in development dependencies)
- These are primarily in the build toolchain (react-scripts) and don't affect the production application
- Working on migrating to more secure alternatives

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- Built with Electron and React
- UI components from Material-UI
- Shell icon design inspired by Unix philosophy