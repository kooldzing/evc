let currentSettings = {
    appearance: {
        theme: 'midnight',
        accentColor: '#007acc',
        terminalFontSize: 13,
        customColors: {
            bg: '#0d1117',
            panel: '#161b22',
            sidebar: '#1c2128',
            header: '#0a0e14',
            text: '#c9d1d9',
            textSecondary: '#8b949e',
            border: '#30363d',
            terminal: '#090d13'
        }
    },
    editor: {
        fontSize: 13,
        lineNumbers: true,
        wordWrap: false,
        autocomplete: true
    },
    compiler: {
        defaultVersion: '0.8.4',
        autoSave: true,
        optimizationDefault: true
    },
    network: {
        customRpc: '',
        defaultGasPrice: 20,
        autoGasEstimation: true
    }
};

let currentSettingsTab = 'appearance';

// Built-in theme presets
const THEME_PRESETS = {
    'dark': {
        label: 'Dark',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: {
            bg: '#1e1e1e',
            panel: '#252526',
            sidebar: '#2d2d2d',
            header: '#1a1a2e',
            text: '#cccccc',
            textSecondary: '#888888',
            border: '#3c3c3c',
            terminal: '#1a1a1a'
        }
    },
    'light': {
        label: 'Light',
        editorTheme: 'default',
        colorScheme: 'light',
        colors: {
            bg: '#ffffff',
            panel: '#f3f3f3',
            sidebar: '#e8e8e8',
            header: '#f0f0f5',
            text: '#1e1e1e',
            textSecondary: '#666666',
            border: '#d4d4d4',
            terminal: '#f8f8f8'
        }
    },
    'midnight': {
        label: 'Midnight',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: {
            bg: '#0d1117',
            panel: '#161b22',
            sidebar: '#1c2128',
            header: '#0a0e14',
            text: '#c9d1d9',
            textSecondary: '#8b949e',
            border: '#30363d',
            terminal: '#090d13'
        }
    },
    'solarized-dark': {
        label: 'Solarized Dark',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: {
            bg: '#002b36',
            panel: '#073642',
            sidebar: '#073642',
            header: '#001f27',
            text: '#839496',
            textSecondary: '#657b83',
            border: '#586e75',
            terminal: '#001e26'
        }
    },
    'solarized-light': {
        label: 'Solarized Light',
        editorTheme: 'default',
        colorScheme: 'light',
        colors: {
            bg: '#fdf6e3',
            panel: '#eee8d5',
            sidebar: '#eee8d5',
            header: '#f5efdc',
            text: '#657b83',
            textSecondary: '#93a1a1',
            border: '#d3cbb7',
            terminal: '#faf3e0'
        }
    },
    'nord': {
        label: 'Nord',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: {
            bg: '#2e3440',
            panel: '#3b4252',
            sidebar: '#434c5e',
            header: '#272d38',
            text: '#d8dee9',
            textSecondary: '#81a1c1',
            border: '#4c566a',
            terminal: '#242933'
        }
    },
    'dracula': {
        label: 'Dracula',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: {
            bg: '#282a36',
            panel: '#343746',
            sidebar: '#3c3f58',
            header: '#21222c',
            text: '#f8f8f2',
            textSecondary: '#6272a4',
            border: '#44475a',
            terminal: '#1e1f29'
        }
    },
    'monokai': {
        label: 'Monokai',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: {
            bg: '#272822',
            panel: '#2e2f2a',
            sidebar: '#353630',
            header: '#1e1f1b',
            text: '#f8f8f2',
            textSecondary: '#75715e',
            border: '#49483e',
            terminal: '#1b1c17'
        }
    },
    'github-dark': {
        label: 'GitHub Dark',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: {
            bg: '#0d1117',
            panel: '#161b22',
            sidebar: '#1c2128',
            header: '#010409',
            text: '#e6edf3',
            textSecondary: '#7d8590',
            border: '#30363d',
            terminal: '#090d13'
        }
    },
    'tokyo-night': {
    label: 'Tokyo Night',
    editorTheme: 'material-darker',
    colorScheme: 'dark',
    colors: {
        bg: '#1a1b26',
        panel: '#1f2335',
        sidebar: '#24283b',
        header: '#16161e',
        text: '#c0caf5',
        textSecondary: '#7aa2f7',
        border: '#2f334d',
        terminal: '#16161e'
    }
},
'cyberpunk': {
    label: 'Cyberpunk',
    editorTheme: 'material-darker',
    colorScheme: 'dark',
    colors: {
        bg: '#0a0014',
        panel: '#160029',
        sidebar: '#1f003d',
        header: '#05000a',
        text: '#fffc00',
        textSecondary: '#ff00ea',
        border: '#3a0066',
        terminal: '#05000a'
    }
},
'ocean': {
    label: 'Ocean',
    editorTheme: 'material-darker',
    colorScheme: 'dark',
    colors: {
        bg: '#0f1c2e',
        panel: '#142841',
        sidebar: '#1b3554',
        header: '#0a1422',
        text: '#dbe9ff',
        textSecondary: '#82aaff',
        border: '#22436a',
        terminal: '#0a1422'
    }
},
'forest': {
    label: 'Forest',
    editorTheme: 'material-darker',
    colorScheme: 'dark',
    colors: {
        bg: '#0f1a14',
        panel: '#162820',
        sidebar: '#1d3528',
        header: '#0a1410',
        text: '#d4e8db',
        textSecondary: '#8fbc8f',
        border: '#2a4a38',
        terminal: '#0a1410'
    }
},
'sunset': {
    label: 'Sunset',
    editorTheme: 'material-darker',
    colorScheme: 'dark',
    colors: {
        bg: '#1f1419',
        panel: '#2a1c25',
        sidebar: '#352531',
        header: '#170d12',
        text: '#ffd9c4',
        textSecondary: '#ff9e7d',
        border: '#4a3340',
        terminal: '#170d12'
    }
},
'rose-pine': {
    label: 'Rosé Pine',
    editorTheme: 'material-darker',
    colorScheme: 'dark',
    colors: {
        bg: '#191724',
        panel: '#1f1d2e',
        sidebar: '#26233a',
        header: '#13111c',
        text: '#e0def4',
        textSecondary: '#c4a7e7',
        border: '#403d52',
        terminal: '#13111c'
    }
},
    'custom': {
        label: 'Custom',
        editorTheme: 'material-darker',
        colorScheme: 'dark',
        colors: null // Uses customColors from settings
    }
};

