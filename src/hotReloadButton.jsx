import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class HotReloadButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fontColor: '#000'
    };
  }
  handleClick = () => {
    const bool = this.props.state.hotReload;
    this.props.state.updateHotReload(!bool);
    const e = document.createEvent('MouseEvents');
    e.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null
    );
    if (this.props.state.iframeElement) {
      this.props.state.stopButton.dispatchEvent(e);
    } else {
      this.props.state.runButton.dispatchEvent(e);
      this.props.state.updateRunButtonColor({
        backgroundColor: ' rgb(0, 185, 158)',
        fontColor: '#eee'
      });
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
        HotReload
      </button>
    );
  }
}
