import { observable, computed, action } from "mobx";

class State {
  @observable handWritingFormulaArea=null;
  @action.bound
  updateHandWritingFormulaArea(object){
    this.handWritingFormulaArea=object;
  }
  @observable customizeState={
    space:false,
    indention:false,
    symbol:false,
    number:false,
    input : false,
    interruption : false,
    event :false,
    word:false
  }
  @action.bound
  updateCustomizeState(object){
    this.customizeState=object;
  }
  @observable dontExecute=false;
  @action.bound
  updateDontExecute(bool){
    this.dontExecute=bool;
  }
  @observable executeHTML=null;
  @action.bound updateExecuteHTML(func){
    this.executeHTML=func;
  }
  @observable runButton=null;
  @action.bound
  updateRunButton(element){
    this.runButton=element;
  }
  @observable stopButton=null;
  @action.bound
  updateStopButton(element){
    this.stopButton=element;
  }
  @observable hotReload = false;
  @action.bound
  updateHotReload(bool) {
    this.hotReload = bool;
  }
  @observable editor;
  @action.bound
  updateEditor(editor) {
    this.editor = editor;
  }
  @observable iframeElement = null;
  @action.bound
  updateIframeElement(element) {
    this.iframeElement = element;
  }
  @observable
  textFile = [
    { id: 0, type: "html", fileName: "index.html", removed: false, text: "" }
  ];
  @action.bound
  pushTextFile(file) {
    if (
      !this.textFile.some(e => {
        return e.fileName === file.fileName;
      })
    ){
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
  @observable activeTextFile = this.textFile[0];
  @action.bound
  changeActiveTextFile(file) {
    this.activeTextFile = file;
  }
  @action.bound
  updateActiveText(text) {
    this.activeTextFile.text = text;
  }
  @observable id = 0;
  @action.bound
  incrementId() {
    this.id++;
  }
  @observable renderingObject = [{ type: "editor", width: window.innerWidth }];
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
        type === "run" ? targetWidth + 3 + 4 : targetWidth + 3;
    }
  }
  @observable
  runButtonColor = {
    backgroundColor: "#eee",
    fontColor: "#e38"
  };
  @action.bound
  updateRunButtonColor(obj) {
    this.runButtonColor = obj;
  }
}

export default State;
