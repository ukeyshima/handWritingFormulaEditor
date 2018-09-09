import { observable, computed, action } from 'mobx';

class State {
  @observable
  editorValue = '';
  @action.bound
  updateEditorValue(text) {
    this.editorValue = text;
  }
  @observable
  handWritingFormulaArea = null;
  @action.bound
  updateHandWritingFormulaArea(object) {
    this.handWritingFormulaArea = object;
  }
  @observable
  resultElement = null;
  @action.bound
  updateResultElement(object) {
    this.resultElement = object;
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
  renderingObject = [{ type: 'editor', width: window.innerWidth }];
  @action.bound
  sizeChange(num, width) {
    this.renderingObject[num].width = width;
  }
  @action.bound
  scrolling(num, bool) {
    this.renderingObject[num].scrolling = bool;
  }
  @action.bound
  pushRenderingObject(obj) {
    this.renderingObject.push(obj);
  }
  removeRenderingObject(type) {
    const target = this.renderingObject.find(e => e.type === type);
    const targetNum = this.renderingObject.indexOf(target);
    if (targetNum !== -1) {
      this.renderingObject.splice(targetNum, 1);
      const targetWidth = target.width;
      this.renderingObject[targetNum - 1].width +=
        type === 'run' ? targetWidth + 3 + 4 : targetWidth + 3;
    }
  }
  @observable
  runButtonColor = {
    backgroundColor: '#eee',
    fontColor: '#e38'
  };
  @action.bound
  updateRunButtonColor(obj) {
    this.runButtonColor = obj;
  }
  @observable
  formulaInCodeId = 0;
  @action.bound
  incrementFormulaInCodeId() {
    this.formulaInCodeId++;
  }
  @observable
  updateFormulaInCode = null;
  @action.bound
  updateUpdateFormulaInCode(func) {
    this.updateFormulaInCode = func;
  }
  @observable
  changeFormulaInCodeAnchor = null;
  @action.bound
  updateChangeFormulaInCodeAnchor(func) {
    this.changeFormulaInCodeAnchor = func;
  }
}

export default State;
