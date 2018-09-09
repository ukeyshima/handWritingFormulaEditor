//export to "renderingObject.jsx"
import React from 'react';
import { inject, observer } from 'mobx-react';
import * as MyScriptJS from 'myscript';
import 'myscript/dist/myscript.min.css';
import latexToJs from './latexTojs';
import 'katex/dist/katex.min.css';
import katex from 'katex';
import { FaReply } from 'react-icons/fa';
import { FaShare } from 'react-icons/fa';
import { FaSyncAlt } from 'react-icons/fa';
import { MdKeyboardReturn } from 'react-icons/md';

@inject('state')
@observer
export default class HandWritingFormulaArea extends React.Component {
  constructor(props) {
    super(props);
    this.handleResize = this.handleResize.bind(this);
    this.handleConvert = this.handleConvert.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleRedo = this.handleRedo.bind(this);
    this.handleInsert = this.handleInsert.bind(this);
    this.handleResizeRowMouseDown = this.handleResizeRowMouseDown.bind(this);
    this.handleResizeRowMouseMove = this.handleResizeRowMouseMove.bind(this);
    this.handleResizeRowMouseUp = this.handleResizeRowMouseUp.bind(this);
    this.width = window.innerWidth;
    this.state = {
      resultHeight: window.innerHeight * 0.2,
      editorHeight: window.innerHeight * 0.8 - 112,
      mouseMoveStartY: 0,
      mouseMoveStartResultHeight: 0,
      mouseMoveStartEditorHeight: 0
    };
  }
  cleanLatex(latexExport) {
    if (latexExport.includes('\\\\')) {
      const steps = '\\begin{align*}' + latexExport + '\\end{align*}';
      return steps
        .replace('\\overrightarrow', '\\vec')
        .replace('\\begin{aligned}', '')
        .replace('\\end{aligned}', '')
        .replace('\\llbracket', '\\lbracket')
        .replace('\\rrbracket', '\\rbracket')
        .replace('\\widehat', '\\hat')
        .replace(new RegExp('(align.{1})', 'g'), 'aligned');
    }
    return latexExport
      .replace('\\overrightarrow', '\\vec')
      .replace('\\llbracket', '\\lbracket')
      .replace('\\rrbracket', '\\rbracket')
      .replace('\\widehat', '\\hat')
      .replace(new RegExp('(align.{1})', 'g'), 'aligned');
  }
  componentDidMount() {
    window.addEventListener('resize', this.handleResize);
    this.editor = MyScriptJS.register(this.refs.editor, {
      recognitionParams: {
        type: 'MATH',
        protocol: 'WEBSOCKET',
        apiVersion: 'V4',
        server: {
          scheme: 'https',
          host: 'webdemoapi.myscript.com',
          applicationKey: '331b4bdf-7ace-4265-94f1-b01504c78743',
          hmacKey: '44f4f4ce-fd0f-48a1-b517-65d2b9465413'
        },
        v4: {
          math: {
            mimeTypes: ['application/x-latex'],
            solver: {
              enable: false
            }
          },
          text: {
            guides: {
              enable: false
            },
            smartGuide: false
          }
        }
      }
    });
    this.props.state.updateHandWritingFormulaArea(this.editor);
    this.props.state.updateResultElement(this.refs.result);
    const resultElement = this.refs.result;
    const convertElement = this.refs.convert;
    this.editor.export_('image/png');
    this.refs.editor.addEventListener('exported', e => {
      const exports = e.detail.exports;
      if (exports && exports['application/x-latex']) {
        convertElement.disabled = false;
        katex.render(
          this.cleanLatex(exports['application/x-latex']),
          resultElement,
          {
            throwOnError: false
          }
        );
        this.code = latexToJs(this.cleanLatex(exports['application/x-latex']));
        this.latex = this.cleanLatex(exports['application/x-latex']);
      } else if (exports && exports['application/mathml+xml']) {
        convertElement.disabled = false;
        // resultElement.innerText = exports["application/mathml+xml"];
      } else if (exports && exports['application/mathofficeXML']) {
        convertElement.disabled = false;
        // resultElement.innerText = exports["application/mathofficeXML"];
      } else {
        convertElement.disabled = true;
        resultElement.innerHTML = '';
      }
    });
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
  handleResize(e) {
    let diff = -3;
    this.props.state.renderingObject.forEach(e => {
      diff += 3;
      if (e.type == 'run') {
        diff += 4;
      }
    });
    const per = (window.innerWidth - diff) / (this.width - diff);
    const width = this.props.state.renderingObject[this.props.num].width;
    this.props.state.sizeChange(this.props.num, width * per);
    this.width = window.innerWidth;
    this.editor.resize();
  }
  handleConvert() {
    this.editor.convert();
  }
  handleClear() {
    this.editor.clear();
  }
  handleUndo() {
    this.editor.undo();
  }
  handleRedo() {
    this.editor.redo();
    console.log(this.editor.model);
  }
  handleInsert() {
    const editor = this.props.state.editor;
    const selection = editor.getSelection();
    const startRange = selection.getCursor();
    const startPosition = editor.renderer.textToScreenCoordinates(startRange);
    const id = this.props.state.formulaInCodeId;
    const searchWord = `${this.code}/*${id}*/`;
    editor.insert(searchWord);
    const splitCode = searchWord.split(/\r\n|\r|\n/);
    const maxLengthWord = splitCode.reduce((prev, next) => {
      return prev.length > next.length ? prev : next;
    });
    editor.$search.setOptions({ needle: maxLengthWord, regExp: false });

    const endRange = editor.$search.findAll(editor.session)[0].end;
    const endPosition = editor.renderer.textToScreenCoordinates(endRange);
    const svgString = new XMLSerializer().serializeToString(
      document.getElementById('MODEL-viewTransform').parentNode
    );
    const svg = new Blob([svgString], { type: 'image/svg+xml' });
    const DOMURL = window.URL || window.webkitURL || window;
    const url = DOMURL.createObjectURL(svg);
    const object = {
      width: endPosition.pageX - startPosition.pageX,
      height:
        ((endPosition.pageX - startPosition.pageX) /
          this.refs.editor.clientWidth) *
        this.refs.editor.clientHeight,
      x: startPosition.pageX,
      y: startPosition.pageY,
      url: url,
      visible: true,
      svgElement: document
        .getElementById('MODEL-viewTransform')
        .cloneNode(true),
      latex: this.latex,
      // model: Object.assign({}, this.editor.model)
      editor: (() => {
        const result = {};
        for (var i in this.editor) {
          result[i] = Object.assign({}, this.editor[i]);
        }
        console.log(result);
        return result;
      })()
      // Object.getOwnPropertyNames(this.editor).reduce((prev, curr) => {
      //   const descriptor = Object.getOwnPropertyDescriptor(this.editor, curr);
      //   Object.defineProperty(prev, curr, descriptor);
      //   return prev;
      // }, {})
      //Object.assign({}, this.editor)
    };
    this.props.state.updateFormulaInCode(object);
    editor.session.on('change', e => {
      editor.$search.setOptions({ needle: searchWord, regExp: false });
      const range = editor.$search.findAll(editor.session);
      if (range.length > 0) {
        const position = editor.renderer.textToScreenCoordinates(
          range[0].start
        );
        this.props.state.changeFormulaInCodeAnchor(
          id,
          position.pageX,
          position.pageY,
          true
        );
      } else {
        this.props.state.changeFormulaInCodeAnchor(id, 0, 0, false);
      }
    });
    editor.session.on('changeScrollTop', e => {
      editor.$search.setOptions({ needle: searchWord, regExp: false });
      const range = editor.$search.findAll(editor.session);
      if (range.length > 0) {
        const position = editor.renderer.textToScreenCoordinates(
          range[0].start
        );
        this.props.state.changeFormulaInCodeAnchor(
          id,
          position.pageX,
          position.pageY,
          true
        );
      }
    });
    editor.session.on('changeScrollLeft', e => {
      editor.$search.setOptions({ needle: searchWord, regExp: false });
      const range = editor.$search.findAll(editor.session);
      if (range.length > 0) {
        const position = editor.renderer.textToScreenCoordinates(
          range[0].start
        );
        this.props.state.changeFormulaInCodeAnchor(
          id,
          position.pageX,
          position.pageY,
          true
        );
      }
    });
  }
  handleResizeRowMouseDown(e) {
    document.body.addEventListener('mousemove', this.handleResizeRowMouseMove);
    document.body.addEventListener('touchmove', this.handleResizeRowMouseMove);
    document.body.addEventListener('mouseup', this.handleResizeRowMouseUp);
    document.body.addEventListener('touchend', this.handleResizeRowMouseUp);
    this.setState({
      mouseMoveStartY: e.hasOwnProperty('changedTouches')
        ? e.changedTouches[0].pageY
        : e.pageY,
      mouseMoveStartResultHeight: this.state.resultHeight,
      mouseMoveStartEditorHeight: this.state.editorHeight
    });
  }
  handleResizeRowMouseMove(e) {
    this.setState({
      resultHeight:
        this.state.mouseMoveStartResultHeight +
        e.pageY -
        this.state.mouseMoveStartY,
      editorHeight:
        this.state.mouseMoveStartEditorHeight -
        e.pageY +
        this.state.mouseMoveStartY
    });
    this.editor.resize();
  }
  handleResizeRowMouseUp() {
    document.body.removeEventListener(
      'mousemove',
      this.handleResizeRowMouseMove
    );
    document.body.removeEventListener(
      'touchmove',
      this.handleResizeRowMouseMove
    );
    document.body.removeEventListener('mouseup', this.handleResizeRowMouseUp);
    document.body.removeEventListener('touchend', this.handleResizeRowMouseUp);
  }
  render() {
    return (
      <div
        style={this.props.style}
        ref="handWritingFormulaArea"
        id="handWritingFormulaArea"
      >
        <div
          ref="result"
          id="result"
          style={{ height: this.state.resultHeight }}
        />
        <button
          className="handWritingFormulaAreaButton"
          id="clearButton"
          ref="clear"
          onClick={this.handleClear}
          style={{ bottom: this.state.editorHeight + 2 }}
        >
          C
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="undoButton"
          ref="undo"
          onClick={this.handleUndo}
          style={{ bottom: this.state.editorHeight + 2 }}
        >
          <FaReply />
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="redoButton"
          ref="redo"
          onClick={this.handleRedo}
          style={{ bottom: this.state.editorHeight + 2 }}
        >
          <FaShare />
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="convertButton"
          ref="convert"
          onClick={this.handleConvert}
          style={{ bottom: this.state.editorHeight + 2 }}
        >
          <FaSyncAlt />
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="insertButton"
          ref="insert"
          onClick={this.handleInsert}
          style={{ bottom: this.state.editorHeight + 2 }}
        >
          <MdKeyboardReturn />
        </button>
        <div
          ref="resizeRowLine"
          id="resizeRowLine"
          onMouseDown={this.handleResizeRowMouseDown}
          onTouchStart={this.handleResizeRowMouseDown}
        />
        <div
          id="handWritingFormulaEditor"
          ref="editor"
          touch-action="none"
          style={{ height: this.state.editorHeight }}
        />
      </div>
    );
  }
}