function initializeSettingsPlugin() {
    setupSettingsEventListeners();
    loadSettings();
    applySettings();
    updateSettingsUI();
}

function setupSettingsEventListeners() {
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const saveBtn = document.getElementById('save-settings');
    const resetBtn = document.getElementById('reset-settings');

    settingsTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchSettingsTab(tab.getAttribute('data-tab'));
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener('click', saveSettings);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', resetSettings);
    }

    setupAppearanceListeners();
    setupEditorListeners();
    setupCompilerListeners();
    setupNetworkListeners();
    setupCustomColorListeners();
    setupThemeManagementListeners();
}

function setupAppearanceListeners() {
    const themeSelect = document.getElementById('theme-select');
    const accentHue = document.getElementById('accent-hue');
    const accentHex = document.getElementById('accent-hex');
    const accentPreview = document.getElementById('accent-preview');
    const terminalFontSize = document.getElementById('terminal-font-size');
    const terminalFontDisplay = document.getElementById('terminal-font-display');

    if (themeSelect) {
        themeSelect.addEventListener('change', (e) => {
            currentSettings.appearance.theme = e.target.value;
            applyTheme(e.target.value);
            updateCustomColorsVisibility();
            updateCustomColorInputs();
        });
    }

    if (accentHue) {
        accentHue.addEventListener('input', (e) => {
            const hue = clamp(parseInt(e.target.value, 10), 0, 360);
            const hex = hslToHex(hue, 75, 55);
            currentSettings.appearance.accentColor = hex;
            if (accentHex) {
                accentHex.value = hex;
                accentHex.classList.remove('input-error');
            }
            if (accentPreview) {
                accentPreview.style.background = hex;
            }
            applyAccentColor(hex);
            updateRangeFill(e.target);
        });
        updateRangeFill(accentHue);
    }

    if (accentHex) {
        const applyHexInput = (value, resetIfInvalid = false) => {
            const normalized = normalizeHex(value);
            if (normalized) {
                currentSettings.appearance.accentColor = normalized;
                accentHex.value = normalized;
                accentHex.classList.remove('input-error');
                if (accentPreview) {
                    accentPreview.style.background = normalized;
                }
                if (accentHue) {
                    const hue = Math.round(hexToHsl(normalized).h);
                    accentHue.value = hue;
                    updateRangeFill(accentHue);
                }
                applyAccentColor(normalized);
            } else if (resetIfInvalid) {
                accentHex.value = currentSettings.appearance.accentColor;
                accentHex.classList.remove('input-error');
            } else {
                accentHex.classList.add('input-error');
            }
        };

        accentHex.addEventListener('input', (e) => applyHexInput(e.target.value));
        accentHex.addEventListener('blur', () => applyHexInput(accentHex.value, true));
    }

    if (terminalFontSize) {
        updateRangeFill(terminalFontSize);
        terminalFontSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            currentSettings.appearance.terminalFontSize = size;
            if (terminalFontDisplay) {
                terminalFontDisplay.textContent = `${size}px`;
            }
            applyTerminalFontSize(size);
            updateRangeFill(e.target);
        });
    }
}

