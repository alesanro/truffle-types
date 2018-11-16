declare module "web3-eth-accounts" {

    import { HexString } from "truffle-contract";
    import Web3, { Transaction } from "web3";

    interface Signer {
        signTransaction(tx: Transaction): Promise<SignedTransaction>;
        sign(data: HexString, privateKey: HexString): SignedMessage;
        encrypt(privateKey: HexString, password: string, options?: Encryption.Options): Encryption.EncryptedWallet | never;
    }

    export interface Account extends Signer {}

    export interface SignedData {
        messageHash: string;
        v: number;
        r: HexString;
        s: HexString;
    }

    export interface SignedTransaction extends SignedData {
        rawTransaction: HexString;
    }

    export interface SignedMessage extends SignedData {
        message: HexString;
        signature: HexString;
    }

    export namespace Encryption {

        interface KdfParams {
            dklen: number;
            salt: HexString;
            c?: number;
            prf: string;
            n?: number;
            r?: number;
            p?: number;
        }

        interface CipherParams {
            iv: HexString;
        }

        interface Options {
            salt?: Buffer;
            iv?: Buffer;
            kdf?: String;
            dklen?: number;
            c?: number;
            n?: number;
            r?: number;
            p?: number;
            cipher?: string;
            uuid?: string;
        }

        interface EncryptedWallet {
            version: number;
            id: string;
            address: string;
            crypto: Crypto;

        }

        interface Crypto {
            ciphertext: string;
            cipherparams: CipherParams;
            cipher: string;
            kdf: string;
            kdfparams: KdfParams;
            mac: HexString;
        }
    }

    export default class Accounts implements Signer {
        constructor(web3: Web3);
        create(entropy: string): Account;
        privateKeyToAccount(privateKey: HexString): string;
        signTransaction(tx: Transaction): Promise<SignedTransaction>;
        sign(data: HexString, privateKey: HexString): SignedMessage;
        recoverTransaction(rawTx: HexString): string;
        hashMessage(data: HexString): string;
        recover(message: SignedData, signature: HexString, preFixed: boolean): string;
        decrypt(v3Keystore: string | JSON, password: string, nonStrict: boolean): Account;
        encrypt(privateKey: HexString, password: string, options?: Encryption.Options): Encryption.EncryptedWallet | never;
    }
}
