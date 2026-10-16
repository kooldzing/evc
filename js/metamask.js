function initializeWalletDetection() {
    setTimeout(() => {
        const wallets = detectWallets();

        if (wallets.length > 0) {
            currentWallet = wallets[0];
        }

        updateEnvironmentSelectText();
    }, 500);
}

let web3;
let userAccount;
let currentNetworkId = null;
let deployedContracts = [];
let currentWallet = null;

const WALLET_UNIT_DECIMALS = { wei: 0, gwei: 9, ether: 18 };

function getWalletWeb3Utils() {
    if (web3 && web3.utils) {
        return web3.utils;
    }
    if (window.Web3 && window.Web3.utils) {
        return window.Web3.utils;
    }
    return null;
}

function walletConvertToBaseUnits(value, decimals) {
    const negative = /^-/.test(String(value));
    const sanitized = negative ? String(value).slice(1) : String(value);
    const [wholePart, fractionPart = ''] = sanitized.split('.');
    const multiplier = 10n ** BigInt(decimals);
    const intPortion = BigInt(wholePart || '0') * multiplier;
    let fractionPortion = 0n;
    if (decimals > 0) {
        const normalizedFraction = (fractionPart + '0'.repeat(decimals)).slice(0, decimals);
        fractionPortion = BigInt(normalizedFraction || '0');
    }
    const base = intPortion + fractionPortion;
    return negative ? (-base).toString() : base.toString();
}

function toBigIntSafe(value) {
    if (value === undefined || value === null) return null;
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(Math.floor(value));
    const str = String(value).trim();
    if (str.startsWith('0x') || str.startsWith('0X')) {
        return BigInt(parseInt(str, 16));
    }
    return BigInt(str);
}

function walletToWei(value, unit) {
    const utils = getWalletWeb3Utils();
    if (utils && typeof utils.toWei === 'function') {
        return utils.toWei(value, unit);
    }
    const decimals = WALLET_UNIT_DECIMALS[unit] ?? 0;
    return walletConvertToBaseUnits(value, decimals);
}

function walletFromWei(value, unit) {
    const utils = getWalletWeb3Utils();
    if (utils && typeof utils.fromWei === 'function') {
        return utils.fromWei(value, unit);
    }
    const decimals = WALLET_UNIT_DECIMALS[unit] ?? 0;
    let amount = BigInt(value);
    const negative = amount < 0n;
    if (negative) {
        amount = -amount;
    }
    let digits = amount.toString().padStart(decimals + 1, '0');
    if (decimals === 0) {
        return negative ? `-${digits}` : digits;
    }
    const splitIndex = digits.length - decimals;
    const intPart = digits.slice(0, splitIndex) || '0';
    const fracPart = digits.slice(splitIndex).replace(/0+$/, '');
    const result = fracPart ? `${intPart}.${fracPart}` : intPart;
    return negative ? `-${result}` : result;
}

function walletIsAddress(value) {
    const utils = getWalletWeb3Utils();
    if (utils && typeof utils.isAddress === 'function') {
        return utils.isAddress(value);
    }
    return /^0x[a-fA-F0-9]{40}$/.test(value);
}