function setupCustomColorListeners() {
    const colorFields = [
        { id: 'custom-bg', key: 'bg' },
        { id: 'custom-panel', key: 'panel' },
        { id: 'custom-sidebar', key: 'sidebar' },
        { id: 'custom-header', key: 'header' },
        { id: 'custom-text', key: 'text' },
        { id: 'custom-text-secondary', key: 'textSecondary' },
        { id: 'custom-border', key: 'border' },
        { id: 'custom-terminal', key: 'terminal' }
    ];

    colorFields.forEach(field => {
        const colorInput = document.getElementById(field.id);
        const hexInput = document.getElementById(field.id + '-hex');

        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                const value = e.target.value;
                currentSettings.appearance.customColors[field.key] = value;
                if (hexInput) {
                    hexInput.value = value;
                }
                if (currentSettings.appearance.theme === 'custom') {
                    applyCustomColors();
                }
            });
        }

        if (hexInput) {
            hexInput.addEventListener('input', (e) => {
                const normalized = normalizeHex(e.target.value);
                if (normalized) {
                    currentSettings.appearance.customColors[field.key] = normalized;
                    if (colorInput) {
                        colorInput.value = normalized;
                    }
                    hexInput.classList.remove('input-error');
                    if (currentSettings.appearance.theme === 'custom') {
                        applyCustomColors();
                    }
                } else {
                    hexInput.classList.add('input-error');
                }
            });

            hexInput.addEventListener('blur', () => {
                const normalized = normalizeHex(hexInput.value);
                if (normalized) {
                    hexInput.value = normalized;
                    hexInput.classList.remove('input-error');
                } else {
                    hexInput.value = currentSettings.appearance.customColors[field.key];
                    hexInput.classList.remove('input-error');
                }
            });
        }
    });

    updateCustomColorsVisibility();
}

function setupThemeManagementListeners() {
    const exportBtn = document.getElementById('export-theme-btn');
    const importBtn = document.getElementById('import-theme-btn');
    const fileInput = document.getElementById('theme-file-input');

    if (exportBtn) {
        exportBtn.addEventListener('click', exportTheme);
    }

    if (importBtn) {
        importBtn.addEventListener('click', () => {
            if (fileInput) fileInput.click();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                importTheme(file);
                fileInput.value = '';
            }
        });
    }
}

function updateCustomColorsVisibility() {
    const section = document.getElementById('custom-colors-section');
    if (!section) return;

    // Always show custom colors section so users
    // can see and tweak colors for any theme
    section.style.display = 'block';
}

function updateCustomColorInputs() {
    const theme = currentSettings.appearance.theme;
    const preset = THEME_PRESETS[theme];

    let colors;
    if (preset && preset.colors) {
        colors = preset.colors;
        // Sync custom colors with preset
        currentSettings.appearance.customColors = { ...colors };
    } else {
        colors = currentSettings.appearance.customColors;
    }

    const colorFields = [
        { id: 'custom-bg', key: 'bg' },
        { id: 'custom-panel', key: 'panel' },
        { id: 'custom-sidebar', key: 'sidebar' },
        { id: 'custom-header', key: 'header' },
        { id: 'custom-text', key: 'text' },
        { id: 'custom-text-secondary', key: 'textSecondary' },
        { id: 'custom-border', key: 'border' },
        { id: 'custom-terminal', key: 'terminal' }
    ];

    colorFields.forEach(field => {
        const colorInput = document.getElementById(field.id);
        const hexInput = document.getElementById(field.id + '-hex');
        const value = colors[field.key] || '#000000';

        if (colorInput) colorInput.value = value;
        if (hexInput) {
            hexInput.value = value;
            hexInput.classList.remove('input-error');
        }
    });
}

