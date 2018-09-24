import React from 'react';
import { inject, observer } from 'mobx-react';

@inject('state')
@observer
export default class TextFileButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseEnter: false,
      deleteMouseEnter: false
    };
  }
  handleMouseEnter = () => {
    this.setState({
      mouseEnter: true,
      deleteMouseEnter: false
    });
  };
  handleMouseLeave = () => {
    this.setState({
      mouseEnter: false,
      deleteMouseEnter: false
    });
  };
  handleDeleteMouseEnter = () => {
    this.setState({
      deleteMouseEnter: true
    });
  };
  handleDeleteMouseLeave = () => {
    this.setState({
      deleteMouseEnter: false
    });
  };
  handleClick = (fileName, e) => {
    if (e.target.id !== 'delete') {
      const hotReloadFlag = this.props.state.hotReload;
      this.props.state.updateHotReload(false);
      const undoManager = this.props.state.editor.session.$undoManager;
      let undoStack = undoManager.$undoStack.concat();
      let redoStack = undoManager.$redoStack.concat();
      this.props.state.updateActiveUndoStack(undoStack);
      this.props.state.updateActiveRedoStack(redoStack);

      const text = this.props.state.editor.getValue();
      this.props.state.updateActiveText(text);
      this.props.state.editor.setValue('');
      this.props.state.updateEditorValue('');
      const textFile = this.props.state.textFile;
      const activeFile = textFile.find(e => {
        return e.fileName === fileName;
      });
      this.props.state.changeActiveTextFile(activeFile);
      this.props.state.updateEditorValue(activeFile.text);

      setTimeout(() => {
        const undoStack = activeFile.undoStack;
        const redoStack = activeFile.redoStack;
        this.props.state.editor.session.$undoManager.reset();
        this.props.state.editor.session.$undoManager.$undoStack = undoStack;
        this.props.state.editor.session.$undoManager.$redoStack = redoStack;
        this.props.state.handWritingFormulaAreas.forEach((e, i) => {
          const searchWord = `/*${i}*/`;
          this.props.state.editor.$search.setOptions({
            needle: searchWord,
            regExp: false
          });
          const range = this.props.state.editor.$search.findAll(
            this.props.state.editor.session
          );
          if (range.length > 0) {
            const position = this.props.state.editor.renderer.textToScreenCoordinates(
              range[0].start
            );
            this.props.state.updateHandWritingFormulaAreaAnchor(
              i,
              this.props.state.handWritingFormulaAreas[i].x,
              position.pageY
            );
            this.props.state.updateHandWritingFormulaAreaVisible(i, true);
          } else {
            this.props.state.updateHandWritingFormulaAreaVisible(i, false);
          }
        });
      }, 1);
      if (hotReloadFlag) {
        this.props.state.updateHotReload(hotReloadFlag);
        const textFIle = this.props.state.textFile;
        this.props.state.executeHTML(textFIle);
      }
    }
  };
  handleDeleteClick = fileName => {
    const hotReloadFlag = this.props.state.hotReload;
    this.props.state.updateHotReload(false);
    const textFile = this.props.state.textFile;
    const activeFile =
      this.props.state.activeTextFile.fileName === fileName
        ? textFile[0]
        : this.props.state.activeTextFile;
    this.props.state.updateEditorValue(activeFile.text);
    this.props.state.changeActiveTextFile(activeFile);
    const undoManager = this.props.state.editor.session.$undoManager;
    const undoStack = undoManager.$undoStack.concat();
    const redoStack = undoManager.$redoStack.concat();
    this.props.state.updateActiveUndoStack(undoStack);
    this.props.state.updateActiveRedoStack(redoStack);
    undoManager.reset();
    const targetFile = textFile.find((e, i) => {
      return e.fileName === fileName;
    });
    this.props.state.removeTextFile(targetFile);
    setTimeout(() => {
      undoManager.reset();
      const undoStack = this.props.state.activeTextFile.undoStack;
      const redoStack = this.props.state.activeTextFile.redoStack;
      this.props.state.editor.session.$undoManager.$undoStack = undoStack;
      this.props.state.editor.session.$undoManager.$redoStack = redoStack;
    }, 1);
    if (hotReloadFlag) {
      this.props.state.updateHotReload(hotReloadFlag);
      const textFIle = this.props.state.textFile;
      this.props.state.executeHTML(textFIle);
    }
  };

  render() {
    return (
      <button
        style={(() => {
          const active =
            this.props.state.activeTextFile.fileName === this.props.fileName;
          const mouseEnter = this.state.mouseEnter;
          return {
            color: active
              ? mouseEnter
                ? '#000'
                : '#fff'
              : mouseEnter
                ? ' rgb(0, 185, 158)'
                : '#000',
            backgroundColor: active ? ' rgb(0, 185, 158)' : '#ccc'
          };
        })()}
        onMouseLeave={this.handleMouseLeave}
        onMouseEnter={this.handleMouseEnter}
        onClick={e => this.handleClick(this.props.fileName, e)}
      >
        {(() => {
          if (this.props.fileName !== 'index.html') {
            return (
              <p
                id="delete"
                onMouseEnter={this.handleDeleteMouseEnter}
                onMouseLeave={this.handleDeleteMouseLeave}
                style={(() => {
                  const active =
                    this.props.state.activeTextFile.fileName ===
                    this.props.fileName;
                  const mouseEnter = this.state.mouseEnter;
                  const deleteMouseEnter = this.state.deleteMouseEnter;
                  return {
                    color: active
                      ? mouseEnter
                        ? deleteMouseEnter
                          ? '#fff'
                          : '#000'
                        : deleteMouseEnter
                          ? '#000'
                          : '#fff'
                      : mouseEnter
                        ? deleteMouseEnter
                          ? '#000'
                          : ' rgb(0, 185, 158)'
                        : deleteMouseEnter
                          ? ' rgb(0, 185, 158)'
                          : '#000',
                    margin: '0 10px 0 0',
                    float: 'left'
                  };
                })()}
                onClick={() => this.handleDeleteClick(this.props.fileName)}
              >
                ×
              </p>
            );
          }
        })()}
        <p
          style={{
            margin: 0,
            float: 'left'
          }}
        >
          {this.props.fileName}
        </p>
      </button>
    );
  }
}
