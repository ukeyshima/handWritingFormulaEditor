import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaPlay } from 'react-icons/fa';

@inject('state')
@observer
export default class RunButton extends React.Component {
  componentDidMount() {
    this.props.state.updateRunButton(this.refs.runButton);
  }
  handleClick = () => {
    const text = this.props.state.editor.getValue();
    this.props.state.updateActiveText(text);
    this.props.state.updateRunAreaRenderingFlag(true);
  };

  handleMouseEnter = () => {
    this.props.state.updateRunButtonColor({
      backgroundColor: ' rgb(0, 185, 158)',
      fontColor: '#eee'
    });
  };
  handleMouseLeave = () => {
    if (!this.props.state.iframeElement) {
      this.props.state.updateRunButtonColor({
        backgroundColor: '#eee',
        fontColor: ' rgb(0, 185, 158)'
      });
    }
  };
  render() {
    return (
      <button
        ref="runButton"
        style={{
          backgroundColor: this.props.state.runButtonColor.backgroundColor,
          color: this.props.state.runButtonColor.fontColor
        }}
        onClick={this.handleClick}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
      >
        <FaPlay />
      </button>
    );
  }
}
