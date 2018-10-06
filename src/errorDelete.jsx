import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class errorDelete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: '#000'
    };
  }
  handleClick = () => {
    const errorElements = document.getElementsByClassName('error-msg');
    while (errorElements.length > 0) {
      errorElements[0].parentNode.removeChild(errorElements[0]);
    }
  };
  handleMouseLeave = () => {
    this.setState({
      fontColor: '#000'
    });
  };
  handleMouseEnter = () => {
    this.setState({
      fontColor: ' rgb(0, 185, 158)'
    });
  };
  render() {
    return (
      <button
        style={{
          color: this.state.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        errorDelete
      </button>
    );
  }
}
