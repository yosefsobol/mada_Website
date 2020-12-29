import React, { Component } from "react";
import "./App.css";
import NotFound from './pags/NotFound.jsx';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Login from './pags/Login.jsx';
import Reister from './pags/Register.jsx';
import Logout from './pags/Logout.jsx';
import Home from './pags/Home';
import Manager from './pags/Manager';
import ShiftRequest from './pags/ShiftRequest';
import Authentication from './pags/Authentication';
import UserManagement from './pags/UserManagement';
import HandlingRequests from './pags/HandlingRequests';
import PasswordReset from './pags/PasswordReset';
import OldShifts from './pags/OldShifts';
import 'bootstrap/dist/css/bootstrap.min.css';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

class App extends Component {

  state = { user: null, manager: null, administrator:null }

  setUser = user => {
    if (user === null) { this.setState({ manager: user, user: user, administrator:user }) }
    else {
      if (user.userData.role === 'administrator') { this.setState({ manager: user, administrator:user}) }
      if (user.userData.role === 'manager') { this.setState({ manager: user}) }
     this.setState({ user: user }) }
  }
  
  componentDidMount() {
    let user = null
    let Token = sessionStorage.getItem('Token');
    let role = sessionStorage.getItem('role');
    let email = sessionStorage.getItem('email');
    let volunteerType = sessionStorage.getItem('volunteerType');
    let firstName = sessionStorage.getItem('firstName');
    let lastName = sessionStorage.getItem('lastName');
    let _id = sessionStorage.getItem('_id');
    let birthday = sessionStorage.getItem('birthday');
    if (Token !== null & role !== null ) {
      user = { Token: Token,userData:{ _id:_id, role: role, email:email, volunteerType:volunteerType, lastName:lastName, firstName:firstName, birthday:birthday} }
    }
    this.setUser(user)
  }

  render() {

    return (
      <div className="App"> <BrowserRouter>
                      <Navbar bg="light" expand="lg">
  <Navbar.Brand >משמרות מד"א</Navbar.Brand>
  <Navbar.Toggle aria-controls="basic-navbar-nav" />
  <Navbar.Collapse id="basic-navbar-nav">
    <Nav className="mr-auto">
    {this.state.user && <Nav.Link  href='/Home'>בית</Nav.Link>}
    {this.state.user && <Nav.Link href='/ShiftRequest'>בקשת משמרות</Nav.Link>}
    {this.state.manager &&  <Nav.Link href="/Manager">שיבוץ משמרות</Nav.Link>}
    {this.state.administrator &&  <Nav.Link href="/UserManagement">ניהול משתמשים</Nav.Link>}
    {this.state.administrator &&  <Nav.Link href="/HandlingRequests">טיפול בבקשות</Nav.Link>}
    {this.state.manager &&  <Nav.Link href="/OldShifts">היסטוריית שיבוצים</Nav.Link>}
    </Nav>
    <Nav className="mr-auto">
    {this.state.user &&<Nav.Link href="/Logout">התנתקות</Nav.Link>}
    </Nav>
  </Navbar.Collapse>
</Navbar>
        <Switch>
          <Route exact path='/Home' render={() => <Home  user={this.state.user} />} />
          <Route exact path='/ShiftRequest' render={() => <ShiftRequest user={this.state.user}/>} />
          <Route exact path='/Manager' render={() => <Manager user={this.state.manager} />} />
          <Route exact path='/UserManagement' render={() => <UserManagement user={this.state.administrator}/>} />
          <Route exact path='/HandlingRequests' render={() => <HandlingRequests  user={this.state.administrator} />} />
          <Route exact path='/' render={() => <Login setUser={this.setUser} />} />
          <Route exact path='/Register' render={() => <Reister setUser={this.setUser} User={this.state.user} />} />
          <Route exact path='/Logout' render={() => <Logout setUser={this.setUser} />} />
          <Route exact path='/Authentication/:email/:authentication' render={(props) => <Authentication {...props} />} />
          <Route exact path='/PasswordReset/:email/:authentication' render={(props) => <PasswordReset {...props} />} />
          <Route exact path='/OldShifts' render={() => <OldShifts user={this.state.manager}/>} />
          <Route component={NotFound} />
        </Switch>
      </BrowserRouter>
      </div>
    );
  }
}

export default App;