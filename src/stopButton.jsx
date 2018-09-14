import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaSquare } from 'react-icons/fa';

@inject('state')
@observer
export default class StopButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      backgroundColor: '#eee',
      fontColor: ' rgb(0, 185, 158)'
    };
  }
  componentDidMount() {
    this.props.state.updateStopButton(this.refs.stopButton);
  }
  handleClick = () => {
    this.props.state.updateActiveText(this.props.state.editor.getValue());
    this.props.state.updateRunAreaRenderingFlag(false);
    this.props.state.updateRunButtonColor({
      backgroundColor: '#eee',
      fontColor: ' rgb(0, 185, 158)'
    });
    this.props.state.updateIframeElement(null);
    this.props.state.updateHotReload(false);
  };
  handleMouseEnter = () => {
    this.setState({
      backgroundColor: ' rgb(0, 185, 158)',
      fontColor: '#eee'
    });
  };
  handleMouseLeave = () => {
    this.setState({
      backgroundColor: '#eee',
      fontColor: ' rgb(0, 185, 158)'
    });
  };
  render() {
    return (
      <button
        ref="stopButton"
        style={{
          backgroundColor: this.state.backgroundColor,
          color: this.state.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        <FaSquare />
      </button>
    );
  }
}
