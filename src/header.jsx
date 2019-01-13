import React from 'react';
import File from './file';
import Mode from './mode';

export default class Header extends React.Component {
  render() {
    return (
      <div id="header">
        <File />
        <Mode />
      </div>
    );
  }
}
