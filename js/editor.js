


let codeEditor; 
let contextMenuTarget = null;


function createCustomSolidityMode() {
    CodeMirror.defineMode("solidity", function() {
        
        const keywords = {
            
            "contract": "keyword", "library": "keyword", "interface": "keyword",
            "function": "keyword", "modifier": "keyword", "event": "keyword",
            "struct": "keyword", "enum": "keyword", "mapping": "keyword",
            "constructor": "keyword", "fallback": "keyword", "receive": "keyword",
            "require": "keyword", "assert": "keyword", "revert": "keyword",
            "return": "keyword", "returns": "keyword", "emit": "keyword",
            
            
            "public": "keyword", "private": "keyword", "internal": "keyword", "external": "keyword",
            
            
            "view": "builtin", "pure": "builtin", "payable": "builtin", "constant": "builtin",
            "virtual": "builtin", "override": "builtin", "abstract": "builtin",
            
            
            "bool": "type", "string": "type", "address": "type", "bytes": "type",
            "uint": "type", "int": "type", "fixed": "type", "ufixed": "type",
            "uint8": "type", "uint16": "type", "uint32": "type", "uint64": "type",
            "uint128": "type", "uint256": "type", "int8": "type", "int16": "type",
            "int32": "type", "int64": "type", "int128": "type", "int256": "type",
            "bytes1": "type", "bytes2": "type", "bytes4": "type", "bytes8": "type",
            "bytes16": "type", "bytes32": "type",
            
            
            "storage": "keyword", "memory": "keyword", "calldata": "keyword",
            
            
            "if": "keyword", "else": "keyword", "for": "keyword", "while": "keyword",
            "do": "keyword", "break": "keyword", "continue": "keyword",
            "try": "keyword", "catch": "keyword", "throw": "keyword",
            
            
            "pragma": "meta", "import": "meta", "using": "keyword", "is": "keyword",
            "assembly": "keyword", "delete": "keyword", "new": "keyword",
            
            
            "this": "atom", "super": "atom",
            
            
            "msg": "builtin", "tx": "builtin", "block": "builtin", "now": "builtin",
            "selfdestruct": "builtin", "suicide": "builtin",
            
            
            "keccak256": "builtin", "sha256": "builtin", "ripemd160": "builtin",
            "ecrecover": "builtin", "addmod": "builtin", "mulmod": "builtin",
            
            
            "true": "atom", "false": "atom", "null": "atom"
        };
        
        return {
            token: function(stream, state) {
                
                if (stream.eatSpace()) return null;
                
                
                if (stream.match(/\/\/.*/)) {
                    return "comment";
                }
                
                
                if (stream.match(/\/\*/)) {
                    state.inComment = true;
                    return "comment";
                }
                if (state.inComment) {
                    if (stream.match(/\*\//)) {
                        state.inComment = false;
                    } else {
                        stream.next();
                    }
                    return "comment";
                }
                
                
                if (stream.match(/^"([^"\\]|\\.)*"/)) return "string";
                if (stream.match(/^'([^'\\]|\\.)*'/)) return "string";
                
                // Hex Numbers – Light Blue
                if (stream.match(/^0x[a-fA-F0-9]+/)) return "number";
                
                // Decimal numbers - light blue
                if (stream.match(/^\d+(\.\d+)?(e[+-]?\d+)?/)) return "number";
                
                // Ether units - light blue
                if (stream.match(/\b\d+(\.\d+)?\s*(wei|gwei|ether)\b/)) return "number";
                
                // Time units - light blue
                if (stream.match(/\b\d+\s*(seconds|minutes|hours|days|weeks|years)\b/)) return "number";
                
                // Addresses - yellow (as lines)
                if (stream.match(/^0x[a-fA-F0-9]{40}/)) return "string";
                
                // Identifiers and keywords
                if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
                    const word = stream.current();
                    return keywords[word] || "variable";
                }
                
                // Operators
                if (stream.match(/^[+\-*/%=<>!&|^~?:]/)) return "operator";
                
                // Punctuation and parentheses
                if (stream.match(/^[{}()\[\];,\.]/)) return "bracket";
                
                // Other characters
                stream.next();
                return null;
            },
            
            startState: function() {
                return {
                    inComment: false
                };
            }
        };
    });
}

