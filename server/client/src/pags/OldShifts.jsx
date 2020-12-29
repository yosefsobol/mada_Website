import React, { Component } from 'react';
import axios from 'axios';
import "./OldShifts.css";

const dayOfWeekH = { Son: 'ראשון', Mon: 'שני', Tue: 'שלישי', Wed: 'רביעי', Thu: 'חמישי', Fri: 'שישי', Sat: 'שבת' }
const allShiftH = { Morning: 'בוקר', Noon: 'צהריים', Evening: 'ערב', Night: 'לילה' }

class OldShifts extends Component {

    state = {weeklyTime:'', id:null,res:null, shiftsTable:null , listItems:null, editingTable:null, registeredPeople: [], allVolunteers: '', listTeam: [], obj: null, day: '', shift: '', TeamName: '', requestVolunteers: null, add: false, pop: false, weeklyDays: null }
  componentDidMount() {
    this.setState({renderTableHeaderdays:this.renderTableHeaderdays() })
    axios.get('/getAllUsers')
      .then(Res => {
        if (Res.data !== []) {
          this.setState({ allVolunteers: Res.data })
          axios.get('/oldShifts')
            .then(res => {
              if (res.data !== '') {
             let max = 0, min = res.data[0].id;
             for (let index = 0; index < res.data.length; index++) {
              if (res.data[index].id > max) { max = res.data[index].id }
              if (res.data[index].id < min) { min = res.data[index].id }
             }
                const weeklyShifts = res.data.find(i=> i.id === max)
                this.setState({weeklyTime:this.weeklyTime(weeklyShifts.firstDay),renderTableHeader: this.renderTableHeader(new Date(weeklyShifts.firstDay)),min:min, max:max, res:res.data,shiftsTable:weeklyShifts,id:max, editingTable:this.editingTable(weeklyShifts.weeklyDays) ,weeklyDays: weeklyShifts.weeklyDays})
              }
            })
            .catch()
        }
      })
      .catch()
  }
  activ = (activ) => {
      let id = this.state.id+1; if (activ === '-'){id = this.state.id-1}
      if (activ === '+' & this.state.id >= this.state.max){alert('אין טבלה עדכנית יותר')}
        else { if (activ === '-' & this.state.id <= this.state.min){alert('אין טבלה ישנה יותר')}
      else {
        const weeklyShifts = this.state.res.find(i=> i.id === id)
        this.setState({weeklyTime:this.weeklyTime(weeklyShifts.firstDay),shiftsTable:weeklyShifts,id:id, editingTable:this.editingTable(weeklyShifts.weeklyDays) ,weeklyDays: weeklyShifts.weeklyDays, renderTableHeader: this.renderTableHeader(new Date(weeklyShifts.firstDay))})
        }}
  }
  weeklyTime = (date) =>{
let firstDay = new Date(date);
let lastDay = new Date(firstDay.getTime() + 6*24*60*60*1000);
var monthNames = ["ינואר", "פבואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];

return (<div><h6>הנתונים המוצגים הם בין התאריכים</h6>
<span>{firstDay.getDate()+' '+monthNames[firstDay.getMonth()]+' '+firstDay.getFullYear()}</span>
<span>{' '}-{' '}</span>
<span>{lastDay.getDate()+' '+monthNames[lastDay.getMonth()]+' '+lastDay.getFullYear()}</span>
  </div>)
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
                if (shift === 'Evening'){numHours = 6}
                if (existing === undefined){hoursList.push({email:teamMember,h:numHours})}
                else {existing.h = existing.h+numHours}
                  }) }) } }) }) }
    hours()
    return hoursList 
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
        })
      }
    deleteTeam = (day, shift, teamName) => {
        const weeklyDays = this.state.weeklyDays;
        delete weeklyDays[day][shift][teamName];
        this.setState({editingTable:this.editingTable(weeklyDays), weeklyDays: weeklyDays })
      }
    addNewTeam = (day, shift) => {
        this.setState({ day: day, shift: shift, pop: true, add: true,listItems:'' })
      }
      UpdateTeamButton = (day, shift, TeamName) => {
        const weeklyDays = this.state.weeklyDays;
        this.setState({ day: day, shift: shift, update: true, pop: true, TeamName: TeamName,listItems:this.listItems(weeklyDays[day][shift][TeamName]), listTeam: weeklyDays[day][shift][TeamName] })
      }
      getOneTeam = (shift, oneTeam) => {
        return shift[oneTeam].map((teamMember, index) => {
          const allVolunteers = this.state.allVolunteers;
          let getName = allVolunteers.find(i => i.email === teamMember)
          return (<div key={index}>{getName.firstName + '-' + getName.lastName}</div>)
        })
      }
    getAllTheTeams = (shiftArray, day, shift) => {
        const numTeams = Object.keys(shiftArray)
        if (numTeams.length > 0) {
          return numTeams.map((teamName, index) => {
            return (
              <div style={{ border: 'red solid 2px', width:'max-content' }} key={index}> {`${teamName}:`}  {this.getOneTeam(shiftArray, numTeams[index])}<button onClick={() => { this.UpdateTeamButton(day, shift, teamName) }}>עדכון</button><button onClick={() => { this.deleteTeam(day, shift, teamName) }}>מחק</button> </div>
            )
          })
        } else { return '' }
      }
    TableTd = (shift,weeklyDays) => {
        const days = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
        return days.map((day, index) => {
          return (
            <td key={index}>{this.getAllTheTeams(weeklyDays[day][shift], day, shift)}<button onClick={() => { this.addNewTeam(day, shift) }}>add</button></td>
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
                {this.TableTd(shift,data)}
              </tr>
            )
          })
        }
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
    optionMans = () => {
        const allVolunteers = this.state.allVolunteers;
        return allVolunteers.map((oemname, index) => {
          return <option key={index} value={oemname.email}>{oemname.firstName + '-' + oemname.lastName}</option>
        })
      }
    listItems = (mans) => {
        if (mans.length > 0) {
          return mans.map((email, index) => {
            const allVolunteers = this.state.allVolunteers;
            let getName = allVolunteers.find(i => i.email === email)
            return <li onClick={() => { this.deleteTeamMember(email) }} key={index} >{getName.firstName + '-' + getName.lastName}</li>
          })
        }
      }
    UpdateTeam = () => {
        const weeklyDays = this.state.weeklyDays
        const TeamName = this.state.TeamName;
        const listTeam = this.state.listTeam;
        const day = this.state.day;
        const shift = this.state.shift;
        if (listTeam.length > 0) {
          weeklyDays[day][shift][TeamName] = listTeam;
          this.setState({editingTable:this.editingTable(weeklyDays), weeklyDays: weeklyDays, update: false, shift: '', pop: false, day: '', listTeam: '',listItems:'', TeamName: '' })
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
            this.setState({editingTable:this.editingTable(weeklyDays), weeklyDays: weeklyDays, pop: false, add: false, shift: '', day: '', listTeam: '',listItems:'', TeamName: '' })
          } else { alert('כבר קיים צוות בשם זה') }
        }
        else { alert('אין אפשרות להוסיף צוות ללא מינימום אנשים') }
      }
    updatebutton = () => {
        const tableDetails = this.state.shiftsTable;
        const url = `/updateOldShifts/${tableDetails._id}`;
        axios.put(url,
          { weeklyDays:this.state.weeklyDays,
            weeklyHors:this.funHoursList()
          })
          .then(function (res) {
            if (res.data.Status === '200') {
              alert('העדכון נשלח ההצלחה'); }
            else { }
          })
          .catch();
      }
    cancel = () => { this.setState({ pop: false, update: false, add: false, shift: '', day: '',listItems:'', listTeam: '', TeamName: '' })}
    render() {  const disabled = !this.state.TeamName;
      const disabled1 = this.state.id === this.state.max;
      const disabled2 = this.state.id === this.state.min;
        return (
            <div className='OldShifts'>
                        <h1>היסטוריית שיבוצים</h1>

                {this.state.weeklyTime}
        <button className='buttons' disabled={disabled1} onClick={()=>{this.activ('+')}}>+</button>
        <button className='buttons' disabled={disabled2} onClick={()=>{this.activ('-')}}>-</button>
        <br></br>
        <table  id='editingTable'>
          <tbody >
            <tr><th></th>
              {this.state.renderTableHeaderdays}</tr>
            <tr><th></th>
              {this.state.renderTableHeader}</tr>
            {this.state.editingTable}
          </tbody>
        </table>

        {this.state.pop &&
          <div>
            <h4> יום: {dayOfWeekH[this.state.day]} - משמרת: {allShiftH[this.state.shift]}</h4>
            {this.state.add && <div> <p>שם צוות</p> <input onChange={e => { this.setState({ TeamName: e.target.value }) }} type="text" /> </div>}
            {this.state.update && <h2>שם הצוות: {this.state.TeamName} </h2>}
            <br></br> <br></br>
       
            <br></br> <br></br>   <span>כל המשתמשים</span>
            <select onChange={e => this.onChangeselect(e)} >
              <option value="" hidden>בחר</option>
              {this.optionMans()}
            </select>
            <ul>
              {this.state.listItems}
            </ul>
            {this.state.add && <button disabled={disabled} onMouseDown={this.addTeam}>הוסף צוות</button>}
            {this.state.update && <button disabled={disabled} onMouseDown={this.UpdateTeam}>עדכן צוות</button>}
            <button onMouseDown={this.cancel}>ביטול</button>
          </div>
        }
        <button onClick={this.updatebutton}>עדכן שיבוץ</button>
            </div>
        );
    }
}

export default OldShifts;