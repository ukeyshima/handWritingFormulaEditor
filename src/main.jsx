import './style.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import RunAndStop from './runAndStop.jsx';
import RenderingObject from './renderingObject.jsx';
import 'pepjs';
import Header from './header.jsx';
import Tab from './tab.jsx';
import { Provider, inject, observer } from 'mobx-react';
import State from './store.js';

// var ctlKey = false;
// document.addEventListener('keydown', function(e) {
//   console.log(e);
//   if (e.ctrlKey) ctlKey = true;
//   if ((e.which || e.keyCode) == 82 && ctlKey) e.preventDefault();
//   if ((e.which || e.keyCode) == 116) e.preventDefault();
// });
// document.addEventListener('keyup', function(e) {
//   if (e.ctrlKey) ctlKey = false;
// });

const stores = {
  state: new State()
};

class HandWritingFormulaEditor extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Provider {...stores}>
          <React.Fragment>
            <Header />
            <RunAndStop />
            <Tab />
            <RenderingObject />
          </React.Fragment>
        </Provider>
      </React.Fragment>
    );
  }
}

ReactDOM.render(<HandWritingFormulaEditor />, document.getElementById('root'));
