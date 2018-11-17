// tslint:disable-next-line:no-implicit-dependencies
import * as Web3 from "web3";

export type Status = "fulfilled" | "pending";

export interface LogRecord {
    from: string;
    to: string;
    input: string;
    sig?: string;
    txhash: string;
    status: Status;
    hashsum: string;
    tx: Partial<Web3.Transaction>;
}
