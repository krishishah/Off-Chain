import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class SignPaymentForm extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <h1>Sign Transaction</h1>
                <input type="text" placeholder="Wei to Transfer" ref="transferValue"/>
                <input type="submit" onClick={this.signOffChainPayment.bind(this)}/>
                <h3>v: {this.props.v}</h3>
                <h3>r: {this.props.r}</h3>
                <h3>s: {this.props.s}</h3>
            </div>
        );
    }

    signOffChainPayment() {
        const transferValue = ReactDOM.findDOMNode(this.refs.transferValue).value
        
        // Hit contract
        this.props.signOffChainPayment(
            this.props.senderAddress,
            this.props.recipientAddress,
            Number(transferValue)
        )
    }
}