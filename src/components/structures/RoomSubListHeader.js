/*
Copyright 2017 Vector Creations Ltd
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
var ReactDOM = require('react-dom');
var classNames = require('classnames');
var sdk = require('matrix-react-sdk');
var FormattingUtils = require('matrix-react-sdk/lib/utils/FormattingUtils');
var RoomNotifs = require('matrix-react-sdk/lib/RoomNotifs');
var AccessibleButton = require('matrix-react-sdk/lib/components/views/elements/AccessibleButton');

module.exports = React.createClass({
  displayName: 'RoomSubListHeader',

  propTypes: {
    label: React.PropTypes.string.isRequired,
    tagName: React.PropTypes.string,
    roomCount: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number
    ]),
    collapsed: React.PropTypes.bool.isRequired,
    isInvited: React.PropTypes.bool,
    roomNotificationCount: React.PropTypes.array,
    hidden: React.PropTypes.bool,
    onClick: React.PropTypes.func,
    onHeaderClick: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      onHeaderClick: function() {} // NOP
    };
  },

  render: function() {
    var TintableSvg = sdk.getComponent("elements.TintableSvg");

    var notifications = this.props.roomNotification;
    var notificationCount = notifications[0];
    var notifyHighlight = notifications[1];

    var chevronClasses = classNames({
      'mx_RoomSubList_chevron': true,
      'mx_RoomSubList_chevronRight': this.props.hidden,
      'mx_RoomSubList_chevronDown': !this.props.hidden
    });

    var badgeClasses = classNames({
      'mx_RoomSubList_badge': true,
      'mx_RoomSubList_badgeHighlight': notifyHighlight
    });

    var badge;
    if (notificationCount > 0) {
      badge = <div className={badgeClasses}>{ FormattingUtils.formatCount(notificationCount) }</div>;
    } else if (notifyHighlight) {
      badge = <div className={badgeClasses}>!</div>;
    }

    var title;
    var roomCount = this.props.roomCount;
    if (this.props.collapsed) {
      title = this.props.label;
      if (roomCount !== '') {
          title += " [" + roomCount + "]";
      }
    }

    var invited;
    if (this.props.isInvited) {
      var IncomingCallBox = sdk.getComponent("voip.IncomingCallBox");
      invited = <IncomingCallBox className="mx_RoomSubList_invited" invited={ this.props.invited }/>;
    }

    return (
      <div
        ref="header"
        className="mx_RoomSubList_labelContainer"
        title={ title }
      >
        <AccessibleButton
          onClick={ this.props.onClick }
          className="mx_RoomSubList_label"
          tabIndex="0"
        >
          { this.props.collapsed ? '' : this.props.label }
          <div
            className="mx_RoomSubList_roomCount"
          >
            { roomCount }
          </div>
          <div
            className={chevronClasses}
          />
          { badge }
          { invited }
        </AccessibleButton>
      </div>
    );
  }
});
