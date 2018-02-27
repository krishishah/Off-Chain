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

        // Load channel into memory
        Channel memory channel = channels[sender][recipient];

        // Validate either sender or recipient is sending this message
        if (!(msg.sender == channel.sender || msg.sender == channel.recipient)) {
            revert();
        }

        // Validate Signature with sha3 (alias for keccak256)
        bytes32 hash = keccak256(
            sender,
            recipient,
            valueTransferred
        );

        address signerAddress = ecrecover(hash,v,r,s);

        if (!(signerAddress == channel.sender || signerAddress == channel.recipient)) {
            revert();
        }

        // Settle up
        settleBalances(channels[sender][recipient], valueTransferred);

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

}