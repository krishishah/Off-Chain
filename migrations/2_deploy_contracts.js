var Channel = artifacts.require("./UnidirectionalPaymentChannelManager.sol");

module.exports = function(deployer) {
  deployer.deploy(Channel);
};
