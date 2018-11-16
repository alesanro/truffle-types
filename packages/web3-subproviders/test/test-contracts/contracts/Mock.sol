pragma solidity ^0.4.24;

contract Mock {
	address owner;

	constructor() public {
		owner = msg.sender;
	}
}
