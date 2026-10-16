

function showLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.style.display = 'flex';
        loader.classList.remove('fade-out');
    }
}

function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (loader) {
        loader.classList.add('fade-out');
        setTimeout(() => {
            loader.style.display = 'none';
        }, 500); 
    }
}


window.addEventListener('load', async () => {
    const loaderShownAt = Date.now();

    setupEventListeners();
    setupPluginSwitching();
    await setupCodeEditor();
    await new Promise(resolve => setTimeout(resolve, 0));

    setupFileSystem();
    setupResizers();
    await new Promise(resolve => setTimeout(resolve, 0));

    if (typeof initializeSettingsPlugin === 'function') {
        initializeSettingsPlugin();
    }

    if (typeof initializeWalletDetection === 'function') {
        initializeWalletDetection();
    }

    switchPlugin('fileManager');

    // Wait for web fonts (capped so the loader never hangs) and the first paint
    if (document.fonts && document.fonts.ready) {
        await Promise.race([
            document.fonts.ready,
            new Promise(resolve => setTimeout(resolve, 1500))
        ]);
    }
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    // Give the layout a short moment to settle after fonts/paint
    await new Promise(resolve => setTimeout(resolve, 300));

    // Keep the loader visible for at least 2.5s so everything feels fully ready
    const elapsed = Date.now() - loaderShownAt;
    if (elapsed < 2500) {
        await new Promise(resolve => setTimeout(resolve, 2500 - elapsed));
    }

    hideLoader();
});


window.addEventListener('beforeunload', () => {
    showLoader();
});

let activePlugin = 'fileManager';
let currentFile = 'contracts/README.sol';
let fileContents = {};



function setupPluginSwitching() {
    const iconItems = document.querySelectorAll('.icon-item');
    iconItems.forEach(item => {
        item.addEventListener('click', () => {
            const plugin = item.getAttribute('data-plugin');
            switchPlugin(plugin);
        });
    });
}


function switchPlugin(pluginName) {
    
    
    document.querySelectorAll('.icon-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-plugin="${pluginName}"]`).classList.add('active');
    
    
    document.querySelectorAll('.plugin-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`[data-content="${pluginName}"]`).classList.add('active');
    
    activePlugin = pluginName;
}

function showPluginSuccess(pluginName) {
    const iconItem = document.querySelector(`[data-plugin="${pluginName}"]`);
    if (!iconItem) return;
    
    
    const existingSuccess = iconItem.querySelector('.plugin-success');
    if (existingSuccess) existingSuccess.remove();
    
    
    const successIndicator = document.createElement('div');
    successIndicator.className = 'plugin-success';
    successIndicator.innerHTML = '✓';
    successIndicator.style.cssText = `
        position: absolute;
        top: 2px;
        right: 2px;
        background: #28a745;
        color: white;
        border-radius: 50%;
        width: 12px;
        height: 12px;
        font-size: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    `;
    
    iconItem.appendChild(successIndicator);
}

function setupResizers() {
    const verticalResizer = document.getElementById('vertical-resizer');
    const horizontalResizer = document.getElementById('horizontal-resizer');
    const sidebar = document.querySelector('.remix-sidebar');
    const terminal = document.querySelector('.remix-terminal');
    const rightSection = document.querySelector('.right-section');
    
    let isResizing = false;
    
    
    verticalResizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleVerticalResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });
    
    function handleVerticalResize(e) {
        if (!isResizing) return;
        
        const mainContent = document.querySelector('.main-content');
        const containerRect = mainContent.getBoundingClientRect();
        const newWidth = e.clientX - containerRect.left;
        
        
        if (newWidth >= 200 && newWidth <= 500) {
            sidebar.style.width = newWidth + 'px';
        }
    }
    
    
    horizontalResizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.addEventListener('mousemove', handleHorizontalResize);
        document.addEventListener('mouseup', stopResize);
        e.preventDefault();
    });
    
    function handleHorizontalResize(e) {
        if (!isResizing) return;
        
        const rightSectionRect = rightSection.getBoundingClientRect();
        const newHeight = rightSectionRect.bottom - e.clientY;
        
        
        if (newHeight >= 80 && newHeight <= 400) {
            terminal.style.height = newHeight + 'px';
        }
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleVerticalResize);
        document.removeEventListener('mousemove', handleHorizontalResize);
        document.removeEventListener('mouseup', stopResize);
    }
}