function setupEditorListeners() {
    const editorFontSize = document.getElementById('editor-font-size');
    const editorFontDisplay = document.getElementById('editor-font-display');
    const lineNumbers = document.getElementById('line-numbers');
    const wordWrap = document.getElementById('word-wrap');
    const autocomplete = document.getElementById('autocomplete');

    if (editorFontSize) {
        updateRangeFill(editorFontSize);
        editorFontSize.addEventListener('input', (e) => {
            const size = parseInt(e.target.value);
            currentSettings.editor.fontSize = size;
            if (editorFontDisplay) {
                editorFontDisplay.textContent = `${size}px`;
            }
            applyEditorFontSize(size);
            updateRangeFill(e.target);
        });
    }

    if (lineNumbers) {
        lineNumbers.addEventListener('change', (e) => {
            currentSettings.editor.lineNumbers = e.target.checked;
            applyLineNumbers(e.target.checked);
        });
    }

    if (wordWrap) {
        wordWrap.addEventListener('change', (e) => {
            currentSettings.editor.wordWrap = e.target.checked;
            applyWordWrap(e.target.checked);
        });
    }

    if (autocomplete) {
        autocomplete.addEventListener('change', (e) => {
            currentSettings.editor.autocomplete = e.target.checked;
            applyAutocomplete(e.target.checked);
        });
    }
}

function setupCompilerListeners() {
    const defaultCompiler = document.getElementById('default-compiler');
    const autoSave = document.getElementById('auto-save');
    const optimizationDefault = document.getElementById('optimization-default');

    if (defaultCompiler) {
        defaultCompiler.addEventListener('change', (e) => {
            currentSettings.compiler.defaultVersion = e.target.value;
            applyDefaultCompiler(e.target.value);
        });
    }

    if (autoSave) {
        autoSave.addEventListener('change', (e) => {
            currentSettings.compiler.autoSave = e.target.checked;
        });
    }

    if (optimizationDefault) {
        optimizationDefault.addEventListener('change', (e) => {
            currentSettings.compiler.optimizationDefault = e.target.checked;
            applyOptimizationDefault(e.target.checked);
        });
    }
}

function setupNetworkListeners() {
    const customRpc = document.getElementById('custom-rpc');
    const defaultGasPrice = document.getElementById('default-gas-price');
    const autoGasEstimation = document.getElementById('auto-gas-estimation');

    if (customRpc) {
        customRpc.addEventListener('change', (e) => {
            currentSettings.network.customRpc = e.target.value;
        });
    }

    if (defaultGasPrice) {
        defaultGasPrice.addEventListener('change', (e) => {
            currentSettings.network.defaultGasPrice = parseInt(e.target.value);
        });
    }

    if (autoGasEstimation) {
        autoGasEstimation.addEventListener('change', (e) => {
            currentSettings.network.autoGasEstimation = e.target.checked;
        });
    }
}

