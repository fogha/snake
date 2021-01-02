import React, { Component } from 'react';
import Modal from 'react-modal';
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

const initialiseState = {
  snakeDots: [
    [0, 0],
  ],
  snakeFood: getRandomFoodCoordinates(),
  direction: 'RIGHT',
  speed: 200,
  grid: 500,
  points: 10,
  scores: [],
  pause: false,
  gameId: ''
}

class App extends Component {

  state = {
    snakeDots: [
      [0, 0],
    ],
    snakeFood: getRandomFoodCoordinates(),
    direction: 'RIGHT',
    speed: 200,
    grid: 500,
    points: 10,
    userName: '',
    scores: [],
    pause: false,    
    savedGames: [],
    loadGame: false,
    gameId: ''
  }

  componentDidMount() {
    this.getSavedGames()
    this.getHighScores()
    setInterval(this.snakeMovement, this.state.speed)
    document.onkeydown = this.snakeControls
  }

  componentDidUpdate() {
    this.checkTouchingBorders();
    this.checkTouchSelf();
    this.checkEat();
    this.getHighScores();
  }

  //getting all the games that have been saved
  getSavedGames = () => {
    fetch('/api').then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(data => {
      this.setState({
        savedGames: data
      })
      this.getUserOption()
    }).catch((error) => console.log(error))
  }

  //getting the username
  getUserName = () => {
    const { savedGames } = this.state;
    let uname = prompt('Enter user name');

    if (uname === '' || uname === ' ') {
      uname = prompt('invalid name, please try again')
    } else {

      savedGames && savedGames.forEach(game => {
        if (game.name === uname) {
          uname = prompt('User name taken, please enter another')
        } else {
          this.setState({
            userName: uname
          })
        }
      });
    }

  }

  //getting what the user would want to do when the game is loaded
  getUserOption = () => {
    const { userName } = this.state;
    // eslint-disable-next-line no-restricted-globals
    let res = prompt("Choose an action from the list below \n'1' to start a new game, \n'2' to load a saved Game");

    if (res === '1') {
      if(userName === '') this.getUserName()
    } else if( res === '2') {
      if(userName === '') {
        let uname = prompt('Enter the username used to save the game');
        this.setState({
          userName: uname,
          loadGame: true,
          pause: true
        })

      } else {
        this.setState({
          loadGame: true,
          pause: true
        })
     }
    } else {
      res = prompt("Invalid option, try again \n'1' to start a new game, \n'2' to load a saved Game");
    } 
  }

