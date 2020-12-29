import React, { Component, Fragment } from 'react';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
import "./Login.css";
import Form from 'react-bootstrap/Form';

class Login extends Component {

    state = { email: '', password: '',RedirectRegister:false, RedirectHome: false, iserror: false, forgot:null, sendAgain:null, form:true }

    componentDidMount() { document.body.addEventListener('keypress', this.UseLoginEnter); }
    componentWillUnmount() { document.body.removeEventListener('keypress', this.UseLoginEnter); }
    UseLoginEnter = e => {
        if (this.state.email !== '' & this.state.password !== '') {
            if (e.keyCode === 13) {
                this.login()
            }
        }
    }
    login = () => {
        axios
            .post("/users/login", {
                email: this.state.email,
                password: this.state.password
            })
            .then(res => {
                if (res.status === 200) {
                    this.props.setUser(res.data);
                    sessionStorage.setItem('Token', res.data.Token);
                    sessionStorage.setItem('role', res.data.userData.role);
                    sessionStorage.setItem('email', res.data.userData.email);
                    sessionStorage.setItem('volunteerType', res.data.userData.volunteerType);
                    sessionStorage.setItem('lastName', res.data.userData.lastName);
                    sessionStorage.setItem('firstName', res.data.userData.firstName);
                    sessionStorage.setItem('_id', res.data.userData._id);
                    sessionStorage.setItem('birthday', res.data.userData.birthday);
                    this.setState({ RedirectHome: true })
                }
                else {  
                    this.setState({ iserror: true })
                }
            }).catch(() => {
                this.setState({ iserror: true })
            })
    }
    sendEmail = () => {
        axios
        .post("/users/sendEmailResetPassword", {email: this.state.email})
        .then()
        .catch()
    }
    forgotPassword = () =>{this.setState({forgot:true, sendAgain:null, form:null})}
    loginPage = () =>{this.setState({forgot:null, sendAgain:null, form:true, password:'', email:''})}
    send = () =>{this.sendEmail(); this.setState({forgot:true, sendAgain:true, form:null})}
    sendAgain = () =>{this.sendEmail();}
    loginRegister = () =>{this.setState({RedirectRegister:true})}
    render() {
        const disabled = !this.state.email || !this.state.password;
        const disabled1 = !this.state.email;
        if (this.state.RedirectHome) { return <Redirect to='./Home' /> }
        if (this.state.RedirectRegister) { return <Redirect to='./Register' /> }
        return (
            <div className='Login'>
               {this.state.form && <Fragment> 
                    <h3>כניסה</h3>
                <span>ברוכים הבאים</span>
                <Form className='from'>
                    <Form.Group controlId="formGroupEmail">
                        <Form.Label>כתובת מייל</Form.Label>
                        <Form.Control autoComplete="off" required onChange={e => this.setState({ email: e.target.value })} type="text" placeholder="הכנס איימיל" />
                    </Form.Group>
                    <Form.Group controlId="formGroupPassword">
                        <Form.Label>סיסמה</Form.Label>
                        <Form.Control onChange={e => this.setState({ password: e.target.value })} required autoComplete="off" type="password" placeholder="סיסמה" />
                         <p>שכחת סיסמא? <span style={{cursor: 'pointer',color:'blue'}} onMouseDown={() => { this.forgotPassword() }}><u>הפק סיסמא חדשה</u></span></p>
                    </Form.Group>
                    {this.state.iserror ? <p style={{ color: 'red' }}>שגיאה באחד הנתונים</p> : ''}
                    <button type="button" disabled={disabled} onMouseDown={() => { this.login() }}>כניסה</button>
               </Form> 
                <div className='loginRegister'>
                    <p>משתמש חדש? <span onMouseDown={() => { this.loginRegister() }} style={{cursor: 'pointer', color:'blue'}}><u>הירשם כאן</u></span></p>
                </div>
                </Fragment>}
                {this.state.forgot && <Fragment>
                <Form className='from'>
                   {!this.state.sendAgain &&  <Fragment>
                   <Form.Group controlId="formGroupEmail">
                        <Form.Label>כתובת מייל</Form.Label>
                        <Form.Control autoComplete="off" required value={this.state.email} onChange={e => this.setState({ email: e.target.value })} type="text" placeholder="הכנס איימיל" />
                    </Form.Group>
                    <button type="button" disabled={disabled1} onMouseDown={() => { this.send() }}>שלח מייל</button> </Fragment>}
    {this.state.sendAgain && <Fragment>
           <h2>המייל נשלח</h2>
         <button type="button"  onMouseDown={() => { this.sendAgain() }}>שלח שוב</button>
      <button type="button"  onMouseDown={() => { this.forgotPassword() }}>שנה את הכתובת אימייל</button>
    </Fragment>}
      <button type="button"  onMouseDown={() => { this.loginPage() }}>חזרה כניסת משתמש</button>
               </Form> 
            </Fragment>}
            </div>
        );
    }
}

export default Login;