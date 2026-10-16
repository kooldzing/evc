


let searchResults = [];
let recentFiles = [];
let currentSearchTab = 'files';


function initializeSearchPlugin() {
    setupSearchEventListeners();
    loadRecentFiles();
}


function setupSearchEventListeners() {
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const searchTabs = document.querySelectorAll('.search-tab');
    
    
    searchInput.addEventListener('input', debounce(performSearch, 300));
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
    
    
    searchBtn.addEventListener('click', performSearch);
    
    
    searchTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchSearchTab(tab.getAttribute('data-tab'));
        });
    });
}


function switchSearchTab(tabName) {
    currentSearchTab = tabName;
    
    
    document.querySelectorAll('.search-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    
    performSearch();
}


function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput.value.trim();
    const resultsContainer = document.getElementById('search-results');
    
    if (!query && currentSearchTab !== 'recent') {
        resultsContainer.innerHTML = '<div class="search-placeholder">Enter search term above</div>';
        return;
    }
    
    
    resultsContainer.innerHTML = '<div class="search-loading">🔍 Searching...</div>';
    
    setTimeout(() => {
        switch (currentSearchTab) {
            case 'files':
                searchFiles(query);
                break;
            case 'content':
                searchContent(query);
                break;
            case 'recent':
                showRecentFiles();
                break;
        }
    }, 100);
}


function searchFiles(query) {
    const caseSensitive = document.getElementById('case-sensitive').checked;
    const isRegex = document.getElementById('regex-search').checked;
    
    searchResults = [];
    
    try {
        const searchPattern = isRegex ? new RegExp(query, caseSensitive ? 'g' : 'gi') : null;
        
        Object.keys(fileContents).forEach(filePath => {
            const fileName = filePath.split('/').pop();
            let matches = false;
            
            if (isRegex && searchPattern) {
                searchPattern.lastIndex = 0;
                matches = searchPattern.test(fileName);
            } else {
                const searchIn = caseSensitive ? fileName : fileName.toLowerCase();
                const searchFor = caseSensitive ? query : query.toLowerCase();
                matches = searchIn.includes(searchFor);
            }
            
            if (matches) {
                searchResults.push({
                    type: 'file',
                    path: filePath,
                    name: fileName,
                    size: fileContents[filePath].length
                });
            }
        });
        
        displayFileResults();
        
    } catch (error) {
        if (isRegex) {
            displaySearchError('Invalid regular expression');
        } else {
            displayFileResults();
        }
    }
}


function searchContent(query) {
    const caseSensitive = document.getElementById('case-sensitive').checked;
    const isRegex = document.getElementById('regex-search').checked;
    
    searchResults = [];
    
    try {
        const searchPattern = isRegex ? new RegExp(query, caseSensitive ? 'g' : 'gi') : null;
        
        Object.keys(fileContents).forEach(filePath => {
            const content = fileContents[filePath];
            const lines = content.split('\n');
            
            lines.forEach((line, lineIndex) => {
                let matches = [];

                if (isRegex && searchPattern) {
                    searchPattern.lastIndex = 0;
                    let match;
                    while ((match = searchPattern.exec(line)) !== null) {
                        matches.push({
                            start: match.index,
                            end: match.index + match[0].length,
                            text: match[0]
                        });
                        if (!searchPattern.global) break;
                        // Prevent infinite loop on zero-width regex matches.
                        if (match[0].length === 0) {
                            searchPattern.lastIndex++;
                        }
                    }
                } else {
                    const searchIn = caseSensitive ? line : line.toLowerCase();
                    const searchFor = caseSensitive ? query : query.toLowerCase();
                    let index = searchIn.indexOf(searchFor);
                    
                    while (index !== -1) {
                        matches.push({
                            start: index,
                            end: index + query.length,
                            text: line.substring(index, index + query.length)
                        });
                        index = searchIn.indexOf(searchFor, index + 1);
                    }
                }
                
                if (matches.length > 0) {
                    searchResults.push({
                        type: 'content',
                        path: filePath,
                        line: lineIndex + 1,
                        lineContent: line.trim(),
                        matches: matches
                    });
                }
            });
        });
        
        displayContentResults();
        
    } catch (error) {
        if (isRegex) {
            displaySearchError('Invalid regular expression');
        } else {
            displayContentResults();
        }
    }
}