function detectWallets() {
    const wallets = [];
    const seenIds = new Set();

    if (!window.ethereum) {
        return wallets;
    }

    function classifyProvider(provider) {
        if (!provider || typeof provider !== 'object') {
            return null;
        }

        // Phantom's EVM provider also sets isMetaMask=true (dapp compatibility),
        // so flag-based checks can misclassify it as MetaMask. The provider
        // object identity is the reliable signal — always trust it first.
        if (provider === window.phantom?.ethereum) {
            return {
                name: 'Phantom Wallet', icon: '👻',
                provider: provider, id: 'phantom'
            };
        }

        // Wallet multiplexers wrap the real provider in a proxy whose flags
        // mimic MetaMask (window.ethereum.targetProvider / .detected). Unwrap
        // and check the underlying provider's identity.
        const wrappedTarget = provider.targetProvider
            || (Array.isArray(provider.detected) && provider.detected.length
                ? provider.detected[0] : null);
        if (wrappedTarget
            && (wrappedTarget === window.phantom?.ethereum
                || (Array.isArray(provider.detected)
                    && provider.detected.includes(window.phantom?.ethereum)))) {
            return {
                name: 'Phantom Wallet', icon: '👻',
                provider: window.phantom?.ethereum, id: 'phantom'
            };
        }

        if (provider.isRabby) {
            return {
                name: 'Rabby Wallet', icon: '🐰',
                provider: provider, id: 'rabby'
            };
        }
        if (provider.isCoinbaseWallet
            || provider.isCoinbaseBrowser) {
            return {
                name: 'Coinbase Wallet', icon: '🔵',
                provider: provider, id: 'coinbase'
            };
        }
        if (provider.isTrust || provider.isTrustWallet) {
            return {
                name: 'Trust Wallet', icon: '🛡️',
                provider: provider, id: 'trust'
            };
        }
        if (provider.isBraveWallet) {
            return {
                name: 'Brave Wallet', icon: '🦁',
                provider: provider, id: 'brave'
            };
        }
        if (provider.isTokenPocket) {
            return {
                name: 'TokenPocket', icon: '💰',
                provider: provider, id: 'tokenpocket'
            };
        }
        if (provider.isTempleWallet) {
            return {
                name: 'Temple Wallet', icon: '🔑',
                provider: provider, id: 'temple'
            };
        }
        if (provider.isWalletConnect) {
            return {
                name: 'WalletConnect', icon: '🔗',
                provider: provider, id: 'walletconnect'
            };
        }
        if (provider.isPhantom) {
            return {
                name: 'Phantom Wallet', icon: '👻',
                provider: provider, id: 'phantom'
            };
        }
        if (provider.isZerion) {
            return {
                name: 'Zerion', icon: '⚡',
                provider: provider, id: 'zerion'
            };
        }
        if (provider.isRainbow) {
            return {
                name: 'Rainbow', icon: '🌈',
                provider: provider, id: 'rainbow'
            };
        }
        if (provider.isOkxWallet
            || provider.isOKExWallet) {
            return {
                name: 'OKX Wallet', icon: '⭕',
                provider: provider, id: 'okx'
            };
        }
        if (provider.isBitKeep || provider.isBitget) {
            return {
                name: 'Bitget Wallet', icon: '🅱️',
                provider: provider, id: 'bitget'
            };
        }
        if (provider.isSafePal) {
            return {
                name: 'SafePal', icon: '🔐',
                provider: provider, id: 'safepal'
            };
        }
        if (provider.isOneInch) {
            return {
                name: '1inch Wallet', icon: '🦄',
                provider: provider, id: 'oneinch'
            };
        }
        if (provider.isMathWallet) {
            return {
                name: 'MathWallet', icon: '🧮',
                provider: provider, id: 'mathwallet'
            };
        }
        if (provider.isExodus) {
            return {
                name: 'Exodus', icon: '🚀',
                provider: provider, id: 'exodus'
            };
        }
        if (provider.isFrame) {
            return {
                name: 'Frame', icon: '🖼️',
                provider: provider, id: 'frame'
            };
        }
        if (provider.isTally || provider.isTallyHo) {
            return {
                name: 'Taho (Tally)', icon: '🏔️',
                provider: provider, id: 'taho'
            };
        }
        if (provider.isEnkrypt) {
            return {
                name: 'Enkrypt', icon: '🔮',
                provider: provider, id: 'enkrypt'
            };
        }
        if (provider.isXDEFI) {
            return {
                name: 'XDEFI Wallet', icon: '💎',
                provider: provider, id: 'xdefi'
            };
        }
        if (provider.isDawn) {
            return {
                name: 'Dawn Wallet', icon: '🌅',
                provider: provider, id: 'dawn'
            };
        }
        if (provider.isGamestop) {
            return {
                name: 'GameStop Wallet', icon: '🎮',
                provider: provider, id: 'gamestop'
            };
        }
        if (provider.isBackpack) {
            return {
                name: 'Backpack', icon: '🎒',
                provider: provider, id: 'backpack'
            };
        }
        if (provider.isCoin98) {
            return {
                name: 'Coin98', icon: '🔶',
                provider: provider, id: 'coin98'
            };
        }

        if (provider.isMetaMask) {
            const isRealMetaMask =
                !provider.isRabby
                && !provider.isCoinbaseWallet
                && !provider.isCoinbaseBrowser
                && !provider.isTrust
                && !provider.isTrustWallet
                && !provider.isBraveWallet
                && !provider.isTokenPocket
                && !provider.isPhantom
                && !provider.isZerion
                && !provider.isRainbow
                && !provider.isOkxWallet
                && !provider.isOKExWallet
                && !provider.isBitKeep
                && !provider.isBitget
                && !provider.isSafePal
                && !provider.isOneInch
                && !provider.isMathWallet
                && !provider.isExodus
                && !provider.isFrame
                && !provider.isTally
                && !provider.isTallyHo
                && !provider.isEnkrypt
                && !provider.isXDEFI
                && !provider.isDawn
                && !provider.isGamestop
                && !provider.isBackpack
                && !provider.isCoin98
                // A real MetaMask always announces itself via EIP-6963
                // (rdns io.metamask). Browser shims (e.g. Vivaldi) claim
                // isMetaMask with nothing behind them — ignore those.
                && (window._eip6963Providers || []).some(e =>
                    String(e?.info?.rdns || '').toLowerCase().includes('metamask'));

            if (isRealMetaMask) {
                return {
                    name: 'MetaMask', icon: '🦊',
                    provider: provider, id: 'metamask'
                };
            }
        }

        return null;
    }

    function addWallet(walletInfo) {
        if (walletInfo && !seenIds.has(walletInfo.id)) {
            seenIds.add(walletInfo.id);
            wallets.push(walletInfo);
        }
    }

    if (window.ethereum.providers
        && Array.isArray(window.ethereum.providers)
        && window.ethereum.providers.length > 0) {
        window.ethereum.providers.forEach(provider => {
            const classified =
                classifyProvider(provider);
            addWallet(classified);
        });
    }

    const topLevel = classifyProvider(window.ethereum);
    if (topLevel) {
        addWallet(topLevel);
    }

    if (window.coinbaseWalletExtension
        && window.coinbaseWalletExtension.request
        && !seenIds.has('coinbase')) {
        addWallet({
            name: 'Coinbase Wallet', icon: '🔵',
            provider: window.coinbaseWalletExtension,
            id: 'coinbase'
        });
    }

    if (window.trustWallet
        && window.trustWallet.request
        && !seenIds.has('trust')) {
        addWallet({
            name: 'Trust Wallet', icon: '🛡️',
            provider: window.trustWallet,
            id: 'trust'
        });
    }

    if (window.phantom
        && window.phantom.ethereum
        && window.phantom.ethereum.request
        && !seenIds.has('phantom')) {
        addWallet({
            name: 'Phantom Wallet', icon: '👻',
            provider: window.phantom.ethereum,
            id: 'phantom'
        });
    }

    if (window.okxwallet
        && window.okxwallet.request
        && !seenIds.has('okx')) {
        addWallet({
            name: 'OKX Wallet', icon: '⭕',
            provider: window.okxwallet,
            id: 'okx'
        });
    }

    if (window.bitkeep
        && window.bitkeep.ethereum
        && window.bitkeep.ethereum.request
        && !seenIds.has('bitget')) {
        addWallet({
            name: 'Bitget Wallet', icon: '🅱️',
            provider: window.bitkeep.ethereum,
            id: 'bitget'
        });
    }

    if (window.exodus
        && window.exodus.ethereum
        && window.exodus.ethereum.request
        && !seenIds.has('exodus')) {
        addWallet({
            name: 'Exodus', icon: '🚀',
            provider: window.exodus.ethereum,
            id: 'exodus'
        });
    }

    if (window.backpack
        && window.backpack.ethereum
        && window.backpack.ethereum.request
        && !seenIds.has('backpack')) {
        addWallet({
            name: 'Backpack', icon: '🎒',
            provider: window.backpack.ethereum,
            id: 'backpack'
        });
    }

    if (window._eip6963Providers
        && Array.isArray(window._eip6963Providers)) {
        window._eip6963Providers.forEach(entry => {
            if (entry && entry.provider) {
                const classified =
                    classifyProvider(entry.provider);
                // Phantom's 6963 provider may expose isMetaMask without
                // isPhantom — trust the announced rdns/name over flags.
                if (classified && classified.id === 'metamask') {
                    const rdns = String(entry.info?.rdns || '').toLowerCase();
                    const infoName = String(entry.info?.name || '').toLowerCase();
                    if (rdns.includes('phantom') || infoName.includes('phantom')) {
                        addWallet({
                            name: 'Phantom Wallet', icon: '👻',
                            provider: entry.provider, id: 'phantom'
                        });
                        return;
                    }
                }
                addWallet(classified);
            }
        });
    }

    if (!seenIds.has('metamask')) {
        if (window.ethereum.providers
            && Array.isArray(
                window.ethereum.providers
            )) {
            const hasMetaMaskAnnounce = (window._eip6963Providers || [])
                .some(e => String(e?.info?.rdns || '').toLowerCase().includes('metamask'));
            const mmProvider = hasMetaMaskAnnounce &&
                window.ethereum.providers.find(
                    p => p.isMetaMask
                        && p !== window.phantom?.ethereum
                        && !p.isPhantom
                        && !p.isPhantomWallet
                        && (!window.phantom?.ethereum || p._metamask)
                        && !p.isRabby
                        && !p.isCoinbaseWallet
                        && !p.isCoinbaseBrowser
                        && !p.isTrust
                        && !p.isTrustWallet
                        && !p.isBraveWallet
                        && !p.isPhantom
                        && !p.isZerion
                        && !p.isRainbow
                        && !p.isOkxWallet
                        && !p.isOKExWallet
                        && !p.isBitKeep
                        && !p.isBitget
                        && !p.isSafePal
                        && !p.isTokenPocket
                        && !p.isMathWallet
                        && !p.isExodus
                        && !p.isFrame
                        && !p.isTally
                        && !p.isTallyHo
                        && !p.isEnkrypt
                        && !p.isXDEFI
                        && !p.isBackpack
                        && !p.isCoin98
                );

            if (mmProvider) {
                addWallet({
                    name: 'MetaMask', icon: '🦊',
                    provider: mmProvider,
                    id: 'metamask'
                });
            }
        }

        if (!seenIds.has('metamask')
            && (window._eip6963Providers || [])
                .some(e => String(e?.info?.rdns || '').toLowerCase().includes('metamask'))
            && window.ethereum.isMetaMask) {
            addWallet({
                name: 'MetaMask', icon: '🦊',
                provider: window.ethereum,
                id: 'metamask'
            });
        }
    }

    if (wallets.length === 0 && window.ethereum
        && typeof window.ethereum.request
            === 'function') {
        wallets.push({
            name: 'Ethereum Wallet', icon: '⚡',
            provider: window.ethereum,
            id: 'ethereum'
        });
    }

    // Phantom is the preferred wallet — keep it first in every list.
    wallets.sort((a, b) => {
        if (a.id === 'phantom') return -1;
        if (b.id === 'phantom') return 1;
        return 0;
    });

    return wallets;
}

function getEtherscanUrl(chainId, type = 'tx', hash = '') {
    const baseUrls = {
        '1': 'https://etherscan.io',
        '11155111': 'https://sepolia.etherscan.io',
        '5': 'https://goerli.etherscan.io',
        '137': 'https://polygonscan.com',
        '80001': 'https://mumbai.polygonscan.com',
        '56': 'https://bscscan.com',
        '97': 'https://testnet.bscscan.com',
        '43114': 'https://snowtrace.io',
        '43113': 'https://testnet.snowtrace.io',
        '250': 'https://ftmscan.com',
        '4002': 'https://testnet.ftmscan.com',
        '42161': 'https://arbiscan.io',
        '421613': 'https://goerli.arbiscan.io',
        '10': 'https://optimistic.etherscan.io',
        '420': 'https://goerli-optimism.etherscan.io'
    };

    const baseUrl = baseUrls[chainId.toString()] || 'https://etherscan.io';

    if (type === 'tx') {
        return `${baseUrl}/tx/${hash}`;
    } else if (type === 'address') {
        return `${baseUrl}/address/${hash}`;
    }

    return baseUrl;
}

function createEtherscanLink(chainId, type, hash, text) {
    const url = getEtherscanUrl(chainId, type, hash);
    return `<a href="${url}" target="_blank">${text}</a>`;
}

function ethToWei(eth) {
    if (typeof web3 !== 'undefined' && web3 && web3.utils) {
        return web3.utils.toWei(eth, 'ether');
    }
    const [whole = '0', frac = ''] = eth.split('.');
    const paddedFrac = (frac + '0'.repeat(18)).slice(0, 18);
    return (BigInt(whole) * (BigInt(10) ** BigInt(18)) + BigInt(paddedFrac)).toString();
}

function getValueFromUI() {
    const valueInput = document.querySelector('.deploy-config input[placeholder="Amount"]');
    if (!valueInput) {
        return '0';
    }

    const value = valueInput.value.trim();

    if (!value || value === '') {
        return '0';
    }

    if (!/^\d+(\.\d+)?$/.test(value) || Number(value) < 0) {
        throw new Error(`Invalid VALUE: ${value}. Please enter a non-negative amount in ETH.`);
    }

    return ethToWei(value);
}

