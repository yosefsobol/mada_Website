import React, { Component } from "react";
import axios from "axios";
import "./Register.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
import { Redirect } from 'react-router-dom';
const _this = this;
class Register extends Component {
  state = {
    firstName: "",
    lastName: "",
    courseYear: "",
    volunteerType: "",
    birthday: "",
    birthdayValue: '',
    validationPassword: "",
    password: "",
    passwordValue: '',
    cellPhone: "",
    cellPhoneValue: '',
    email: "",
    emailValue: '',
    address: "",
    emailToSendAgian: "",
    iserror: false,
    birthday_has_error: false,
    password_has_error: false,
    email_has_error: false,
    passwordLengthError: false,
    cellPhone_has_error: false,
    authentication: "",
    role: '',
    status: '',
    redirectLogin: null
  };
  componentDidMount() {
    if (this.props.update) { this.person(this.props.update) }
    this.setState({ displayForm: true, displaySendAgian: false })
  }
  optionVolunteer = () => {
    const options = ['נוער מע"ר', 'משתלם נוער', 'בוגר - חובש', 'משתלם חובשים', 'נהג אמבולנס', 'משתלם נהג אמבולנס']
    return options.map((option, index) => {
      return <option key={index} value={option}>{option}</option>
    })
  }
  disabled1 = () => {
    const disabled = !this.state.role ||
      !this.state.firstName ||
      !this.state.lastName ||
      !this.state.courseYear ||
      !this.state.volunteerType ||
      !this.state.birthday ||
      !this.state.cellPhone ||
      !this.state.status ||
      !this.state.address;
    return disabled
  }
  person = (person) => {
    this.setState({
      birthdayValue: person.birthday,
      cellPhoneValue: person.cellPhone,
      firstName: person.firstName,
      lastName: person.lastName,
      cellPhone: person.cellPhone,
      address: person.address,
      birthday: person.birthday,
      courseYear: person.courseYear,
      volunteerType: person.volunteerType,
      status: person.status,
      role: person.role
    })
  }

  scendRegister = (_id) => {
    const url = `/updateUser/${_id}`;
    axios.put(url, { takeCare: false })
      .then(function (res) {
        if (res.data.Status === '200') {
          alert('בקשתך נשלחה למנהל');
          _this.setState({ redirectLogin: true });
        }
        else { alert('אירע שגיאה - אנא נסה שנית') }
      })
      .catch();
  }

  update = () => {
    if (this.props.update.role === 'administrator') {
      if (this.props.numAdmin < 2 & this.state.status === 'blocked') {
         return alert('אין אפשרות לחסום מנהל ראשי אם קיים רק אחד פעיל')
      }
    }
    const _id = this.props.update._id;
    const url = `/updateUser/${_id}`;
    const _this = this;
    axios.put(url,
      {
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        cellPhone: this.state.cellPhone,
        address: this.state.address,
        birthday: this.state.birthday,
        courseYear: this.state.courseYear,
        volunteerType: this.state.volunteerType,
        status: this.state.status,
        role: this.state.role
      })
      .then(function (res) {
        if (res.data.Status === '200') {
          alert('עודכן בהצלחה')
          _this.props.cancel()
          _this.props.getUsers()
        }
        else { alert('אירע שגיאה - אנא נסה שנית') }
      })
      .catch();
  }

  register = () => {
    this.setState({ iserror: false });
    axios
      .post("/register/insertUser",
        {
          email: this.state.email,
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          password: this.state.password,
          cellPhone: this.state.cellPhone,
          address: this.state.address,
          birthday: this.state.birthday,
          courseYear: this.state.courseYear,
          volunteerType: this.state.volunteerType,
          city: "לוד",
          status: "awaitingAuthentication",
          role: 'volunteer',
          takeCare: false
        }
      )
      .then((res) => {
        const Status = res.data.Status;
        if (Status === '201' || Status === '400' || Status === 400) {
          if (Status === '201') {
            this.setState({ emailToSendAgian: this.state.email, displayForm: false, displaySendAgian: true });
            this.clearFields();
            alert("לסיום הליך הרישום נדרש לאמת את כתובת המייל");
          }
          if (Status === '400') { this.scendRegister(res.data.Results) }
          if (Status === 400) { this.setState({ displayForm: false, displaySendAgian: true, emailToSendAgian: this.state.email }) }
        } else { alert('אירע שגיאה - אנא נסה שנית') }
      })
      .catch((err) => {
        this.setState({ iserror: true });
        console.log(err);
      });
  };

  sendAgian = () => {
    axios
      .post(
        "/register/sendEmailAuthentication",
        { email: this.state.emailToSendAgian }
      )
      .then(alert('מייל נשלח שוב'))
      .catch();
  };