// IMPROVED: CodeMirror editor settings with beautiful features
async function setupCodeEditor() {
    return new Promise((resolve) => {
        
        // Add custom Solidity mode if it is not
        if (typeof CodeMirror.modes.solidity === 'undefined') {
            createCustomSolidityMode();
        }
        
        setTimeout(() => {
            initializeCodeMirror();
            resolve();
        }, 100);
    });
}
function initializeCodeMirror() {
    
    codeEditor = CodeMirror(document.getElementById('code-editor'), {
        mode: 'solidity',
        theme: 'material-darker',
        lineNumbers: true,
        indentUnit: 4,
        indentWithTabs: false,
        autoCloseBrackets: true,
        matchBrackets: true,
        highlightSelectionMatches: { showToken: /\w/, annotateScrollbar: true },
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        styleActiveLine: true, 
        selectionPointer: true,
        cursorBlinkRate: 530,
        extraKeys: {
            "Ctrl-Space": "autocomplete",
            "Ctrl-S": function(cm) {
                saveCurrentFile();
            },
            "Ctrl-Shift-C": function(cm) {
                compileContract();
            },
            "Ctrl-/": "toggleComment", 
            "Ctrl-D": "duplicateLine", 
            "Alt-Up": "swapLineUp", 
            "Alt-Down": "swapLineDown", 
            "Ctrl-F": "findPersistent", 
            "F11": function(cm) {
                cm.setOption("fullScreen", !cm.getOption("fullScreen"));
            },
            "Esc": function(cm) {
                if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
            }
        },
        value: getDefaultContractContent()
    });
    
    
    setupEditorFeatures();
    
    
    codeEditor.on('change', handleCodeChange);
    codeEditor.on('cursorActivity', updateEditorStatus);
    codeEditor.on('focus', handleEditorFocus);
    codeEditor.on('blur', handleEditorBlur);
    
    
    window.codeEditor = codeEditor;
    
}


function setupEditorFeatures() {
    
    CodeMirror.commands.duplicateLine = function(cm) {
        const cursor = cm.getCursor();
        const line = cm.getLine(cursor.line);
        cm.replaceRange('\n' + line, { line: cursor.line, ch: line.length });
        cm.setCursor(cursor.line + 1, cursor.ch);
    };
    
    
    CodeMirror.commands.swapLineUp = function(cm) {
        const cursor = cm.getCursor();
        if (cursor.line > 0) {
            const line = cm.getLine(cursor.line);
            const prevLine = cm.getLine(cursor.line - 1);
            cm.replaceRange(line + '\n' + prevLine, 
                { line: cursor.line - 1, ch: 0 }, 
                { line: cursor.line + 1, ch: 0 });
            cm.setCursor(cursor.line - 1, cursor.ch);
        }
    };
    
    CodeMirror.commands.swapLineDown = function(cm) {
        const cursor = cm.getCursor();
        if (cursor.line < cm.lastLine()) {
            const line = cm.getLine(cursor.line);
            const nextLine = cm.getLine(cursor.line + 1);
            cm.replaceRange(nextLine + '\n' + line, 
                { line: cursor.line, ch: 0 }, 
                { line: cursor.line + 2, ch: 0 });
            cm.setCursor(cursor.line + 1, cursor.ch);
        }
    };
    
    
    setupSolidityAutocomplete();
    
    
    setupErrorHighlighting();
}


function setupSolidityAutocomplete() {
    const solidityHints = [
        
        'contract', 'library', 'interface', 'function', 'modifier', 'event',
        'struct', 'enum', 'mapping', 'constructor', 'fallback', 'receive',
        'public', 'private', 'internal', 'external', 'view', 'pure', 'payable',
        'virtual', 'override', 'abstract', 'storage', 'memory', 'calldata',
        
        
        'bool', 'string', 'address', 'bytes', 'uint', 'int', 'uint256', 'uint8',
        'uint16', 'uint32', 'uint64', 'uint128', 'int8', 'int16', 'int32',
        'int64', 'int128', 'int256', 'bytes1', 'bytes2', 'bytes4', 'bytes8',
        'bytes16', 'bytes32',
        
        
        'msg.sender', 'msg.value', 'msg.data', 'msg.sig', 'msg.gas',
        'tx.origin', 'tx.gasprice', 'block.number', 'block.timestamp',
        'block.difficulty', 'block.coinbase', 'block.gaslimit', 'block.blockhash',
        
        
        'require', 'assert', 'revert', 'keccak256', 'sha256', 'ripemd160',
        'ecrecover', 'addmod', 'mulmod', 'selfdestruct', 'suicide',
        
        
        'pragma solidity ^0.8.0;',
        '// SPDX-License-Identifier: MIT',
        'constructor() {}',
        'function () public {}',
        'function () public view returns () {}',
        'modifier () { _; }',
        'event ()',
        'struct {}',
        'enum {}',
        'mapping(address => uint256)',
        'require(, "");',
        'emit ();'
    ];
    
    CodeMirror.registerHelper("hint", "solidity", function(cm) {
        const cursor = cm.getCursor();
        const token = cm.getTokenAt(cursor);
        const start = token.start;
        const end = cursor.ch;
        const word = token.string.slice(0, end - start);
        
        const completions = solidityHints.filter(hint => 
            hint.toLowerCase().startsWith(word.toLowerCase())
        );
        
        return {
            list: completions,
            from: CodeMirror.Pos(cursor.line, start),
            to: CodeMirror.Pos(cursor.line, end)
        };
    });
}


