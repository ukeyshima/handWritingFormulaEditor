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
    this.handleClick = this.handleClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleDeleteMouseEnter = this.handleDeleteMouseEnter.bind(this);
    this.handleDeleteMouseLeave = this.handleDeleteMouseLeave.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }
  handleMouseEnter() {
    this.setState({
      mouseEnter: true,
      deleteMouseEnter: false
    });
  }
  handleMouseLeave() {
    this.setState({
      mouseEnter: false,
      deleteMouseEnter: false
    });
  }
  handleDeleteMouseEnter() {
    this.setState({
      deleteMouseEnter: true
    });
  }
  handleDeleteMouseLeave() {
    this.setState({
      deleteMouseEnter: false
    });
  }
  handleClick(fileName, e) {
    if (e.target.id !== 'delete') {
      const undoManager = this.props.state.editor.session.$undoManager;
      const undoStack = undoManager.$undoStack.concat();
      const redoStack = undoManager.$redoStack.concat();
      this.props.state.updateActiveUndoStack(undoStack);
      this.props.state.updateActiveRedoStack(redoStack);
      undoManager.reset();
      const text = this.props.state.editor.getValue();
      this.props.state.updateActiveText(text);
      this.props.state.editor.setValue('');
      this.props.state.updateEditorValue('');
      const textFile = this.props.state.textFile;
      const activeFile = textFile.find(e => {
        return e.fileName === fileName;
      });
      this.props.state.changeActiveTextFile(activeFile);
      this.props.state.updateEditorValue(this.props.state.activeTextFile.text);

      setTimeout(() => {
        undoManager.reset();
        const undoStack = this.props.state.activeTextFile.undoStack;
        const redoStack = this.props.state.activeTextFile.redoStack;
        this.props.state.editor.session.$undoManager.$undoStack = undoStack;
        this.props.state.editor.session.$undoManager.$redoStack = redoStack;
        if (this.props.state.hotReload) {
          setTimeout(() => {
            this.executeHTML();
          }, 15);
        }
      }, 10);
    }
  }
  handleDeleteClick(fileName) {
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
      if (this.props.state.hotReload) {
        setTimeout(() => {
          this.props.state.updateActiveText(f);
          this.executeHTML();
        }, 15);
      }
    }, 10);
  }

  executeHTML() {
    const domParser = new DOMParser();
    let document_obj = null;
    const textFile = this.props.state.textFile;
    try {
      document_obj = domParser.parseFromString(textFile[0].text, 'text/html');
      if (document_obj.getElementsByTagName('parsererror').length) {
        document_obj = null;
      }
    } catch (e) {
      console.log(e);
    }
    if (document_obj) {
      const scripts = document_obj.getElementsByTagName('script');
      const links = document_obj.getElementsByTagName('link');
      for (let i = 0; i < scripts.length; i++) {
        if (scripts[i].src) {
          const targetOfJs = textFile.find(e => {
            return (
              e.fileName ===
              scripts[i].src.split('/')[scripts[i].src.split('/').length - 1]
            );
          });

          const blob = new Blob([targetOfJs.text], {
            type: 'application/javascript'
          });
          scripts[i].src = URL.createObjectURL(blob);
        } else {
          const targetOfNotJs = textFile.find(e => {
            return e.fileName === scripts[i].type;
          });
          scripts[i].text = targetOfNotJs.text;
        }
      }
      for (let i = 0; i < links.length; i++) {
        const targetOfCss = textFile.find(e => {
          return (
            e.type === 'css' &&
            links[i].rel === 'stylesheet' &&
            links[i].href.split('/')[links[i].href.split('/').length - 1] ===
              e.fileName
          );
        });
        if (targetOfCss) {
          const blob = new Blob([targetOfCss.text], { type: 'text/css' });
          links[i].href = URL.createObjectURL(blob);
        }
      }
      const blob = new Blob([document_obj.documentElement.outerHTML], {
        type: 'text/html'
      });
      this.props.state.iframeElement.contentWindow.location.replace(
        URL.createObjectURL(blob)
      );
    }
  }
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
                ? '#e38'
                : '#000',
            backgroundColor: active ? '#e38' : '#ccc'
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
                          : '#e38'
                        : deleteMouseEnter
                          ? '#e38'
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
