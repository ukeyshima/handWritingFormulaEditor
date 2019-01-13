import style from './style.scss';
import React from 'react';
import ReactDOM from 'react-dom';
import RunAndStop from './runAndStop';
import RenderingObject from './renderingObject';
import 'pepjs';
import Header from './header';
import Tab from './tab';
import { Provider, inject, observer } from 'mobx-react';
import State from './store.js';

const stores = {
  state: new State()
};

class HandWritingFormulaEditor extends React.Component {
  componentDidMount() {
    style.use();
  }
  componentWillUnmount() {
    style.unuse();
  }
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