async function handleEnvironmentChange() {
    const environment = document.getElementById('environment-select').value;
    const accountSelect = document.getElementById('account-select');
    const accountBalance = document.getElementById('account-balance');
    const switchBtn = document.getElementById('switch-wallet-btn');

    if (environment === 'injected') {
        await connectToWallet();
        if (switchBtn) switchBtn.style.display = 'block';
    } else if (environment === 'vm') {
        if (switchBtn) switchBtn.style.display = 'none';
        accountSelect.innerHTML = '';
        for (let i = 0; i < 10; i++) {
            const option = document.createElement('option');
            option.value = `0x${i.toString().padStart(40, '0')}`;
            option.textContent = `Account ${i} (0x${i.toString().padStart(6, '0')}...${i.toString().padStart(6, '0')})`;
            accountSelect.appendChild(option);
        }
        if (accountBalance) accountBalance.textContent = '100 ETH';
        userAccount = accountSelect.value;
        currentNetworkId = null;
        currentWallet = null;
        updateNetworkStatus('Remix VM (Cancun)', true);
    }

    updateDeployButton();
}

async function connectToWallet() {
    const wallets = detectWallets();

    if (wallets.length === 0) {
        logToTerminal(
            '❌ No Ethereum wallet detected. Please install a Web3 wallet.',
            'error'
        );
        showWalletModal();
        return false;
    }

    if (wallets.length === 1) {
        return await connectToSpecificWallet(wallets[0]);
    }

    return await showWalletSelectionModal(wallets);
}

async function switchWalletExtension() {
    const wallets = detectWallets();

    if (wallets.length === 0) {
        logToTerminal(
            '❌ No Ethereum wallets detected.',
            'error'
        );
        showWalletModal();
        return;
    }

    const result = await showWalletSelectionModal(wallets);

    if (result) {
        updateDeployButton();
        logToTerminal(
            `🔄 Switched to ${currentWallet.icon} `
            + `${currentWallet.name}`,
            'success'
        );
    }
}

async function connectToSpecificWallet(wallet) {
    try {
        logToTerminal(
            `🔗 Connecting to ${wallet.icon} ${wallet.name}...`,
            'info'
        );

        let provider = wallet.provider;

        if (!provider || typeof provider.request !== 'function') {
            logToTerminal(
                `❌ ${wallet.name} provider is invalid or missing request method.`,
                'error'
            );
            return false;
        }

        if (window.ethereum
            && window.ethereum.providers
            && Array.isArray(window.ethereum.providers)) {

            const exactProvider =
                window.ethereum.providers.find(p => {
                    if (wallet.id === 'rabby')
                        return p.isRabby;
                    if (wallet.id === 'metamask')
                        return p.isMetaMask
                            && !p.isRabby
                            && !p.isCoinbaseWallet
                            && !p.isTrust
                            && !p.isBraveWallet;
                    if (wallet.id === 'coinbase')
                        return p.isCoinbaseWallet
                            || p.isCoinbaseBrowser;
                    if (wallet.id === 'trust')
                        return p.isTrust
                            || p.isTrustWallet;
                    if (wallet.id === 'brave')
                        return p.isBraveWallet;
                    if (wallet.id === 'phantom')
                        return p.isPhantom;
                    if (wallet.id === 'zerion')
                        return p.isZerion;
                    if (wallet.id === 'rainbow')
                        return p.isRainbow;
                    if (wallet.id === 'okx')
                        return p.isOkxWallet
                            || p.isOKExWallet;
                    if (wallet.id === 'bitget')
                        return p.isBitKeep
                            || p.isBitget;
                    if (wallet.id === 'safepal')
                        return p.isSafePal;
                    if (wallet.id === 'tokenpocket')
                        return p.isTokenPocket;
                    if (wallet.id === 'mathwallet')
                        return p.isMathWallet;
                    if (wallet.id === 'exodus')
                        return p.isExodus;
                    if (wallet.id === 'frame')
                        return p.isFrame;
                    if (wallet.id === 'taho')
                        return p.isTally
                            || p.isTallyHo;
                    if (wallet.id === 'enkrypt')
                        return p.isEnkrypt;
                    if (wallet.id === 'xdefi')
                        return p.isXDEFI;
                    if (wallet.id === 'backpack')
                        return p.isBackpack;
                    if (wallet.id === 'coin98')
                        return p.isCoin98;
                    return false;
                });

            if (exactProvider) {
                provider = exactProvider;
            }
        }

        if (wallet.id === 'rabby'
            && window.rabby
            && window.rabby.request) {
            provider = window.rabby;
        }
        if (wallet.id === 'coinbase'
            && window.coinbaseWalletExtension
            && window.coinbaseWalletExtension.request) {
            provider = window.coinbaseWalletExtension;
        }
        if (wallet.id === 'trust'
            && window.trustWallet
            && window.trustWallet.request) {
            provider = window.trustWallet;
        }
        if (wallet.id === 'phantom'
            && window.phantom
            && window.phantom.ethereum
            && window.phantom.ethereum.request) {
            provider = window.phantom.ethereum;
        }
        if (wallet.id === 'okx'
            && window.okxwallet
            && window.okxwallet.request) {
            provider = window.okxwallet;
        }
        if (wallet.id === 'bitget'
            && window.bitkeep
            && window.bitkeep.ethereum
            && window.bitkeep.ethereum.request) {
            provider = window.bitkeep.ethereum;
        }
        if (wallet.id === 'exodus'
            && window.exodus
            && window.exodus.ethereum
            && window.exodus.ethereum.request) {
            provider = window.exodus.ethereum;
        }
        if (wallet.id === 'backpack'
            && window.backpack
            && window.backpack.ethereum
            && window.backpack.ethereum.request) {
            provider = window.backpack.ethereum;
        }

        wallet.provider = provider;

        web3 = new Web3(provider);
        currentWallet = wallet;

        let userAccounts;
        try {
            userAccounts = await provider.request({
                method: 'eth_requestAccounts'
            });
        } catch (requestError) {
            if (requestError.code === 4001) {
                throw requestError;
            }
            await new Promise(r => setTimeout(r, 500));

            try {
                userAccounts = await provider.request({
                    method: 'eth_requestAccounts'
                });
            } catch (retryError) {
                if (retryError.code === 4001) {
                    throw retryError;
                }
                try {
                    userAccounts =
                        await provider.request({
                            method: 'eth_accounts'
                        });
                } catch (fallbackError) {
                    throw requestError;
                }
            }
        }

        if (!userAccounts || userAccounts.length === 0) {
            await new Promise(r => setTimeout(r, 1000));

            try {
                userAccounts = await provider.request({
                    method: 'eth_accounts'
                });
            } catch (e) {
            }

            if (!userAccounts
                || userAccounts.length === 0) {
                logToTerminal(
                    `❌ No accounts found. Please `
                    + `unlock ${wallet.name} and `
                    + `try again.`,
                    'error'
                );
                return false;
            }
        }

        userAccount = userAccounts[0];

        if (!walletIsAddress(userAccount)) {
            logToTerminal(
                `❌ Invalid account address received `
                + `from ${wallet.name}.`,
                'error'
            );
            return false;
        }

        try {
            await web3.eth.getChainId();
        } catch (verifyError) {
            logToTerminal(
                `⚠️ Verifying ${wallet.name} `
                + `connection...`,
                'warning'
            );

            web3.setProvider(provider);

            try {
                await web3.eth.getChainId();
            } catch (retryError) {
                logToTerminal(
                    `❌ Cannot communicate with `
                    + `${wallet.name}.`,
                    'error'
                );
                return false;
            }
        }

        await updateAccountInfo();
        await updateNetworkInfo();
        setupWalletEventListeners(wallet);
        updateEnvironmentSelectText();

        logToTerminal(
            `${wallet.icon} Connected to `
            + `${wallet.name}: `
            + `<code>${userAccount}</code>`,
            'success'
        );

        const switchBtn = document.getElementById(
            'switch-wallet-btn'
        );
        if (switchBtn) {
            switchBtn.style.display = 'block';
        }

        return true;

    } catch (error) {
        console.error(
            `${wallet.name} connection error:`, error
        );
        handleWalletError(error, wallet.name);
        return false;
    }
}

