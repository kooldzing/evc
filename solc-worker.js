let solc = null;
let solcLoading = null;

var SOLC_URL = './soljson.js'; 

const DEFAULT_SOURCE_NAME = 'Contract';

async function loadSolc() {
    if (solc) return solc;
    if (solcLoading) return solcLoading;

    solcLoading = new Promise(function (resolve, reject) {
        try {
            self.postMessage({ type: 'status', message: 'Loading official Solidity compiler...' });
            importScripts(SOLC_URL);
            solc = self.Module;
            self.postMessage({ type: 'status', message: 'Compiler loaded successfully' });
            resolve(solc);
        } catch (err) {
            reject(new Error('Failed to load Solidity compiler: ' + err.message));
        }
    });

    return solcLoading;
}

function buildCompilerInput(sourceName, sourceCode, enableOptimization, optimizationRuns) {
    return {
        language: 'Solidity',
        sources: {
            [sourceName + '.sol']: { content: sourceCode },
        },
        settings: {
            optimizer: {
                enabled: !!enableOptimization,
                runs: typeof optimizationRuns === 'number' ? optimizationRuns : 200,
            },
            outputSelection: {
                '*': {
                    '*': ['abi', 'evm.bytecode.object', 'metadata'],
                },
            },
        },
    };
}

function runCompiler(input) {
    var rawOutput = solc.cwrap('solidity_compile', 'string', ['string'])(JSON.stringify(input));
    return JSON.parse(rawOutput);
}

function compileSource(opts) {
    var sourceCode = opts.sourceCode;
    var sourceName = opts.requestedName || DEFAULT_SOURCE_NAME;
    var input = buildCompilerInput(sourceName, sourceCode, opts.enableOptimization, opts.optimizationRuns);
    var output = runCompiler(input);

    var errors = (output.errors || []).filter(function (e) { return e.severity === 'error'; });
    var warnings = (output.errors || []).filter(function (e) { return e.severity === 'warning'; });

    if (errors.length > 0) {
        return {
            success: false,
            error: errors[0].formattedMessage || errors[0].message,
            details: errors.map(function (e) {
                return {
                    message: e.message,
                    formattedMessage: e.formattedMessage,
                    severity: e.severity,
                    type: e.type,
                };
            }),
            warnings: warnings.map(function (w) { return w.formattedMessage || w.message; }),
        };
    }

    var contracts = output.contracts && output.contracts[sourceName + '.sol'];
    if (!contracts || Object.keys(contracts).length === 0) {
        return { success: false, error: 'No contracts found in compilation output.' };
    }

    var targetName = opts.requestedName || Object.keys(contracts)[0];
    var compiled = contracts[targetName] || contracts[Object.keys(contracts)[0]];

    return {
        success: true,
        contractName: targetName,
        abi: compiled.abi || [],
        bytecode: (compiled.evm && compiled.evm.bytecode && compiled.evm.bytecode.object) || '',
        warnings: warnings.map(function (w) { return w.formattedMessage || w.message; }),
    };
}

self.onmessage = async function (e) {
    var data = e.data;
    if (data.action === 'compile') {
        try {
            await loadSolc();
            var result = compileSource({
                sourceCode: data.options.sourceCode,
                requestedName: data.options.contractName,
                enableOptimization: data.options.enableOptimization,
                optimizationRuns: data.options.optimizationRuns
            });
            self.postMessage({ type: 'result', id: data.id, result: result });
        } catch (err) {
            self.postMessage({
                type: 'result',
                id: data.id,
                result: { success: false, error: err.message },
            });
        }
    }
};