function switchSettingsTab(tabName) {
    currentSettingsTab = tabName;

    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    document.querySelectorAll('.settings-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.querySelector(`[data-panel="${tabName}"]`).classList.add('active');
}

function applySettings() {
    applyTheme(currentSettings.appearance.theme);
    applyAccentColor(currentSettings.appearance.accentColor);
    applyTerminalFontSize(currentSettings.appearance.terminalFontSize);
    applyEditorFontSize(currentSettings.editor.fontSize);
    applyLineNumbers(currentSettings.editor.lineNumbers);
    applyWordWrap(currentSettings.editor.wordWrap);
    applyAutocomplete(currentSettings.editor.autocomplete);
    applyDefaultCompiler(currentSettings.compiler.defaultVersion);
    applyOptimizationDefault(currentSettings.compiler.optimizationDefault);
}

function applyTheme(theme) {
    const body = document.body;
    const preset = THEME_PRESETS[theme];

    if (!preset) {
        // Fallback to dark
        applyTheme('dark');
        return;
    }

    // Remove all theme classes
    body.className = body.className
        .replace(/\b\w+-theme\b/g, '')
        .trim();

    // Set color scheme
    const scheme = preset.colorScheme || 'dark';
    if (scheme === 'light') {
        body.classList.add('light-theme');
    } else {
        body.classList.add('dark-theme');
    }
    document.documentElement.setAttribute('data-theme', scheme);
    document.documentElement.style.colorScheme = scheme;

    // Apply editor theme
    if (window.codeEditor) {
        window.codeEditor.setOption('theme',
            preset.editorTheme || 'material-darker'
        );
    }

    // Apply colors
    if (theme === 'custom') {
        applyCustomColors();
    } else if (preset.colors) {
        applyColorSet(preset.colors);
        // Sync custom colors with this preset
        currentSettings.appearance.customColors = {
            ...preset.colors
        };
    }
}

function applyColorSet(colors) {
    const root = document.documentElement;

    root.style.setProperty('--bg-primary', colors.bg);
    root.style.setProperty('--bg-secondary', colors.panel);
    root.style.setProperty('--bg-panel', colors.panel);
    root.style.setProperty('--bg-elevated', colors.sidebar);
    root.style.setProperty('--bg-contrast', colors.header);
    root.style.setProperty('--text-primary', colors.text);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--text-muted', colors.textSecondary);
    root.style.setProperty('--input-border', colors.border);
    root.style.setProperty('--border-color', colors.border);

    // Terminal background
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.style.background = colors.terminal;
    }

    // Header
    const header = document.querySelector('.remix-header');
    if (header) {
        header.style.background = colors.header;
    }

    // Sidebar
    const sidebar = document.querySelector('.remix-sidebar');
    if (sidebar) {
        sidebar.style.background = colors.panel;
    }

    // Icon panel
    const iconPanel = document.querySelector('.remix-icon-panel');
    if (iconPanel) {
        iconPanel.style.background = colors.sidebar;
    }

    // Main background
    const editor = document.querySelector('.remix-editor');
    if (editor) {
        editor.style.background = colors.bg;
    }

    // Terminal section
    const terminalSection = document.querySelector('.remix-terminal');
    if (terminalSection) {
        terminalSection.style.background = colors.terminal;
    }

    // CodeMirror background
    if (window.codeEditor) {
        const wrapper = window.codeEditor.getWrapperElement();
        if (wrapper) {
            wrapper.style.background = colors.bg;
        }
    }
}

function applyCustomColors() {
    const colors = currentSettings.appearance.customColors;
    if (colors) {
        applyColorSet(colors);
    }
}

