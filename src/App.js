import React, { Component } from 'react'
import PaymentChannel from '../build/contracts/UnidirectionalPaymentChannelManager.json'
import getWeb3 from './utils/getWeb3'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      storageValue: 0,
      web3: null,
      paymentChannelInstance: null
    }
  }

  async waitForTxToBeMined (txHash) {
    // let txReceipt
    // while (!txReceipt) {
    //   try {
    //     txReceipt = await this.state.web3.eth.getTransactionReceipt(txHash)
    //   } catch (err) {
    //     console.log("Failure!: " + err)
    //   }
    // }
    console.log("Success!: " + txHash)
  }

  toHex(str) {
    var hex = ''
    for(var i=0;i<str.length;i++) {
     hex += ''+str.charCodeAt(i).toString(16)
    }
    return hex
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  signString(senderAddress, recipientAddress, valueToTransfer) {
    /*
    * Sign a string and return (hash, v, r, s) used by ecrecover to regenerate the coinbase address;
    */
    // var msg = `${senderAddress}${recipientAddress}`
    var msg = `${senderAddress.slice(2)}${recipientAddress.slice(2)}`
    // var msgHex = '0x' + Buffer.from(msg).toString('hex')
    var encodedMsg = this.state.web3.sha3(msg, { encoding: 'hex' })
    var sig = this.state.web3.eth.sign(senderAddress, encodedMsg).slice(2)
    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = this.state.web3.toDecimal(sig.slice(128, 130)) + 27


    return {msg, v, r, s};
  }

  instantiateContract() {
    /*
     * SMART CONTRACT EXAMPLE
     *
     * Normally these functions would be called in the context of a
     * state management library, but for convenience I've placed them here.
     */

    const contract = require('truffle-contract')
    const paymentChannel = contract(PaymentChannel)
    paymentChannel.setProvider(this.state.web3.currentProvider)
    var senderAddress
    var recipientAddress

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      paymentChannel.deployed().then((instance) => {
        this.setState({paymentChannelInstance: instance})
        const web3 = this.state.web3
        web3.eth.defaultAccount = this.state.web3.eth.accounts[0]
        this.setState({web3})

        // Open channel
        senderAddress = this.state.web3.eth.accounts[0]
        recipientAddress = this.state.web3.eth.accounts[3]
        return this.openChannel(senderAddress, recipientAddress, 20)
      }).then((txHash) => {
        // Wait for tx to be mined
        console.log('Transaction sent')
        console.log(txHash)
        this.setState({storageValue: 3})
        return this.waitForTxToBeMined(txHash)
      }).then((result) => {
        // Validate Signature
        let {_, v, r, s} = this.signOffChainPayment(senderAddress, recipientAddress, 5)
        return this.validateSignature(senderAddress, recipientAddress, 5, v, r, s)
      }).then((result) => {
        // Close channel
        if(result !== true) {
          throw Error("Invalid signature error")
        }
        let {_, v_decimal, r, s} = this.signOffChainPayment(senderAddress, recipientAddress, 5)
        return this.closeChannel(senderAddress, recipientAddress, 5, v_decimal, r, s)
      
      }).then((txHash) => {
        // wait for tx to be mined
        console.log('Transaction sent')
        console.log(txHash)
        return this.waitForTxToBeMined(txHash)
      }).catch( e => {
        console.log(e)
      })
    })
  }

  async openChannel(
    senderAddress, 
    recipientAddress, 
    collateral
  ) {
    return this.state.paymentChannelInstance.openChannel(
        senderAddress, 
        recipientAddress, 
        collateral,
        {from: senderAddress, gas: 4712388, value: collateral}
      )
  }

  signOffChainPayment(
    senderAddress, 
    recipientAddress, 
    valueToTransfer
  ) {
    return this.signString(
        senderAddress, 
        recipientAddress,
        valueToTransfer
    )
  }

  async validateSignature(
    senderAddress, 
    recipientAddress, 
    valueTransferred, 
    v, 
    r, 
    s
  ) {
    var message = `${senderAddress}${recipientAddress}`
    return this.state.paymentChannelInstance.verifySignature.call(
        this.state.web3.sha3(`\x19Ethereum Signed Message:\n${message.length}${message}`),
        // message,
        senderAddress, 
        recipientAddress, 
        valueTransferred, 
        v, 
        r, 
        s,
        {gas: 4712388, gasPrice: 1}
      )
  }

  async closeChannel(
    senderAddress, 
    recipientAddress, 
    valueTransferred, 
    v_decimal, 
    r, 
    s
  ) {
    return this.state.paymentChannelInstance.closeChannel(
        senderAddress, 
        recipientAddress, 
        valueTransferred, 
        v_decimal, 
        r, 
        s, 
        {gas: 4712388, gasPrice: 1}
      )
  }

  getProviderSignaturePrefix(message, provider) {
    if (provider === 'testrpc' || provider === 'geth' || provider === 'parity') {
      return `\x19Ethereum Signed Message:\n${message.length}`
    } else {
      return ''
    }
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Truffle Box</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>Good to Go!</h1>
              <p>Your Truffle Box is installed and ready.</p>
              <h2>Smart Contract Example</h2>
              <p>If your contracts compiled and migrated successfully, below will show a stored value of 5 (by default).</p>
              <p>Try changing the value stored on <strong>line 59</strong> of App.js.</p>
              <p>The stored value is: {this.state.storageValue}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
