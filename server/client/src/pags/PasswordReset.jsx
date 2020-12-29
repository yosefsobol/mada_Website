import React, { Component } from 'react';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import "./PasswordReset.css";

class PasswordReset extends Component {
    state = {
        authentication: null,
        failed: null,
        _id: '',
        validationPassword: "",
        passwordLengthError: false,
        password_has_error: false,
        passwordValue: '',
        password: "",
        redirectLogin: false
    }
    VerificationCheck = () => {
        const config = { headers: { Authorization: `Bearer ${this.props.match.params.authentication}` } }
        const url = `/verificationPlusUser/${this.props.match.params.email}`
        axios.get(url, config)
            .then(res => {
                if (res.status === 200) { this.setState({ _id: res.data._id, authentication: true }) }
            })
            .catch(err => {
                this.setState({ failed: true })
            })
    }
    change = () => {
        const _id = this.state._id;
        const url = `/updateUser/${_id}`;
        const _this = this;
        axios.put(url, { password: this.state.password })
            .then(function (res) {
                if (res.data.Status === '200') {
                    alert('הסיסמא שונתה בהצלחה')
                    _this.setState({ redirectLogin: true })
                }
                else { }
            })
            .catch();
    }
    componentDidMount() {
        this.VerificationCheck()
    }
    onChange = (name, e) => {
        this.setState({ [name]: e.target.value }, () => {
            if (name === "password" || name === "validationPassword") { this.checkPassword(); }
            if (name === "passwordValue") { this.checkLengthPassword(); }
        });
    };
    checkLengthPassword = () => {
        if (this.state.passwordValue.length >= 6) {
            this.setState({ passwordLengthError: false, password: this.state.passwordValue });
        } else {
            this.setState({ passwordLengthError: true, password: '' });
        }
    }
    checkPassword() {
        if (this.state.passwordValue !== this.state.validationPassword) {
            this.setState({ password_has_error: true });
        } else {
            this.setState({ password_has_error: false });
        }
    }

    render() {
        const disabled = !this.state.password || this.state.password !== this.state.validationPassword;
        if (this.state.redirectLogin) { return <Redirect to='/' /> }
        return (
            <div className='PasswordReset'>
                {this.state.authentication && <div>
                    <h3>איפוס סיסמא</h3>
                    <Form>
                        <Form.Row>
                            <Form.Group as={Col} controlId="formGridpassword">
                                <Form.Label>סיסמה חדשה</Form.Label>
                                <Form.Control
                                    value={this.state.passwordValue}
                                    autoComplete="off"
                                    onChange={(e) => this.onChange("passwordValue", e)}
                                    type="password"
                                    placeholder="סיסמה"
                                />
                                {this.state.passwordLengthError ? (
                                    <p style={{ color: "red" }}>אורך הסיסמא המינמלי הוא 6 תוים</p>
                                ) : (
                                        ""
                                    )}
                            </Form.Group>
                            <Form.Group as={Col} controlId="formGridvalidationPassword">
                                <Form.Label>אמת סיסמא חדשה</Form.Label>
                                <Form.Control
                                    autoComplete="off"
                                    value={this.state.validationPassword}
                                    onChange={(e) => this.onChange("validationPassword", e)}
                                    type="password"
                                    placeholder="אימות סיסמה"
                                />
                                {this.state.password_has_error ? (
                                    <p style={{ color: "red" }}>הסיסמא לא תואמת</p>
                                ) : (
                                        ""
                                    )}
                            </Form.Group>
                        </Form.Row>
                        <Form.Group>
                            <Button
                                disabled={disabled}
                                variant="primary"
                                onClick={this.change}
                                type="Button"
                            >    עדכן סיסמא חדשה
                </Button>
                        </Form.Group>
                    </Form>
                </div>}
                {this.state.failed && <div>
                    <h1>לצערנו תוקף הקישור פג</h1>
                </div>}
            </div>
        );
    }
}

export default PasswordReset;