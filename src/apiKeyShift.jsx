import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class apiKeyShift extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: '#000'
    };
  }
  handleClick = () => {
    this.props.state.keyChange();
    console.log(this.props.state.key.applicationKey);
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
        APIKeyShift
      </button>
    );
  }
}