function setupErrorHighlighting() {
    let errorMarkers = [];
    
    
    window.clearEditorErrors = function() {
        errorMarkers.forEach(marker => marker.clear());
        errorMarkers = [];
    };
    
    
    window.highlightEditorErrors = function(errors) {
        clearEditorErrors();
        
        errors.forEach(error => {
            if (error.sourceLocation) {
                const start = error.sourceLocation.start;
                const end = error.sourceLocation.end;
                
                const startPos = codeEditor.posFromIndex(start);
                const endPos = codeEditor.posFromIndex(end);
                
                const marker = codeEditor.markText(startPos, endPos, {
                    className: 'syntax-error',
                    title: error.message,
                    css: 'background: rgba(255, 107, 107, 0.2); border-bottom: 2px wavy #ff6b6b;'
                });
                
                errorMarkers.push(marker);
            }
        });
    };
}


function handleEditorFocus() {
    document.querySelector('.editor-content').classList.add('editor-focused');
}

function handleEditorBlur() {
    document.querySelector('.editor-content').classList.remove('editor-focused');
}


function handleCodeChange(cm, change) {
    if (currentFile) {
        fileContents[currentFile] = cm.getValue();
        saveFilesToStorage();
        
        
        markFileAsModified(currentFile, true);
        
        
        if (window.clearEditorErrors) {
            clearEditorErrors();
        }
        if (typeof clearCompilationResults === 'function') {
            clearCompilationResults();
        }
    }
    
    
    if (document.getElementById('auto-compile')?.checked) {
        clearTimeout(window.autoCompileTimeout);
        window.autoCompileTimeout = setTimeout(compileContract, 2000);
    }
    

    // Auto-save every edit silently; only Ctrl+S prints to the terminal.
    if (currentFile) {
        saveCurrentFile(true);
    }
}


function updateEditorStatus() {
    const cursor = codeEditor.getCursor();
    const selection = codeEditor.getSelection();
    const doc = codeEditor.getDoc();
    
    let statusText = `Ln ${cursor.line + 1}, Col ${cursor.ch + 1}`;
    
    if (selection) {
        const selectionLength = selection.length;
        statusText += ` | Selected: ${selectionLength} chars`;
    }
    
    const totalLines = doc.lineCount();
    const totalChars = doc.getValue().length;
    statusText += ` | Total: ${totalLines} lines, ${totalChars} chars`;
    
    const statusElement = document.getElementById('editor-status');
    if (statusElement) {
        statusElement.textContent = statusText;
    }
}


// silent=true is used for auto-save; it persists without terminal noise.
function saveCurrentFile(silent = false) {
    if (currentFile && codeEditor) {
        const currentContent = codeEditor.getValue();
        fileContents[currentFile] = currentContent;
        saveFilesToStorage();
        markFileAsModified(currentFile, false);
    }
}


function showSaveNotification() {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = 'Saved!';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #51cf66, #40c057);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(64, 192, 87, 0.3);
        animation: saveNotification 2s ease-in-out forwards;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 2000);
}


function markFileAsModified(filePath, isModified) {
    const fileElement = document.querySelector(`[data-file="${filePath}"]`);
    if (!fileElement) return;
    
    const existingIndicator = fileElement.querySelector('.file-modified');
    
    if (isModified && !existingIndicator) {
        const indicator = document.createElement('span');
        indicator.className = 'file-modified';
        indicator.textContent = '●';
        indicator.style.color = '#f6851b';
        indicator.style.marginLeft = '4px';
        fileElement.appendChild(indicator);
    } else if (!isModified && existingIndicator) {
        existingIndicator.remove();
    }
    
    
    updateTabModifiedState(filePath, isModified);
}

function updateTabModifiedState(filePath, isModified) {
    const tab = document.querySelector(`[data-file="${filePath}"].editor-tab`);
    if (!tab) return;
    
    const existingIndicator = tab.querySelector('.tab-modified');
    
    if (isModified && !existingIndicator) {
        const indicator = document.createElement('span');
        indicator.className = 'tab-modified';
        indicator.textContent = '●';
        indicator.style.color = '#f6851b';
        indicator.style.marginLeft = '4px';
        tab.insertBefore(indicator, tab.querySelector('.tab-close'));
    } else if (!isModified && existingIndicator) {
        existingIndicator.remove();
    }
}