  onChange = (name, e) => {
    this.setState({ [name]: e.target.value }, () => {
      if (name === "passwordValue" || name === "validationPassword") { this.checkPassword(); }
      if (name === "passwordValue") { this.checkLengthPassword(); }
      if (name === "emailValue") { this.checkEmail(); }
      if (name === "birthdayValue") { this.onchangeDate() }
    });
  };

  onchangeDate = () => {
    if (this.state.birthdayValue) {
      let max = new Date('2500/01/01')
      let value = new Date(this.state.birthdayValue)
      if (max > value) {
        this.setState({ birthday_has_error: false, birthday: this.state.birthdayValue });
      } else {
        this.setState({ birthday_has_error: true, birthday: '' });
      }
    }
  }
  checkLengthPassword = () => {
    if (this.state.passwordValue.length >= 6) {
      this.setState({ passwordLengthError: false, password: this.state.passwordValue });
    } else {
      this.setState({ passwordLengthError: true, password: '' });
    }
  }
  checkCall = (e) => {
    let value = e.target.value;
    if (value.toString().length === 10 || value.toString().length < 10) {
      this.setState({ cellPhoneValue: value })
      if (new RegExp(/^\(?([0-9]{10})$/).test(value)) {
        this.setState({ cellPhone_has_error: false, cellPhone: this.state.cellPhoneValue });
      } else {
        this.setState({ cellPhone_has_error: true, cellPhone: '' });
      }
    }
  }
  checkEmail = () => {
    if (new RegExp(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,15}/g).test(this.state.emailValue)) {
      this.setState({ email_has_error: false, email: this.state.emailValue });
    } else {
      this.setState({ email_has_error: true, email: '' });
    }
  }
  checkPassword() {
    if (this.state.passwordValue !== this.state.validationPassword) {
      this.setState({ password_has_error: true });
    } else {
      this.setState({ password_has_error: false });
    }
  }

  optionsCourseYear = () => {
    let startYear = new Date().getFullYear() - 40;
    let endYear = new Date().getFullYear();
    let araay = []
    for (let i = endYear; i > startYear; i--) { araay.push(i) }
    return araay.map((option, index) => {
      return <option key={index} value={option}>{option}</option>
    })
  }

  clearFields = () => {
    this.setState({
      email: "",
      firstName: "",
      lastName: "",
      courseYear: "",
      volunteerType: "",
      birthday: "",
      birthdayValue: "",
      cellPhoneValue: "",
      emailValue: "",
      password: "",
      validationPassword: "",
      cellPhone: "",
      address: "",
      role: "",
    });
  };

  disabled = () => {
    const disabled = !this.state.email ||
      !this.state.firstName ||
      !this.state.lastName ||
      !this.state.courseYear ||
      !this.state.volunteerType ||
      !this.state.birthday ||
      !this.state.password ||
      this.state.password !== this.state.validationPassword ||
      !this.state.cellPhone ||
      !this.state.address;
    return disabled
  }

