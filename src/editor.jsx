import React from "react";
import AceEditor from "react-ace";

import "brace/mode/html";
import "brace/mode/javascript";
import "brace/mode/glsl";
import "brace/mode/css";
import "brace/theme/dawn";

import { inject, observer } from "mobx-react";

@inject("state")
@observer
export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.width = window.innerWidth;
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
  }
  componentWillUpdate() {
    this.props.state.updateDontExecute(true);
    const text = this.props.state.editor.getValue();
    this.props.state.updateActiveText(text);
  }
  shouldComponentUpdate(){
    return this.props.state.shouldEditorUpdate;
  }
  componentDidUpdate(nextProps) {
    this.editor.setValue(nextProps.state.activeTextFile.text);   
  }
  componentDidMount() {
    this.editor = this.refs.aceEditor.editor;
    this.editor.$blockScrolling = Infinity;
    this.props.state.updateEditor(this.editor);
    const self = this;
    const AceUndoManager = this.editor.session.$undoManager;
    AceUndoManager.execute = function(options) {
      if (self.props.state.dontExecute === false) {
        const activeId = self.props.state.activeTextFile.id;
        var deltaSets = options.args[0];
        this.$doc = options.args[1];
        if (options.merge && this.hasUndo()) {
          this.dirtyCounter[activeId]--;
          deltaSets = this.$undoStack[activeId].pop().concat(deltaSets);
        }
        this.$undoStack[activeId].push(deltaSets);
        this.$redoStack[activeId] = [];
        if (this.dirtyCounter[activeId] < 0) {
          this.dirtyCounter[activeId] = NaN;
        }
        this.dirtyCounter[activeId]++;
      } else {
        self.props.state.updateDontExecute(false);
      }
    };
    AceUndoManager.undo = function(dontSelect) {
      const activeId = self.props.state.activeTextFile.id;
      var deltaSets = this.$undoStack[activeId].pop();
      var undoSelectionRange = null;
      if (deltaSets) {
        undoSelectionRange = this.$doc.undoChanges(deltaSets, dontSelect);
        this.$redoStack[activeId].push(deltaSets);
        this.dirtyCounter[activeId]--;
      }
      return undoSelectionRange;
    };
    AceUndoManager.redo = function(dontSelect) {
      const activeId = self.props.state.activeTextFile.id;
      var deltaSets = this.$redoStack[activeId].pop();
      var redoSelectionRange = null;
      if (deltaSets) {
        redoSelectionRange = this.$doc.redoChanges(
          this.$deserializeDeltas(deltaSets),
          dontSelect
        );
        this.$undoStack[activeId].push(deltaSets);
        this.dirtyCounter[activeId]++;
      }
      return redoSelectionRange;
    };
    AceUndoManager.init = function() {
      this.$undoStack = [];
      this.$redoStack = [];
      this.dirtyCounter = [];
    };
    AceUndoManager.reset = function() {
      const activeId = self.props.state.activeTextFile.id;
      this.$undoStack[activeId] = [];
      this.$redoStack[activeId] = [];
      this.dirtyCounter[activeId] = 0;
    };
    AceUndoManager.hasUndo = function() {
      const activeId = self.props.state.activeTextFile.id;
      return this.$undoStack[activeId].length > 0;
    };
    AceUndoManager.hasRedo = function() {
      const activeId = self.props.state.activeTextFile.id;
      return this.$redoStack[activeId].length > 0;
    };
    AceUndoManager.markClean = function() {
      const activeId = self.props.state.activeTextFile.id;
      this.dirtyCounter[activeId] = 0;
    };
    AceUndoManager.isClean = function() {
      const activeId = self.props.state.activeTextFile.id;
      return this.dirtyCounter[activeId] === 0;
    };

    this.undoManager = AceUndoManager;
    this.undoManager.init();
    this.undoManager.reset();
    this.keyboardHandler = this.editor.getKeyboardHandler();
    this.keyboardHandler.addCommand({
      name: "undo-event",
      bindKey: { win: "Ctrl+z", mac: "Command+z" },
      exec: () => {
        try {
          this.undoManager.undo();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    this.keyboardHandler.addCommand({
      name: "redo-event",
      bindKey: { win: "Ctrl+Shift+z", mac: "Command+Shift+z" },
      exec: () => {
        try {
          this.undoManager.redo();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    this.keyboardHandler.addCommand({
      name: "unbra-event",
      bindKey: { win: "Alt+z", mac: "Option+z" },
      exec: () => {
        try {
          this.undoManager.unbra();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    this.keyboardHandler.addCommand({
      name: "rebra-event",
      bindKey: { win: "Alt+Shift+z", mac: "Option+Shift+z" },
      exec: () => {
        try {
          this.undoManager.rebra();
        } catch (e) {
          console.log(e);
        }
      },
      readOnly: true
    });
    window.addEventListener("resize", this.handleResize);
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
  }
  handleMouseMove(e) {
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      if (this.props.state.renderingObject[this.props.num + 1].scrolling) {
        const width = this.props.state.renderingObject[this.props.num].width;
        const diff = width - e.nativeEvent.clientX;
        const nextElementWidth = this.props.state.renderingObject[
          this.props.num + 1
        ].width;
        this.props.state.sizeChange(this.props.num, width - diff);
        this.props.state.sizeChange(
          this.props.num + 1,
          nextElementWidth + diff
        );
        if (
          this.props.state.renderingObject[this.props.num + 1].type ===
          "handWritingFormulaArea"
        ) {
          this.props.state.handWritingFormulaArea.resize();
        }
      }
    }
  }
  handleMouseUp() {
    if (this.props.state.renderingObject.length > this.props.num + 1) {
      this.props.state.scrolling(this.props.num + 1, false);
    }
  }
  render() {
    return (
      <div onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
        <AceEditor
          ref="aceEditor"
          style={this.props.style}
          mode={this.props.state.activeTextFile.type}
          theme="dawn"
          fontSize={23}
          editorProps={{
            $blockScrolling: Infinity
          }}
        />
      </div>
    );
  }
}
