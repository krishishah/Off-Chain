import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class SearchBox extends React.Component {
    
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <h1>Search for existing Payment Channel</h1>
                <input type="text" placeholder="Sender Address" ref="senderAddress"/>
                <input type="text" placeholder="Recipient Address" ref="recipientAddress"/>
                <input type="submit" onClick={this.searchForChannel.bind(this)}/>
            </div>
        );
    }

    searchForChannel() {
        var senderAddress = ReactDOM.findDOMNode(this.refs.senderAddress).value;
        var recipientAddress = ReactDOM.findDOMNode(this.refs.recipientAddress).value;
        // Hit contract
        this.props.searchChannel(senderAddress, recipientAddress)
    }
}