import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export default class SearchBox extends React.Component {
    render() {
        return (
            <div>
                <h1>Search for existing Payment Channel</h1>
                <input type="text" placeholder="Sender Address" ref="channelSearch"/>
                <input type="text" placeholder="Recipient Address"/>
                <input type="submit" onClick={this.searchForChannel}/>
            </div>
        );
    }

    searchForChannel() {
        var query = ReactDOM.findDOMNode(this.refs.channelSearch).value;
        // Hit contract
    }
}