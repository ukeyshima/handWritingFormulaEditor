import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class SizeChangeBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleIframeMouseMove = this.handleIframeMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.state = {
      startWidth1: 0,
      startWidth2: 0,
      startX: 0
    };
  }
  handleMouseDown(e) {
    document.body.addEventListener('mousemove', this.handleMouseMove);
    document.body.addEventListener('touchmove', this.handleMouseMove);
    document.body.addEventListener('mouseup', this.handleMouseUp);
    document.body.addEventListener('touchend', this.handleMouseUp);
    if (
      this.props.state.renderingObject[this.props.num - 1].type === 'run' ||
      this.props.state.renderingObject[this.props.num].type === 'run'
    ) {
      const iframe = this.props.state.iframeElement;
      iframe.contentDocument.addEventListener(
        'mousemove',
        this.handleIframeMouseMove
      );
      iframe.contentDocument.addEventListener(
        'touchmove',
        this.handleIframeMouseMove
      );
      iframe.contentDocument.addEventListener('mouseup', this.handleMouseUp);
      iframe.contentDocument.addEventListener('touchend', this.handleMouseUp);
    }
    this.setState({
      startWidth1: this.props.state.renderingObject[this.props.num - 1].width,
      startWidth2: this.props.state.renderingObject[this.props.num].width,
      startX: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageX
        : e.pageX
    });
  }
  handleMouseMove(e) {
    this.props.state.editor.resize();
    this.props.state.sizeChange(
      this.props.num - 1,
      this.state.startWidth1 + e.pageX - this.state.startX
    );
    this.props.state.sizeChange(
      this.props.num,
      this.state.startWidth2 - e.pageX + this.state.startX
    );
    if (
      this.props.state.renderingObject[this.props.num - 1].type ===
      'handWritingFormulaArea'
    ) {
      this.props.state.handWritingFormulaArea.resize();
    }
    if (
      this.props.state.renderingObject[this.props.num].type ===
      'handWritingFormulaArea'
    ) {
      this.props.state.handWritingFormulaArea.resize();
    }
    this.props.state.editor.resize();
  }
  handleIframeMouseMove(e) {
    if (this.props.state.renderingObject[this.props.num - 1].type === 'run') {
      this.props.state.sizeChange(
        this.props.num,
        this.props.state.renderingObject[this.props.num].width +
          this.props.state.renderingObject[this.props.num - 1].width -
          e.clientX
      );
      this.props.state.sizeChange(this.props.num - 1, e.clientX);
    } else {
      this.props.state.sizeChange(
        this.props.num - 1,
        this.props.state.renderingObject[this.props.num - 1].width + e.clientX
      );
      this.props.state.sizeChange(
        this.props.num,
        this.props.state.renderingObject[this.props.num].width - e.clientX
      );
    }
    if (
      this.props.state.renderingObject[this.props.num - 1].type ===
      'handWritingFormulaArea'
    ) {
      this.props.state.handWritingFormulaArea.resize();
    }
    if (
      this.props.state.renderingObject[this.props.num].type ===
      'handWritingFormulaArea'
    ) {
      this.props.state.handWritingFormulaArea.resize();
    }
    this.props.state.editor.resize();
  }
  handleMouseUp() {
    document.body.removeEventListener('mousemove', this.handleMouseMove);
    document.body.removeEventListener('touchmove', this.handleMouseMove);
    document.body.removeEventListener('mouseup', this.handleMouseUp);
    document.body.removeEventListener('touchend', this.handleMouseUp);
    if (this.props.state.iframeElement) {
      const iframe = this.props.state.iframeElement;
      iframe.contentDocument.removeEventListener(
        'mousemove',
        this.handleIframeMouseMove
      );
      iframe.contentDocument.removeEventListener(
        'touchmove',
        this.handleIframeMouseMove
      );
      iframe.contentDocument.removeEventListener('mouseup', this.handleMouseUp);
      iframe.contentDocument.removeEventListener(
        'touchend',
        this.handleMouseUp
      );
    }
  }
  render() {
    return (
      <div
        onMouseDown={this.handleMouseDown}
        onTouchStart={this.handleMouseDown}
        style={{
          width: '3px',
          height: window.innerHeight - 110,
          backgroundColor: '#e38',
          float: 'left',
          cursor: 'col-resize'
        }}
      />
    );
  }
}