function applyAccentColor(color) {
    const base = normalizeHex(color) || '#007acc';
    const soft = adjustColor(base, 18);
    const strong = adjustColor(base, -12);
    const deep = adjustColor(base, -22);
    const rgb = hexToRgb(base);
    const softRgb = hexToRgb(soft);
    const contrast = getContrastColor(base);
    const root = document.documentElement;
    root.style.setProperty('--accent-color', base);
    root.style.setProperty('--accent-color-soft', soft);
    root.style.setProperty('--accent-color-strong', strong);
    root.style.setProperty('--accent-color-deep', deep);
    root.style.setProperty('--accent-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
    root.style.setProperty('--accent-color-soft-rgb', `${softRgb.r}, ${softRgb.g}, ${softRgb.b}`);
    root.style.setProperty('--accent-color-contrast', contrast);
    if (currentSettings.appearance) {
        currentSettings.appearance.accentColor = base;
    }
}

function applyTerminalFontSize(size) {
    const terminal = document.getElementById('terminal');
    if (terminal) {
        terminal.style.fontSize = `${size}px`;
    }
}

function applyEditorFontSize(size) {
    if (window.codeEditor) {
        const wrapper = window.codeEditor.getWrapperElement();
        if (wrapper && wrapper.style) {
            wrapper.style.setProperty('font-size', `${size}px`, 'important');
        }
        window.codeEditor.refresh();
    }
}

function applyLineNumbers(show) {
    if (window.codeEditor) {
        window.codeEditor.setOption('lineNumbers', show);
    }
}

function applyWordWrap(wrap) {
    if (window.codeEditor) {
        window.codeEditor.setOption('lineWrapping', wrap);
    }
}

function applyAutocomplete(enabled) {
    if (window.codeEditor) {
        const extraKeys = window.codeEditor.getOption('extraKeys') || {};
        if (enabled) {
            extraKeys['Ctrl-Space'] = 'autocomplete';
        } else {
            delete extraKeys['Ctrl-Space'];
        }
        window.codeEditor.setOption('extraKeys', extraKeys);
    }
}

function applyDefaultCompiler(version) {
    const compilerSelect = document.getElementById('compiler-version');
    if (!compilerSelect) return;

    const availableVersions = Array.from(compilerSelect.options).map(option => option.value);
    if (version && availableVersions.includes(version)) {
        compilerSelect.value = version;
    } else if (availableVersions.length > 0) {
        compilerSelect.value = availableVersions[0];
    }
}

function applyOptimizationDefault(enabled) {
    const optimizationCheckbox = document.getElementById('enable-optimization');
    if (optimizationCheckbox) {
        optimizationCheckbox.checked = enabled;
    }
}

function exportTheme() {
    const themeData = {
        name: currentSettings.appearance.theme === 'custom'
            ? 'My Custom Theme'
            : THEME_PRESETS[currentSettings.appearance.theme]?.label
              || currentSettings.appearance.theme,
        version: '1.0',
        exportedAt: new Date().toISOString(),
        appearance: {
            theme: currentSettings.appearance.theme,
            accentColor: currentSettings.appearance.accentColor,
            customColors: { ...currentSettings.appearance.customColors }
        }
    };

    const blob = new Blob(
        [JSON.stringify(themeData, null, 2)],
        { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${themeData.name.toLowerCase()
        .replace(/\s+/g, '-')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    logToTerminal('📤 Theme exported successfully', 'success');
    showSettingsNotification('Theme exported!', 'success');
}

function importTheme(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const themeData = JSON.parse(e.target.result);

            if (!themeData.appearance
                || !themeData.appearance.customColors) {
                throw new Error('Invalid theme file format');
            }

            // Apply imported colors
            currentSettings.appearance.theme = 'custom';
            currentSettings.appearance.accentColor =
                themeData.appearance.accentColor
                || currentSettings.appearance.accentColor;
            currentSettings.appearance.customColors = {
                ...currentSettings.appearance.customColors,
                ...themeData.appearance.customColors
            };

            // Update UI
            const themeSelect = document.getElementById('theme-select');
            if (themeSelect) {
                themeSelect.value = 'custom';
            }

            updateCustomColorInputs();
            updateCustomColorsVisibility();
            applyTheme('custom');
            applyAccentColor(currentSettings.appearance.accentColor);
            updateSettingsUI();
            saveSettings();

            const themeName = themeData.name || 'Imported Theme';
            logToTerminal(
                `📥 Theme "${themeName}" imported successfully`,
                'success'
            );
            showSettingsNotification(
                `Theme "${themeName}" imported!`,
                'success'
            );

        } catch (error) {
            logToTerminal(
                `❌ Failed to import theme: ${error.message}`,
                'error'
            );
            showSettingsNotification(
                'Invalid theme file!', 'error'
            );
        }
    };

    reader.readAsText(file);
}

function updateRangeFill(element) {
    if (!element || element.type !== 'range') return;
    const min = Number(element.min) || 0;
    const max = Number(element.max) || 100;
    const value = clamp(Number(element.value) || 0, min, max);
    const percent = max === min ? 0 : ((value - min) / (max - min)) * 100;
    element.style.setProperty('--range-fill', `${percent}%`);
}

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function normalizeHex(value) {
    if (!value) return null;
    let hex = value.trim().replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(char => `${char}${char}`).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return null;
    }
    return `#${hex.toLowerCase()}`;
}

function hexToRgb(hex) {
    const normalized = normalizeHex(hex) || '#007acc';
    const value = normalized.replace('#', '');
    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16)
    };
}

function rgbToHex(r, g, b) {
    const toHex = (component) => {
        const clamped = clamp(Math.round(component), 0, 255);
        const str = clamped.toString(16);
        return str.length === 1 ? `0${str}` : str;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function hexToHsl(hex) {
    const { r, g, b } = hexToRgb(hex);
    const rNorm = r / 255;
    const gNorm = g / 255;
    const bNorm = b / 255;
    const max = Math.max(rNorm, gNorm, bNorm);
    const min = Math.min(rNorm, gNorm, bNorm);
    const delta = max - min;
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;
    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));
        switch (max) {
            case rNorm:
                h = ((gNorm - bNorm) / delta) % 6;
                break;
            case gNorm:
                h = (bNorm - rNorm) / delta + 2;
                break;
            default:
                h = (rNorm - gNorm) / delta + 4;
        }
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    const sat = clamp(s, 0, 100) / 100;
    const light = clamp(l, 0, 100) / 100;
    const chroma = (1 - Math.abs(2 * light - 1)) * sat;
    const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = light - chroma / 2;
    let r = 0;
    let g = 0;
    let b = 0;
    if (h >= 0 && h < 60) {
        r = chroma; g = x; b = 0;
    } else if (h < 120) {
        r = x; g = chroma; b = 0;
    } else if (h < 180) {
        r = 0; g = chroma; b = x;
    } else if (h < 240) {
        r = 0; g = x; b = chroma;
    } else if (h < 300) {
        r = x; g = 0; b = chroma;
    } else {
        r = chroma; g = 0; b = x;
    }
    return rgbToHex(
        (r + m) * 255,
        (g + m) * 255,
        (b + m) * 255
    );
}

