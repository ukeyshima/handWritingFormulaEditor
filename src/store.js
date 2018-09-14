import { observable, computed, action } from 'mobx';

class State {
  @observable
  tabChangeEvent = false;
  @action.bound
  updateTabChangeEvent(bool) {
    this.tabChangeEvent = bool;
  }
  @observable
  editorValue = '';
  @action.bound
  updateEditorValue(text) {
    this.editorValue = text;
  }
  @observable
  executeHTML = null;
  @action.bound
  updateExecuteHTML(func) {
    this.executeHTML = func;
  }
  @observable
  runButton = null;
  @action.bound
  updateRunButton(element) {
    this.runButton = element;
  }
  @observable
  stopButton = null;
  @action.bound
  updateStopButton(element) {
    this.stopButton = element;
  }
  @observable
  hotReload = false;
  @action.bound
  updateHotReload(bool) {
    this.hotReload = bool;
  }
  @observable
  editor = null;
  @action.bound
  updateEditor(editor) {
    this.editor = editor;
  }
  @observable
  iframeElement = null;
  @action.bound
  updateIframeElement(element) {
    this.iframeElement = element;
  }
  @observable
  textFile = [
    {
      id: 0,
      type: 'html',
      fileName: 'index.html',
      removed: false,
      text: '',
      undoStack: null,
      redoStack: null
    }
  ];
  @action.bound
  pushTextFile(file) {
    if (
      !this.textFile.some(e => {
        return e.fileName === file.fileName;
      })
    ) {
      this.editor.setValue(file.text);
      this.textFile.push(file);
      this.changeActiveTextFile(this.textFile[this.textFile.length - 1]);
    }
  }
  @action.bound
  removeTextFile(file) {
    const nextTextFile = this.textFile.filter(e => e !== file);
    this.textFile = nextTextFile;
  }
  @observable
  activeTextFile = this.textFile[0];
  @action.bound
  changeActiveTextFile(file) {
    this.activeTextFile = file;
  }
  @action.bound
  updateActiveText(text) {
    this.activeTextFile.text = text;
  }
  @action.bound
  updateActiveUndoStack(undoStack) {
    this.activeTextFile.undoStack = undoStack;
  }
  updateActiveRedoStack(redoStack) {
    this.activeTextFile.redoStack = redoStack;
  }
  @observable
  id = 0;
  @action.bound
  incrementId() {
    this.id++;
  }
  @observable
  runAreaRenderingFlag = false;
  @action.bound
  updateRunAreaRenderingFlag(bool) {
    this.runAreaRenderingFlag = bool;
  }
  @observable
  runAreaPosition = { x: window.innerWidth - 600, y: 100 };
  @action.bound
  updateRunAreaPosition(x, y) {
    this.runAreaPosition.x = x;
    this.runAreaPosition.y = y;
  }
  @observable
  runButtonColor = {
    backgroundColor: '#eee',
    fontColor: ' rgb(0, 185, 158)'
  };
  @action.bound
  updateRunButtonColor(obj) {
    this.runButtonColor = obj;
  }
  @observable
  handWritingFormulaAreas = [];
  @action.bound
  pushHandWritingFormulaAreas(obj) {
    this.handWritingFormulaAreas.push(obj);
  }
  @action.bound
  updateHandWritingFormulaAreaAnchor(num, x, y) {
    this.handWritingFormulaAreas[num].x = x;
    this.handWritingFormulaAreas[num].y = y;
  }
  @action.bound
  updateHandWritingFormulaAreaSize(num, width, height) {
    this.handWritingFormulaAreas[num].width = width;
    this.handWritingFormulaAreas[num].height = height;
  }
  @action.bound
  updateHandWritingFormulaAreaVisible(num, bool) {
    this.handWritingFormulaAreas[num].visible = bool;
  }
  @action.bound
  updateHandWritingFormulaAreaExchange(num, bool) {
    this.handWritingFormulaAreas[num].exchange = bool;
  }
  @action.bound
  updateHandWritingFormulaAreaCodeEditor(num, editor) {
    this.handWritingFormulaAreas[num].codeEditor = editor;
  }
  updateHandWritingFormulaAreaHandWritingFormulaEditor(num, editor) {
    this.handWritingFormulaAreas[num].handWritingFormulaEditor = editor;
  }
  @action.bound
  updateHandWritingFormulaAreaCode(num, code) {
    this.handWritingFormulaAreas[num].code = code;
  }
  @observable
  handWritingFormulaAreaId = 0;
  @action.bound
  incrementHandWritingFormulaAreaId() {
    this.handWritingFormulaAreaId++;
  }
}

export default State;
