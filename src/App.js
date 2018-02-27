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
      web3: null
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

  signString(senderAddress, text) {
    /*
    * Sign a string and return (hash, v, r, s) used by ecrecover to regenerate the coinbase address;
    */
    let sha = '0x' + this.state.web3.sha3(text);
    let sig = this.state.web3.eth.sign(senderAddress, sha);
    sig = sig.substr(2, sig.length); //remove 0x
    let r = '0x' + sig.substr(0, 64);
    let s = '0x' + sig.substr(64, 64);
    let v = this.state.web3.toDecimal(sig.substr(128, 2)) + 27;
    return {sha, v, r, s};
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

    // Declaring this for later so we can chain functions on PaymentChannel.
    var paymentChannelInstance
    this.setState({storageValue: 1})
    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      paymentChannel.deployed().then((instance) => {
        paymentChannelInstance = instance
        const web3 = this.state.web3
        web3.eth.defaultAccount = this.state.web3.eth.accounts[0]
        this.setState({web3})

        // Open channel
        let senderAddress = this.state.web3.eth.accounts[0]
        let recipientAddress = this.state.web3.eth.accounts[3]
        this.setState({storageValue: 2})
        return paymentChannelInstance.openChannel(recipientAddress, {from: senderAddress, gas: 4712388, value: 10})
      }).then((txHash) => {
        // Wait for tx to be mined
        console.log('Transaction sent')
        console.log(txHash)
        this.setState({storageValue: 3})
        return this.waitForTxToBeMined(txHash)
      }).then((result) => {
        // Close channel
        let senderAddress = this.state.web3.eth.accounts[0]
        let recipientAddress = this.state.web3.eth.accounts[3]

        let {sha, v_decimal, r, s} = this.signString(senderAddress, Buffer.from(senderAddress + recipientAddress + "5").toString('hex'))

        console.log(sha, v_decimal, r, s)
        this.setState({storageValue: 4})
        return paymentChannelInstance.closeChannel(senderAddress, recipientAddress, 5, v_decimal, r, s, {gas: 4712388, gasPrice: 1})
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
