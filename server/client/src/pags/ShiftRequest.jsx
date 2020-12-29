import React, { Component } from 'react';
import './ShiftRequest.css';
import axios from 'axios';
import { Redirect } from 'react-router-dom';
const allShiftH = { Morning: 'בוקר', Noon: 'צהריים', Evening: 'ערב', Night: 'לילה' }

class ShiftRequest extends Component {
  state = { correctTime: false, redirectHome: null, user: null, firstDay: '', beny: '', add: true, update: false, clearFields: '' }

  getNextDayOfTheWeek = (dayName, excludeToday = true, refDate = new Date()) => {
    const dayOfWeek = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
      .indexOf(dayName.slice(0, 3).toLowerCase());
    if (dayOfWeek < 0) return;
    refDate.setHours(0, 0, 0, 0);
    refDate.setDate(refDate.getDate() + +!!excludeToday +
      (dayOfWeek + 7 - refDate.getDay() - +!!excludeToday) % 7);
    return refDate;
  }
  componentDidMount() {
    const userShift = {
      days: {
        Son: { Morning: false, Noon: false, Evening: false, Night: false },
        Mon: { Morning: false, Noon: false, Evening: false, Night: false },
        Tue: { Morning: false, Noon: false, Evening: false, Night: false },
        Wed: { Morning: false, Noon: false, Evening: false, Night: false },
        Thu: { Morning: false, Noon: false, Evening: false, Night: false },
        Fri: { Morning: false, Noon: false, Evening: false, Night: false },
        Sat: { Morning: false, Noon: false, Evening: false, Night: false }
      }
    }
    this.correctTime();
    this.setState({ user: userShift });
    let email = sessionStorage.getItem('email');
    const url = `/getRequestShifts/${email}`
    axios.get(url)
      .then(res => {
        if (res.data !== '') {
          this.setState({ user: res.data, add: false, update: true })
        }
      })
      .catch()

    this.setState({ renderTableHeader: this.renderTableHeader(new Date(this.getNextDayOfTheWeek("sun", false))) })
  }

  correctTime = () => {
    const thisDate = new Date().getDay()
    if (thisDate < 3) { this.setState({ correctTime: true }) }
  }
  clearFields = () => {
    const user = this.state.user;
    function clear() {
      const allShift = ['Morning', 'Noon', 'Evening', 'Night'];
      const days = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return days.map((day) => {
        return allShift.map((shift) => {
          return user.days[day][shift] = false
        })
      })
    }
    clear()
    this.setState({ user: user })
  }

  renderTableBody = () => {
    const volunteerType = this.props.user;
    const user = this.state.user;
    if (volunteerType && user) {
      const type = volunteerType.userData.volunteerType;
      let allShift = ['Morning', 'Noon', 'Evening', 'Night']
      if (type === 'נוער - מע"ר' || type === 'משתלם נוער') { allShift = ['Morning', 'Noon', 'Evening'] }
      return allShift.map((shift, index) => {
        return (
          <tr key={index}>
            <td key={index + 1}>{allShiftH[shift]}</td>
            {this.TableTd(shift)}
          </tr>
        )
      })
    }
  }
  TableTd = (shift) => {
    const user = this.state.user.days;
    const days = ['Son', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return days.map((day, index) => {
      return (
        <td key={index} className={this.color(user[day][shift])} onClick={() => { this.onClicksquare(user[day][shift], day, shift) }}></td>
      )
    })
  }
  color = Boolean => { if (Boolean === true) { return 'green' } else { return 'red' } }
  onClicksquare = (PreviousValue, day, shift) => {
    let user = this.state.user
    let days = user.days
    if (PreviousValue) {
      days[day][shift] = false
      user.days = days
      this.setState({ user: user })
    }
    else {
      days[day][shift] = true
    }
    user.days = days
    this.setState({ user: user })
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
      let newDate = new Date(firstDay.getTime() + index * 24 * 60 * 60 * 1000);
      return <th key={index} >{newDate.getDate()}</th>
    })
  }

  send = () => {
    const userDetails = this.props.user.userData;
    axios
      .post("/createRequestShifts", {
        date: this.getNextDayOfTheWeek("sun", false),
        email: userDetails.email,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        volunteerType: userDetails.volunteerType,
        days: this.state.user.days
      })
      .then(res => {
        if (res.status === 201) {
          alert('השיבוץ נשלח בהצלחה'); this.setState({ redirectHome: true })
        }
      })
      .catch();
  }

  update = () => {
    const userDetails = this.state.user
    const url = `/updateRequestShifts/${userDetails._id}`;
    const obj = { days: this.state.user.days }
    const _this = this;
    axios.put(url, obj)
      .then(res => {
        if (res.data.Status === '200') {
          alert('העדכון נשלח בהצלחה'); _this.setState({ redirectHome: true })
        }
      })
      .catch();
  }

  render() {
    if (this.state.redirectHome) { return <Redirect to='/Home' /> }
    return (
      <div className='ShiftRequest'>
        {this.state.correctTime &&<div>
          <h1>לא ניתן לשבץ היום</h1>
          <h2>ניתן לשלוח שיבוץ רק מיום רביעי עד ראשון</h2>
        </div>}
        {!this.state.correctTime && <div>
        <h3>שליחת בקשה לשיבוץ</h3>
        <div className='Shift'>
          <p>בוקר: 07-15</p>
          <p>צהריים: 15-23</p>
          <p>ערב: 17-23</p>
          <p>לילה: 23- 07</p>
	 </div>
          <table>
            <tbody>
              <tr><th></th>
                {this.renderTableHeaderdays()}</tr>
              <tr><th></th>
                {this.state.renderTableHeader}</tr>
              {this.state.user && this.renderTableBody()}
            </tbody>
          </table>
          {this.state.add && <button  onClick={this.send}>שלח בקשה</button>}
          {this.state.update && <button  onClick={this.update}>עדכן בקשה</button>}
          <button style={{display:'block', margin:'2rem auto'}} onClick={this.clearFields}>נקה הכל</button>
        </div>}
      </div>
    );
  }
}

export default ShiftRequest;