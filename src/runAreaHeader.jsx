import React from 'react';
import { inject, observer } from 'mobx-react';

@inject(({ state }) => ({
  iframeElement: state.iframeElement,
  runAreaPosition: state.runAreaPosition,
  updateRunAreaPosition: state.updateRunAreaPosition
}))
@observer
export default class RunAreaHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      x: 0,
      y: 0
    };
  }
  handleMouseAndTouchDown = e => {
    document.body.addEventListener('mousemove', this.handleMouseAndTouchMove);
    document.body.addEventListener('touchmove', this.handleMouseAndTouchMove);
    document.body.addEventListener('mouseup', this.handleMouseAndTouchUp);
    document.body.addEventListener('touchend', this.handleMouseAndTouchUp);
    const iframe = this.props.iframeElement;
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
      x: 'changedTouches' in e ? e.changedTouches[0].pageX : e.pageX,
      y: 'changedTouches' in e ? e.changedTouches[0].pageY : e.pageY
    });
  };
  handleMouseAndTouchMove = e => {
    const position = this.props.runAreaPosition;
    const x = 'changedTouches' in e ? e.changedTouches[0].pageX : e.pageX;
    const y = 'changedTouches' in e ? e.changedTouches[0].pageY : e.pageY;
    this.props.updateRunAreaPosition(
      position.x + x - this.state.x,
      position.y + y - this.state.y
    );
    this.setState({
      x: x,
      y: y
    });
  };
  handleIframeMouseAndTouchMove = e => {
    const iframe = this.props.iframeElement;
    const iframePosition = iframe.getBoundingClientRect();
    const position = this.props.runAreaPosition;
    const x =
      ('changedTouches' in e ? e.changedTouches[0].pageX : e.pageX) +
      Math.floor(iframePosition.left);
    const y =
      ('changedTouches' in e ? e.changedTouches[0].pageY : e.pageY) +
      Math.floor(iframePosition.top);
    this.props.updateRunAreaPosition(
      position.x + x - this.state.x,
      position.y + y - this.state.y
    );
    this.setState({
      x: x,
      y: y
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
    const iframe = this.props.iframeElement;
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
        touch-action='none'
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
