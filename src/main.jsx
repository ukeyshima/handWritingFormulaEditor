import "./style.scss";
import React from "react";
import ReactDOM from "react-dom";
import RunAndStop from "./runAndStop.jsx";
import RenderingObject from "./renderingObject.jsx";
import Header from "./header.jsx";
import Tab from "./tab.jsx";
import { Provider, inject, observer } from "mobx-react";
import State from "./store.js";
import registerServiceWorker from './registerServiceWorker';

const stores = {
  state: new State()
};

class HandWritingFormulaEditor extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Provider {...stores}>
        <React.Fragment>
          <Header />
          <RunAndStop />
          <Tab />
          <RenderingObject />
        </React.Fragment>
      </Provider>
    );
  }
}


ReactDOM.render(  
    <HandWritingFormulaEditor/>,
  document.getElementById("root")
);
registerServiceWorker();