  //Getting direction based on arrow key pressed
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
    if (head && (head[0] >= 100 || head[0] < 0 || head[1] >= 100 || head[1] < 0)) {
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
    if (snake && (snake[0] === snakeFood[0] && snake[1] === snakeFood[1])) {
      let newSnake = [...this.state.snakeDots];
      newSnake.unshift([]);
 
      this.setState({
        snakeFood: getRandomFoodCoordinates(),
        points: points + 10,
        snakeDots: newSnake
      })
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

  //function to end the game
  gameOver = () => {
    const { points, userName } = this.state;
    this.setState(
      initialiseState
    )
    fetch('/api/create', {
      method: 'POST',
      body: JSON.stringify({
        name: userName,
        points: points,
        snake: [],
        completed: 1
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then(res => res.json())
      .then(res => {
        if (res.httpCode === '201') {
          alert(res.message);
          this.getUserOption();
        }
      }).catch(() => alert('Failed to save game'))
  }

  //GEtting the highest scores to be displayed
  getHighScores = () => {
    fetch('/api/leaderboard').then(response => {
      if (response.ok) {
        return response.json();
      }
    }).then(data => {
      this.setState({
        scores: data
      })
    }).catch((error) => {
      console.log(error);
    })
  }

  //Moving the snake when the arrow keys are pressed
  snakeMovement = () => {
    const { pause } = this.state
    if (pause == false) {
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
  }

  //Configurations that can be done on the game
  gameSettings = (type) => {
    const { speed, grid } = this.state;

    switch (type) {
      case "inc":
        if (speed > 50) {

          let newSpeed = speed - 50;
          this.setState({ speed: newSpeed })
        } 
        break;
    
      case "dec":
        speed < 300 && this.setState({ speed: speed + 50 })
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
  } 

  //Saving the game in order to continue later
  onClickSave = () => {
    const { points, snakeDots, userName, gameId } = this.state;

    if (gameId !== '') {
        return this.updateSavedGame()
      }

      fetch('/api/create', {
        method: 'POST',
        body: JSON.stringify({
          name: userName,
          points: points,
          snake: snakeDots,
          completed: 0
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8"
        }
      }).then(res => res.json())
        .then(res => {
          if (res.httpCode === '201') {
            this.setState(
              initialiseState
            );
            alert(res.message)
          }
        }).catch(() => alert('Failed to save game data'))
    
  }

  updateSavedGame = () => {
    const { gameId, userName, points, snakeDots } = this.state;

    fetch(`/api/update/${gameId}`, {
      method: 'POST',
      body: JSON.stringify({
        id: gameId,
        name: userName,
        points: points,
        snake: snakeDots,
        completed: 0
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8"
      }
    }).then(res => res.json())
      .then(res => {
        if (res.httpCode === '201') {
          this.setState(
            initialiseState
          );
          alert(res.message)
        }
      }).catch(() => alert('Failed to update game data'))
  }

  //closing the modal
  closeModal = () => {
    this.setState({ loadGame: false })
  }

  //load saved game into state
  loadGame = (game) => {
    console.log(game);
    this.setState({
      snakeDots: game.snake,
      points: game.points,
      pause: true,
      loadGame: false,
      gameId: game.id
    })
  }

  render() {
    const {
      grid, snakeDots, snakeFood, points, scores, pause, userName, speed, loadGame, savedGames
    } = this.state;

    const gameStyle = {
      width: `${grid + 350}px`,
      height: `${grid}px`
    }

    const customStyles = {
      content: {
        top: '20%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        width: '30%'
      }
    };
    
    return (
      <div className="snakeGame">
        <div className="gameArea" style={gameStyle}>
          <Snake snakeDots={snakeDots} />
          <SnakeFood dots={snakeFood} />
        </div>
        <div className="snakeGame__settings">
          <h2 className="snakeGame__header">Game Settings</h2>

          <div className="snakeGame__settingsBox">

            <div className="snakeGame__gameInfo">
              <p>Points: {points}</p>
              <p>User: {userName}</p>
              <p>Speed: {speed}</p>
              <p>Grid size: {grid}</p>
            </div>

            <button className="snakeGame__infoButtons inc" onClick={() => this.gameSettings('inc')}>Increase Speed</button>
            <button className="snakeGame__infoButtons incSize" onClick={() => this.gameSettings('incSize')}>Increase Size</button>
            <button className="snakeGame__infoButtons dec" onClick={() => this.gameSettings('dec')}>Decrease Speed</button>
            <button className="snakeGame__infoButtons decSize" onClick={() => this.gameSettings('decSize')}>Decrease Size</button>

            <div className="snakeGame__controls">
              <button className="snakeGame__infoButtons save" onClick={() => this.setState({ pause: !pause })}> Play/Pause</button>
              <button className="snakeGame__infoButtons save" onClick={() => this.onClickSave()}> Save Game </button>
            </div>

            <div className="leaderboard">
              {
                scores && scores.length === 0 ? (
                  <div className="modal__noGame">
                    <h2>No scores on leaderboard yet</h2>
                  </div>
                ) : (
                    scores.map((score, i) => {
                      if (i < 11) {
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
                }))
                
              }
            </div>
            
            <div id="modal">
              <Modal
                isOpen={loadGame}
                onRequestClose={this.closeModal} 
                style={customStyles}
                contentLabel="Load Game"
                ariaHideApp={false}
              >
                <div className="modal__headerBox">
                  <h2 className="modal__header">Load Game</h2>
                  <button className="modal__close" onClick={() => this.closeModal()}>x</button>
                </div>
                
                <div>
                  {
                    savedGames.map((game, i) => {
                      console.log(game);
                      if (game.name === userName && game.completed === 0) {
                        const name = game.name;
                        const points = game.points;
                        console.log(name, points);
                        return (
                          <div key={i} role="Presentation" onClick={() => this.loadGame(game)} className="loadGame__button">
                            <p>{name}</p>
                            <p>{points}</p>
                          </div>                          
                        )
                      }
                    }) 
                  }
                </div>
              </Modal>
            </div>
          </div>
        </div>
      </div>
      
    );
  }
 
}

export default App;
