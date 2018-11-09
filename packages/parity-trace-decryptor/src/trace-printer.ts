import { DecryptedTrace, DecryptedTreeTrace } from "./types";

/**
 *
 * @param treeTrace list of decrypted trace trees to traverse
 * @param printer output pipe; console by default
 * @param prompt prompt symbol; 1 tab by default
 */
export function printTree(treeTrace: DecryptedTreeTrace<DecryptedTrace>[], printer: Console = console, prompt = "\t"): void {
    function _printBranch(treeTrace: DecryptedTreeTrace<DecryptedTrace>, depth: number): void {
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