function setupFileSystem() {
    
    
    const savedFiles = localStorage.getItem('remix-files');
    if (savedFiles) {
        try {
            fileContents = JSON.parse(savedFiles);
        } catch (error) {
            fileContents = {};
        }
    }
    
    
    if (Object.keys(fileContents).length === 0) {
        fileContents = {
            'contracts/README.sol': getDefaultContractContent()
        };
        saveFilesToStorage();
    }
    
    
    generateFileExplorerFromStorage();
    
    
    const firstFile = Object.keys(fileContents)[0];
    const waitForEditor = setInterval(() => {
      if (window.codeEditor !== undefined) {
        clearInterval(waitForEditor);
        if (firstFile) {
            openFile(firstFile);
        }
      }
    }, 100);
    
    
}


function getDefaultContractContent() {
    return `// This is an example code file, create a new one to get started!

/// @title ExampleContract
/// @notice This is placeholder code. Create a new file to get started!
contract ExampleContract {
    /// @notice A simple stored value to demonstrate state.
    uint256 public value;

    /// @notice The address that deployed this contract.
    address public owner;

    /// @notice Emitted whenever the stored value changes.
    event ValueUpdated(uint256 oldValue, uint256 newValue);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Update the stored value.
    /// @param newValue The new value to store.
    function setValue(uint256 newValue) external onlyOwner {
        uint256 oldValue = value;
        value = newValue;
        emit ValueUpdated(oldValue, newValue);
    }

    /// @notice Read the stored value (redundant with the public getter,
    ///         but here as an example of a view function).
    function getValue() external view returns (uint256) {
        return value;
    }
}`;
}


function saveFilesToStorage() {
    try {
        const dataToSave = JSON.stringify(fileContents);
        localStorage.setItem('remix-files', dataToSave);
        
        
        const saved = localStorage.getItem('remix-files');
        if (!saved) {
            console.error('Failed to save to localStorage - quota exceeded?');
            logToTerminal('⚠️ Warning: Files may not be saved due to storage limits', 'warning');
        }
    } catch (error) {
        console.error('Error saving files:', error);
        logToTerminal('❌ Error saving files to browser storage', 'error');
    }
}


function generateFileExplorerFromStorage() {
    const fileExplorer = document.getElementById('file-explorer');
    const contractsFolder = fileExplorer.querySelector('.folder-content');
    
    
    contractsFolder.innerHTML = '';
    
    
    // Grouping files into folders
    const folders = {};
    Object.keys(fileContents).forEach(filePath => {
        if (filePath.startsWith('contracts/')) {
            const pathParts = filePath.split('/');
            if (pathParts.length === 2) {
                // The file directly in the contracts/
                const fileName = pathParts[1];
                if (!fileName.startsWith('.')) { // We do not show hidden files
                    const fileElement = createFileElement(filePath, fileName);
                    contractsFolder.appendChild(fileElement);
                }
            } else if (pathParts.length > 2) {
                // File in a subfolder
                const subFolderName = pathParts[1];
                if (!folders[subFolderName]) {
                    folders[subFolderName] = [];
                }
                if (!pathParts[2].startsWith('.')) { // We do not show hidden files
                    folders[subFolderName].push(filePath);
                }
            }
        }
    });
    
    // Add subfolders
    Object.keys(folders).forEach(folderName => {
        const folderElement = createFolderElement(folderName, folders[folderName]);
        contractsFolder.appendChild(folderElement);
    });
    

}

// IMPROVED: Creating a file item from the context menu
function createFileElement(filePath, fileName) {
    const fileElement = document.createElement('div');
    fileElement.className = `file-item ${filePath === currentFile ? 'active' : ''}`;
    fileElement.setAttribute('data-file', filePath);
    
    
    fileElement.addEventListener('click', (e) => {
        e.stopPropagation();
        openFile(filePath);
    });
    
    
    fileElement.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, filePath);
    });
    
    
    fileElement.draggable = true;
    fileElement.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', filePath);
        fileElement.classList.add('dragging');
    });
    
    fileElement.addEventListener('dragend', () => {
        fileElement.classList.remove('dragging');
    });
    
    fileElement.innerHTML = `
        <svg class="file-icon" width="16" height="16" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" fill="var(--accent-color)"/>
        </svg>
        <span class="file-name">${fileName}</span>
    `;
    
    return fileElement;
}