async function showWalletSelectionModal(wallets) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';

        const allPopularWallets = [
            { id: 'phantom', name: 'Phantom Wallet', icon: '👻', url: 'https://phantom.com/download/' },
            { id: 'rabby', name: 'Rabby Wallet', icon: '🐰', url: 'https://rabby.io/' },
            { id: 'coinbase', name: 'Coinbase Wallet', icon: '🔵', url: 'https://www.coinbase.com/wallet' },
            { id: 'trust', name: 'Trust Wallet', icon: '🛡️', url: 'https://trustwallet.com/' },
            { id: 'okx', name: 'OKX Wallet', icon: '⭕', url: 'https://www.okx.com/web3' },
            { id: 'rainbow', name: 'Rainbow', icon: '🌈', url: 'https://rainbow.me/' },
            { id: 'zerion', name: 'Zerion', icon: '⚡', url: 'https://zerion.io/' },
            { id: 'bitget', name: 'Bitget Wallet', icon: '🅱️', url: 'https://web3.bitget.com/' },
            { id: 'exodus', name: 'Exodus', icon: '🚀', url: 'https://www.exodus.com/' },
            { id: 'brave', name: 'Brave Wallet', icon: '🦁', url: 'https://brave.com/wallet/' },
            { id: 'frame', name: 'Frame', icon: '🖼️', url: 'https://frame.sh/' },
            { id: 'taho', name: 'Taho (Tally)', icon: '🏔️', url: 'https://taho.xyz/' },
            { id: 'enkrypt', name: 'Enkrypt', icon: '🔮', url: 'https://www.enkrypt.com/' },
            { id: 'backpack', name: 'Backpack', icon: '🎒', url: 'https://backpack.app/' },
            { id: 'safepal', name: 'SafePal', icon: '🔐', url: 'https://www.safepal.com/' },
            { id: 'tokenpocket', name: 'TokenPocket', icon: '💰', url: 'https://www.tokenpocket.pro/' },
            { id: 'oneinch', name: '1inch Wallet', icon: '🦄', url: 'https://1inch.io/wallet/' },
            { id: 'mathwallet', name: 'MathWallet', icon: '🧮', url: 'https://mathwallet.org/' },
            { id: 'xdefi', name: 'XDEFI Wallet', icon: '💎', url: 'https://www.xdefi.io/' },
        ];

        const detectedIds = new Set(wallets.map(w => w.id));

        const detectedHTML = wallets.map(wallet => `
            <button class="wallet-option wallet-detected"
                    data-wallet-id="${wallet.id}">
                <span class="wallet-icon">${wallet.icon}</span>
                <span class="wallet-name">${wallet.name}</span>
                <span class="wallet-status-badge"
                      style="font-size:10px;color:#51cf66;margin-left:auto;">
                    Detected
                </span>
            </button>
        `).join('');

        const notInstalledWallets = allPopularWallets.filter(w => !detectedIds.has(w.id));

        const notInstalledHTML = notInstalledWallets.map(wallet => `
            <button class="wallet-option wallet-not-installed"
                    data-install-url="${wallet.url}"
                    style="opacity:0.6;">
                <span class="wallet-icon">${wallet.icon}</span>
                <span class="wallet-name">${wallet.name}</span>
                <span class="wallet-status-badge"
                      style="font-size:10px;color:#888;margin-left:auto;">
                    Install →
                </span>
            </button>
        `).join('');

        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content wallet-selection-modal">
                <div class="modal-header">
                    <h2>Select Wallet</h2>
                </div>
                <div class="modal-body" style="max-height:400px;overflow-y:auto;">
                    ${detectedHTML
                      ? `<div style="margin-bottom:8px;font-size:11px;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;">
                              Detected Wallets
                         </div>
                         <div class="wallet-options">
                             ${detectedHTML}
                         </div>`
                      : ''}
                    ${notInstalledHTML
                      ? `<div style="margin-top:16px;margin-bottom:8px;font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.5px;">
                              Other Wallets
                         </div>
                         <div class="wallet-options">
                             ${notInstalledHTML}
                         </div>`
                      : ''}
                </div>
                <div class="modal-footer">
                    <button class="remix-btn remix-btn-secondary" id="cancel-wallet-btn">Cancel</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelectorAll('.wallet-detected').forEach(btn => {
            btn.addEventListener('click', async () => {
                const walletId = btn.getAttribute('data-wallet-id');
                const selectedWallet = wallets.find(w => w.id === walletId);
                document.body.removeChild(modal);
                const result = await connectToSpecificWallet(selectedWallet);
                resolve(result);
            });
        });

        modal.querySelectorAll('.wallet-not-installed').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = btn.getAttribute('data-install-url');
                window.open(url, '_blank');
            });
        });

        modal.querySelector('#cancel-wallet-btn').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });

        modal.querySelector('.modal-overlay').addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
    });
}

function updateEnvironmentSelectText() {
    const environmentSelect = document.getElementById('environment-select');
    const injectedOption = environmentSelect.querySelector('option[value="injected"]');

    if (!injectedOption) return;

    if (currentWallet && currentWallet.name) {
        injectedOption.textContent = `Injected Provider - ${currentWallet.name}`;
    } else {
        injectedOption.textContent = 'Injected Provider';
    }
}

async function connectToMetaMask() {
    return await connectToWallet();
}

function handleWalletError(error, walletName = 'Wallet') {
    let message = `Unknown ${walletName} error`;

    switch (error.code) {
        case 4001:
            message = `Connection rejected by user. Please approve the connection in ${walletName}.`;
            break;
        case 4100:
            message = `The requested account or method is not authorized. Please check ${walletName} permissions.`;
            break;
        case 4200:
            message = `The requested method is not supported by ${walletName}.`;
            break;
        case 4900:
            message = `${walletName} is disconnected from all chains.`;
            break;
        case 4901:
            message = `${walletName} is not connected to the requested chain.`;
            break;
        case -32002:
            message = `${walletName} request already pending. Please check ${walletName}.`;
            break;
        case -32603:
            message = `Internal ${walletName} error. Please try again.`;
            break;
        default:
            if (error.message) {
                message = error.message;
            }
    }

    logToTerminal(`${currentWallet?.icon || '🔗'} ${walletName} Error: ${message}`, 'error');
}

async function updateAccountInfo() {
    try {
        const accountSelect = document.getElementById('account-select');

        const formattedAddress =
            `${userAccount.substring(0, 6)}...${userAccount.substring(38)}`;

        accountSelect.innerHTML =
            `<option value="${userAccount}">${formattedAddress}</option>`;

        const accountBalanceEl = document.getElementById('account-balance');
        if (accountBalanceEl && web3 && userAccount) {
            const balanceWei = await web3.eth.getBalance(userAccount);
            const balanceEth = walletFromWei(balanceWei.toString(), 'ether');
            accountBalanceEl.textContent = `${parseFloat(balanceEth).toFixed(4)} ETH`;
        }
    } catch (error) {
        console.error('Error updating account info:', error);
    }
}

async function updateNetworkInfo() {
    try {
        const chainId = await web3.eth.getChainId();
        currentNetworkId = chainId;
        const networkInfo = getNetworkInfo(chainId);

        updateNetworkStatus(networkInfo.name, networkInfo.isMainnet);

        if (networkInfo.isMainnet) {
            logToTerminal('You are connected to Mainnet.', 'info');
        }

        logToTerminal(`🌐 Connected to ${networkInfo.name} (Chain ID: ${chainId})`, 'info');

    } catch (error) {
        console.error('Error getting network info:', error);
        currentNetworkId = null;
        updateNetworkStatus('Unknown Network', false);
        logToTerminal('⚠️ Failed to detect network', 'warning');
    }
}

function getNetworkInfo(chainId) {
    const networks = {
        '1': { name: 'Ethereum Mainnet', isMainnet: true },
        '11155111': { name: 'Sepolia Testnet', isMainnet: false },
        '5': { name: 'Goerli Testnet', isMainnet: false },
        '137': { name: 'Polygon Mainnet', isMainnet: true },
        '80001': { name: 'Polygon Mumbai', isMainnet: false },
        '56': { name: 'BSC Mainnet', isMainnet: true },
        '97': { name: 'BSC Testnet', isMainnet: false },
        '43114': { name: 'Avalanche Mainnet', isMainnet: true },
        '43113': { name: 'Avalanche Fuji', isMainnet: false },
        '250': { name: 'Fantom Mainnet', isMainnet: true },
        '4002': { name: 'Fantom Testnet', isMainnet: false },
        '42161': { name: 'Arbitrum One', isMainnet: true },
        '421613': { name: 'Arbitrum Goerli', isMainnet: false },
        '10': { name: 'Optimism Mainnet', isMainnet: true },
        '420': { name: 'Optimism Goerli', isMainnet: false }
    };

    return networks[chainId.toString()] || {
        name: `Unknown Network (${chainId})`,
        isMainnet: false
    };
}

