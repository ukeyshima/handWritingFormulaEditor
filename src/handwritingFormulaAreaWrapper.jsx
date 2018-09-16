//export to "renderingObject.jsx"
import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaExchangeAlt } from 'react-icons/fa';
import HandWritingFormulaArea from './handWritingFormulaArea.jsx';
import HandWritingExchange from './handWritingExchange.jsx';

@inject('state')
@observer
export default class HandWritingFormulaAreaWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevEndRangeRow: 0,
      prevEndRangeColumn: 0
    };
  }
  handleExchange = () => {
    const bool = this.props.state.handWritingFormulaAreas[this.props.num]
      .exchange;
    this.props.state.updateHandWritingFormulaAreaExchange(
      this.props.num,
      !bool
    );
  };
  handleMouseAndTouchDownResize = e => {
    document.body.addEventListener(
      'mousemove',
      this.handleMouseAndTouchMoveResize
    );
    document.body.addEventListener(
      'touchmove',
      this.handleMouseAndTouchMoveResize
    );
    document.body.addEventListener('mouseup', this.handleMouseAndTouchUpResize);
    document.body.addEventListener(
      'touchend',
      this.handleMouseAndTouchUpResize
    );
    this.startX = e.hasOwnProperty('changedTouches')
      ? e.changedTouches[0].pageX
      : e.pageX;
    this.startY = e.hasOwnProperty('changedTouches')
      ? e.changedTouches[0].pageY
      : e.pageY;
    this.startWidth = this.props.state.handWritingFormulaAreas[
      this.props.num
    ].width;
    this.startHeight = this.props.state.handWritingFormulaAreas[
      this.props.num
    ].height;
    const editor = this.props.state.editor;
    const prevEndRange = editor.renderer.screenToTextCoordinates(
      this.startX,
      this.startY
    );
    console.log(prevEndRange);
    this.setState({
      prevEndRangeRow: prevEndRange.row,
      prevEndRangeColumn: prevEndRange.column
    });
  };
  handleMouseAndTouchMoveResize = e => {
    const x = e.hasOwnProperty('changedTouches')
      ? e.changedTouches[0].pageX
      : e.pageX;
    const y = e.hasOwnProperty('changedTouches')
      ? e.changedTouches[0].pageY
      : e.pageY;

    if (
      this.startWidth + x - this.startX > 250 &&
      this.startHeight + y - this.startY > 100
    ) {
      const editor = this.props.state.editor;
      const searchWord = `/*${this.props.num}*/`;
      editor.$search.setOptions({ needle: searchWord, regExp: false });
      const startRange = editor.$search.findAll(editor.session)[0].start;
      const prevEndRange = {
        row: this.state.prevEndRangeRow,
        column: this.state.prevEndRangeColumn
      };
      const currentEndRange = editor.renderer.screenToTextCoordinates(x, y);
      let insertText = `/*${this.props.num}*/`;
      for (let i = 0; i < currentEndRange.row - startRange.row; i++) {
        insertText += '\n';
      }
      for (let i = 0; i < currentEndRange.column; i++) {
        insertText += '\x20';
      }
      editor.session.replace(
        {
          start: startRange,
          end: prevEndRange
        },
        insertText
      );
      this.setState({
        prevEndRangeRow: currentEndRange.row,
        prevEndRangeColumn: currentEndRange.column
      });

      this.props.state.updateHandWritingFormulaAreaSize(
        this.props.num,
        this.startWidth + x - this.startX,
        this.startHeight + y - this.startY
      );
      this.props.state.handWritingFormulaAreas[
        this.props.num
      ].handWritingFormulaEditor.resize();
      if (this.props.state.handWritingFormulaAreas[this.props.num].exchange) {
        this.props.state.handWritingFormulaAreas[
          this.props.num
        ].codeEditor.resize();
      }
    }
  };
  handleMouseAndTouchUpResize = () => {
    document.body.removeEventListener(
      'mousemove',
      this.handleMouseAndTouchMoveResize
    );
    document.body.removeEventListener(
      'touchmove',
      this.handleMouseAndTouchMoveResize
    );
    document.body.removeEventListener(
      'mouseup',
      this.handleMouseAndTouchUpResize
    );
    document.body.removeEventListener(
      'touchend',
      this.handleMouseAndTouchUpResize
    );
  };
  render() {
    return (
      <div style={this.props.style}>
        <button
          className="handWritingFormulaAreaButton"
          id="exchangeButton"
          onClick={this.handleExchange}
        >
          <FaExchangeAlt />
        </button>
        <div
          style={{
            backgroundColor: '#888',
            width: 3,
            height: 30,
            margin: 0,
            padding: 0,
            position: 'absolute',
            right: 0,
            bottom: 0,
            cursor: 'nwse-resize',
            zIndex: 23
          }}
          onMouseDown={this.handleMouseAndTouchDownResize}
        />
        <div
          style={{
            backgroundColor: '#888',
            width: 30,
            height: 3,
            margin: 0,
            padding: 0,
            position: 'absolute',
            bottom: 0,
            right: 0,
            cursor: 'nwse-resize',
            zIndex: 23
          }}
          onMouseDown={this.handleMouseAndTouchDownResize}
        />
        <HandWritingFormulaArea
          num={this.props.num}
          startrow={this.props.startrow}
          style={{
            position: 'absolute',
            width: Math.floor(this.props.status.width - 3),
            height: Math.floor(this.props.status.height - 3),
            top: 0,
            left: 0
          }}
        />
        {(() => {
          if (this.props.status.exchange) {
            return (
              <HandWritingExchange
                num={this.props.num}
                code={this.props.status.code}
                style={{
                  position: 'absolute',
                  width: Math.floor(this.props.status.width - 3),
                  height: Math.floor(this.props.status.height - 3),
                  top: 0,
                  left: 0
                }}
              />
            );
          }
        })()}
      </div>
    );
  }
}
