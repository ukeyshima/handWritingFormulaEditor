//export to "renderingObject.jsx"
import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaExchangeAlt } from 'react-icons/fa';
import HandWritingFormulaArea from './handWritingFormulaArea.jsx';
import HandWritingExchange from './handWritingExchange.jsx';

@inject(({ state }, props) => ({
  editor: state.editor,
  handWritingFormulaArea:
    state.activeTextFile.handWritingFormulaAreas[props.num],
  updateHandWritingFormulaAreaExchange:
    state.updateHandWritingFormulaAreaExchange,
  updateHandWritingFormulaAreaResizeEvent:
    state.updateHandWritingFormulaAreaResizeEvent,
  updateHandWritingFormulaAreaSize: state.updateHandWritingFormulaAreaSize
}))
@observer
export default class HandWritingFormulaAreaWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevEndRangeRow: 0,
      prevEndRangeColumn: 0
    };
    this.shouldUpdate = false;
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.style.visibility !== nextProps.style.visibility) {
      this.shouldUpdate = true;
    } else {
      this.shouldUpdate = false;
    }
  }
  shouldComponentUpdate() {
    return this.props.handWritingFormulaArea.visible || this.shouldUpdate;
  }
  handleMouseDownOrTouchStart = () => {
    this.props.editor.blur();
  };
  handleExchange = () => {
    const bool = this.props.handWritingFormulaArea.exchange;
    this.props.updateHandWritingFormulaAreaExchange(this.props.num, !bool);
  };
  handleMouseAndTouchDownResize = e => {
    this.props.updateHandWritingFormulaAreaResizeEvent(this.props.num, true);
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
    this.startX = e.pageX
      ? e.pageX
      : e.touches
        ? e.touches[0].pageX
        : e.changedTouches[0].pageX;
    this.startY = e.pageY
      ? e.pageY
      : e.touches
        ? e.touches[0].pageY
        : e.changedTouches[0].pageY;
    this.startWidth = this.props.handWritingFormulaArea.width;
    this.startHeight = this.props.handWritingFormulaArea.height;

    const editor = this.props.editor;
    const prevEndRange = editor.renderer.pixelToScreenCoordinates(
      this.startX,
      this.startY
    );
    this.setState({
      prevEndRangeRow: prevEndRange.row,
      prevEndRangeColumn: prevEndRange.column
    });
  };
  handleMouseAndTouchMoveResize = e => {
    const x = e.pageX
      ? e.pageX
      : e.touches
        ? e.touches[0].pageX
        : e.changedTouches[0].pageX;
    const y = e.pageY
      ? e.pageY
      : e.touches
        ? e.touches[0].pageY
        : e.changedTouches[0].pageY;
    if (
      this.startWidth + x - this.startX > 250 &&
      this.startHeight + y - this.startY > 150
    ) {
      this.props.updateHandWritingFormulaAreaSize(
        this.props.num,
        this.startWidth + x - this.startX,
        this.startHeight + y - this.startY
      );
    }
  };
  handleMouseAndTouchUpResize = e => {
    const x = e.pageX
      ? e.pageX
      : e.touches
        ? e.touches[0].pageX
        : e.changedTouches[0].pageX;
    const y = e.pageY
      ? e.pageY
      : e.touches
        ? e.touches[0].pageY
        : e.changedTouches[0].pageY;
    const editor = this.props.editor;
    const searchWord = `/*${this.props.num}*/`;
    editor.$search.setOptions({ needle: searchWord, regExp: false });
    const startRange = editor.$search.findAll(editor.session)[0].start;
    const prevEndRange = {
      row: this.state.prevEndRangeRow,
      column: this.state.prevEndRangeColumn
    };
    const currentEndRange = editor.renderer.pixelToScreenCoordinates(x, y);
    let insertText = `/*${this.props.num}*/`;
    const num = currentEndRange.column - startRange.column - insertText.length;
    for (let i = 0; i < num; i++) {
      insertText += '\x20';
    }
    for (let i = 0; i < currentEndRange.row - startRange.row; i++) {
      insertText += '\n';
      for (let i = 0; i < currentEndRange.column; i++) {
        insertText += '\x20';
      }
    }
    const text = editor.session.getTextRange({
      start: {
        row: startRange.row,
        column: startRange.column
      },
      end: {
        row: prevEndRange.row,
        column: prevEndRange.column
      }
    });
    let minusText = '';
    for (let i = searchWord.length; i < text.length; i++) {
      let character = text[i];
      if (character !== '\x20' && character !== '\n') {
        minusText = text.slice(i, text.length);
      }
    }

    editor.session.replace(
      {
        start: {
          row: startRange.row,
          column: startRange.column
        },
        end: {
          row: prevEndRange.row,
          column: prevEndRange.column - minusText.length
        }
      },
      insertText
    );

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
    this.props.handWritingFormulaArea.handWritingFormulaEditor.resize();
    if (this.props.handWritingFormulaArea.exchange) {
      this.props.handWritingFormulaArea.codeEditor.resize();
    }
    this.props.updateHandWritingFormulaAreaResizeEvent(this.props.num, false);
  };
  render() {
    return (
      <div
        style={this.props.style}
        onMouseDown={this.handleMouseDownOrTouchStart}
        onTouchStart={this.handleMouseDownOrTouchStart}
      >
        <button
          className="handWritingFormulaAreaButton"
          id="exchangeButton"
          onClick={this.handleExchange}
        >
          <FaExchangeAlt />
        </button>
        <div
          touch-action="none"
          style={{
            backgroundColor: '#888',
            width: 7,
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
          onTouchStart={this.handleMouseAndTouchDownResize}
        />
        <div
          touch-action="none"
          style={{
            backgroundColor: '#888',
            width: 30,
            height: 7,
            margin: 0,
            padding: 0,
            position: 'absolute',
            bottom: 0,
            right: 0,
            cursor: 'nwse-resize',
            zIndex: 23
          }}
          onMouseDown={this.handleMouseAndTouchDownResize}
          onTouchStart={this.handleMouseAndTouchDownResize}
        />
        <HandWritingFormulaArea
          // model={this.props.model}
          num={this.props.num}
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