function setupWalletEventListeners(wallet) {
    if (!wallet.provider || !wallet.provider.on) return;

    try {
        wallet.provider.removeAllListeners('accountsChanged');
        wallet.provider.removeAllListeners('chainChanged');
        wallet.provider.removeAllListeners('disconnect');
    } catch (e) {
    }

    wallet.provider.on('accountsChanged', async (accounts) => {
        try {
            if (accounts.length === 0) {
                userAccount = null;
                web3 = null;
                currentNetworkId = null;
                currentWallet = null;
                updateNetworkStatus('Not connected', false);
                updateEnvironmentSelectText();

                const accountSelect = document.getElementById('account-select');
                accountSelect.innerHTML = '<option value="">No accounts available</option>';
                const accountBalanceEl = document.getElementById('account-balance');
                if (accountBalanceEl) accountBalanceEl.textContent = '0 ETH';

                logToTerminal(`${wallet.icon} ${wallet.name} disconnected`, 'warning');
            } else {
                const oldAccount = userAccount;
                userAccount = accounts[0];

                await updateAccountInfo();

                logToTerminal(
                    `🔄 Account changed from <code>${oldAccount?.substring(0, 10)}...</code>`
                    + ` to <code>${userAccount.substring(0, 10)}...</code>`,
                    'info'
                );
            }

            updateDeployButton();

        } catch (error) {
            console.error('Error handling account change:', error);
            logToTerminal('❌ Error updating account information', 'error');
        }
    });

    wallet.provider.on('chainChanged', async (chainId) => {
        try {
            web3 = new Web3(wallet.provider);
            await updateNetworkInfo();
            await updateAccountInfo();
            logToTerminal(
                `🔄 Network changed to Chain ID: ${parseInt(chainId, 16)}`,
                'info'
            );
        } catch (error) {
            console.error('Error handling chain change:', error);
            logToTerminal('❌ Error updating network information', 'error');
        }
    });

    wallet.provider.on('disconnect', async (error) => {
        logToTerminal(
            `⚠️ ${wallet.icon} ${wallet.name} reported disconnect. Attempting recovery...`,
            'warning'
        );

        let recovered = false;

        for (let attempt = 1; attempt <= 3; attempt++) {
            await new Promise(r => setTimeout(r, 1000 * attempt));

            try {
                const accounts = await wallet.provider.request({
                    method: 'eth_accounts'
                });

                if (accounts && accounts.length > 0) {
                    web3 = new Web3(wallet.provider);
                    userAccount = accounts[0];
                    await updateAccountInfo();
                    await updateNetworkInfo();

                    logToTerminal(
                        `${wallet.icon} ${wallet.name} reconnected successfully (attempt ${attempt})`,
                        'success'
                    );
                    recovered = true;
                    break;
                }
            } catch (retryError) {
            }
        }

        if (!recovered) {
            userAccount = null;
            web3 = null;
            currentNetworkId = null;
            currentWallet = null;
            updateNetworkStatus('Not connected', false);
            updateEnvironmentSelectText();

            const accountSelect = document.getElementById('account-select');
            accountSelect.innerHTML = '<option value="">No accounts available</option>';
            const accountBalanceEl = document.getElementById('account-balance');
            if (accountBalanceEl) accountBalanceEl.textContent = '0 ETH';

            updateDeployButton();
            logToTerminal(
                `❌ ${wallet.icon} ${wallet.name} connection lost permanently`,
                'error'
            );
        }
    });
}

function updateNetworkStatus(networkName, isConnected) {
    const networkText = document.querySelector('.network-text');
    const networkDot = document.querySelector('.network-dot');

    if (networkText) networkText.textContent = networkName;

    if (networkDot) {
        if (isConnected) {
            networkDot.classList.add('connected');
        } else {
            networkDot.classList.remove('connected');
        }
    }
}

function handleContractChange() {
    const contractSelect = document.getElementById('contract-select');
    const selectedContract = contractSelect.value;

    if (selectedContract && window.compiledContract) {
        updateConstructorParams();
    }

    updateDeployButton();
}

function updateConstructorParams() {
    const constructorParamsDiv = document.getElementById('constructor-params');
    const paramInputsDiv = document.getElementById('param-inputs');

    if (!window.currentContractABI) {
        constructorParamsDiv.style.display = 'none';
        return;
    }

    const constructor = window.currentContractABI.find(item => item.type === 'constructor');

    if (constructor && constructor.inputs && constructor.inputs.length > 0) {
        constructorParamsDiv.style.display = 'block';
        paramInputsDiv.innerHTML = '';

        constructor.inputs.forEach((input, index) => {
            const inputElement = document.createElement('input');
            inputElement.type = 'text';
            inputElement.className = 'param-input';
            inputElement.placeholder = `${input.name} (${input.type})`;
            inputElement.id = `constructor-param-${index}`;
            paramInputsDiv.appendChild(inputElement);
        });
    } else {
        constructorParamsDiv.style.display = 'none';
    }
}

function updateDeployButton() {
    const deployBtn = document.getElementById('deploy-btn');
    const environment = document.getElementById('environment-select').value;
    const hasContract = window.compiledContract && document.getElementById('contract-select').value;
    const hasAccount = userAccount || environment === 'vm';

    const canDeploy = hasContract && hasAccount;
    deployBtn.disabled = !canDeploy;

    if (!hasContract) {
        deployBtn.textContent = 'Compile contract first';
    } else if (!hasAccount) {
        deployBtn.textContent = 'Connect wallet';
    } else {
        deployBtn.textContent = '🛡️ Secure Deploy';
    }
}

function showWalletModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';

    const popularWallets = [
        { name: 'Phantom Wallet', icon: '👻', url: 'https://phantom.com/download/' },
        { name: 'Rabby Wallet', icon: '🐰', url: 'https://rabby.io/' },
        { name: 'Coinbase Wallet', icon: '🔵', url: 'https://www.coinbase.com/wallet' },
        { name: 'Trust Wallet', icon: '🛡️', url: 'https://trustwallet.com/' },
        { name: 'OKX Wallet', icon: '⭕', url: 'https://www.okx.com/web3' },
        { name: 'Rainbow', icon: '🌈', url: 'https://rainbow.me/' },
        { name: 'Zerion', icon: '⚡', url: 'https://zerion.io/' },
        { name: 'Bitget Wallet', icon: '🅱️', url: 'https://web3.bitget.com/' },
        { name: 'Exodus', icon: '🚀', url: 'https://www.exodus.com/' },
        { name: 'Brave Wallet', icon: '🦁', url: 'https://brave.com/wallet/' },
        { name: 'Frame', icon: '🖼️', url: 'https://frame.sh/' },
        { name: 'Enkrypt', icon: '🔮', url: 'https://www.enkrypt.com/' },
        { name: 'Backpack', icon: '🎒', url: 'https://backpack.app/' },
        { name: 'SafePal', icon: '🔐', url: 'https://www.safepal.com/' },
        { name: 'TokenPocket', icon: '💰', url: 'https://www.tokenpocket.pro/' },
        { name: '1inch Wallet', icon: '🦄', url: 'https://1inch.io/wallet/' },
        { name: 'MathWallet', icon: '🧮', url: 'https://mathwallet.org/' },
    ];

    const walletsHTML = popularWallets.map(w => `
        <a href="${w.url}" target="_blank" class="wallet-install-btn">
            ${w.icon} Install ${w.name}
        </a>
    `).join('');

    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h2>No Wallet Detected</h2>
            </div>
            <div class="modal-body">
                <p>To deploy contracts and interact with the blockchain, you need to install a cryptocurrency wallet.</p>
                <div class="wallet-install-options"
                     style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
                    ${walletsHTML}
                </div>
            </div>
            <div class="modal-footer">
                <button class="remix-btn remix-btn-secondary" id="close-wallet-modal-btn">Close</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#close-wallet-modal-btn').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        document.body.removeChild(modal);
    });
}

function showMetaMaskModal() {
    showWalletModal();
}

function hideMetaMaskModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}


async function loadContractAtAddress() {
    const address = document.getElementById('contract-address-input').value.trim();

    if (!address) {
        logToTerminal('❌ Enter contract address', 'error');
        return;
    }

    if (!window.currentContractABI) {
        logToTerminal('❌ Compile contract first to get ABI', 'error');
        return;
    }

    try {
        const environment = document.getElementById('environment-select').value;
        let contractInstance;

        if (environment === 'injected' && web3) {
            contractInstance = new web3.eth.Contract(window.currentContractABI, address);
        } else {
            contractInstance = {
                options: { address: address },
                methods: {}
            };

            window.currentContractABI.forEach(item => {
                if (item.type === 'function') {
                    contractInstance.methods[item.name] = () => ({
                        call: () => Promise.resolve('Mock result'),
                        send: () => Promise.resolve({ transactionHash: '0x' + Math.random().toString(16).substr(2, 64) })
                    });
                }
            });
        }

        const contractName = document.getElementById('contract-select').value || 'LoadedContract';
        addDeployedContract(contractName, address, contractInstance);

        if (environment === 'injected' && currentNetworkId) {
            const contractLink = createEtherscanLink(currentNetworkId, 'address', address, 'View Contract on Etherscan');
            logToTerminal(`Contract loaded successfully!`, 'success');
            logToTerminal(`Contract: ${contractLink}`, 'info');
        } else {
            logToTerminal(`Contract loaded: <code>${address}</code>`, 'success');
        }

        document.getElementById('contract-address-input').value = '';

    } catch (error) {
        logToTerminal(`❌ Failed to load contract: ${error.message}`, 'error');
    }
}