  render() {
    if (this.state.redirectLogin) { return <Redirect to='/' /> }
    const disabled = this.disabled();
    const disabled1 = this.disabled1();
    return (
      <div className="Register">
        {!this.props.update &&<h3>רישום לאתר</h3>}
        {this.props.update &&<h3>עדכן פרטי משתמש</h3>}
        {this.state.displayForm && (
          <Form>
            <Form.Row>
              <Form.Group as={Col} controlId="formGridfirstName">
                <Form.Label>שם פרטי</Form.Label>
                <Form.Control
                  value={this.state.firstName}
                  onChange={(e) => this.onChange("firstName", e)}
                  type="text"
                  placeholder="שם פרטי"
                />
              </Form.Group>
              <Form.Group as={Col} controlId="formGridlastName">
                <Form.Label>שם משפחה</Form.Label>
                <Form.Control
                  value={this.state.lastName}
                  onChange={(e) => this.onChange("lastName", e)}
                  type="text"
                  placeholder="שם משפחה"
                />
              </Form.Group>
            </Form.Row>
            <Form.Group controlId="formGridAddress">
              <Form.Label>כתובת</Form.Label>
              <Form.Control
                value={this.state.address}
                onChange={(e) => this.onChange("address", e)}
                placeholder="כתובת מלאה"
              />
            </Form.Group>
            <Form.Row>
              {!this.props.update && <Form.Group as={Col} controlId="formGridEmail">
                <Form.Label>אימייל</Form.Label>
                <Form.Control
                  value={this.state.emailValue}
                  onChange={(e) => this.onChange("emailValue", e)}
                  type="email"
                  placeholder="הכנס אימייל"
                />
                {this.state.email_has_error ? (
                  <p style={{ color: "red" }}>האיימייל לא תקין</p>
                ) : (
                    ""
                  )}
              </Form.Group>}
              {this.props.update && <Form.Group as={Col} controlId="formGridvolunteer">
                <Form.Label>תפקיד</Form.Label>
                <Form.Control
                  value={this.state.role}
                  onChange={(e) => this.onChange("role", e)}
                  as="select"
                >
                  <option value="" hidden>בחר</option>
                  <option value="volunteer" >מתנדב</option>
                  <option value="manager" >מנהל</option>
                  <option value="administrator" >מנהל ראשי</option>
                </Form.Control>
              </Form.Group>}
              <Form.Group as={Col} controlId="formGridcellPhone">
                <Form.Label>פלאפון</Form.Label>
                <Form.Control
                  value={this.state.cellPhoneValue}
                  onChange={(e) => this.checkCall(e)}
                  type="number"
                  placeholder="טלפון"
                />
                {this.state.cellPhone_has_error ? (
                  <p style={{ color: "red" }}>מספר הפלאפון לא תקין</p>
                ) : (
                    ""
                  )}
              </Form.Group>
              {this.props.update && <Form.Group as={Col} controlId="formGridvolunteer">
                <Form.Label>סטאטוס</Form.Label>
                <Form.Control
                  value={this.state.status}
                  onChange={(e) => this.onChange("status", e)}
                  as="select"
                >
                  <option value="" hidden>בחר</option>
                  <option value="active" >פעיל</option>
                  <option value="awaitingApproval" >ממתין לאישור</option>
                  <option value="blocked" >חסום</option>
                </Form.Control>
              </Form.Group>}
            </Form.Row>
            {!this.props.update && <Form.Row>
              <Form.Group as={Col} controlId="formGridpassword">
                <Form.Label>סיסמה</Form.Label>
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
                <Form.Label>אימות סיסמה</Form.Label>
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
            </Form.Row>}
            <Form.Row>
              <Form.Group as={Col} controlId="formGridage">
                <Form.Label>תאריך לידה</Form.Label>
                <Form.Control
                  value={this.state.birthdayValue}
                  onChange={(date) => { this.onChange("birthdayValue", date) }}
                  type="date"
                  formt='dd/mm/yyyy'
                  placeholder="תאריך לידה"
                />
                {this.state.birthday_has_error ? (
                  <p style={{ color: "red" }}>התאריך לא תקין</p>
                ) : (
                    ""
                  )}
              </Form.Group>
              <Form.Group as={Col} controlId="formGridvolunteer">
                <Form.Label>סוג מתנדב</Form.Label>
                <Form.Control
                  value={this.state.volunteerType}
                  onChange={(e) => this.onChange("volunteerType", e)}
                  as="select"
                >
                  <option value="" hidden>בחר</option>
                  {this.optionVolunteer()}
                </Form.Control>
              </Form.Group>
              <Form.Group as={Col} controlId="formGridcourseYear">
                <Form.Label>שנת ביצוע קורס</Form.Label>
                <Form.Control
                  value={this.state.courseYear}
                  onChange={(e) => this.onChange("courseYear", e)}
                  as="select"
                >
                  <option value="" hidden>בחר</option>
                  {this.optionsCourseYear()}
                </Form.Control>
              </Form.Group>
            </Form.Row>
            {this.state.iserror ? (
              <p style={{ color: "red" }}>הרישום נכשל</p>
            ) : (
                ""
              )}
            <Form.Row>
              {this.props.update && <Form.Group as={Col}>
                <Button
                  variant="primary"
                  disabled={disabled1}
                  onClick={this.update}
                  type="Button"
                >
                  עדכן שינויים
            </Button>
              </Form.Group>
              }
              {this.props.update && <Form.Group>
                <Button
                  variant="primary"
                  onClick={() => { this.props.cancel() }}
                  type="Button"
                >   ביטול
                </Button>
              </Form.Group>}
              {!this.props.update && <Form.Group as={Col}>
                <Button
                  variant="primary"
                  disabled={disabled}
                  onClick={this.register}
                  type="Button"
                >
                  שלח בקשה
            </Button>
              </Form.Group>}
              {!this.props.update && <Form.Group>
              <span onMouseDown={() => { this.setState({ redirectLogin: true }) }} style={{cursor: 'pointer'}}><u>עבור לכניסת משתמש</u></span>
                
                {/* <Button
                  variant="primary"
                  onClick={() => { this.setState({ redirectLogin: true }) }}
                  type="Button"
                >   כניסת משתמש
                </Button> */}
              </Form.Group>}
            </Form.Row>
          </Form>
        )}
        {this.state.displaySendAgian && (
          <div>
            <h4>נשלח לך מייל בכדי לאמת את כתובת הדואר שלך</h4>
            <h4>לא קיבלת מייל? לחץ לשליחה חוזרת</h4>
            <button onClick={() => { this.sendAgian(); }}>שלח שוב</button>
            <br></br>
            <Button
              variant="primary"
              onClick={() => { this.setState({ redirectLogin: true }) }}
              type="Button"
            >   כניסת משתמש
                </Button>
          </div>
        )}
      </div>
    );
  }
}

export default Register;