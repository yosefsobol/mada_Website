import React, { Component, Fragment } from 'react';
import './Manager.css';
import axios from 'axios';
import html2canvas from 'html2canvas';
import Form from "react-bootstrap/Form";
import { Redirect } from 'react-router-dom';

const dayOfWeekH = { Son: 'ראשון', Mon: 'שני', Tue: 'שלישי', Wed: 'רביעי', Thu: 'חמישי', Fri: 'שישי', Sat: 'שבת' }
const allShiftH = { Morning: 'בוקר', Noon: 'צהריים', Evening: 'ערב', Night: 'לילה' }
class Manager extends Component {
  state = {redirectHome:null, send:false, emailList: null, emailEmbeddedOnly: false, emailToAll: false, listText: null, messageList: [], headerText: '', messageText: '', shiftsTable: null, optionMansvolunteers: null, requestShiftsTable: null, listItems: null, editingTable: null, registeredPeople: [], allVolunteers: '', listTeam: [], updatebutton: false, obj: null, create: true, update: false, day: '', shift: '', TeamName: '', requestVolunteers: null, RequestTable: null, add: false, pop: false, weeklyDays: null }
  componentDidMount() {
    let basicTableEditing = {
      Son: { Morning: {}, Noon: {}, Evening: {}, Night: {} },
      Mon: { Morning: {}, Noon: {}, Evening: {}, Night: {} },
      Tue: { Morning: {}, Noon: {}, Evening: {}, Night: {} },
      Wed: { Morning: {}, Noon: {}, Evening: {}, Night: {} },
      Thu: { Morning: {}, Noon: {}, Evening: {}, Night: {} },
      Fri: { Morning: {}, Noon: {}, Evening: {}, Night: {} },
      Sat: { Morning: {}, Noon: {}, Evening: {}, Night: {} }
    }
    this.setState({ weeklyDays: basicTableEditing, renderTableHeaderdays: this.renderTableHeaderdays() })
    axios.get('/getAllShiftAssignmentRequests')
      .then(res => {
        if (res.data !== []) {
          this.setState({ requestVolunteers: res.data })
        }
      })
      .catch()
    axios.get('/getAllUsers')
      .then(Res => {
        if (Res.data !== []) {
          this.setState({ allVolunteers: Res.data })
          const url = `/getTemporaryShifts`
          axios.get(url)
            .then(res => {
              if (res.data !== '') {
                this.setState({ shiftsTable: res.data, requestShiftsTable: this.requestShiftsTable(), editingTable: this.editingTable(res.data.weeklyDays), weeklyDays: res.data.weeklyDays, create: false, updatebutton: true })
              }
              else {
                this.setState({ requestShiftsTable: this.requestShiftsTable(), editingTable: this.editingTable(basicTableEditing) })
              }
            })
            .catch()
        }
      })
      .catch()

    this.setState({ renderTableHeader: this.renderTableHeader(new Date(this.getNextDayOfTheWeek("sun", false))) })

    let RequestTable = {
      Son: { Morning: [], Noon: [], Evening: [], Night: [] },
      Mon: { Morning: [], Noon: [], Evening: [], Night: [] },
      Tue: { Morning: [], Noon: [], Evening: [], Night: [] },
      Wed: { Morning: [], Noon: [], Evening: [], Night: [] },
      Thu: { Morning: [], Noon: [], Evening: [], Night: [] },
      Fri: { Morning: [], Noon: [], Evening: [], Night: [] },
      Sat: { Morning: [], Noon: [], Evening: [], Night: [] }
    }
    this.setState({ RequestTable: RequestTable })
  }
  getNextDayOfTheWeek = (dayName, excludeToday = true, refDate = new Date()) => {
    const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
      .indexOf(dayName.slice(0, 3).toLowerCase());
    if (dayOfWeek < 0) return;
    refDate.setHours(0, 0, 0, 0);
    refDate.setDate(refDate.getDate() + +!!excludeToday +
      (dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7);
    return refDate
  }
  getOneTeam = (shift, oneTeam) => {
    return shift[oneTeam].map((teamMember, index) => {
      const allVolunteers = this.state.allVolunteers;
      let getName = allVolunteers.find(i => i.email === teamMember)
      return (<div key={index}>{getName.firstName + '-' + getName.lastName}</div>)
    })
  }
  funHoursList = () => {
    let hoursList = []
    const weeklyDays = this.state.weeklyDays;
    function hours() {
      const allShift = ['Morning', 'Noon', 'Evening', 'Night'];
      const days = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      days.forEach((day) => {
        allShift.forEach((shift) => {
          const numTeams = Object.keys(weeklyDays[day][shift])
          if (numTeams.length > 0) {
            numTeams.forEach(() => {
              weeklyDays[day][shift][numTeams].forEach((teamMember) => {
                let existing = hoursList.find(i => i.email === teamMember), numHours = 8;
                if (shift === 'Evening') { numHours = 6 }
                if (existing === undefined) { hoursList.push({ email: teamMember, h: numHours }) }
                else { existing.h = existing.h + numHours }
              })
            })
          }
        })
      })
    }
    hours()
    return hoursList
  }
  getAllTheTeams = (shiftArray, day, shift) => {
    const numTeams = Object.keys(shiftArray)
    if (numTeams.length > 0) {
      return numTeams.map((teamName, index) => {
        return (
          <div style={{ border: 'tomato solid 2px', padding: '0.2rem' }} key={index}> {<b>{teamName}:</b>}  {this.getOneTeam(shiftArray, numTeams[index])}<button onClick={() => { this.UpdateTeamButton(day, shift, teamName) }}>עדכון</button><button onClick={() => { this.deleteTeam(day, shift, teamName) }}>מחק</button> </div>
        )
      })
    } else { return '' }
  }
  deleteTeam = (day, shift, teamName) => {
    const weeklyDays = this.state.weeklyDays;
    delete weeklyDays[day][shift][teamName];
    this.setState({ editingTable: this.editingTable(weeklyDays), weeklyDays: weeklyDays })
  }
  createTableFromAllRequests = () => {
    const requestVolunteers = this.state.requestVolunteers;
    if (requestVolunteers) {
      return requestVolunteers.map(OnePeople => {
        const email = OnePeople.email
        const obj = OnePeople;
        const days = obj.days;
        const allShift = ['Morning', 'Noon', 'Evening', 'Night']
        return Object.keys(days).map((day) => {
          return allShift.map((shift) => {
            return (
              this.checkBooleanValue(days[day][shift], day, shift, email)
            )
          })
        })
      })
    }
  }
  requestShiftsTable = () => {
    this.createTableFromAllRequests()
    const RequestTable = this.state.RequestTable;
    let allShift = ['Morning', 'Noon', 'Evening', 'Night']
    if (RequestTable) {
      return allShift.map((shift, index) => {
        return (
          <tr key={index}>
            <td key={index + 1}>{shift}</td>
            {this.TableTd1(shift)}
          </tr>
        )
      })
    }
  }
  TableTd1 = (shift) => {
    const RequestTable = this.state.RequestTable;
    let days = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days.map((day, index) => {
      return (
        <td key={index}>{this.getNames(RequestTable[day][shift])}</td>
      )
    })
  }
  checkVolunteerType = (volunteerType) => {
    if (volunteerType === 'נוער - מע"ר' || volunteerType === 'משתלם נוער') { return 'young' }
  }
  getNames = (RequestTable) => {
    if (RequestTable.length > 0) {
      return RequestTable.map((email, index) => {
        const requestVolunteers = this.state.requestVolunteers;
        let getName = requestVolunteers.find(i => i.email === email)
        return (
          <div className={this.checkVolunteerType(getName.volunteerType)} key={index}>{getName.firstName + '-' + getName.lastName}</div>
        )
      })
    }
    else {
      return <div ></div>
    }
  }

  TableTd = (shift, weeklyDays) => {
    const days = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days.map((day, index) => {
      return (
        <td key={index}>{this.getAllTheTeams(weeklyDays[day][shift], day, shift)}<button onClick={() => { this.addNewTeam(day, shift) }}>הוסף</button></td>
      )
    })
  }
  editingTable = (data) => {
    let weeklyDays = data;
    let allShift = ['Morning', 'Noon', 'Evening', 'Night']
    if (weeklyDays) {
      return allShift.map((shift, index) => {
        return (
          <tr key={index}>
            <td key={index + 1}>{shift}</td>
            {this.TableTd(shift, data)}
          </tr>
        )
      })
    }
  }


  checkBooleanValue = (Boolean, day, shift, email) => {
    let RequestTable = this.state.RequestTable;
    if (Boolean === true) {
      let checkDuplicates = RequestTable[day][shift].filter(i => i === email)
      if (checkDuplicates.length > 0) { }
      else {
        RequestTable[day][shift].push(email)
      }
    } else { }
  }

  addNewTeam = (day, shift) => {
    this.setState({ day: day, shift: shift, pop: true, add: true, listItems: '',update:null })
    this.optionMans1(day, shift);
  }
  clearFields = () => {
    const weeklyDays = this.state.weeklyDays;
    function clear() {
      const allShift = ['Morning', 'Noon', 'Evening', 'Night'];
      const days = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map((day) => {
        return allShift.map((shift) => {
          return weeklyDays[day][shift] = {}
        })
      })
    }
    clear()
    this.setState({ editingTable: this.editingTable(weeklyDays), weeklyDays: weeklyDays })
  }
  cancel = () => {
    this.setState({ pop: false, update: false, add: false, shift: '', day: '', listItems: '', listTeam: '', TeamName: '' })
  }
  UpdateTeamButton = (day, shift, TeamName) => {
    const weeklyDays = this.state.weeklyDays;
    this.setState({ day: day, shift: shift, update: true, pop: true,add:null, TeamName: TeamName, listItems: this.listItems(weeklyDays[day][shift][TeamName]), listTeam: weeklyDays[day][shift][TeamName] })
    this.optionMans1(day, shift);
  }
  UpdateTeam = () => {
    const weeklyDays = this.state.weeklyDays
    const TeamName = this.state.TeamName;
    const listTeam = this.state.listTeam;
    const day = this.state.day;
    const shift = this.state.shift;
    if (listTeam.length > 0) {
      weeklyDays[day][shift][TeamName] = listTeam;
      this.setState({ editingTable: this.editingTable(weeklyDays), weeklyDays: weeklyDays, update: false, shift: '', pop: false, day: '', listTeam: '', listItems: '', TeamName: '' })
    }
    else { alert('אין אפשרות לעדכן צוות ללא מינימום אנשים') }
  }
  addTeam = () => {
    let weeklyDays = this.state.weeklyDays
    const TeamName = this.state.TeamName;
    const listTeam = this.state.listTeam;
    const day = this.state.day;
    const shift = this.state.shift;
    if (listTeam.length > 0) {
      const checkTeamName = weeklyDays[day][shift][TeamName];
      if (checkTeamName === undefined) {
        weeklyDays[day][shift][TeamName] = listTeam;
        this.setState({ editingTable: this.editingTable(weeklyDays), weeklyDays: weeklyDays, pop: false, add: false, shift: '', day: '', listTeam: '', listItems: '', TeamName: '' })
      } else { alert('כבר קיים צוות בשם זה') }
    }
    else { alert('אין אפשרות להוסיף צוות ללא מינימום אנשים') }
  }
  registeredPeople = () => {
    const weeklyDays = this.state.weeklyDays
    const day = this.state.day;
    const shift = this.state.shift;
    const shiftArray = weeklyDays[day][shift];
    let registeredPeople = []
    const numTeams = Object.keys(shiftArray)
    numTeams.forEach(element => {
      registeredPeople = registeredPeople.concat(shiftArray[element])
      this.setState({ registeredPeople: registeredPeople })
    });
  }

  onChangeselect = (e) => {
    this.registeredPeople();
    const man = e.target.value;
    let registeredPeople = this.state.registeredPeople.filter(i => i === man)
    let listTeam = [...this.state.listTeam]
    let checkDuplicates = listTeam.filter(i => i === man)
    if (checkDuplicates.length === 0 && registeredPeople.length === 0) {
      listTeam.push(man)
      this.setState({ listTeam: listTeam, listItems: this.listItems(listTeam) })
    }
  }
  deleteTeamMember = (TeamMember) => {
    let list = this.state.listTeam
    let listToKeep = list.filter(i => i !== TeamMember)
    this.setState({ listTeam: listToKeep, listItems: this.listItems(listToKeep) })
  }
  listItems = (mans) => {
    if (mans.length > 0) {
      return mans.map((email, index) => {
        const allVolunteers = this.state.allVolunteers;
        let getName = allVolunteers.find(i => i.email === email)
        return <li key={index} ><button onMouseDown={() => { this.deleteTeamMember(email) }}>מחק</button> {getName.firstName + '-' + getName.lastName}</li>
      })
    }
  }
  optionMans = () => {
    const allVolunteers = this.state.allVolunteers;
    return allVolunteers.map((oemname, index) => {
      return <option key={index} value={oemname.email}>{oemname.firstName + '-' + oemname.lastName}</option>
    })
  }
  optionMans1 = (day, shift) => {
    const RequestTable = this.state.RequestTable;
    const volunteers = RequestTable[day][shift];
    if (volunteers.length < 1) { this.setState({ optionMansvolunteers: null }) }
    else { this.setState({ optionMansvolunteers: this.optionMansvolunteers(volunteers) }) }
  }
  optionMansvolunteers = (volunteers) => {
    const requestVolunteers = this.state.requestVolunteers;
    return volunteers.map((oemname, index) => {
      let getName = requestVolunteers.find(i => i.email === oemname)
      return <option key={index} value={oemname}>{getName.firstName + '-' + getName.lastName}</option>
    })
  }
  optionTeamName = () => {
    let araay = []
    for (let index = 1; index < 11; index++) { araay.push(index) }
    return araay.map((option, index) => {
      return <option key={index} value={`אמבולנס-${option}`}>{`אמבולנס-${option}`}</option>
    })
  }

  renderTableHeaderdays() {
    const days = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    return days.map((day, index) => {
      return <th key={index} >{day}</th>
    })
  }
  renderTableHeader(firstDay) {
    const numberTimes = [1, 2, 3, 4, 5, 6, 7]
    return numberTimes.map((head, index) => {
      let newDate = new Date(firstDay.getTime() + index*24*60*60*1000);
        return <th key={index} >{newDate.getDate()}</th>
    })}
  create = () => {
    axios.post("/createTemporaryShifts",
        {
          weeklyDays: this.state.weeklyDays,
          firstDay: this.getNextDayOfTheWeek("sun", false),
          weeklyHors: this.funHoursList()
        }
      )
      .then((res) => {
        if (res.status === 201){
          alert('השיבוץ נשמר בהצלחה'); this.setState({redirectHome:true}) }
        })
      .catch((err) => { });
  }

  updatebutton = () => {
    const tableDetails = this.state.shiftsTable;
    const url = `/updateTemporaryShifts/${tableDetails._id}`;
    const _this = this;
    axios.put(url,
      {
        weeklyDays: this.state.weeklyDays,
        weeklyHors: this.funHoursList()
      })
      .then(function (res) {
        if (res.data.Status === '200') {
          alert('השינויים נשמרו בהצלחה');  _this.setState({redirectHome:true}) }
      })
      .catch();
  }

  sendShiftsByEmail = () => {
    const Email = this.state.emailList;
    const Html = { header: this.state.headerText, list: this.state.messageList }
    var listbuttons = document.getElementsByTagName("button");
    for (let i = 0; i < listbuttons.length; i++) { listbuttons[i].style.display = 'none' }
    var Element = document.getElementById('editingTable')
    
    html2canvas(Element, { scrollY: -window.scrollY }).then(function (canvas) {
      let dataURL = canvas.toDataURL();
      axios
        .post("/sendShiftsByEmail", { dataURL: dataURL, email: Email, Html: Html })
        .then(alert('השיבוץ נשלח')
        )
        .catch();
    });
    for (let i = 0; i < listbuttons.length; i++) { listbuttons[i].style.display = 'inline' }
  }
  addMessage = () => {
    const text = this.state.messageText;
    let messageList = this.state.messageList;
    messageList.push(text);
    this.setState({ messageList: messageList, listText: this.listText(messageList), messageText: '' })
  }
  listText = (messageList) => {
    if (messageList.length > 0) {
      return messageList.map((message, index) => {
        return <Fragment key={index}> <li>{message} <button onClick={() => { this.deleteMessage(message) }}>מחק</button></li>  </Fragment>
      })
    }
  }
  deleteMessage = (message) => {
    let messageList = this.state.messageList
    let listToKeep = messageList.filter(i => i !== message)
    this.setState({ messageList: listToKeep, listText: this.listText(listToKeep) })
  }
  emailList = (listPeople) => {
    let getListPeople = this.state.allVolunteers;
    if (listPeople === 'emailEmbeddedOnly') { getListPeople = this.funHoursList(); }
    let emailList = [];
    getListPeople.forEach((teamMember) => { emailList.push(teamMember.email) })
    this.setState({ emailList: emailList })
  }
  onChanCheck = (name, e, TheSecondCheck) => { this.setState({ [name]: e.target.checked, [TheSecondCheck]: false }); this.emailList(name) };
  onChange = (name, e) => { this.setState({ [name]: e.target.value }) };
  render() {
    const disabled = !this.state.TeamName;
    const disabled1 = !this.state.messageText;
    if (this.state.redirectHome) { return <Redirect to='/Home' /> }

    return (
      <div className='Manager' >
        <h3>שיבוץ מתנדבים</h3>
        <table className='requestShiftsTable'>
          <tbody>
            <tr><th></th>
              {this.state.renderTableHeaderdays}</tr>
            <tr><th></th>
              {this.state.renderTableHeader}</tr>
            {this.state.requestShiftsTable}
          </tbody>
        </table>
        <table id='editingTable'>
          <tbody >
            <tr><th></th>
              {this.state.renderTableHeaderdays}</tr>
            <tr><th></th>
              {this.state.renderTableHeader}</tr>
            {this.state.editingTable}
          </tbody>
        </table>

        {this.state.pop &&  <div className='backgroundPop'> <div className='Pop'>
            <h4> יום: {dayOfWeekH[this.state.day]} - משמרת: {allShiftH[this.state.shift]}</h4>
            {this.state.add && <div> <span>שם צוות: </span> 
              <select onChange={e =>  this.onChange('TeamName', e)} >
                <option value="" hidden>בחר</option>
                {this.optionTeamName()}
              </select> </div>}
            {this.state.update && <h2>שם הצוות: {this.state.TeamName} </h2>
            }
            {this.state.optionMansvolunteers && <div>
              <br></br> 
              <span>משתמשים שביקשו </span>
              <select onChange={e => this.onChangeselect(e)} >
                <option value="" hidden>משתמשים שביקשו</option>
                {this.state.optionMansvolunteers}
              </select>
            </div>}
            {!this.state.optionMansvolunteers && <span>אין משתמשים שביקשו</span>}
            <br></br>
            <span>כל המשתמשים </span>
            <select onChange={e => this.onChangeselect(e)} >
              <option value="" hidden>בחר</option>
              {this.optionMans()}
            </select>
            <ul className='list'>
              {this.state.listItems}
            </ul>
            {this.state.add && <button disabled={disabled} onMouseDown={this.addTeam}>הוסף צוות</button>}
            {this.state.update && <button disabled={disabled} onMouseDown={this.UpdateTeam}>עדכן צוות</button>}

            <button style={{ marginRight: '15rem'}} onMouseDown={this.cancel}>ביטול</button>
          </div> </div>
        }
    
        {this.state.create && <button onClick={this.create}>צור</button>}
        {this.state.updatebutton && <button onClick={this.updatebutton}>עדכן שינויים</button>}
        <button style={{ marginRight: '15rem'}} onClick={this.clearFields}>נקה שדות</button>

      {!this.state.send &&<button style={{ display: 'block', margin:'2rem auto' }} onClick={()=>{this.setState({send:true})}}>שליחת שיבוץ במייל</button>} <br></br><br></br>
        {this.state.send && <Fragment>
         כותרת: <input onChange={e => { this.onChange('headerText', e) }}></input> <br></br><br></br>
         <div>
          הודעה: <input value={this.state.messageText} onChange={e => { this.onChange('messageText', e) }}></input> <button disabled={disabled1} onClick={this.addMessage}>הוסף הודעה</button></div>
        {this.state.headerText && <h4>{this.state.headerText}</h4>}
        {this.state.listText && <ul className='list'> {this.state.listText}  </ul> }
        <Form.Check className='FormCheck'  style={{ marginTop:'1rem' }}
          onChange={e => { this.onChanCheck('emailToAll', e, 'emailEmbeddedOnly') }}
          checked={this.state.emailToAll}
          type='radio'
          label='כל המתנדבים'
        />
        <Form.Check className='FormCheck'
          onChange={e => { this.onChanCheck('emailEmbeddedOnly', e, 'emailToAll') }}
          checked={this.state.emailEmbeddedOnly}
          type='radio'
          label='רק מתנדבים שמשובצים'
        />
        <button disabled  onClick={() => { this.sendShiftsByEmail() }}>שלח</button> </Fragment> }
        <br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br><br></br>
      </div>
    );
  }
}

export default Manager;