function adjustColor(hex, delta) {
    const hsl = hexToHsl(hex);
    const lightness = clamp(hsl.l + delta, 5, 95);
    return hslToHex(hsl.h, hsl.s, lightness);
}

function getContrastColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#0f172a' : '#ffffff';
}

function updateSettingsUI() {
    // Appearance
    const accentHue = document.getElementById('accent-hue');
    const accentHex = document.getElementById('accent-hex');
    const accentPreview = document.getElementById('accent-preview');
    const themeSelect = document.getElementById('theme-select');
    const terminalFontSize = document.getElementById('terminal-font-size');
    const terminalFontDisplay = document.getElementById('terminal-font-display');

    const accentHsl = hexToHsl(currentSettings.appearance.accentColor);
    if (accentHex) {
        accentHex.value = currentSettings.appearance.accentColor;
        accentHex.classList.remove('input-error');
    }
    if (accentHue) {
        accentHue.value = Math.round(accentHsl.h);
        updateRangeFill(accentHue);
    }
    if (accentPreview) {
        accentPreview.style.background = currentSettings.appearance.accentColor;
    }

    if (themeSelect) themeSelect.value = currentSettings.appearance.theme;
    if (terminalFontSize) terminalFontSize.value = currentSettings.appearance.terminalFontSize;
    if (terminalFontDisplay) terminalFontDisplay.textContent = `${currentSettings.appearance.terminalFontSize}px`;
    if (terminalFontSize) updateRangeFill(terminalFontSize);

    updateCustomColorInputs();
    updateCustomColorsVisibility();

    // Editor
    const editorFontSize = document.getElementById('editor-font-size');
    const editorFontDisplay = document.getElementById('editor-font-display');
    const lineNumbers = document.getElementById('line-numbers');
    const wordWrap = document.getElementById('word-wrap');
    const autocomplete = document.getElementById('autocomplete');

    if (editorFontSize) editorFontSize.value = currentSettings.editor.fontSize;
    if (editorFontDisplay) editorFontDisplay.textContent = `${currentSettings.editor.fontSize}px`;
    if (lineNumbers) lineNumbers.checked = currentSettings.editor.lineNumbers;
    if (wordWrap) wordWrap.checked = currentSettings.editor.wordWrap;
    if (autocomplete) autocomplete.checked = currentSettings.editor.autocomplete;
    if (editorFontSize) updateRangeFill(editorFontSize);

    // Compiler
    const defaultCompiler = document.getElementById('default-compiler');
    const autoSave = document.getElementById('auto-save');
    const optimizationDefault = document.getElementById('optimization-default');

    if (defaultCompiler) defaultCompiler.value = currentSettings.compiler.defaultVersion;
    if (autoSave) autoSave.checked = currentSettings.compiler.autoSave;
    if (optimizationDefault) optimizationDefault.checked = currentSettings.compiler.optimizationDefault;

    // Network
    const customRpc = document.getElementById('custom-rpc');
    const defaultGasPrice = document.getElementById('default-gas-price');
    const autoGasEstimation = document.getElementById('auto-gas-estimation');

    if (customRpc) customRpc.value = currentSettings.network.customRpc;
    if (defaultGasPrice) defaultGasPrice.value = currentSettings.network.defaultGasPrice;
    if (autoGasEstimation) autoGasEstimation.checked = currentSettings.network.autoGasEstimation;
}

