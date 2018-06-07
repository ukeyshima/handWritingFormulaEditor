//export to "renderingObject.jsx"
import React from "react";
import ReactDOM from "react-dom";
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
    this.handleUndo=this.handleUndo.bind(this);
    this.handleRedo=this.handleRedo.bind(this);
    this.handleInsert=this.handleInsert.bind(this);
    this.width = window.innerWidth;
    this.state={
      code:""
    }
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
    this.refs.editor.addEventListener("exported", e => {
      const exports = e.detail.exports;
      if (exports && exports["application/x-latex"]) {
        convertElement.disabled = false;
        katex.render(cleanLatex(exports["application/x-latex"]), resultElement);
        resultElement.innerHTML =
          "<span>" + exports["application/x-latex"] + "</span>";  
          console.log(latex2js(exports["application/x-latex"]));
          this.setState({
            code:latex2js(exports["application/x-latex"])
          })
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
  handleMouseUp(e) {
    if (this.props.state.renderingObject[this.props.num].scrolling) {
      this.props.state.renderingObject[this.props.num].scrolling = false;
    }
  }
  handleConvert(e) {
    this.editor.convert();
  }
  handleUndo(){
    this.editor.undo();
  }
  handleRedo(){
    this.editor.redo();
  }
  handleInsert(){
    this.props.state.editor.insert(this.state.code);   
  }
  render() {
    return (
      <div
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        style={this.props.style}
        ref="handWritingFormulaArea"
      >
        <div ref="result" id="result">          
        </div>
        <button className="handWritingFormulaAreaButton" id="convertButton" ref="convert" onClick={this.handleConvert}>
            convert
        </button>
        <button className="handWritingFormulaAreaButton" id="undoButton" ref="undo" onClick={this.handleUndo}>
            undo
        </button>
        <button className="handWritingFormulaAreaButton" id="redoButton" ref="redo" onClick={this.handleRedo}>
            redo
        </button>
        <button className="handWritingFormulaAreaButton" id="insertButton" ref="insert" onClick={this.handleInsert}>
          insert
          </button>
        <div id="handWritingFormulaEditor" ref="editor"/>
      </div>
    );
  }
}
