import React, { Component } from 'react';
import "./NotFound.css"
class NotFound extends Component {
    render() {
        return (
            <div className='NotFound'>
                <h2 style={{ color: 'red' }}>404. That’s an error.</h2>
            </div>
        );
    }
}

export default NotFound;