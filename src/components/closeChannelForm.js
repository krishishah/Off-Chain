import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class CloseChannelForm extends React.Component {

    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div>
                <h1>Close existing Payment Channel</h1>
                <input type="text" placeholder="Wei Transferred" ref="valueTransferred"/>
                <input type="text" placeholder="v" ref="v"/>
                <input type="text" placeholder="r" ref="r"/>
                <input type="text" placeholder="s" ref="s"/>
                <input type="submit" onClick={this.closeChannel.bind(this)}/>
            </div>
        );
    }

    closeChannel() {
        const valueTransferred = ReactDOM.findDOMNode(this.refs.valueTransferred).value
        const v = ReactDOM.findDOMNode(this.refs.v).value
        const r = ReactDOM.findDOMNode(this.refs.r).value
        const s = ReactDOM.findDOMNode(this.refs.s).value
        // Hit contract
        this.props.closeChannel(
            this.props.senderAddress, 
            this.props.recipientAddress, 
            Number(valueTransferred),
            Number(v),
            r,
            s
        )
    }
}