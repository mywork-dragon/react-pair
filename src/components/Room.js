import React from 'react'
const socket = io()
import Codemirror from 'react-codemirror'
import ModeSelect from './ModeSelect'
import ThemeSelect from './ThemeSelect'
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as actions from '../actions/challengesActions';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/theme/bespin.css';
import 'codemirror/theme/3024-day.css';
import 'codemirror/theme/3024-night.css';
import 'codemirror/theme/cobalt.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/isotope.css';
import 'codemirror/theme/duotone-light.css';
import 'codemirror/theme/icecoder.css';
import 'codemirror/theme/material.css';
import 'codemirror/theme/midnight.css';
import 'codemirror/theme/solarized.css';

import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/ruby/ruby.js'
import 'codemirror/mode/swift/swift.js'
import 'codemirror/mode/clojure/clojure.js'
import 'codemirror/mode/python/python.js'
import 'codemirror/mode/php/php.js'
import 'codemirror/mode/erlang/erlang.js'
import 'codemirror/mode/coffeescript/coffeescript.js'
import 'codemirror/mode/crystal/crystal.js'


class Room extends React.Component {
  constructor(props) {
    super(props)
    this.state = {code: '', mode: 'javascript', theme: 'eclipse', users: []}
    socket.on('receive code', (newCode) => this.updateCodeInState(newCode));
    socket.on('receive change mode', (newMode) => this.updateModeInState(newMode))
    socket.on('new user join', (users) => this.joinUser(users))
    socket.on('load present users', () => this.sendUsers())
    socket.on('load users', (users) => this.updateUsersInState(users))
    socket.on('user left room', (user) => this.removeUser(user))
  }

  componentDidMount() {
    if (this.props.challenge.id == undefined) {
      this.props.actions.getChallenges();
    } else {
      const user = this.props.currentUser
      const users = [...this.state.users, this.props.currentUser]
      socket.emit('room', {room: this.props.challenge.id, user: user});
      this.setState({users: users})
    }
  }

  componentWillUnmount() {
    socket.emit('leave room', {room: this.props.challenge.id, user: this.props.currentUser})
  }

  componentWillReceiveProps() {
    const user = this.props.currentUser
    const users = [...this.state.users, this.props.currentUser]
    socket.emit('room', {room: this.props.challenge.id, user: user});
    this.setState({users: users})
  }

  sendUsers() {
    socket.emit('send users', {room: this.props.challenge.id, users: this.state.users})
  }

  removeUser(user) {
    const newUsers = Object.assign([], this.state.users);
    const indexOfUserToDelete = this.state.users.findIndex(Olduser => {return Olduser == user.user})
    newUsers.splice(indexOfUserToDelete, 1);
    this.setState({users: newUsers})
  }

  joinUser(user) {
    this.setState({users: [...this.state.users, user]})
  }


  updateCodeInState(newCode) {
    this.setState({
      code: newCode
    });
  }

  updateModeInState(newMode) {
    this.setState({
      mode: newMode
    })
  }

  updateUsersInState(users) {
    const combinedUsers = this.state.users.concat(users)
    const newUsers = Array.from(new Set(combinedUsers));
    const cleanUsers = newUsers.filter(user => {return user.length > 1})
    this.setState({users: cleanUsers})
  }

  codeIsHappening(newCode) {
    this.updateCodeInState(newCode)
    socket.emit('coding event', {code: newCode, room: this.props.challenge.id})
  }

  changeMode(newMode) {
    this.updateModeInState
    socket.emit('change mode', {mode: newMode, room: this.props.challenge.id})
  }

  changeTheme(newTheme) {
    this.setState({theme: newTheme})
  }

  render() {
    var options = {
        lineNumbers: true,
        mode: this.state.mode,
        theme: this.state.theme
    };
    return (
      <div>
        <h1>{this.props.challenge.title}</h1>
        <p>{this.props.challenge.description}</p>
        <ul>
          <li>yo</li>
          {this.state.users.map(u => {return <li>{u}</li>})}
        </ul>
        <ModeSelect mode={this.state.mode} changeMode={this.changeMode.bind(this)}/>
        <ThemeSelect theme={this.state.theme} changeTheme={this.changeTheme.bind(this)} />
        <Codemirror value={this.state.code} onChange={this.codeIsHappening.bind(this)} options={options} />
      </div>

    )
  }
}

function mapStateToProps(state, ownProps) {
  if (state.challenges.length > 0) {
    const challenge = state.challenges.filter(challenge => {return challenge.id == ownProps.params.id})[0]
    return {challenge: challenge, currentUser: state.currentUser}
  } else {
    return {challenge: {title: '', description: '', source: ''}, currentUser: ''}
  }
}

function mapDispatchToProps(dispatch) {
  return {actions: bindActionCreators(actions, dispatch)}
}

export default connect(mapStateToProps, mapDispatchToProps)(Room)





