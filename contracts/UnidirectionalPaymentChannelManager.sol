pragma solidity ^0.4.2;

contract UnidirectionalPaymentChannelManager {

    struct Channel {
        address sender;
        address recipient;
        uint collateral;
    }


    mapping (address => mapping (address => Channel)) public channels;


    function openChannel(address recipient) public payable {
        //perform some validation first
        channels[msg.sender][recipient] = Channel({
            sender:msg.sender,
            recipient: recipient,
            collateral: msg.value
        });
    }


    function closeChannel(
        address sender, 
        address recipient, 
        uint valueTransferred,
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) 
    public 
    {
        // Check channel exists
        if (channels[sender][recipient].collateral <= 0) {
            revert();
        }

        // Make sure value transferred is less than collateral
        if (channels[sender][recipient].collateral >= valueTransferred) {
            revert();
        }

        // Load channel into memory
        Channel memory channel = channels[sender][recipient];

        if (!verifySignature(sender, recipient, valueTransferred, v, r, s)) {
            revert();
        }

        // Settle up
        settleBalances(channel, valueTransferred);

        // Remove mapping
        delete channels[sender][recipient];
    }


    function settleBalances(
        Channel channel, 
        uint valueTransferred
    ) 
    private 
    {
        channel.recipient.transfer(valueTransferred);
        channel.sender.transfer((channel.collateral - valueTransferred));
    }


    function verifySignature(
        address sender, 
        address recipient, 
        uint valueTransferred,
        uint8 v, 
        bytes32 r, 
        bytes32 s
    ) 
    public pure returns (bool)
    {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";

        // Validate Signature with sha3 (alias for keccak256)
        bytes32 messageHash = keccak256(
            sender,
            recipient,
            valueTransferred
        );

        bytes32 prefixedHash = keccak256(
            prefix,
            messageHash
        );

        address signerAddress = ecrecover(prefixedHash,v,r,s);

        if (signerAddress != sender) {
            return false;
        }

        return true;
    }

}