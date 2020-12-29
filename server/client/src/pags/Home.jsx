import React, { Component } from "react";
import "./Home.css";
import Form from "react-bootstrap/Form";
import axios from "axios";

let noar = `נוער מע"ר`,
  mishtalemN = `משתלם נוער`,
  boger = `בוגר - חובש`,
  chovshim = `משתלם חובשים`,
  nahag = `נהג אמבולנס`,
  nahagM = `משתלם נהג אמבולנס`;
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { numHors: undefined, value: "", volunteer: "" };

    this.handleChange = this.handleChange.bind(this);
  }
  handleChange(varName, e) {
    this.setState({ [varName]: e.target.value });
  }

  componentDidMount() {
    axios.get(`/users/updates`).then((res) => {
      const updates = res.data.reverse();
      this.setState({ updates });
    });
    let email = sessionStorage.getItem("email");
    axios.get(`/getUserData/${email}`).then((res) => {
      this.setState({
        userDataFromDb: res.data,
        newAddress: res.data.address,
        newCellPhone: res.data.cellPhone,
      });
    });

    this.birthday();
    const url = `/getVolunteerHours/${email}`
    axios.get(url)
      .then(res => {
        if (res.data !== '') { this.getNumHors(res.data, email); }
      })
      .catch()
  }

  getNumHors = (araay, email) => {
    let numHors = 0;
    araay.forEach(obj => {
      let existing = obj.weeklyHors.find(i => i.email === email);
      numHors = numHors + existing.h;
    });
    this.setState({ numHors: numHors })
  }
  sendChanges = () => {
    console.log("ddddd");
    axios.post("/user/updateHisData", {
      email: this.state.userDataFromDb.email,
      address: this.state.newAddress,
      cellPhone: this.state.newCellPhone
    }).then(function (response) {
      console.log(response);
    });
  };
  onChange = (name, e) => {
    this.setState({ [name]: e.target.value });
  };

  sendRequest = () => {
    if (
      this.state.volunteer !== this.state.userDataFromDb.volunteerType &&
      this.state.volunteer !== ""
    ) {
      axios
        .post("/changesRequest", {
          volunteerType: this.state.volunteer,
          volunteerEmail: this.state.userDataFromDb.email,
          volunteerFirstName: this.props.user.userData.firstName,
          volunteerLastName: this.props.user.userData.lastName,
        })
        .then(function (response) {
          console.log(response);
        });
      alert("תודה \nבקשתך נשלחה \nהמתן לתגובת המנהל");
      this.setState({ volunteer: "" });
    } else if (
      this.state.volunteer === this.state.userDataFromDb.volunteerType
    ) {
      alert(`אתה כבר רשום בתור ${this.state.volunteer}`);
    }
  };

  birthday = () => {
    let birthday = sessionStorage.getItem("birthday");
    let date = new Date(birthday);
    if (birthday !== null) { this.setState({ age: this.GetAge(date) }) }
  }

  GetAge = date => {
    if (date === null || date.toString() === 'Invalid Date') { return 'עליך לעדכן תאריך לידה נכון' }
    else {
      const birth = new Date(date);
      const dd = checkTime(birth.getDate());
      const mm = checkTime(birth.getMonth() + 1)
      const yyyy = birth.getFullYear();
      function checkTime(i) { if (i < 10) { i = "0" + i; } return i; }
      function calculate_age(birth_day, birth_month, birth_year) {
        const today_date = new Date();
        const today_year = today_date.getFullYear();
        const today_month = today_date.getMonth();
        const today_day = today_date.getDate();
        let age = today_year - birth_year;
        if (today_month < birth_month - 1) {
          age--;
        }
        if (birth_month - 1 === today_month && today_day < birth_day) {
          age--;
        }
        if (age < 0) { }
        else {
          return age;
        }
      }
      const numAge = calculate_age(dd, mm, yyyy)
      return numAge
    }
  }
  render() {
    return (
      <div className='Home'>
        <h1>מד"א אזורי </h1>
        <h2>עדכונים ולו"ז</h2>
        <div className="updatesFrame">
          <h4>עדכונים</h4>
          <ul>
            {this.state.updates
              ? this.state.updates.map((it, i) => (
                <li key={i}>
                  <div>{it.content}</div>
                </li>
              ))
              : ""}
          </ul>
        </div>
        <button style={{ marginTop: "25px" }}>המשמרות של השבוע</button>
        <br />

        <div className="flex-grid-thirds">
          <div className="col">
            פרטי המתנדב
            <div className="userDetails">
              שם:
              <span>
                {this.state.userDataFromDb &&
                  this.state.userDataFromDb.firstName}
              </span>
            </div>
            <div className="userDetails">
              משפחה:
              <span>
                {this.state.userDataFromDb &&
                  this.state.userDataFromDb.lastName}
              </span>
            </div>
            <div className="userDetails">
              מספר שעות: { }
              <span>
                {this.state.numHors}
              </span>
            </div>
            <div className="userDetails">
              גיל:
              <span>
                {this.state.age}
              </span>
            </div>
          </div>
          <div className="col">
            עדכון סוג מתנדב:
            <div>
              הנך כעת:
              <span>
                {this.state.userDataFromDb &&
                  this.state.userDataFromDb.volunteerType}
              </span>
            </div>
            <div>
              שנה לסטטוס של:
              <span>
                <Form.Control
                  value={this.state.volunteer}
                  onChange={(e) => this.onChange("volunteer", e)}
                  as="select"
                >
                  <option value="" hidden>
                    בחר
                  </option>
                  <option value={noar}>{noar}</option>
                  <option value={mishtalemN}>{mishtalemN}</option>
                  <option value={boger}>{boger}</option>
                  <option value={chovshim}>{chovshim}</option>
                  <option value={nahag}>{nahag}</option>
                  <option value={nahagM}>{nahagM}</option>
                </Form.Control>
              </span>
            </div>
            <button onClick={this.sendRequest}>שלח בקשה לשינוי</button>
          </div>
          <div className="col" style={{ textAlign: "right" }}>
            <h3 style={{ textAlign: "center" }}>עדכון פרטים אישיים:</h3>

            <div>
              כתובת:
              <input
                value={
                  (this.state.userDataFromDb && this.state.newAddress) || ""
                }
                onChange={(e) => this.handleChange("newAddress", e)}
                style={{ width: "50%", left: "7px", position: "absolute" }}
              ></input>
            </div>
            <div style={{ marginTop: "11px" }}>
              טלפון:
              <input
                value={
                  (this.state.userDataFromDb && this.state.newCellPhone) || ""
                }
                onChange={(e) => this.handleChange("newCellPhone", e)}
                type="tel"
                style={{ width: "50%", left: "7px", position: "absolute" }}
              ></input>
            </div>
            <div style={{ marginTop: "11px" }}>
              <button
                disabled={
                  this.state.userDataFromDb
                    ? this.state.userDataFromDb.cellPhone ===
                    this.state.newCellPhone &&
                    this.state.userDataFromDb.address ===
                    this.state.newAddress
                    : true
                }
                style={{ width: "100%" }}
                onClick={this.sendChanges}
              >
                שלח
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
