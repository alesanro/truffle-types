declare module "abi-primitives" {
    export type ContractAbi = AbiDefinition[];

    export interface FunctionParameter {
        name: string;
        type: string;
    }

    type AbiDefinition = FunctionAbi | EventAbi;

    type FunctionAbi = MethodAbi | ConstructorAbi | FallbackAbi;

    enum AbiType {
        Function = "function",
        Constructor = "constructor",
        Event = "event",
        Fallback = "fallback"
    }

    interface MethodAbi {
        type: AbiType.Function;
        name: string;
        inputs: FunctionParameter[];
        outputs: FunctionParameter[];
        constant: boolean;
        payable: boolean;
    }

    interface ConstructorAbi {
        type: AbiType.Constructor;
        inputs: FunctionParameter[];
        payable: boolean;
    }

    interface FallbackAbi {
        type: AbiType.Fallback;
        payable: boolean;
    }

    interface EventAbi {
        type: AbiType.Event;
        name: string;
        inputs: EventParameter[];
        anonymous: boolean;
    }

    interface EventParameter {
        name: string;
        type: string;
        indexed: boolean;
    }
}
