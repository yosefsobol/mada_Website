import React, { Component } from "react";
import axios from "axios";
import "./HandlingRequests.css";

const status = { active: 'פעיל', blocked: 'חסום', awaitingApproval: 'ממתין לאישור' }
const role = { administrator: 'מנהל ראשי', manager: 'מנהל', volunteer: 'מתנדב' }
class HandlingRequests extends Component {
  state = {
    volunteerType: "",
    emailToSendAgian: "",
    displayForm: false,
    displayTable: true,
    awaitingApproval: null,
    requestChanges: null,
    user_id: '',
    request: '',
    numAdministrator: '',
    manager: false,
    explanatory: '',
    person: '',
    requestType: null,
    key: '',
    val: '',
    action: null
  };
  componentDidMount() {
    this.getUsers();
  }
  getUsers = () => {
    axios.get('/getAllUsers')
      .then(res => {
        axios.get('/getAllRequestChanges')
          .then(respons => {
            if (res.data !== []) {
              const awaitingApproval = res.data.filter(i => i.takeCare === false);
              if (awaitingApproval.length > 0) { this.setState({ awaitingApproval: this.approvalToTable(awaitingApproval) }) }
               else{this.setState({ awaitingApproval:null})}
              if (respons.data !== []) {
                const requestChanges = respons.data
                if (requestChanges.length > 0) { this.setState({ requestChanges: this.requestChangesToTable(requestChanges, res.data) }) }
               else{this.setState({requestChanges:null})}
              }
            }
          })
          .catch()
      })
      .catch()
  }

  renderTableApproval() {
    let header = ['שם משפחה', 'שם פרטי', 'אימייל', 'פלאפון', 'סטאטוס גישה', 'פעולות']
    return header.map((h, index) => {
      return <th key={index}>{h}</th>
    })
  }
  requestChangesTable() {
    let header = ['שם משפחה', 'שם פרטי', 'אימייל', 'פלאפון', 'סוג מתנדב נוכחי', 'בקשת עדכון מתנדב', 'תפקיד', 'סטאטוס גישה', 'פעולות']
    return header.map((h, index) => {
      return <th key={index}>{h}</th>
    })
  }
  requestChangesToTable = (requestChanges, users) => {
    return requestChanges.map((request, index) => {
      const person = users.find(i => i.email === request.email)
      return (
        <tr key={index}>
          <td>{person.lastName}</td>
          <td>{person.firstName}</td>
          <td>{person.email}</td>
          <td>{person.cellPhone}</td>
          <td>{person.volunteerType}</td>
          <td>{request.volunteerType}</td>
          <td>{role[person.role]}</td>
          <td>{status[person.status]}</td>
          <td><button onMouseDown={() => { this.setState({ person: person, key: 'volunteerType', val: request.volunteerType, requestType: true, request: request, action: true }) }}>טפל</button></td>
        </tr>
      )
    })
  }
  subject = () => { if (this.state.key === 'status') { return 'בקשת גישה לאתר משמרות מד"א' } else { return 'בקשה לעדכון סוג מתנדב' } }
  deleteButton = () => { if (this.state.key === 'status') { return true } else { return null } }

  approvalToTable = persons => {
    return persons.map((person, index) => {
      return (
        <tr key={index}>
          <td>{person.lastName}</td>
          <td>{person.firstName}</td>
          <td>{person.email}</td>
          <td>{person.cellPhone}</td>
          <td>{status[person.status]}</td>
          <td><button onMouseDown={() => { this.setState({ person: person, key: 'status', val: 'active', action: true }) }}>טפל</button></td>
        </tr>
      )
    })
  }