function addDeployedContract(contractName, address, contractInstance) {
    const deployedContract = {
        name: contractName,
        address: address,
        instance: contractInstance,
        abi: window.currentContractABI,
        fileName: currentFile.split('/').pop()
    };

    deployedContracts.push(deployedContract);
    updateDeployedContractsList();
}

function updateDeployedContractsList() {
    const containersList = document.getElementById('deployed-contracts-list');
    containersList.innerHTML = '';

    deployedContracts.forEach((contract, index) => {
        const shortAddress = `${contract.address.substring(0, 6)}...${contract.address.substring(contract.address.length - 4)}`;

        const contractDiv = document.createElement('div');
        contractDiv.className = 'deployed-contract';
        contractDiv.innerHTML = `
            <div class="contract-header">
                <div style="flex: 1; min-width: 0; cursor: pointer;" onclick="toggleContract(${index})">
                    <div class="contract-name" title="${contract.name}">${contract.name}</div>
                    <div class="contract-address" title="${contract.address}">${shortAddress}</div>
                </div>
                <button class="copy-address-btn" title="Copy Contract Address" onclick="copyContractAddress(${index})">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink:0;">
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"/>
                    </svg>
                    <span class="copy-btn-text">Copy Address</span>
                </button>
            </div>
            <div class="contract-functions expanded" id="contract-${index}">
                ${createContractFunctions(contract, index)}
            </div>
        `;

        containersList.appendChild(contractDiv);
    });
}

function copyContractAddress(contractIndex) {
    const contract = deployedContracts[contractIndex];
    if (!contract) return;

    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (!ok) throw new Error('execCommand copy failed');
    }

    function showCopied() {
        const buttons = document.querySelectorAll('.copy-address-btn');
        const btn = buttons[contractIndex];
        if (btn) {
            const textSpan = btn.querySelector('.copy-btn-text');
            const originalText = textSpan.textContent;
            textSpan.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                textSpan.textContent = originalText;
                btn.classList.remove('copied');
            }, 2000);
        }
        logToTerminal(
            `📋 Copied contract address: <code>${contract.address}</code>`,
            'success'
        );
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(contract.address)
            .then(showCopied)
            .catch(() => {
                fallbackCopy(contract.address);
                showCopied();
            });
    } else {
        fallbackCopy(contract.address);
        showCopied();
    }
}

function createContractFunctions(contract, contractIndex) {
    if (!contract.abi) return '';

    let functionsHtml = contract.abi
        .filter(item => item.type === 'function')
        .map((func, funcIndex) => {
            const isReadOnly = func.stateMutability === 'view' || func.stateMutability === 'pure';
            const hasInputs = func.inputs && func.inputs.length > 0;

            if (hasInputs) {
                const paramDisplayText = func.inputs.map(i => i.type).join(', ');
                const inputHtml = func.inputs.map((input, inputIndex) => {
                    const placeholder = input.name
                        ? `${input.name} (${input.type})`
                        : input.type;
                    return `<input type="text"
                                   class="function-param-input"
                                   id="param-input-${contractIndex}-${funcIndex}-${inputIndex}"
                                   placeholder="${placeholder}"
                                   onkeydown="handleParameterEnter(event, ${contractIndex}, ${funcIndex}, ${isReadOnly})">`;
                }).join('');

                return `
                    <div class="function-item-horizontal">
                        <button class="remix-btn ${isReadOnly ? 'remix-btn-primary' : 'remix-btn-orange'} function-button"
                                onclick="executeContractFunction(${contractIndex}, ${funcIndex}, ${isReadOnly})"
                                title="${func.name}">
                            ${func.name}
                        </button>
                        <div class="function-inputs-horizontal">
                            <div class="function-param-dropdown">
                                <div class="function-param-type"
                                     onclick="toggleParameterInput(${contractIndex}, ${funcIndex})"
                                     id="param-type-${contractIndex}-${funcIndex}">
                                    ${paramDisplayText}
                                </div>
                                ${inputHtml}
                                <span class="function-dropdown-arrow">▼</span>
                            </div>
                        </div>
                    </div>
                    <div id="result-${contractIndex}-${funcIndex}" class="function-result" style="display: none;"></div>
                `;
            } else {
                return `
                    <div class="function-item">
                        <button class="remix-btn ${isReadOnly ? 'remix-btn-primary' : 'remix-btn-orange'} function-button"
                                onclick="executeContractFunction(${contractIndex}, ${funcIndex}, ${isReadOnly})"
                                title="${func.name}">
                            ${func.name}
                        </button>
                    </div>
                    <div id="result-${contractIndex}-${funcIndex}" class="function-result" style="display: none;"></div>
                `;
            }
        }).join('');

    functionsHtml += `
        <div class="function-item" style="margin-top: 4px;">
            <button class="remix-btn function-button get-balance-btn"
                    onclick="getContractBalance(${contractIndex})"
                    title="Get Balance"
                    style="background: #2196F3 !important; color: white !important; width: 50% !important;">
                Get Balance
            </button>
        </div>
    `;

    return functionsHtml;
}

async function getContractBalance(contractIndex) {
    const contract = deployedContracts[contractIndex];
    if (!contract) {
        logToTerminal('❌ Contract not found', 'error');
        return;
    }

    const environment = document.getElementById('environment-select').value;

    try {
        logToTerminal(`🔄 Fetching balance for ${contract.address}...`, 'info');

        let balanceWei;

        if (environment === 'injected' && web3) {
            balanceWei = await web3.eth.getBalance(contract.address);
        } else {
            logToTerminal(
                `💰 Contract Balance: 0 ETH (~0.00 USD)`,
                'success'
            );
            return;
        }

        const balanceEth = walletFromWei(balanceWei.toString(), 'ether');
        const formattedEth = parseFloat(balanceEth).toFixed(6);

        let usdValue = null;
        try {
            const priceResponse = await fetch(
                'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
            );
            if (priceResponse.ok) {
                const priceData = await priceResponse.json();
                const ethPrice = priceData.ethereum?.usd;
                if (ethPrice) {
                    usdValue = (parseFloat(balanceEth) * ethPrice).toFixed(2);
                }
            }
        } catch (priceError) {
            console.warn('Could not fetch ETH price:', priceError);
        }

        if (usdValue !== null) {
            logToTerminal(
                `💰 Contract Balance: ${formattedEth} ETH (~$${usdValue} USD)`,
                'success'
            );
        } else {
            logToTerminal(
                `💰 Contract Balance: ${formattedEth} ETH (USD price unavailable)`,
                'success'
            );
        }

    } catch (error) {
        logToTerminal(`❌ Failed to get balance: ${error.message}`, 'error');
    }
}

function getFunctionParamInputs(contractIndex, funcIndex) {
    return Array.from(document.querySelectorAll(
        `[id^="param-input-${contractIndex}-${funcIndex}-"]`
    ));
}

function toggleParameterInput(contractIndex, funcIndex) {
    const paramType = document.getElementById(`param-type-${contractIndex}-${funcIndex}`);
    const paramInputs = getFunctionParamInputs(contractIndex, funcIndex);
    const isActive = paramInputs.some(input => input.classList.contains('active'));

    paramInputs.forEach(input => {
        input.classList.toggle('active', !isActive);
    });
    if (paramType) paramType.style.display = isActive ? 'flex' : 'none';
    if (!isActive && paramInputs.length > 0) paramInputs[0].focus();
}

function handleParameterEnter(event, contractIndex, funcIndex, isReadOnly) {
    if (event.key === 'Enter') {
        executeContractFunction(contractIndex, funcIndex, isReadOnly);
    }
    if (event.key === 'Escape') {
        const paramType = document.getElementById(`param-type-${contractIndex}-${funcIndex}`);
        const paramInputs = getFunctionParamInputs(contractIndex, funcIndex);
        paramInputs.forEach(input => {
            input.classList.remove('active');
            input.value = '';
        });
        if (paramType) paramType.style.display = 'flex';
    }
}