function createFolderElement(folderName, files) {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'folder-item expanded';
    
    const folderHeader = document.createElement('div');
    folderHeader.className = 'folder-header';
    folderHeader.innerHTML = `
        <svg class="folder-icon" width="16" height="16" viewBox="0 0 24 24">
            <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.11,6 20,6H12L10,4Z" fill="currentColor"/>
        </svg>
        <span class="folder-name">${folderName}</span>
        <div class="folder-actions">
            <button class="folder-action-btn" title="New File" onclick="createNewFile('contracts/${folderName}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
            </button>
            <button class="folder-action-btn" title="New Folder" onclick="createNewFolder('contracts/${folderName}')">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M10,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V8C22,6.89 21.11,6 20,6H12L10,4Z"/>
                </svg>
            </button>
        </div>
    `;
    
    const folderContent = document.createElement('div');
    folderContent.className = 'folder-content';
    
    files.forEach(filePath => {
        const fileName = filePath.split('/').pop();
        const fileElement = createFileElement(filePath, fileName);
        folderContent.appendChild(fileElement);
    });
    
    folderDiv.appendChild(folderHeader);
    folderDiv.appendChild(folderContent);
    
    return folderDiv;
}


function setupEventListeners() {
    
    
    document.getElementById('create-file-main-btn').addEventListener('click', () => createNewFile('contracts'));
    document.getElementById('create-folder-main-btn').addEventListener('click', () => createNewFolder('contracts'));
    
    
    const createFileBtn = document.getElementById('create-file-btn');
    const createFolderBtn = document.getElementById('create-folder-btn');
    if (createFileBtn) createFileBtn.addEventListener('click', () => createNewFile('contracts'));
    if (createFolderBtn) createFolderBtn.addEventListener('click', () => createNewFolder('contracts'));
    
    
    document.getElementById('compile-btn').addEventListener('click', compileContract);
    
    
    document.getElementById('environment-select').addEventListener('change', handleEnvironmentChange);
    document.getElementById('switch-wallet-btn').addEventListener('click', switchWalletExtension);
    document.getElementById('contract-select').addEventListener('change', handleContractChange);
    document.getElementById('deploy-btn').addEventListener('click', deployContract);
    document.getElementById('at-address-btn').addEventListener('click', loadContractAtAddress);
    
    
    document.getElementById('clear-terminal-btn').addEventListener('click', clearTerminal);
    
    
    const closeModalBtn = document.getElementById('close-modal-btn');
    const installMetaMaskBtn = document.getElementById('install-metamask-btn');
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', hideMetaMaskModal);
    }
    
    if (installMetaMaskBtn) {
        installMetaMaskBtn.addEventListener('click', () => {
            window.open('https://phantom.com/download/', '_blank');
        });
    }
    
    
    
    
    
    
    
    
        
    
    
    
    
    
    
    
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu();
        }
    });
    
}


function createNewFile(folderPath = 'contracts') {
    showInputModal('Create New File', 'Enter file name (e.g., NewContract):', 'MyContract', (fileName) => {
        if (!fileName) return;

        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(fileName.replace('.sol', ''))) {
            showAlertModal('Invalid File Name', 'Use only letters, numbers, and underscores. Must start with a letter.');
            return;
        }

        const fullFileName = fileName.endsWith('.sol') ? fileName : fileName + '.sol';
        const fullPath = `${folderPath}/${fullFileName}`;

        if (fileContents[fullPath]) {
            showAlertModal('File Exists', 'A file with this name already exists.');
            return;
        }

        const defaultContent = '';

        fileContents[fullPath] = defaultContent;
        saveFilesToStorage();

        generateFileExplorerFromStorage();

        currentFile = fullPath;

        if (window.codeEditor) {
            window.codeEditor.setValue("");
            window.codeEditor.clearHistory();
        }

        document.getElementById('current-file-name').textContent = fullPath;
        updateEditorTabs();
        openFile(currentFile);

        setTimeout(() => {
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('data-file') === fullPath) {
                    item.classList.add('active');
                }
            });
        }, 50);

        logToTerminal(`📁 Created new file: ${fullPath}`, 'success');
    });
}

function createNewFolder(parentPath = 'contracts') {
    showInputModal('Create New Folder', 'Enter folder name:', 'NewFolder', (folderName) => {
        if (!folderName) return;

        if (!/^[a-zA-Z0-9_-]+$/.test(folderName)) {
            showAlertModal('Invalid Folder Name', 'Folder name can only contain letters, numbers, hyphens and underscores.');
            return;
        }

        const folderPath = `${parentPath}/${folderName}`;

        fileContents[`${folderPath}/.placeholder`] = '// This is a placeholder file to create the folder structure';

        saveFilesToStorage();
        generateFileExplorerFromStorage();
        logToTerminal(`📂 Created new folder: ${folderPath}`, 'success');
    });
}

