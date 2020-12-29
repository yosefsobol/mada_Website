import React, { Component } from 'react';
import axios from 'axios';

class Authentication extends Component {
    state = { user: '' }
    VerificationCheck = () => {
        const config = { headers: { Authorization: `Bearer ${this.props.match.params.authentication}` } }
        axios
            .post("/users/insertUser", { email: this.props.match.params.email }
                , config
            )
            .then(res => {
                if (res.data.Status === '201' || res.data.Status === '404' || res.data.Status === '400') {
                    alert(res.data.Results)
                    window.close ()
                }
                else { alert('אירע שגיאה - אנא נסה שנית'); window.close () }
            }).catch();
    }
    componentDidMount() {
        this.VerificationCheck()
    }

    render() {
        return (
            <div>
                <h1>אימות מייל</h1>
            </div>
        );
    }
}

export default Authentication;