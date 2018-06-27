//export to "renderingObject.jsx"
import React from "react";
import { inject, observer } from "mobx-react";
import * as MyScriptJS from "myscript/src/myscript";
import "myscript/dist/myscript.min.css";
import latex2js from "./latexToJs";
import katex from "katex";

@inject("state")
@observer
export default class HandWritingFormulaArea extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.handleConvert = this.handleConvert.bind(this);
    this.handleClear = this.handleClear.bind(this);
    this.handleUndo = this.handleUndo.bind(this);
    this.handleRedo = this.handleRedo.bind(this);
    this.handleInsert = this.handleInsert.bind(this);
    this.width = window.innerWidth;
    this.state = {
      code: ""
    };
  }
  componentDidMount() {
    window.addEventListener("resize", this.handleResize);
    this.editor = MyScriptJS.register(this.refs.editor, {
      recognitionParams: {
        type: "MATH",
        protocol: "WEBSOCKET",
        apiVersion: "V4",
        server: {
          scheme: "https",
          host: "webdemoapi.myscript.com",
          applicationKey: "331b4bdf-7ace-4265-94f1-b01504c78743",
          hmacKey: "44f4f4ce-fd0f-48a1-b517-65d2b9465413"
        }
      }
    });
    this.props.state.updateHandWritingFormulaArea(this.editor);
    function cleanLatex(latexExport) {
      if (latexExport.includes("\\\\")) {
        const steps = "\\begin{align*}" + latexExport + "\\end{align*}";
        return steps
          .replace("\\overrightarrow", "\\vec")
          .replace("\\begin{aligned}", "")
          .replace("\\end{aligned}", "")
          .replace("\\llbracket", "\\lbracket")
          .replace("\\rrbracket", "\\rbracket")
          .replace("\\widehat", "\\hat")
          .replace(new RegExp("(align.{1})", "g"), "aligned");
      }
      return latexExport
        .replace("\\overrightarrow", "\\vec")
        .replace("\\llbracket", "\\lbracket")
        .replace("\\rrbracket", "\\rbracket")
        .replace("\\widehat", "\\hat")
        .replace(new RegExp("(align.{1})", "g"), "aligned");
    }
    const resultElement = this.refs.result;
    const convertElement = this.refs.convert;
    this.editor.export_("image/png");
    this.refs.editor.addEventListener("exported", e => {
      const exports = e.detail.exports;
      if (exports && exports["application/x-latex"]) {
        convertElement.disabled = false;
        katex.render(cleanLatex(exports["application/x-latex"]), resultElement);
        resultElement.innerHTML =
          "<span>" + exports["application/x-latex"] + "</span>";
        this.setState({
          code: latex2js(exports["application/x-latex"])
        });
      } else if (exports && exports["application/mathml+xml"]) {
        convertElement.disabled = false;
        resultElement.innerText = exports["application/mathml+xml"];
      } else if (exports && exports["application/mathofficeXML"]) {
        convertElement.disabled = false;
        resultElement.innerText = exports["application/mathofficeXML"];
      } else {
        convertElement.disabled = true;
        resultElement.innerHTML = "";
      }
    });
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  handleResize(e) {
    let diff = -3;
    this.props.state.renderingObject.forEach(e => {
      diff += 3;
      if (e.type == "run") {
        diff += 4;
      }
    });
    const per = (window.innerWidth - diff) / (this.width - diff);
    const width = this.props.state.renderingObject[this.props.num].width;
    this.props.state.sizeChange(this.props.num, width * per);
    this.width = window.innerWidth;
    this.editor.resize();
  }
  handleMouseMove(e) {
    if (this.props.state.renderingObject[this.props.num].scrolling) {
      const width = this.props.state.renderingObject[this.props.num].width;
      const diff =
        e.nativeEvent.clientX -
        this.refs.handWritingFormulaArea.getBoundingClientRect().left;
      const frontElementWidth = this.props.state.renderingObject[
        this.props.num - 1
      ].width;
      this.props.state.sizeChange(this.props.num - 1, frontElementWidth + diff);
      this.props.state.sizeChange(this.props.num, width - diff);
      this.editor.resize();
    }
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      if (this.props.state.renderingObject[this.props.num + 1].scrolling) {
        const width = this.props.state.renderingObject[this.props.num].width;
        const diff =
          this.refs.handWritingFormulaArea.getBoundingClientRect().right -
          e.nativeEvent.clientX;
        const nextElementWidth = this.props.state.renderingObject[
          this.props.num + 1
        ].width;
        this.props.state.sizeChange(
          this.props.num + 1,
          nextElementWidth + diff
        );
        this.props.state.sizeChange(this.props.num, width - diff);
        this.editor.resize();
      }
    }
  }
  handleMouseUp() {
    if (this.props.state.renderingObject[this.props.num].scrolling) {
      this.props.state.renderingObject[this.props.num].scrolling = false;
    }
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
  }
  handleInsert() {
    const editor = this.props.state.editor;
    const selection = editor.getSelection();
    const startRange = selection.getCursor();
    const startPosition = editor.renderer.textToScreenCoordinates(startRange);
    const id = this.props.state.formulaInCodeId;
    const searchWord = `${this.state.code}/*${id}*/`;
    editor.insert(searchWord);
    const endRange = selection.getCursor();
    const endPosition = editor.renderer.textToScreenCoordinates(endRange);
    const svgString = new XMLSerializer().serializeToString(
      document.getElementsByTagName("svg")[1]
    );
    const svg = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svg);
    const object = {
      width: endPosition.pageX - startPosition.pageX,
      height:
        ((endPosition.pageX - startPosition.pageX) /
          this.refs.editor.clientWidth *this.refs.editor.clientHeight),
      x: startPosition.pageX,
      y: startPosition.pageY,
      url: url,
      visible: true
    };
    this.props.state.updateFormulaInCode(object);    
    editor.session.on("change", e => {
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
    editor.session.on("changeScrollTop", e => { 
      editor.$search.setOptions({ needle: searchWord, regExp: false });
      const range = editor.$search.findAll(editor.session);
      const position = editor.renderer.textToScreenCoordinates(
        range[0].start
      );        
      this.props.state.changeFormulaInCodeAnchor(
        id,
        position.pageX,
        position.pageY,
        true
      );              
    });
    editor.session.on("changeScrollLeft", e => {
      editor.$search.setOptions({ needle: searchWord, regExp: false });
      const range = editor.$search.findAll(editor.session);
      const position = editor.renderer.textToScreenCoordinates(
        range[0].start
      );        
      this.props.state.changeFormulaInCodeAnchor(
        id,
        position.pageX,
        position.pageY,
        true
      );              
    });
  }
  render() {
    return (
      <div
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        style={this.props.style}
        ref="handWritingFormulaArea"
        id="handWritingFormulaArea"
      >
        <div ref="result" id="result" />
        <button
          className="handWritingFormulaAreaButton"
          id="clearButton"
          ref="clear"
          onClick={this.handleClear}
        >
          clear
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="undoButton"
          ref="undo"
          onClick={this.handleUndo}
        >
          undo
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="redoButton"
          ref="redo"
          onClick={this.handleRedo}
        >
          redo
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="convertButton"
          ref="convert"
          onClick={this.handleConvert}
        >
          convert
        </button>
        <button
          className="handWritingFormulaAreaButton"
          id="insertButton"
          ref="insert"
          onClick={this.handleInsert}
        >
          insert
        </button>
        <div id="handWritingFormulaEditor" ref="editor" />
      </div>
    );
  }
}
