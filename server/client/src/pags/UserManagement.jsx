import React, { Component } from "react";
import axios from "axios";
import "./UserManagement.css";
import Register from './Register.jsx';
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Col from "react-bootstrap/Col";
const status = { active: 'פעיל', blocked: 'חסום', awaitingApproval: 'ממתין לאישור' }
const role = {administrator:'מנהל ראשי',manager:'מנהל',volunteer:'מתנדב'}
class UserManagement extends Component {
  state = {
    displayForm: false,
    displayTable: true,
    users: null,
    numAdmin: '',
    allUsers:'',
    keyToSearch:'',
    textToSearch:'',
  };
  componentDidMount() {
    this.getUsers();
  }
  getUsers = () => {
    axios.get('/getAllUsers')
      .then(res => {
        if (res.data !== []) {
          const users = res.data.filter(i => i.status === 'active');
          const administrator = res.data.filter(i => i.status === 'active' & i.role === 'administrator');
          if (users.length > 0) { this.setState({allUsers:res.data, users: this.userToTable(users), numAdmin: administrator.length }) }
        }
      })
      .catch()
  }

  search = () =>{
    let filter = this.state.allUsers.filter(i => i[this.state.keyToSearch] === this.state.textToSearch );
    if (filter.length < 1){ this.setState({ users: null}); alert('אין תןצאות מתאימות לחיפוש') }
    else { this.setState({ users: this.userToTable(filter)}) } }
    managers = () =>{
      let filter = this.state.allUsers.filter(i => i.role === 'manager' || i.role === 'administrator' );
     this.setState({ users: this.userToTable(filter)}) }
     notActive = () =>{
      let filter = this.state.allUsers.filter(i => i.status !== 'active' );
      if (filter.length < 1){ this.setState({ users: null}); alert('אין תןצאות מתאימות') }
      else { this.setState({ users: this.userToTable(filter)}) } }
      active = () => {
        let filter = this.state.allUsers.filter(i => i.status === 'active' );
        this.setState({ users: this.userToTable(filter)})}

    optionVolunteer = () => {
    const options = ['נוער מע"ר', 'משתלם נוער', 'בוגר - חובש', 'משתלם חובשים', 'נהג אמבולנס', 'משתלם נהג אמבולנס']
    return options.map((option, index) => {
      return <option key={index} value={option}>{option}</option>
    })
  }

  renderTableUsers() {
    let header = ['עדכן', 'שם משפחה', 'שם פרטי', 'אימייל', 'פלאפון', 'תפקיד', 'סטאטוס']
    return header.map((h, index) => {
      return <th key={index}>{h}</th>
    })
  }
  userToTable = users => {
    return users.map((user, index) => {
          return (
        <tr key={index}>
          <td><button onMouseDown={() => {
            this.setState({ displayForm: user, displayTable: false });
          }}>הצג</button></td>
          <td>{user.lastName}</td>
          <td>{user.firstName}</td>
          <td>{user.email}</td>
          <td>{user.cellPhone}</td>
          <td>{role[user.role]}</td>
          <td>{status[user.status]}</td>
        </tr>
      )
    })
  }

  cancel = () => { this.setState({ displayForm: false, displayTable: true }); }
  onChange = (name, e) => {
    this.setState({ [name]: e.target.value }); };
  render() { const disabled = !this.state.textToSearch;
    return (
      <div className="UserManagement">
        <h3>ניהול משתמשים</h3>
        {this.state.displayTable && <div>
          {this.state.users && <table>
            <tbody>
              <tr>{this.renderTableUsers()}</tr>
              {this.state.users}
            </tbody>
          </table>}
          <Form>
          <Form.Row>
          <Button className='Buttons' onMouseDown={this.managers}>הצג רק מנהלים</Button>
          <Button className='Buttons' onMouseDown={this.notActive}>הצג לא פעילים</Button>
          <Button className='Buttons' onMouseDown={this.active}>הצג ללא סינון</Button>
          </Form.Row>
          <br></br>
          <Form.Row>
           <Form.Group as={Col} >
                <Form.Control
                  value={this.state.keyToSearch}
                  onChange={(e) => this.onChange("keyToSearch", e)}
                  as="select"
                >
                  <option value="" hidden>בחר סינון</option>
                  <option value="firstName" >שם פרטי</option>
                  <option value="lastName" >שם משפחה</option>
                  <option value="email" >אימייל</option>
                  <option value="cellPhone" >פלאפון</option>
                </Form.Control>
              </Form.Group>
            <Form.Group as={Col} >
              <Form.Control
                value={this.state.textToSearch}
                onChange={(e) => this.onChange("textToSearch", e)}
                placeholder="ערך תואם"
              />
            </Form.Group>
            <Button style={{maxHeight: '2.4rem'}} disabled={disabled} onMouseDown={this.search}>חפש</Button>
            </Form.Row>
            </Form>
        </div>}
        {this.state.displayForm &&
          <Register numAdmin={this.state.numAdmin} update={this.state.displayForm} cancel={this.cancel} getUsers={this.getUsers}></Register>
        }
      </div>
    );
  }
}

export default UserManagement;
