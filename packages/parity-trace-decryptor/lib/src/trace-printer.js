"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 *
 * @param treeTrace list of decrypted trace trees to traverse
 * @param printer output pipe; console by default
 * @param prompt prompt symbol; 1 tab by default
 */
function printTree(treeTrace, printer = console, prompt = "\t") {
    function _printBranch(treeTrace, depth) {
        const prefix = prompt.repeat(depth + 1);
        printer.info(`${prefix} ${treeTrace.decryptedAction.toContract} ${treeTrace.decryptedAction.selector} ${treeTrace.decryptedAction.gasUsed} ${treeTrace.error ? `[${treeTrace.error}]` : ""}`);
        for (const subtrace of treeTrace.calls) {
            _printBranch(subtrace, depth + 1);
        }
    }
    for (const trace of treeTrace) {
        printer.info(`${trace.decryptedAction.fromContract}`);
        _printBranch(trace, 0);
    }
}
exports.printTree = printTree;
