import React, { Component } from 'react'
import PaymentChannel from '../build/contracts/UnidirectionalPaymentChannelManager.json'
import getWeb3 from './utils/getWeb3'
import ChannelInformationForm from './components/channelInformationForm'
import OpenChannelForm from './components/openChannelForm'
import SearchBox from './components/searchBox'
import ReactDOM from 'react-dom'

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
      paymentChannelInstance: null,
      senderAddress: null,
      recipientAddress: null,
      channelCollateral: null
    }
    
    this.web3Utils = require('web3-utils')

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
    // var senderAddress
    // var recipientAddress

    // Get accounts.
    this.state.web3.eth.getAccounts((error, accounts) => {
      paymentChannel.deployed().then((instance) => {

        const web3 = this.state.web3
        web3.eth.defaultAccount = this.state.web3.eth.accounts[0]

        this.setState(
          {
            paymentChannelInstance: instance,
            web3: web3
          }
        )

      //   // Open channel
      //   return this.openChannel(this.state.senderAddress, this.state.recipientAddress, 20)
      // }).then((txHash) => {
      //   // Wait for tx to be mined
      //   console.log('Transaction sent')
      //   console.log(txHash)
      //   this.setState({storageValue: 3})
      //   return this.waitForTxToBeMined(txHash)
      // }).then((result) => {
      //   // Validate Signature
      //   let {_, v, r, s} = this.signOffChainPayment(this.state.senderAddress, this.state.recipientAddress, 5)
      //   return this.validateSignature(this.state.senderAddress, this.state.recipientAddress, 5, v, r, s)
      // }).then((result) => {
      //   // Close channel
      //   if(result !== true) {
      //     throw Error("Invalid signature error")
      //   }
      //   let {_, v_decimal, r, s} = this.signOffChainPayment(this.state.senderAddress, this.state.recipientAddress, 5)
      //   return this.closeChannel(this.state.senderAddress, this.state.recipientAddress, 5, v_decimal, r, s)
      
      // }).then((txHash) => {
      //   // wait for tx to be mined
      //   console.log('Transaction sent')
      //   console.log(txHash)
      //   return this.waitForTxToBeMined(txHash)
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
        recipientAddress, 
        {from: senderAddress, gas: 4712388, value: collateral}
    ).then(txHash => {
      this.setState(
        {
          senderAddress: senderAddress, 
          recipientAddress: recipientAddress,
          channelCollateral: collateral
        }
      )
    })
  }

  signOffChainPayment(
    senderAddress, 
    recipientAddress, 
    valueToTransfer
  ) {
    /*
    * Sign a string and return (hash, v, r, s) used by ecrecover to regenerate the coinbase address;
    */

    const encodedMsg = this.web3Utils.soliditySha3(
      {
        type: 'address',
        value: senderAddress
      },
      {
        type: 'address',
        value: recipientAddress
      },
      {
        type: 'uint',
        value: valueToTransfer
      }
    ) 
    var sig = this.state.web3.eth.sign(senderAddress, encodedMsg).slice(2)
    var r = `0x${sig.slice(0, 64)}`
    var s = `0x${sig.slice(64, 128)}`
    var v = this.state.web3.toDecimal(sig.slice(128, 130)) + 27

    return {encodedMsg, v, r, s};
  }

  async validateSignature(
    senderAddress, 
    recipientAddress, 
    valueTransferred, 
    v, 
    r, 
    s
  ) {
    return this.state.paymentChannelInstance.verifySignature.call(
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

  async searchChannel(
    senderAddress, 
    recipientAddress, 
  ) {
    this.state.paymentChannelInstance.getChannelCollateral.call(
        senderAddress, 
        recipientAddress, 
        {gas: 4712388, gasPrice: 1}
    ).then(collateral => {
      this.setState(
        {senderAddress: senderAddress, 
         recipientAddress: recipientAddress,
         channelCollateral: collateral.toNumber(),
        }
      )
    })
  }

  render() {
    return (
      <div className="App">
        <nav className="navbar pure-menu pure-menu-horizontal">
            <a href="#" className="pure-menu-heading pure-menu-link">Off-Chain: Ethereum Payment Channel</a>
        </nav>

        <main className="container">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <OpenChannelForm openChannel={this.openChannel.bind(this)}/>
              <SearchBox searchChannel={this.searchChannel.bind(this)}/>
              <ChannelInformationForm
                senderAddress={this.state.senderAddress} 
                recipientAddress={this.state.recipientAddress} 
                channelCollateral={this.state.channelCollateral}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }
}

export default App
