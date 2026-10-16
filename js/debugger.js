


let transactionHistory = [];
let callStack = [];
let gasAnalytics = {
    totalGasUsed: 0,
    totalTransactions: 0,
    maxGasUsed: 0,
    minGasUsed: Infinity
};
let errorLog = [];
let currentDebugTab = 'transactions';


function initializeDebuggerPlugin() {
    setupDebuggerEventListeners();
    loadDebuggerData();
    updateGasAnalytics();
}


function setupDebuggerEventListeners() {
    const debugTabs = document.querySelectorAll('.debug-tab');
    
    
    debugTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchDebugTab(tab.getAttribute('data-tab'));
        });
    });
}


function switchDebugTab(tabName) {
    currentDebugTab = tabName;
    
    
    document.querySelectorAll('.debug-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    
    document.querySelectorAll('.debug-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.querySelector(`[data-panel="${tabName}"]`).classList.add('active');
    
    
    updateDebugContent(tabName);
}


function updateDebugContent(tabName) {
    switch (tabName) {
        case 'transactions':
            updateTransactionHistory();
            break;
        case 'calls':
            updateCallStack();
            break;
        case 'gas':
            updateGasAnalytics();
            break;
        case 'errors':
            updateErrorLog();
            break;
    }
}


function addTransactionToDebugger(txData) {
    const transaction = {
        hash: txData.hash || txData.transactionHash,
        type: txData.type || 'unknown',
        from: txData.from || 'unknown',
        to: txData.to || 'contract',
        gasUsed: txData.gasUsed || 0,
        status: txData.status || 'success',
        timestamp: new Date().toISOString(),
        block: txData.blockNumber || 'pending',
        value: txData.value || '0',
        functionName: txData.functionName || 'unknown'
    };
    
    transactionHistory.unshift(transaction);
    
    
    if (transactionHistory.length > 50) {
        transactionHistory = transactionHistory.slice(0, 50);
    }
    
    
    if (transaction.gasUsed > 0) {
        gasAnalytics.totalGasUsed += parseInt(transaction.gasUsed);
        gasAnalytics.totalTransactions++;
        gasAnalytics.maxGasUsed = Math.max(gasAnalytics.maxGasUsed, parseInt(transaction.gasUsed));
        gasAnalytics.minGasUsed = Math.min(gasAnalytics.minGasUsed, parseInt(transaction.gasUsed));
    }
    
    saveDebuggerData();
    
    
    if (currentDebugTab === 'transactions') {
        updateTransactionHistory();
    }
    if (currentDebugTab === 'gas') {
        updateGasAnalytics();
    }
}


function addFunctionCall(callData) {
    const call = {
        functionName: callData.functionName,
        contractAddress: callData.contractAddress,
        parameters: callData.parameters || [],
        gasEstimate: callData.gasEstimate || 0,
        timestamp: new Date().toISOString(),
        status: 'pending'
    };
    
    callStack.unshift(call);
    
    
    if (callStack.length > 20) {
        callStack = callStack.slice(0, 20);
    }
    
    if (currentDebugTab === 'calls') {
        updateCallStack();
    }
}


function addErrorToDebugger(errorData) {
    const error = {
        message: errorData.message || 'Unknown error',
        type: errorData.type || 'runtime',
        file: errorData.file || currentFile,
        line: errorData.line || 0,
        timestamp: new Date().toISOString(),
        details: errorData.details || ''
    };
    
    errorLog.unshift(error);
    
    if (errorLog.length > 30) {
        errorLog = errorLog.slice(0, 30);
    }
    
    saveDebuggerData();
    
    if (currentDebugTab === 'errors') {
        updateErrorLog();
    }
}


function updateTransactionHistory() {
    const container = document.getElementById('transaction-history');
    
    if (transactionHistory.length === 0) {
        container.innerHTML = '<div class="debug-placeholder">No transactions yet</div>';
        return;
    }
    
    let html = '';
    transactionHistory.forEach((tx, index) => {
        const statusIcon = tx.status === 'success' ? '✅' : '❌';
        const gasFormatted = parseInt(tx.gasUsed).toLocaleString();
        const timeAgo = getTimeAgo(tx.timestamp);
        
        html += `
            <div class="transaction-item" onclick="showTransactionDetails(${index})">
                <div class="transaction-header">
                    <span class="transaction-status">${statusIcon}</span>
                    <span class="transaction-type">${tx.type}</span>
                    <span class="transaction-time">${timeAgo}</span>
                </div>
                <div class="transaction-info">
                    <div class="transaction-hash">${shortenHash(tx.hash)}</div>
                    <div class="transaction-gas">Gas: ${gasFormatted}</div>
                    <div class="transaction-function">${tx.functionName}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}


function updateCallStack() {
    const container = document.getElementById('call-stack');
    
    if (callStack.length === 0) {
        container.innerHTML = '<div class="debug-placeholder">No active calls</div>';
        return;
    }
    
    let html = '';
    callStack.forEach((call, index) => {
        const timeAgo = getTimeAgo(call.timestamp);
        const statusIcon = call.status === 'success' ? '✅' : call.status === 'pending' ? '⏳' : '❌';
        
        html += `
            <div class="call-item">
                <div class="call-header">
                    <span class="call-status">${statusIcon}</span>
                    <span class="call-function">${call.functionName}</span>
                    <span class="call-time">${timeAgo}</span>
                </div>
                <div class="call-info">
                    <div class="call-contract">${shortenAddress(call.contractAddress)}</div>
                    <div class="call-gas">Est. Gas: ${call.gasEstimate.toLocaleString()}</div>
                </div>
                ${call.parameters.length > 0 ? `
                    <div class="call-parameters">
                        Parameters: ${call.parameters.join(', ')}
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}


function updateGasAnalytics() {
    const totalGasElement = document.getElementById('total-gas');
    const avgGasElement = document.getElementById('avg-gas');
    const maxGasElement = document.getElementById('max-gas');
    
    if (totalGasElement) {
        totalGasElement.textContent = gasAnalytics.totalGasUsed.toLocaleString();
    }
    
    if (avgGasElement) {
        const avgGas = gasAnalytics.totalTransactions > 0 
            ? Math.round(gasAnalytics.totalGasUsed / gasAnalytics.totalTransactions)
            : 0;
        avgGasElement.textContent = avgGas.toLocaleString();
    }
    
    if (maxGasElement) {
        const maxGas = gasAnalytics.maxGasUsed === 0 || gasAnalytics.maxGasUsed === Infinity 
            ? 0 
            : gasAnalytics.maxGasUsed;
        maxGasElement.textContent = maxGas.toLocaleString();
    }
}


function updateErrorLog() {
    const container = document.getElementById('error-log');
    
    if (errorLog.length === 0) {
        container.innerHTML = '<div class="debug-placeholder">No errors logged</div>';
        return;
    }
    
    let html = '';
    errorLog.forEach((error, index) => {
        const timeAgo = getTimeAgo(error.timestamp);
        const typeIcon = getErrorTypeIcon(error.type);
        
        html += `
            <div class="error-item" onclick="showErrorDetails(${index})">
                <div class="error-header">
                    <span class="error-type">${typeIcon} ${error.type}</span>
                    <span class="error-time">${timeAgo}</span>
                </div>
                <div class="error-message">${error.message}</div>
                <div class="error-location">${error.file}:${error.line}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function showTransactionDetails(index) {
    const tx = transactionHistory[index];
    if (!tx) return;
    
    logToTerminal(`📋 Transaction Details:`, 'info');
    logToTerminal(`Hash: ${tx.hash}`, 'info');
    logToTerminal(`Type: ${tx.type}`, 'info');
    logToTerminal(`Gas Used: ${parseInt(tx.gasUsed).toLocaleString()}`, 'info');
    logToTerminal(`Status: ${tx.status}`, tx.status === 'success' ? 'success' : 'error');
    logToTerminal(`Function: ${tx.functionName}`, 'info');
}


function showErrorDetails(index) {
    const error = errorLog[index];
    if (!error) return;
    
    logToTerminal(`❌ Error Details:`, 'error');
    logToTerminal(`Type: ${error.type}`, 'error');
    logToTerminal(`Message: ${error.message}`, 'error');
    logToTerminal(`Location: ${error.file}:${error.line}`, 'error');
    if (error.details) {
        logToTerminal(`Details: ${error.details}`, 'error');
    }
}


function shortenHash(hash) {
    if (!hash || hash.length < 10) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
}


function shortenAddress(address) {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}


function getErrorTypeIcon(type) {
    switch (type) {
        case 'compilation': return '🔨';
        case 'runtime': return '⚡';
        case 'network': return '🌐';
        case 'metamask': return '🦊';
        default: return '❌';
    }
}


function getTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInSeconds = Math.floor((now - time) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
}


function saveDebuggerData() {
    try {
        const debugData = {
            transactionHistory,
            gasAnalytics,
            errorLog,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('remix-debugger-data', JSON.stringify(debugData));
    } catch (error) {
        console.error('Error saving debugger data:', error);
    }
}


function loadDebuggerData() {
    try {
        const saved = localStorage.getItem('remix-debugger-data');
        if (saved) {
            const debugData = JSON.parse(saved);
            transactionHistory = debugData.transactionHistory || [];
            gasAnalytics = debugData.gasAnalytics || gasAnalytics;
            errorLog = debugData.errorLog || [];
        }
    } catch (error) {
        console.error('Error loading debugger data:', error);
    }
}


function clearDebuggerData() {
    transactionHistory = [];
    callStack = [];
    gasAnalytics = {
        totalGasUsed: 0,
        totalTransactions: 0,
        maxGasUsed: 0,
        minGasUsed: Infinity
    };
    errorLog = [];
    
    saveDebuggerData();
    updateDebugContent(currentDebugTab);
    logToTerminal('🗑️ Debugger data cleared', 'info');
}


document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeDebuggerPlugin, 1000);
});


window.debuggerPlugin = {
    addTransactionToDebugger,
    addFunctionCall,
    addErrorToDebugger,
    clearDebuggerData
};