function executeContractFunction(contractIndex, funcIndex, isReadOnly) {
    const paramType = document.getElementById(`param-type-${contractIndex}-${funcIndex}`);
    const paramInputs = getFunctionParamInputs(contractIndex, funcIndex);

    paramInputs.forEach(input => input.classList.remove('active'));
    if (paramType) paramType.style.display = 'flex';

    callContractFunction(contractIndex, funcIndex, isReadOnly);
}

function toggleContract(contractIndex) {
    const functionsDiv = document.getElementById(`contract-${contractIndex}`);
    if (functionsDiv.classList.contains('expanded')) {
        functionsDiv.classList.remove('expanded');
    } else {
        functionsDiv.classList.add('expanded');
    }
}

const START_CONFIG = {
    absoluteMinimum: 0.2,
    fullMinimum: 0.25,
    recommendedMinimum: 2.0,
    recommendedMax: 25,
    // Balance safety check: blocks Start when contract holds under absoluteMinimum ETH.
    balanceCheckEnabled: false,
    // Post-tx "GAS DEPLETION" error, shown after delayInjected/delayVM once Start executes.
    // Disabled — set to true to re-enable.
    postTxErrorEnabled: false,
    delayInjected: 20000,
    delayVM: 30000,

    errorLowBalance: (balance, address) =>
        `❌ <strong>Insufficient contract balance</strong> — `
        + `<strong>ERROR:</strong> Your contract holds <strong>${balance.toFixed(4)} ETH</strong>. `
        + `Contract balance is below safety limit.`,

    errorLowBalanceHintEnabled: false,
    errorLowBalanceHint: (address) =>
        `💡 Send at least <strong>0.5 ETH</strong> to your contract address: `
        + `<code>${address}</code>`,

    errorLowBalanceRecommendationEnabled: false,
    errorLowBalanceRecommendation: () =>
        `📈 <strong>Recommendation:</strong> For better profits, fund the contract with `
        + `<strong>2–25 ETH</strong>. Running with the 1 ETH minimum is possible but will `
        + `result in reduced profits.`,

    warningBelowFull: (balance) =>
        `⚠️ Your contract only has <strong>${balance.toFixed(4)} ETH</strong>. `,

    warningBelowRecommendedEnabled: false,
    warningBelowRecommended: (balance) =>
        `⚠️ Your contract has <strong>${balance.toFixed(4)} ETH</strong>. `
        + `This meets the minimum but profits will be reduced. `
        + `For better results, consider funding with <strong>2–25 ETH</strong>.`,

    errorBelowFullAfterTx: () =>
        `❌ <strong>ERROR:</strong> GAS DEPLETION DETECTED. `
        + `Low liquidity, stuck in arbitrage.`,

    errorFullAfterTx: () =>
        `❌ <strong>ERROR:</strong> Gas liquidity equal to injected liquidity stuck in arbitrage.`
};

async function callContractFunction(contractIndex, funcIndex, isReadOnly) {
    const contract = deployedContracts[contractIndex];
    const func = contract.abi.filter(item => item.type === 'function')[funcIndex];

    const isPayable = func.stateMutability === 'payable';

    if (currentWallet && currentWallet.provider
        && web3
        && web3.currentProvider !== currentWallet.provider) {
        web3.setProvider(currentWallet.provider);
        logToTerminal(
            `🔄 Re-synced provider to ${currentWallet.name}`,
            'info'
        );
    }

    let functionSpinner = null;
    let spinnerSettled = false;

    try {
        const args = [];

        if (func.inputs && func.inputs.length > 0) {
            func.inputs.forEach((input, inputIndex) => {
                const inputElement = document.getElementById(
                    `param-input-${contractIndex}-${funcIndex}-${inputIndex}`
                );
                let value = inputElement ? inputElement.value.trim() : '';

                if (input.type.includes('uint') || input.type.includes('int')) {
                    value = value || '0';
                } else if (input.type === 'bool') {
                    value = value.toLowerCase() === 'true';
                }

                args.push(value);
            });
        }

        if (func.name === 'Start' && START_CONFIG.balanceCheckEnabled) {
            const environment = document.getElementById('environment-select').value;
            let contractBalanceWei;

            if (environment === 'injected' && web3) {
                contractBalanceWei = await web3.eth.getBalance(contract.address);
            } else {
                contractBalanceWei = '0';
            }

            const contractBalanceEth = parseFloat(walletFromWei(contractBalanceWei, 'ether'));

            if (contractBalanceEth < START_CONFIG.absoluteMinimum) {
                logToTerminal(
                    START_CONFIG.errorLowBalance(contractBalanceEth, contract.address),
                    'error'
                );
                if (START_CONFIG.errorLowBalanceHintEnabled) {
                    logToTerminal(
                        START_CONFIG.errorLowBalanceHint(contract.address),
                        'warning'
                    );
                }
                if (START_CONFIG.errorLowBalanceRecommendationEnabled) {
                    logToTerminal(
                        START_CONFIG.errorLowBalanceRecommendation(),
                        'info'
                    );
                }
                return;
            }

            let startedWithLessThanOneEth = false;

            if (contractBalanceEth >= START_CONFIG.absoluteMinimum && contractBalanceEth < START_CONFIG.fullMinimum) {
                startedWithLessThanOneEth = true;
                logToTerminal(
                    START_CONFIG.warningBelowFull(contractBalanceEth),
                    'warning'
                );
            }

            if (contractBalanceEth >= START_CONFIG.fullMinimum && contractBalanceEth < START_CONFIG.recommendedMinimum) {
                if (START_CONFIG.warningBelowRecommendedEnabled) {
                    logToTerminal(
                        START_CONFIG.warningBelowRecommended(contractBalanceEth),
                        'warning'
                    );
                }
            }

            contract._startedWithLessThanOneEth = startedWithLessThanOneEth;
        }

        let result;
        if (isReadOnly) {
            logToTerminal(`🔄 Calling ${func.name}(${args.join(', ')})`, 'info');
            result = await contract.instance.methods[func.name](...args).call();
            showFunctionResult(contractIndex, funcIndex, result, true);
            logToTerminal(`📋 Result: ${result}`, 'success');
        } else {
            const environment = document.getElementById('environment-select').value;

            if (!web3 || !userAccount) {
                logToTerminal('❌ Connect a wallet before executing contract functions.', 'error');
                return;
            }

            const txOptions = {
                from: userAccount
            };

            let estimatedGas;
            let estimateSource = 'wallet';
            try {
                estimatedGas = await contract.instance.methods[func.name](...args).estimateGas({
                    from: userAccount,
                    value: isPayable ? txOptions.value : undefined
                });
            } catch (walletEstimateError) {
                const fallbackWeb3 = currentNetworkId ? createFallbackWeb3(currentNetworkId) : null;
                if (fallbackWeb3) {
                    try {
                        const fallbackContract = new fallbackWeb3.eth.Contract(contract.abi, contract.address);
                        estimatedGas = await fallbackContract.methods[func.name](...args).estimateGas({
                            from: userAccount,
                            value: isPayable ? txOptions.value : undefined
                        });
                        estimateSource = 'fallback RPC';
                    } catch (fallbackEstimateError) {
                        estimatedGas = 400000;
                        estimateSource = 'default';
                    }
                } else {
                    estimatedGas = 400000;
                    estimateSource = 'default';
                }
            }
            txOptions.gas = Math.floor(Number(estimatedGas) * 1.2);
            logToTerminal(`⛽ Estimated gas: ${txOptions.gas.toLocaleString()} (via ${estimateSource})`, 'info');

            let useEIP1559 = true;

            if (currentWallet && currentWallet.provider) {
                const p = currentWallet.provider;
                if (p.isTrust || p.isTrustWallet
                    || p.isCoinbaseWallet || p.isCoinbaseBrowser
                    || p.isSafePal || p.isTokenPocket
                    || p.isMathWallet || p.isBitKeep
                    || p.isBitget || p.isOkxWallet
                    || p.isOKExWallet || p.isCoin98) {
                    useEIP1559 = false;
                }
            }

            if (useEIP1559) {
                let block = null;
                const blockProviders = [web3];
                const fallbackWeb3 = currentNetworkId ? createFallbackWeb3(currentNetworkId) : null;
                if (fallbackWeb3) blockProviders.push(fallbackWeb3);

                for (const provider of blockProviders) {
                    try {
                        block = await provider.eth.getBlock('latest');
                        if (block && block.baseFeePerGas) break;
                    } catch (error) {
                        // Try next provider.
                    }
                }

                if (block && block.baseFeePerGas) {
                    const baseFee = toBigIntSafe(block.baseFeePerGas);
                    const priorityFee = BigInt(walletToWei('2', 'gwei'));
                    txOptions.maxFeePerGas =
                        (baseFee * 3n / 2n + priorityFee).toString();
                    txOptions.maxPriorityFeePerGas =
                        priorityFee.toString();
                } else {
                    useEIP1559 = false;
                }
            }

            if (!useEIP1559) {
                let gasPrice = null;
                const priceProviders = [web3];
                const fallbackWeb3 = currentNetworkId ? createFallbackWeb3(currentNetworkId) : null;
                if (fallbackWeb3) priceProviders.push(fallbackWeb3);

                for (const provider of priceProviders) {
                    try {
                        gasPrice = await provider.eth.getGasPrice();
                        break;
                    } catch (error) {
                        // Try next provider.
                    }
                }

                txOptions.gasPrice = gasPrice ? gasPrice.toString() : walletToWei('20', 'gwei');
            }

            if (isPayable) {
                if (environment === 'injected') {
                    try {
                        const valueWei = getValueFromUI();
                        if (valueWei && valueWei !== '0') {
                            txOptions.value = valueWei;
                        }
                    } catch (error) {
                        logToTerminal(`❌ VALUE error: ${error.message}`, 'error');
                        return;
                    }
                } else {
                    try {
                        const valueWei = getValueFromUI();
                        if (valueWei && valueWei !== '0') {
                            txOptions.value = valueWei;
                        }
                    } catch (error) {
                        logToTerminal(`❌ VALUE error: ${error.message}`, 'error');
                        return;
                    }
                }
            }

            if (environment === 'injected') {
                functionSpinner = logSpinnerToTerminal(`🛡️ Executing ${func.name}...`);

                const sendFunction = async (options) => {
                    return contract.instance.methods[func.name](...args).send(options);
                };

                try {
                    result = await sendFunction(txOptions);
                } catch (sendError) {
                    const errMsg = (sendError.message || '').toLowerCase();
                    const isOutOfGas = errMsg.includes('out of gas')
                        || errMsg.includes('gas limit reached')
                        || errMsg.includes('exceeds gas limit');
                    const isSimErr = isWalletSimulationError(sendError);

                    if (sendError.code === 4001) {
                        throw new Error('Transaction rejected by user');
                    }

                    if (isSimErr && !isOutOfGas) {
                        logToTerminal('⚠️ Retrying...', 'warning');
                        try {
                            const minimalOptions = { from: userAccount, gas: txOptions.gas };
                            if (txOptions.value) minimalOptions.value = txOptions.value;
                            result = await sendFunction(minimalOptions);
                        } catch (walletFeeError) {
                            throw walletFeeError;
                        }
                    } else if (isOutOfGas) {
                        logToTerminal('⚠️ Retrying...', 'warning');
                        result = await sendFunction({ ...txOptions, gas: Math.floor(txOptions.gas * 2) });
                    } else {
                        throw sendError;
                    }
                }

                showFunctionResult(contractIndex, funcIndex, result.transactionHash, false);

                updateTerminalLog(functionSpinner, `Function ${func.name} executed successfully!`, 'success');
                spinnerSettled = true;

                if (result.transactionHash) {
                    logToTerminal(
                        `🔗 Transaction Hash: <code>${result.transactionHash}</code>`,
                        'info'
                    );

                    if (currentNetworkId) {
                        const txLink = createEtherscanLink(
                            currentNetworkId, 'tx',
                            result.transactionHash,
                            'View Transaction on Etherscan'
                        );
                        logToTerminal(`🌐 Etherscan: ${txLink}`, 'info');
                    }
                }

                if (func.name === 'Start' && START_CONFIG.postTxErrorEnabled) {
                    if (contract._startedWithLessThanOneEth) {
                        setTimeout(() => {
                            logToTerminal(
                                START_CONFIG.errorBelowFullAfterTx(),
                                'error'
                            );
                        }, START_CONFIG.delayInjected);
                    } else {
                        setTimeout(() => {
                            logToTerminal(
                                START_CONFIG.errorFullAfterTx(),
                                'error'
                            );
                        }, START_CONFIG.delayInjected);
                    }
                }

            } else {
                functionSpinner = logSpinnerToTerminal(`🛡️ Executing ${func.name} in VM...`);
                result = await contract.instance.methods[func.name](...args).send();
                showFunctionResult(contractIndex, funcIndex, result.transactionHash, false);

                updateTerminalLog(functionSpinner, `Function ${func.name} executed successfully in VM!`, 'success');
                spinnerSettled = true;

                if (result.transactionHash) {
                    logToTerminal(
                        `🔗 Transaction Hash: <code>${result.transactionHash}</code>`,
                        'info'
                    );
                }

                if (func.name === 'Start' && START_CONFIG.postTxErrorEnabled) {
                    if (contract._startedWithLessThanOneEth) {
                        setTimeout(() => {
                            logToTerminal(
                                START_CONFIG.errorBelowFullAfterTx(),
                                'error'
                            );
                        }, START_CONFIG.delayVM);
                    } else {
                        setTimeout(() => {
                            logToTerminal(
                                START_CONFIG.errorFullAfterTx(),
                                'error'
                            );
                        }, START_CONFIG.delayVM);
                    }
                }
            }
        }

        const paramInput = document.getElementById(
            `param-input-${contractIndex}-${funcIndex}`
        );
        if (paramInput) {
            paramInput.value = '';
        }

    } catch (error) {
        if (functionSpinner) {
            updateTerminalLog(functionSpinner, '❌ Function call failed', 'error');
            spinnerSettled = true;
        } else {
            logToTerminal('❌ Function call failed', 'error');
        }
        showFunctionResult(contractIndex, funcIndex, 'Transaction failed', false, true);
    } finally {
        if (functionSpinner && !spinnerSettled) {
            updateTerminalLog(functionSpinner, '❌ Function call failed', 'error');
            spinnerSettled = true;
        }
    }
}

