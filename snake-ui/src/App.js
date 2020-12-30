import React, { Component } from 'react';
import './App.css';

import Game from './components/game/Game'

class App extends Component {

  state = {
    speed: 300,
    grid: 500
  }

  gameSettings = (type) => {
    const { speed, grid } = this.state;
    switch (type) {
      case "inc":
        if (speed > 100) {
          console.log("inc");
          let newSpeed = speed - 100;
          this.setState({ speed: newSpeed })
        } 
        break;
    
      case "dec":
        speed < 300 && this.setState({ speed: speed + 100 })
        break;
      
      case "incSize":
        grid < 700 && this.setState({ grid: grid + 200 })
        break;

      case "decSize":
        grid > 300 && this.setState({ grid: grid - 200 })
        break;

      default:
        break;
    }

    console.log(this.state);
  } 

  render() {
    const { speed, grid } = this.state;
    
    return (
      <div className="snakeGame">
        <Game speed={speed} grid={grid}/>
        <div className="snakeGame__settings">
          <h2 className="snakeGame__header">Game Settings</h2>

          <div className="snakeGame__settingsBox">
            <button onClick={() => this.gameSettings('inc')}>Increase Speed</button>
            <button onClick={() => this.gameSettings('dec')}>Decrease Speed</button>
            <button onClick={() => this.gameSettings('incSize')}>Increase Size</button>
            <button onClick={() => this.gameSettings('decSize')}>Decrease Size</button>
          </div>
        </div>
      </div>
      
    );
  }
 
}

export default App;
