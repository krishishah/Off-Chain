import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class OpenChannelForm extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <h1>Open new Payment Channel</h1>
                <input type="text" placeholder="Sender Address" ref="senderAddress"/>
                <input type="text" placeholder="Recipient Address" ref="recipientAddress"/>
                <input type="text" placeholder="Deposit" ref="collateral"/>
                <input type="submit" onClick={this.openChannel.bind(this)}/>
            </div>
        );
    }

    openChannel() {
        var senderAddress = ReactDOM.findDOMNode(this.refs.senderAddress).value
        var recipientAddress = ReactDOM.findDOMNode(this.refs.recipientAddress).value
        var collateral = ReactDOM.findDOMNode(this.refs.collateral).value
        // Hit contract
        this.props.openChannel(senderAddress, recipientAddress, collateral)
    }
}