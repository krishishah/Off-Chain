import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class ChannelInformationForm extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            senderAddress: null,
            recipientAddress: null,
            deposit: null
        }
    }

    render() {
        return (
            <div className="ChannelInformation">
                <h1>Channel Information</h1>
                <h2>Sender Address: {this.state.senderAddress}</h2>
                <h2>Recipient Address: {this.state.recipientAddress}</h2>
                <h2>Channel Deposit (in Wei): {this.state.deposit}</h2>
            </div>
        );
    }
}