function showContextMenu(event, filePath) {
    const contextMenu = document.getElementById('file-context-menu');
    contextMenuTarget = filePath;
    
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    
    
    setTimeout(() => {
        document.addEventListener('click', hideContextMenu, { once: true });
    }, 10);
}

function hideContextMenu() {
    document.getElementById('file-context-menu').style.display = 'none';
    contextMenuTarget = null;
}


function renameFile() {
    if (!contextMenuTarget) return;

    const oldPath = contextMenuTarget;
    const oldName = oldPath.split('/').pop();

    showInputModal('Rename File', `Enter new name for "${oldName}":`, oldName, (newName) => {
        if (!newName || newName === oldName) return;

        if (!/^[a-zA-Z][a-zA-Z0-9_]*\.sol$/.test(newName)) {
            showAlertModal('Invalid File Name', 'Use format: ContractName.sol');
            return;
        }

        const newPath = oldPath.replace(oldName, newName);

        if (fileContents[newPath]) {
            showAlertModal('File Exists', 'A file with this name already exists.');
            return;
        }

        fileContents[newPath] = fileContents[oldPath];
        delete fileContents[oldPath];

        if (currentFile === oldPath) {
            currentFile = newPath;
        }

        saveFilesToStorage();
        generateFileExplorerFromStorage();
        updateEditorTabs();

        logToTerminal(`✏️ Renamed: ${oldPath} → ${newPath}`, 'success');
    });

    hideContextMenu();
}

function duplicateFile() {
    if (!contextMenuTarget) return;
    
    const originalPath = contextMenuTarget;
    const originalName = originalPath.split('/').pop();
    const baseName = originalName.replace('.sol', '');
    const extension = '.sol';
    
    let counter = 1;
    let newPath;
    
    
    do {
        const newName = `${baseName}_copy${counter}${extension}`;
        newPath = originalPath.replace(originalName, newName);
        counter++;
    } while (fileContents[newPath]);
    
    
    fileContents[newPath] = fileContents[originalPath];
    
    saveFilesToStorage();
    generateFileExplorerFromStorage();
    openFile(newPath);
    
    logToTerminal(`📋 Duplicated: ${originalPath} → ${newPath}`, 'success');
    hideContextMenu();
}

function deleteFile() {
    if (!contextMenuTarget) return;

    const filePath = contextMenuTarget;

    if (Object.keys(fileContents).length <= 1) {
        showAlertModal('Cannot Delete', 'Cannot delete the last file.');
        hideContextMenu();
        return;
    }

    showConfirmModal(
        'Delete File',
        `Are you sure you want to delete <strong>${filePath}</strong>?`,
        'Delete',
        () => {
            delete fileContents[filePath];

            if (currentFile === filePath) {
                const remainingFiles = Object.keys(fileContents);
                if (remainingFiles.length > 0) {
                    openFile(remainingFiles[0]);
                }
            }

            saveFilesToStorage();
            generateFileExplorerFromStorage();
            updateEditorTabs();

            logToTerminal(`🗑️ Deleted: ${filePath}`, 'warning');
        }
    );

    hideContextMenu();
}

function showConfirmModal(title, message, confirmText, onConfirm) {
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
                <p style="color:var(--text-secondary);font-size:13px;line-height:1.5;">
                    ${message}
                </p>
            </div>
            <div class="modal-footer"
                 style="display:flex;gap:8px;
                        justify-content:flex-end;">
                <button class="remix-btn remix-btn-secondary"
                        id="confirm-modal-cancel">
                    Cancel
                </button>
                <button class="remix-btn remix-btn-primary"
                        id="confirm-modal-ok"
                        style="background:#ff6b6b;">
                    ${confirmText}
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const okBtn = modal.querySelector('#confirm-modal-ok');
    const cancelBtn = modal.querySelector('#confirm-modal-cancel');
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

    okBtn.addEventListener('click', () => {
        closeModal();
        onConfirm();
    });

    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', closeModal);

    document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeModal();
            document.removeEventListener('keydown', handler);
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            closeModal();
            onConfirm();
            document.removeEventListener('keydown', handler);
        }
    });

    setTimeout(() => {
        const content = modal.querySelector('.modal-content');
        content.style.transform = 'scale(1)';
        content.style.opacity = '1';
    }, 10);
}
