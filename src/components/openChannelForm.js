import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class OpenChannelForm extends React.Component {
    render() {
        return (
            <div>
                <h1>Open new Payment Channel</h1>
                <input type="text" placeholder="Sender Address"/>
                <input type="text" placeholder="Recipient Address"/>
                <input type="submit" />
            </div>
        );
    }
}