function saveSettings() {
    try {
        localStorage.setItem('remix-settings', JSON.stringify(currentSettings));
        logToTerminal('💾 Settings saved successfully', 'success');
        showSettingsNotification('Settings saved!', 'success');
    } catch (error) {
        console.error('Error saving settings:', error);
        logToTerminal('❌ Failed to save settings', 'error');
        showSettingsNotification('Failed to save settings!', 'error');
    }
}

function loadSettings() {
    try {
        const saved = localStorage.getItem('remix-settings');
        if (saved) {
            const loadedSettings = JSON.parse(saved);

            currentSettings = {
                ...currentSettings,
                ...loadedSettings,
                appearance: {
                    ...currentSettings.appearance,
                    ...loadedSettings.appearance,
                    customColors: {
                        ...currentSettings.appearance.customColors,
                        ...(loadedSettings.appearance?.customColors || {})
                    }
                },
                editor: { ...currentSettings.editor, ...loadedSettings.editor },
                compiler: { ...currentSettings.compiler, ...loadedSettings.compiler },
                network: { ...currentSettings.network, ...loadedSettings.network }
            };
        }
    } catch (error) {
        console.error('Error loading settings:', error);
        logToTerminal('⚠️ Failed to load settings, using defaults', 'warning');
    }
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        currentSettings = {
            appearance: {
                theme: 'midnight',
                accentColor: '#007acc',
                terminalFontSize: 13,
                customColors: {
                    bg: '#0d1117',
                    panel: '#161b22',
                    sidebar: '#1c2128',
                    header: '#0a0e14',
                    text: '#c9d1d9',
                    textSecondary: '#8b949e',
                    border: '#30363d',
                    terminal: '#090d13'
                }
            },
            editor: {
                fontSize: 13,
                lineNumbers: true,
                wordWrap: false,
                autocomplete: true
            },
            compiler: {
                defaultVersion: '0.8.4',
                autoSave: true,
                optimizationDefault: true
            },
            network: {
                customRpc: '',
                defaultGasPrice: 20,
                autoGasEstimation: true
            }
        };

        // Remove inline styles from elements
        const root = document.documentElement;
        const cssProps = [
            '--bg-primary', '--bg-secondary', '--bg-panel',
            '--bg-elevated', '--bg-contrast',
            '--text-primary', '--text-secondary', '--text-muted',
            '--input-border', '--border-color'
        ];
        cssProps.forEach(prop => root.style.removeProperty(prop));

        const elements = [
            document.getElementById('terminal'),
            document.querySelector('.remix-header'),
            document.querySelector('.remix-sidebar'),
            document.querySelector('.remix-icon-panel'),
            document.querySelector('.remix-editor'),
            document.querySelector('.remix-terminal')
        ];
        elements.forEach(el => {
            if (el) el.style.background = '';
        });

        if (window.codeEditor) {
            const wrapper = window.codeEditor.getWrapperElement();
            if (wrapper) wrapper.style.background = '';
        }

        updateSettingsUI();
        applySettings();
        saveSettings();

        logToTerminal('🔄 Settings reset to defaults', 'info');
        showSettingsNotification('Settings reset to defaults!', 'info');
    }
}

function showSettingsNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'settings-notification';
    notification.textContent = message;

    const colors = {
        success: '#51cf66',
        error: '#ff6b6b',
        info: '#74c0fc'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        animation: slideInRight 0.3s ease-out forwards;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function getCurrentSettings() {
    return { ...currentSettings };
}

function updateSetting(section, key, value) {
    if (currentSettings[section]) {
        currentSettings[section][key] = value;
        saveSettings();

        switch (section) {
            case 'appearance':
                if (key === 'theme') applyTheme(value);
                if (key === 'accentColor') applyAccentColor(value);
                if (key === 'terminalFontSize') applyTerminalFontSize(value);
                break;
            case 'editor':
                if (key === 'fontSize') applyEditorFontSize(value);
                if (key === 'lineNumbers') applyLineNumbers(value);
                if (key === 'wordWrap') applyWordWrap(value);
                if (key === 'autocomplete') applyAutocomplete(value);
                break;
            case 'compiler':
                if (key === 'defaultVersion') applyDefaultCompiler(value);
                if (key === 'optimizationDefault') applyOptimizationDefault(value);
                break;
        }
    }
}

// initializeSettingsPlugin is called from app.js once the app is fully loaded.

window.settingsPlugin = {
    getCurrentSettings,
    updateSetting,
    saveSettings,
    resetSettings,
    exportTheme,
    importTheme
};