function showRecentFiles() {
    const resultsContainer = document.getElementById('search-results');
    
    if (recentFiles.length === 0) {
        resultsContainer.innerHTML = '<div class="search-placeholder">No recent files</div>';
        return;
    }
    
    let html = '<div class="search-section"><h4>Recent Files</h4>';
    
    recentFiles.slice(0, 10).forEach(filePath => {
        const fileName = filePath.split('/').pop();
        const lastModified = getFileLastModified(filePath);
        
        html += `
            <div class="search-result-item" onclick="openFileFromSearch('${filePath}')">
                <div class="search-result-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${fileName}</div>
                    <div class="search-result-path">${filePath}</div>
                    <div class="search-result-meta">Modified: ${lastModified}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
}


function displayFileResults() {
    const resultsContainer = document.getElementById('search-results');
    
    if (searchResults.length === 0) {
        resultsContainer.innerHTML = '<div class="search-placeholder">No files found</div>';
        return;
    }
    
    let html = `<div class="search-section"><h4>Found ${searchResults.length} file(s)</h4>`;
    
    searchResults.forEach(result => {
        const sizeText = formatFileSize(result.size);
        html += `
            <div class="search-result-item" onclick="openFileFromSearch('${result.path}')">
                <div class="search-result-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${result.name}</div>
                    <div class="search-result-path">${result.path}</div>
                    <div class="search-result-meta">${sizeText}</div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
}


function displayContentResults() {
    const resultsContainer = document.getElementById('search-results');
    
    if (searchResults.length === 0) {
        resultsContainer.innerHTML = '<div class="search-placeholder">No content matches found</div>';
        return;
    }
    
    
    const groupedResults = {};
    searchResults.forEach(result => {
        if (!groupedResults[result.path]) {
            groupedResults[result.path] = [];
        }
        groupedResults[result.path].push(result);
    });
    
    let html = `<div class="search-section"><h4>Found ${searchResults.length} match(es) in ${Object.keys(groupedResults).length} file(s)</h4>`;
    
    Object.keys(groupedResults).forEach(filePath => {
        const fileName = filePath.split('/').pop();
        const matches = groupedResults[filePath];
        
        html += `
            <div class="search-file-group">
                <div class="search-file-header" onclick="openFileFromSearch('${filePath}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                    <span class="search-file-name">${fileName}</span>
                    <span class="search-match-count">${matches.length} match(es)</span>
                </div>
                <div class="search-matches">
        `;
        
        matches.slice(0, 5).forEach(match => {
            const highlightedLine = highlightMatches(match.lineContent, match.matches);
            html += `
                <div class="search-match-item" onclick="openFileAtLine('${filePath}', ${match.line})">
                    <span class="search-line-number">${match.line}</span>
                    <span class="search-line-content">${highlightedLine}</span>
                </div>
            `;
        });
        
        if (matches.length > 5) {
            html += `<div class="search-more-matches">... and ${matches.length - 5} more match(es)</div>`;
        }
        
        html += '</div></div>';
    });
    
    html += '</div>';
    resultsContainer.innerHTML = html;
}


function highlightMatches(line, matches) {
    let result = '';
    let lastIndex = 0;
    
    matches.forEach(match => {
        result += escapeHtml(line.substring(lastIndex, match.start));
        result += `<span class="search-highlight">${escapeHtml(match.text)}</span>`;
        lastIndex = match.end;
    });
    
    result += escapeHtml(line.substring(lastIndex));
    return result;
}

// Search error display
function displaySearchError(message) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = `<div class="search-error">❌ ${message}</div>`;
}


function openFileFromSearch(filePath) {
    addToRecentFiles(filePath);
    openFile(filePath);
    logToTerminal(`🔍 Opened file from search: ${filePath}`, 'info');
}


function openFileAtLine(filePath, lineNumber) {
    addToRecentFiles(filePath);
    openFile(filePath);
    
    
    setTimeout(() => {
        if (window.codeEditor) {
            window.codeEditor.setCursor(lineNumber - 1, 0);
            window.codeEditor.scrollIntoView({line: lineNumber - 1, ch: 0});
            
            
            const marker = window.codeEditor.markText(
                {line: lineNumber - 1, ch: 0},
                {line: lineNumber - 1, ch: window.codeEditor.getLine(lineNumber - 1).length},
                {className: 'search-highlight-line'}
            );
            
            
            setTimeout(() => marker.clear(), 2000);
        }
    }, 100);
    
    logToTerminal(`🔍 Jumped to line ${lineNumber} in ${filePath}`, 'info');
}


function addToRecentFiles(filePath) {
    
    recentFiles = recentFiles.filter(path => path !== filePath);
    
    
    recentFiles.unshift(filePath);
    
    
    if (recentFiles.length > 20) {
        recentFiles = recentFiles.slice(0, 20);
    }
    
    saveRecentFiles();
}


function loadRecentFiles() {
    try {
        const saved = localStorage.getItem('remix-recent-files');
        if (saved) {
            recentFiles = JSON.parse(saved);
        }
    } catch (error) {
        console.error('Error loading recent files:', error);
        recentFiles = [];
    }
}


function saveRecentFiles() {
    try {
        localStorage.setItem('remix-recent-files', JSON.stringify(recentFiles));
    } catch (error) {
        console.error('Error saving recent files:', error);
    }
}


function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}


function getFileLastModified(filePath) {
    
    return 'Recently';
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}


function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeSearchPlugin, 1000);
});


window.searchPlugin = {
    addToRecentFiles,
    performSearch,
    openFileFromSearch
};
