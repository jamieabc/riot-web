/*
Copyright 2015, 2016 OpenMarket Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var React = require('react');
var DragDropContext = require('react-dnd').DragDropContext;
var HTML5Backend = require('react-dnd-html5-backend');
var sdk = require('matrix-react-sdk');
var dis = require('matrix-react-sdk/lib/dispatcher');

var VectorConferenceHandler = require('../../VectorConferenceHandler');
var CallHandler = require("matrix-react-sdk/lib/CallHandler");

var LeftPanel = React.createClass({
    displayName: 'LeftPanel',

    propTypes: {
        collapsed: React.PropTypes.bool.isRequired,
        teamToken: React.PropTypes.string
    },

    getInitialState: function() {
        return {
            showCallElement: null,
            searchFilter: ''
        };
    },

    componentWillMount: function() {
      this.focusedElement = null;
    },

    componentDidMount: function() {
        this.dispatcherRef = dis.register(this.onAction);
    },

    componentWillReceiveProps: function(newProps) {
        this._recheckCallElement(newProps.selectedRoom);
    },

    componentWillUnmount: function() {
        dis.unregister(this.dispatcherRef);
    },

    onFocus: function(ev) {
      this.focusedElement = ev.target;
    },

    onBlur: function(ev) {
      this.focusedElement = null;
    },

    onKeyDown: function(ev) {
      if(!this.focusedElement) return;
      let handled = false;
      const ctrlOnly = ev.ctrlKey && !ev.metaKey && !ev.altKey && !ev.shiftKey;

      switch(ev.keyCode) {
      case 38:                  // key up
        this.onChaneFocusItem(true);
        handled = true;
        break;
      case 40:                  // key down
        this.onChaneFocusItem(false);
        handled = true;
        break;
      case 78:                  // ctrl-n
        if (ctrlOnly) {
          this.onChaneFocusItem(false);
          handled = true;
        }
        break;
      case 80:                  // ctrl-p
        if (ctrlOnly) {
          this.onChaneFocusItem(true);
          handled = true;
        }
        break;
      }

      if (handled) {
        ev.stopPropagation();
        ev.preventDefault();
      }
    },

    onChaneFocusItem: function(up) {
      var current = this.focusedElement;

      var descending = false;
      var classes;

      do {
        var child = up ? current.lastElementChild : current.firstElementChild;
        var sibling = up ? current.previousElementSibling : current.nextElementSibling;

        if (descending) {
          if (child) {
            current = child;
          } else if (sibling) {
            current = sibling;
          } else {
            descending = false;
            current = current.parentElement;
          }
        } else {
          if (sibling) {
            current = sibling;
            descending = true;
          } else {
            current = current.parentElement;
          }
        }

        if (current) {
          classes = current.classList;
          if (classes.contains("mx_LeftPanel")) { // top list
            current = up ? current.lastElementChild : current.firstElementChild;
            descending = true;
          }
        }
      } while(current && !(
        classes.contains("mx_RoomTile") ||
        classes.contains("mx_SearchBox_search") ||
        classes.contains("mx_RoomSubList_ellipsis")));

      if (current) {
        current.focus();
        this.focusedElement = current;
        this.focusedDescending = descending;
      }
    },

    onAction: function(payload) {
        switch (payload.action) {
            // listen for call state changes to prod the render method, which
            // may hide the global CallView if the call it is tracking is dead
            case 'call_state':
                this._recheckCallElement(this.props.selectedRoom);
                break;
        }
    },

    _recheckCallElement: function(selectedRoomId) {
        // if we aren't viewing a room with an ongoing call, but there is an
        // active call, show the call element - we need to do this to make
        // audio/video not crap out
        var activeCall = CallHandler.getAnyActiveCall();
        var callForRoom = CallHandler.getCallForRoom(selectedRoomId);
        var showCall = (activeCall && activeCall.call_state === 'connected' && !callForRoom);
        this.setState({
            showCallElement: showCall
        });
    },

    onHideClick: function() {
        dis.dispatch({
            action: 'hide_left_panel',
        });
    },

    onCallViewClick: function() {
        var call = CallHandler.getAnyActiveCall();
        if (call) {
            dis.dispatch({
                action: 'view_room',
                room_id: call.groupRoomId || call.roomId,
            });
        }
    },

    onSearch: function(term) {
        this.setState({ searchFilter: term });
    },

    render: function() {
        var RoomList = sdk.getComponent('rooms.RoomList');
        var BottomLeftMenu = sdk.getComponent('structures.BottomLeftMenu');
        var SearchBox = sdk.getComponent('structures.SearchBox');

        var collapseButton;
        var classes = "mx_LeftPanel mx_fadable";
        if (this.props.collapsed) {
            classes += " collapsed";
        }
        else {
            // Hide the collapse button until we work out how to display it in the new skin
            // collapseButton = <img className="mx_LeftPanel_hideButton" onClick={ this.onHideClick } src="img/hide.png" width="12" height="20" alt="<"/>
        }

        var callPreview;
        if (this.state.showCallElement && !this.props.collapsed) {
            var CallView = sdk.getComponent('voip.CallView');
            callPreview = (
                <CallView
                    className="mx_LeftPanel_callView" showVoice={true} onClick={this.onCallViewClick}
                    ConferenceHandler={VectorConferenceHandler} />
            );
        }

        return (
          <aside
            className={classes}
            style={{ opacity: this.props.opacity }}
            onKeyDown={ this.onKeyDown }
            onFocus={ this.onFocus }
            onBlur={ this.onBlur }
          >
            <SearchBox collapsed={ this.props.collapsed } onSearch={ this.onSearch } />
              { collapseButton }
              { callPreview }
            <RoomList
              selectedRoom={this.props.selectedRoom}
              collapsed={this.props.collapsed}
              searchFilter={this.state.searchFilter}
              ConferenceHandler={VectorConferenceHandler} />
            <BottomLeftMenu collapsed={this.props.collapsed} teamToken={this.props.teamToken}/>
          </aside>
        );
    }
});

module.exports = DragDropContext(HTML5Backend)(LeftPanel);
