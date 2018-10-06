import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class RunArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0,
      iframeX: 0,
      iframeY: 0
    };
  }
  handleMouseAndTouchDown = e => {
    document.body.addEventListener('mousemove', this.handleMouseAndTouchMove);
    document.body.addEventListener('touchmove', this.handleMouseAndTouchMove);
    document.body.addEventListener('mouseup', this.handleMouseAndTouchUp);
    document.body.addEventListener('touchend', this.handleMouseAndTouchUp);
    const iframe = this.props.state.iframeElement;
    iframe.contentDocument.addEventListener(
      'mousemove',
      this.handleIframeMouseAndTouchMove
    );
    iframe.contentDocument.addEventListener(
      'touchmove',
      this.handleIframeMouseAndTouchMove
    );
    iframe.contentDocument.addEventListener(
      'mouseup',
      this.handleMouseAndTouchUp
    );
    iframe.contentDocument.addEventListener(
      'touchend',
      this.handleMouseAndTouchUp
    );
    this.setState({
      x: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageX
        : e.pageX,
      y: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageY
        : e.pageY
    });
  };
  handleMouseAndTouchMove = e => {
    const position = this.props.state.runAreaPosition;
    this.props.state.updateRunAreaPosition(
      position.x + e.pageX - this.state.x,
      position.y + e.pageY - this.state.y
    );
    this.setState({
      x: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageX
        : e.pageX,
      y: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageY
        : e.pageY
    });
  };
  handleIframeMouseAndTouchMove = e => {
    const iframe = this.props.state.iframeElement;
    const iframePosition = iframe.getBoundingClientRect();
    const position = this.props.state.runAreaPosition;
    this.props.state.updateRunAreaPosition(
      position.x + e.pageX + Math.floor(iframePosition.left) - this.state.x,
      position.y + e.pageY + Math.floor(iframePosition.top) - this.state.y
    );
    this.setState({
      x: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageX + Math.floor(iframePosition.left)
        : e.pageX + Math.floor(iframePosition.left),
      iframeY: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageY + Math.floor(iframePosition.top)
        : e.pageY + Math.floor(iframePosition.top)
    });
  };
  handleMouseAndTouchUp = () => {
    document.body.removeEventListener(
      'mousemove',
      this.handleMouseAndTouchMove
    );
    document.body.removeEventListener(
      'touchmove',
      this.handleMouseAndTouchMove
    );
    document.body.removeEventListener('mouseup', this.handleMouseAndTouchUp);
    document.body.removeEventListener('touchend', this.handleMouseAndTouchUp);
    const iframe = this.props.state.iframeElement;
    iframe.contentDocument.removeEventListener(
      'mousemove',
      this.handleIframeMouseAndTouchMove
    );
    iframe.contentDocument.removeEventListener(
      'touchmove',
      this.handleIframeMouseAndTouchMove
    );
    iframe.contentDocument.removeEventListener(
      'mouseup',
      this.handleMouseAndTouchUp
    );
    iframe.contentDocument.removeEventListener(
      'touchend',
      this.handleMouseAndTouchUp
    );
  };
  render() {
    return (
      <div
        touch-action="none"
        onMouseDown={this.handleMouseAndTouchDown}
        onTouchStart={this.handleMouseAndTouchDown}
        style={{
          height: 20,
          backgroundColor: '#ddd',
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5
        }}
      />
    );
  }
}
