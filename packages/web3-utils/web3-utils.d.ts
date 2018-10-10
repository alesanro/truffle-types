declare module "web3-utils" {

    import BigNumber from "bignumber.js";

    namespace Utils {
        
        type Unit =
            | "noether"
            | "wei"
            | "kwei"
            | "Kwei"
            | "babbage"
            | "femtoether"
            | "mwei"
            | "Mwei"
            | "lovelace"
            | "picoether"
            | "gwei"
            | "Gwei"
            | "shannon"
            | "nanoether"
            | "nano"
            | "szabo"
            | "microether"
            | "micro"
            | "finney"
            | "milliether"
            | "milli"
            | "ether"
            | "kether"
            | "grand"
            | "mether"
            | "gether"
            | "tether";
    
        type Mixed =
            | string
            | number
            | BigNumber
            | {
            type: string;
            value: string;
        }
            | {
            t: string;
            v: string;
        };
    
        function isBigNumber(any: any): boolean;
        function isAddress(any: any): boolean;
        function isHex(any: any): boolean;
        function asciiToHex(val: string): string;
        function hexToAscii(val: string): string;
        function bytesToHex(val: number[]): string;
        function numberToHex(val: number | BigNumber): string;
        function checkAddressChecksum(address: string): boolean;
        function fromAscii(val: string): string;
        function fromDecimal(val: string | number | BigNumber): string;
        function fromUtf8(val: string): string;
        function fromWei(val: string | number | BigNumber, unit: Unit): string | BigNumber;
        function hexToBytes(val: string): number[];
        function hexToNumber(val: string | number | BigNumber): number;
        function hexToNumberString(val: string | number | BigNumber): string;
        function hexToString(val: string): string;
        function hexToUtf8(val: string): string;
        function keccak256(val: string): string;
        function leftPad(string: string, chars: number, sign: string): string;
        function padLeft(string: string, chars: number, sign: string): string;
        function rightPad(string: string, chars: number, sign: string): string;
        function padRight(string: string, chars: number, sign: string): string;
        function sha3(
                val: string,
                val2?: string,
                val3?: string,
                val4?: string,
                val5?: string
            ): string;
        function soliditySha3(...val: Mixed[]): string;
        function randomHex(bytes: number): string;
        function stringToHex(val: string): string;
        function toAscii(hex: string): string;
        function toChecksumAddress(val: string): string;
        function toDecimal(val: any): number;
        function toHex(val: any): string;
        function toUtf8(val: any): string;
        function toWei(val: string | number, unit?: Unit): string;
        function toWei(val: BigNumber, unit?: Unit): BigNumber;
        
        const unitMap: any;
    }


    export = Utils
}