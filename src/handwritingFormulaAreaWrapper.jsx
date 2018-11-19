//export to "renderingObject.jsx"
import React from 'react';
import { inject, observer } from 'mobx-react';
import { FaExchangeAlt } from 'react-icons/fa';
import HandWritingFormulaArea from './handWritingFormulaArea.jsx';
import HandWritingExchange from './handWritingExchange.jsx';

@inject(({ state }, props) => {
  return {
    editor: state.editor,
    activeTextFileHandWritingFormulaAreaHandWritingFormulaEditor:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .handWritingFormulaEditor,
    activeTextFileHandWritingFormulaAreaBackgroundWord:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .backgroundWord,
    activeTextFileHandWritingFormulaAreaCodeEditor:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .codeEditor,
    handWritingFormulaAreaVisible:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .visible,
    handWritingFormulaAreaExchange:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .exchange,
    updateHandWritingFormulaAreaExchange:
      state.updateHandWritingFormulaAreaExchange,
    updateHandWritingFormulaAreaResizeEvent:
      state.updateHandWritingFormulaAreaResizeEvent,
    updateHandWritingFormulaAreaSize: state.updateHandWritingFormulaAreaSize,
    handWritingFormulaAreaWidth:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .width,
    handWritingFormulaAreaHeight:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num]
        .height,
    handWritingFormulaAreaAnchorX:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num].x,
    handWritingFormulaAreaAnchorY:
      state.textFile[props.textfilenum].handWritingFormulaAreas[props.num].y,
    updateHandWritingFormulaAreaBackgroundWord:
      state.updateHandWritingFormulaAreaBackgroundWord
  };
})
@observer
export default class HandWritingFormulaAreaWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      prevEndRangeRow: 0,
      prevEndRangeColumn: 0
    };
  }
  handleMouseDownOrTouchStart = () => {
    this.props.editor.blur();
  };
  handleExchange = () => {
    const bool = this.props.handWritingFormulaAreaExchange;
    this.props.updateHandWritingFormulaAreaExchange(this.props.num, !bool);
  };
  handleMouseAndTouchDownResize = e => {
    e.preventDefault();
    this.props.editor.blur();
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
    const editor = this.props.editor;
    const searchWord = this.props
      .activeTextFileHandWritingFormulaAreaBackgroundWord;
    editor.$search.setOptions({ needle: searchWord, regExp: false });
    const range = editor.$search.find(editor.session);
    this.setState({
      prevEndRangeRow: range.end.row,
      prevEndRangeColumn: range.end.column
    });
  };
  handleMouseAndTouchMoveResize = e => {
    if (e.buttons === 0) {
      this.handleMouseAndTouchUpResize(e);
    } else {
      e.preventDefault();
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
      if (y - this.props.handWritingFormulaAreaAnchorY > 150) {
        this.props.updateHandWritingFormulaAreaSize(
          this.props.num,
          this.props.handWritingFormulaAreaWidth,
          y - this.props.handWritingFormulaAreaAnchorY
        );
      }
      if (x - this.props.handWritingFormulaAreaAnchorX > 280) {
        this.props.updateHandWritingFormulaAreaSize(
          this.props.num,
          x - this.props.handWritingFormulaAreaAnchorX,
          this.props.handWritingFormulaAreaHeight
        );
      }
    }
  };
  handleMouseAndTouchUpResize = e => {
    e.preventDefault();
    const x =
      this.props.handWritingFormulaAreaAnchorX +
      this.props.handWritingFormulaAreaWidth;
    const y =
      this.props.handWritingFormulaAreaAnchorY +
      this.props.handWritingFormulaAreaHeight;

    const editor = this.props.editor;
    const searchWord = `/*${this.props.num}*/`;
    editor.$search.setOptions({ needle: searchWord, regExp: false });
    const startRange = editor.$search.find(editor.session).start;
    const prevEndRange = {
      row: this.state.prevEndRangeRow,
      column: this.state.prevEndRangeColumn
    };
    const currentEndRange = { column: 0, row: 0 };
    currentEndRange.column =
      x - this.props.handWritingFormulaAreaAnchorX > 280
        ? editor.renderer.pixelToScreenCoordinates(x, y).column
        : editor.renderer.pixelToScreenCoordinates(
            this.props.handWritingFormulaAreaAnchorX + 280,
            y
          ).column;
    currentEndRange.row =
      y - this.props.handWritingFormulaAreaAnchorY > 150
        ? editor.renderer.pixelToScreenCoordinates(x, y).row
        : editor.renderer.pixelToScreenCoordinates(
            x,
            this.props.handWritingFormulaAreaAnchorY + 150
          ).row;
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
    const splitText = text.split('\n');
    for (let i = 0; i < splitText.length; i++) {
      if (splitText[i].indexOf(searchWord) === -1) {
        if (!/^[\n\s]+$/.test(splitText[i])) {
          prevEndRange.row -= splitText.length - i;
          prevEndRange.column = 0;
          break;
        }
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
          column: prevEndRange.column
        }
      },
      insertText
    );
    this.props.updateHandWritingFormulaAreaBackgroundWord(
      this.props.num,
      insertText
    );
    this.props.activeTextFileHandWritingFormulaAreaHandWritingFormulaEditor.resize();
    if (this.props.handWritingFormulaAreaExchange) {
      this.props.activeTextFileHandWritingFormulaAreaCodeEditor.resize();
    }
    this.props.updateHandWritingFormulaAreaResizeEvent(this.props.num, false);
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
      <div
        style={this.props.style}
        onMouseDown={this.handleMouseDownOrTouchStart}
        onTouchStart={this.handleMouseDownOrTouchStart}
      >
        <button
          touch-action="auto"
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
          num={this.props.num}
          textfilenum={this.props.textfilenum}
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
                textfilenum={this.props.textfilenum}
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