function showInputModal(title, message, placeholder, onConfirm) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width:420px;">
            <div class="modal-header">
                <h2>${title}</h2>
            </div>
            <div class="modal-body">
                <p style="margin-bottom:12px;color:var(--text-secondary);font-size:13px;">
                    ${message}
                </p>
                <input type="text"
                       id="modal-input-field"
                       class="form-control"
                       placeholder="${placeholder}"
                       autocomplete="off"
                       spellcheck="false"
                       style="width:100%;
                              padding:10px 12px;
                              font-size:14px;
                              border-radius:6px;
                              border:1px solid var(--input-border);
                              background:var(--bg-primary);
                              color:var(--text-primary);
                              outline:none;">
                <div id="modal-input-error"
                     style="display:none;
                            margin-top:8px;
                            color:#ff6b6b;
                            font-size:12px;">
                </div>
            </div>
            <div class="modal-footer"
                 style="display:flex;gap:8px;
                        justify-content:flex-end;">
                <button class="remix-btn remix-btn-secondary"
                        id="modal-cancel-btn">
                    Cancel
                </button>
                <button class="remix-btn remix-btn-primary"
                        id="modal-confirm-btn">
                    Create
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const inputField = modal.querySelector('#modal-input-field');
    const confirmBtn = modal.querySelector('#modal-confirm-btn');
    const cancelBtn = modal.querySelector('#modal-cancel-btn');
    const overlay = modal.querySelector('.modal-overlay');

    // Focus the input after a brief delay
    setTimeout(() => {
        inputField.focus();
    }, 50);

    function closeModal() {
        modal.querySelector('.modal-content').style.transform = 'scale(0.95)';
        modal.querySelector('.modal-content').style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 150);
    }

    function handleConfirm() {
        const value = inputField.value.trim();
        if (!value) {
            const errorDiv = modal.querySelector('#modal-input-error');
            errorDiv.textContent = 'Please enter a name.';
            errorDiv.style.display = 'block';
            inputField.style.borderColor = '#ff6b6b';
            inputField.focus();
            return;
        }
        closeModal();
        onConfirm(value);
    }

    confirmBtn.addEventListener('click', handleConfirm);

    cancelBtn.addEventListener('click', () => {
        closeModal();
    });

    overlay.addEventListener('click', () => {
        closeModal();
    });

    inputField.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
        }
    });

    // Clear error styling on input
    inputField.addEventListener('input', () => {
        const errorDiv = modal.querySelector('#modal-input-error');
        errorDiv.style.display = 'none';
        inputField.style.borderColor = 'var(--input-border)';
    });

    // Animate in
    setTimeout(() => {
        const content = modal.querySelector('.modal-content');
        content.style.transform = 'scale(1)';
        content.style.opacity = '1';
    }, 10);
}

function showAlertModal(title, message) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width:400px;">
            <div class="modal-header">
                <h2>${title}</h2>
            </div>
            <div class="modal-body">
                <p style="color:var(--text-secondary);font-size:13px;line-height:1.5;">
                    ${message}
                </p>
            </div>
            <div class="modal-footer"
                 style="display:flex;justify-content:flex-end;">
                <button class="remix-btn remix-btn-primary"
                        id="modal-ok-btn">
                    OK
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const okBtn = modal.querySelector('#modal-ok-btn');
    const overlay = modal.querySelector('.modal-overlay');

    function closeModal() {
        modal.querySelector('.modal-content').style.transform = 'scale(0.95)';
        modal.querySelector('.modal-content').style.opacity = '0';
        setTimeout(() => {
            if (modal.parentNode) {
                document.body.removeChild(modal);
            }
        }, 150);
    }

    okBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Enter' || e.key === 'Escape') {
            e.preventDefault();
            closeModal();
            document.removeEventListener('keydown', handler);
        }
    });

    setTimeout(() => {
        const content = modal.querySelector('.modal-content');
        content.style.transform = 'scale(1)';
        content.style.opacity = '1';
    }, 10);
}


