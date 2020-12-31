import React, { Component } from 'react';
import './App.css';

import SnakeFood from './components/food/SnakeFood';
import Snake from './components/snake/Snake';

const getRandomFoodCoordinates = () => {
  let min = 1;
  let max = 98;
  let x = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;
  let y = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;

  return [x, y];
}

const initialState = {
  snakeDots: [
    [0, 0],
  ],
  snakeFood: getRandomFoodCoordinates(),
  direction: 'RIGHT',
  speed: 200,
  grid: 500,
  points: 10,
  gameName: '',
  scores: []
}

class App extends Component {

  state = {
    ...initialState,
    savedGames: []
  }

  componentDidMount() {
    this.getSavedGames()
    this.getHighScores()
    this.setState({ speed: this.props.speed })
    setInterval(this.snakeMovement, this.state.speed)
    document.onkeydown = this.snakeControls
  }

  componentDidUpdate() {
    this.checkTouchingBorders();
    this.checkTouchSelf();
    this.checkEat();
    this.getHighScores()

  }

  //getting all the games that have been saved
  getSavedGames = () => {
    fetch('/api').then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(data => console.log(data))

  }

  //
  snakeControls = e => {
    e = e || window.event;

    switch (e.keyCode) {
      case 38:
        this.setState({ direction: 'UP' })
        break;

      case 40:
        this.setState({ direction: 'DOWN' })
        break;

      case 37:
        this.setState({ direction: 'LEFT' })
        break;

      case 39:
        this.setState({ direction: 'RIGHT' })
        break;

      default:
        break;
    }
  }

  //checking if snake collides with the borders
  checkTouchingBorders = () => {
    const { snakeDots } = this.state;
    let head = snakeDots[snakeDots.length - 1];
    if (head[0] >= 100 || head[0] < 0 || head[1] >= 100 || head[1] < 0) {
      this.gameOver()
    }
  }

  //checking if the snake touches itself
  checkTouchSelf = () => {
    let snake = [...this.state.snakeDots];
    let head = snake[snake.length - 1];

    snake.pop();
    snake.forEach(dot => {
      if (head[0] == dot[0] && head[1] == dot[1]) this.gameOver()
    })
  }

  //checking when the snake collides with the dot
  checkEat = () => {
    const { snakeDots, snakeFood, points } = this.state;
    let snake = snakeDots[snakeDots.length - 1];
    if (snake[0] === snakeFood[0] && snake[1] === snakeFood[1]) {
      this.setState({
        snakeFood: getRandomFoodCoordinates(),
        points: points + 10
      })
      this.enlargeSnake();
      this.increaseSpeed();
    }
  }

  //Making the snake grow each time it touches the dot
  enlargeSnake = () => {
    let newSnake = [...this.state.snakeDots];

    newSnake.unshift([]);
    this.setState({
      snakeDots: newSnake
    })
  }

  //Gradually increasing the speed of the game each time it touches the dot
  increaseSpeed = () => {
    const { speed } = this.state
    if (speed > 10) {
      this.setState({ speed: speed - 10 })
    }
  }

  //Ending the game
  gameOver = () => {
    const { points, savedGames } = this.state;
    this.setState({
      ...initialState,
      savedGames
    })
    fetch('/api/save-game', {
      method: 'POST',
      body: JSON.stringify({
        name: prompt("Enter Name to save the game"),
        points: points,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then(res => res.json())
      .then(res => {
        if (res.httpCode === 201) {
          this.setState({
            ...initialState,
            savedGames
          });
          alert(res.message)
        }
      })
  }

  getHighScores = () => {
    fetch('/api/leaderboard').then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(data => {
      console.log(data);
      this.setState({
        scores: data
      })
    })

  }

  //Moving the snake when the arrow keys are pressed
  snakeMovement = () => {
    const { direction } = this.state;
    let dots = [...this.state.snakeDots];
    let head = dots[dots.length - 1];

    switch (direction) {
      case 'RIGHT':
        head = [head[0] + 2, head[1]];
        break;

      case 'LEFT':
        head = [head[0] - 2, head[1]];
        break;

      case 'DOWN':
        head = [head[0], head[1] + 2];
        break;

      case 'UP':
        head = [head[0], head[1] - 2];
        break;

      default:
        break;
    }

    dots.push(head);
    dots.shift();
    this.setState({
      snakeDots: dots
    })
  }

  //Configurations that can be done on the game
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
        grid < 650 && this.setState({ grid: grid + 200 })
        break;

      case "decSize":
        grid > 450 && this.setState({ grid: grid - 200 })
        break;

      default:
        break;
    }

    console.log(this.state);
  } 

  //Saving the game in order to continue late
  onClickSave = () => {
    const { points, snakeDots, savedGames, gameName } = this.state;

    fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({
        name: gameName,
        points: points,
        snake: snakeDots
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then(res => res.json())
      .then(res => {
        if (res.httpCode === '201') {
          this.setState({
            ...initialState,
            savedGames
          })
          alert(res.message)
        }
      })
  }

  onChangeInput = () => {

  }

  render() {
    const { grid, snakeDots, snakeFood, points, scores } = this.state;
    const gameStyle = {
      width: `${grid}px`,
      height: `${grid}px`
    }
    
    return (
      <div className="snakeGame">
        <div className="gameArea" style={gameStyle}>
          <Snake snakeDots={snakeDots} />
          <SnakeFood dots={snakeFood} />
        </div>
        <div className="snakeGame__settings">
          <h2 className="snakeGame__header">Game Settings</h2>

          <div className="snakeGame__settingsBox">

            <p>Points: {points}</p>

            <button className="inc" onClick={() => this.gameSettings('inc')}>Increase Speed</button>
            <button className="incSize" onClick={() => this.gameSettings('incSize')}>Increase Size</button>
            <button className="dec" onClick={() => this.gameSettings('dec')}>Decrease Speed</button>
            <button className="decSize" onClick={() => this.gameSettings('decSize')}>Decrease Size</button>

            <div className="snakeGame__controls">
              <input type="text" placeholder="Enter game name" onChange={(e) => this.setState({ gameName: e.target.value}) } />
              <button className="save" onClick={() => this.onClickSave()}> Save Game </button>
            </div>

            <div className="leaderboard">
              {
                scores && scores.map((score, i) => {
                  if (i < 10) {
                    return (
                      <div key={i} className="snakeGame__leaderboard">
                        <p className="snakeGame__leaderboard-name">
                          {score.name}
                        </p>
                        <p className="snakeGame__leaderboard-points">
                          {score.points}
                        </p>
                      </div>
                    )
                  }
                })
              }
            </div>
            
          </div>
        </div>
      </div>
      
    );
  }
 
}

export default App;