  clear = () => {
    this.setState({ person: '', key: '', val: '', requestType: null, request: '', explanatory: '' })
  }
  sendEmailFree = (subjectType) => {
    let subject = "", text = '';
    if (subjectType === 'update') { text = 'בקשתך אושרה' } else { text = 'לצערנו בקשתך לא אושרה' }
    if (this.state.key === 'status' || this.state.key === 'takeCare') { subject = 'בקשת גישה לאתר משמרות מד"א' } else { subject = 'בקשה לעדכון סוג מתנדב' }
    const html = `<h2> ${text} </h2> <p> ${this.state.explanatory} </p> `;
    axios
      .post(
        "/sendEmailFree",
        { email: this.state.person.email, subject: subject, html: html }
      )
      .then( this.clear() )
      .catch(); }
      
  update = (key,val) => {
    const url = `/updateUser/${this.state.person._id}`;
    const _this = this;
    let scope = 'שינוי סוג מתנדב';
    if (key !== 'volunteerType'){scope = 'גישה לאתר מד"א'}
    let obj = {[key]: val};
    if (this.state.key === 'status' ){obj = {[key]: val, 'takeCare': true }}
    axios.put(url, obj)
      .then(function (res) {
        if (res.data.Status === '200') {
          if (_this.state.requestType) { _this.deleteChangesRequest(null) }
          alert('עודכן בהצלחה')
          if (key === 'takeCare'){_this.sendEmailFree('reject'); _this.createLogs(scope,'הבקשה נדחתה');}
          else{_this.sendEmailFree('update');  _this.createLogs(scope,'הבקשה אושרה');} 
          _this.getUsers();
          _this.setState({action:null})
        }
      })
      .catch();
  }

  deleteChangesRequest = (sendEmail) => {
    const url = `/deleteChangesRequest/${this.state.request._id}`;
    const _this = this;
    axios.delete(url)
      .then(function (res) {
        if (res.status === 200) {
          if (sendEmail) { _this.sendEmailFree('reject');  _this.createLogs('שינוי סוג מתנדב','הבקשה נדחתה'); }
          _this.getUsers();
          _this.setState({action:null});
        }
      })
      .catch();
  }
  createLogs = (scope,action) => {
    const user = this.props.user.userData;
    axios
      .post("/createLogs",
        {
          email: this.state.request.email,
          firstName: this.state.request.firstName,
          lastName: this.state.request.lastName,
          scope:scope,
          action:action,
          time:new Date(),
          managerEffector: user.firstName + ' ' + user.lastName
        }
      )
      .then()
      .catch();
  };

  onChange = (name, e) => {
    this.setState({ [name]: e.target.value });
  }

  render() {
    return (
      <div className="HandlingRequests">
        <h3>טיפול בבקשות</h3>
        {this.state.displayTable && <div>
          {this.state.awaitingApproval && <table>
            <tbody>
              <tr>{this.renderTableApproval()}</tr>
              {this.state.awaitingApproval}
            </tbody>
          </table>}

          {this.state.requestChanges && <table>
            <tbody>
              <tr>{this.requestChangesTable()}</tr>
              {this.state.requestChanges}
            </tbody>
          </table>}

          {this.state.action &&
              <div className='backgroundPop'>
            <div className='Pop'>
              <h3>{this.subject()}</h3>
              <h5>{this.state.person.firstName + ' ' + this.state.person.lastName}</h5>
              <p>הערת מנהל לשליחה במייל:</p><textarea onChange={(e) => { this.setState({ explanatory: e.target.value }) }}></textarea>
              <br></br>
              <button onMouseDown={() => { this.update(this.state.key, this.state.val) }}>אשר</button>
              <button className='buttonPop' onMouseDown={() => { this.setState({ action: null }) }}>טפל מאוחר יותר</button>
              {!this.deleteButton() && <button onMouseDown={() => { this.deleteChangesRequest(true) }}>דחה</button>}
              {this.deleteButton() && <button onMouseDown={() => { this.update('takeCare' , true) }}>דחה</button>}
            </div> </div>
          }

        </div>}


      </div>
    );
  }
}

export default HandlingRequests;
