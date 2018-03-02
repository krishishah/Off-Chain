import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class ChannelInformationForm extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="ChannelInformation">
                <h1>Channel Information</h1>
                <h3>Sender Address: {this.props.senderAddress}</h3>
                <h3>Recipient Address: {this.props.recipientAddress}</h3>
                <h3>Channel Deposit (in Wei): {this.props.channelCollateral}</h3>
            </div>
        );
    }
}