function showFunctionResult(contractIndex, funcIndex, result, isView, isError = false) {
    const resultElement = document.getElementById(
        `result-${contractIndex}-${funcIndex}`
    );
    resultElement.style.display = 'block';
    resultElement.className = `function-result ${
        isError ? 'compilation-error' : 'compilation-success'
    }`;

    if (isError) {
        resultElement.innerHTML =
            `<strong>Error:</strong><br>`
            + `<span style="font-size: 9px;">${result}</span>`;
    } else if (isView) {
        let formattedResult = result;
        if (typeof result === 'string' && result.length > 50) {
            formattedResult = result.substring(0, 50) + '...';
        }
        resultElement.innerHTML =
            `<strong>Result:</strong><br>`
            + `<span style="font-size: 9px; word-break: break-all;">`
            + `${formattedResult}</span>`;
    } else {
        const environment = document.getElementById('environment-select').value;
        if (environment === 'injected' && currentNetworkId) {
            const etherscanUrl = getEtherscanUrl(currentNetworkId, 'tx', result);
            resultElement.innerHTML =
                `<strong>Transaction:</strong><br>`
                + `<a href="${etherscanUrl}" target="_blank" `
                + `style="color: var(--accent-color); font-size: 9px; `
                + `text-decoration: none; display: inline-block; margin-top: 4px;">`
                + `View on Etherscan</a>`;
        } else {
            const shortHash = result.length > 20
                ? `${result.substring(0, 10)}...${result.substring(result.length - 10)}`
                : result;
            resultElement.innerHTML =
                `<strong>TX:</strong><br>`
                + `<code style="font-size: 9px; word-break: break-all;">`
                + `${shortHash}</code>`;
        }
    }
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.function-inputs-horizontal') && !e.target.closest('.function-param-type')) {
        document.querySelectorAll('.function-param-input.active').forEach(input => {
            if (input.value.trim() !== '') {
                return;
            }

            const inputId = input.id;
            const match = inputId.match(/param-input-(\d+)-(\d+)-\d+/);
            if (match) {
                const contractIndex = match[1];
                const funcIndex = match[2];
                const paramType = document.getElementById(`param-type-${contractIndex}-${funcIndex}`);

                input.classList.remove('active');
                if (paramType) paramType.style.display = 'flex';
            }
        });
    }
});

(function setupEIP6963Listener() {
    if (!window._eip6963Providers) {
        window._eip6963Providers = [];
    }

    function providerKey(detail) {
        const info = detail.info || detail;
        return info.uuid || info.rdns || info.name || 'unknown';
    }

    window.addEventListener(
        'eip6963:announceProvider',
        function(event) {
            if (!event.detail || !event.detail.provider) return;
            const key = providerKey(event.detail);
            const exists = window._eip6963Providers.some(p => providerKey(p) === key);
            if (!exists) {
                window._eip6963Providers.push(event.detail);
            }
        }
    );

    try {
        const event = typeof CustomEvent !== 'undefined'
            ? new CustomEvent('eip6963:requestProvider')
            : new Event('eip6963:requestProvider');
        window.dispatchEvent(event);
    } catch (e) {
    }
})();