function openFile(filePath) {
    if (!(filePath in fileContents)) {
        logToTerminal(`❌ File not found: ${filePath}`, 'error');
        console.error('File not found in fileContents:', filePath);
        
        const availableFiles = Object.keys(fileContents);
        if (availableFiles.length > 0) {
            const fallbackFile = availableFiles[0];
            openFile(fallbackFile);
        }
        return;
    }

    
    if (currentFile && fileContents[currentFile] !== undefined && window.codeEditor) {
        const currentContent = window.codeEditor.getValue();
        if (currentContent !== fileContents[currentFile]) {
            fileContents[currentFile] = currentContent;
            saveFilesToStorage();
        }
    }
    
    currentFile = filePath;

    
    if (window.codeEditor) {
        window.codeEditor.setValue(fileContents[filePath]);
        window.codeEditor.clearHistory(); 
    }
    
    
    document.getElementById('current-file-name').textContent = filePath;
    
    
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-file') === filePath) {
            item.classList.add('active');
        }
    });
    
    updateEditorTabs();
    updateCompilerVersion();
    
    
    clearCompilationResults();
    
    
    const compileBtn = document.getElementById('compile-btn');
    const fileName = filePath.split('/').pop();
    compileBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
        </svg>
        Compile ${fileName}
    `;
}


function updateEditorTabs() {
    const tabsContainer = document.querySelector('.editor-tabs');
    const existingTabs = tabsContainer.querySelectorAll('.editor-tab');
    
    
    existingTabs.forEach(tab => {
        if (!tab.classList.contains('new-tab-btn')) {
            tab.remove();
        }
    });
    
    
    const fileName = currentFile.split('/').pop();
    const tabElement = document.createElement('div');
    tabElement.className = 'editor-tab active';
    tabElement.setAttribute('data-file', currentFile);
    
    
    tabElement.addEventListener('click', () => {
        if (currentFile !== tabElement.getAttribute('data-file')) {
            openFile(tabElement.getAttribute('data-file'));
        }
    });
    
    tabElement.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
        <span>${fileName}</span>
        <button class="tab-close" onclick="event.stopPropagation(); closeFile('${currentFile}')">×</button>
    `;
    
    
    const newTabBtn = tabsContainer.querySelector('.new-tab-btn');
    tabsContainer.insertBefore(tabElement, newTabBtn);
}


function closeFile(filePath) {
    if (Object.keys(fileContents).length <= 1) {
        alert('Cannot close the last file');
        return;
    }
    
    delete fileContents[filePath];
    saveFilesToStorage();
    
    
    const remainingFiles = Object.keys(fileContents);
    if (remainingFiles.length > 0) {
        openFile(remainingFiles[0]);
    }
    
    generateFileExplorerFromStorage();
    logToTerminal(`❌ Closed file: ${filePath}`, 'info');
}


function updateCompilerVersion() {
    if (!currentFile || !fileContents[currentFile]) return;

    const compilerSelect = document.getElementById('compiler-version');
    if (!compilerSelect) return;

    const availableVersions = Array.from(compilerSelect.options).map(option => option.value);
    if (availableVersions.length === 0) return;

    const sourceCode = fileContents[currentFile];
    const pragmaMatch = sourceCode.match(/pragma\s+solidity\s+[\^~>=<\s]*([0-9]+\.[0-9]+\.[0-9]+)/);

    if (pragmaMatch) {
        const version = pragmaMatch[1];

        // Exact match first
        if (availableVersions.includes(version)) {
            compilerSelect.value = version;
            return;
        }

        // Fallback: nearest available version that satisfies the pragma range
        const targetParts = version.split('.').map(Number);
        const candidates = availableVersions
            .map(v => ({ v, parts: v.split('.').map(Number) }))
            .filter(({ parts }) => parts[0] === targetParts[0] && (
                parts[1] > targetParts[1] ||
                (parts[1] === targetParts[1] && parts[2] >= targetParts[2])
            ));
        candidates.sort((a, b) => a.parts[1] - b.parts[1] || a.parts[2] - b.parts[2]);

        if (candidates.length > 0) {
            compilerSelect.value = candidates[0].v;
            return;
        }
    }

    // No pragma / no suitable match: keep current if valid, otherwise select the first option
    if (!availableVersions.includes(compilerSelect.value)) {
        compilerSelect.value = availableVersions[0];
    }
}


function clearCompilationResults() {
    const compilationResult = document.getElementById('compilation-result');
    compilationResult.className = 'compilation-output';
    compilationResult.innerHTML = '<div class="output-placeholder">Select a Solidity file to compile</div>';
    
    const contractSelect = document.getElementById('contract-select');
    contractSelect.innerHTML = '<option value="">No compiled contracts</option>';
    
    window.compiledContract = null;
    window.currentContractABI = null;
    updateDeployButton();
}
