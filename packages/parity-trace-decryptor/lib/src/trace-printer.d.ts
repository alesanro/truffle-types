import { DecryptedTrace, DecryptedTreeTrace } from "./types";
/**
 *
 * @param treeTrace list of decrypted trace trees to traverse
 * @param printer output pipe; console by default
 * @param prompt prompt symbol; 1 tab by default
 */
export declare function printTree(treeTrace: DecryptedTreeTrace<DecryptedTrace>[], printer?: Console, prompt?: string): void;
