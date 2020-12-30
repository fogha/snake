import React, { Component } from 'react';

import SnakeFood from '../food/SnakeFood';
import Snake from '../snake/Snake';


const getRandomFoodCoordinates = () => {
  let min = 1;
  let max = 98;
  let x = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;
  let y = Math.floor((Math.random() * (max - min + 1) + min) / 2) * 2;

  return [x, y]

}

class Game extends Component {

  state = {
    snakeDots: [
      [0, 0],
    ],
    snakeFood: getRandomFoodCoordinates(),
    direction: 'RIGHT',
    speed: 300,
  }

  componentDidMount() {
    this.setState({ speed: this.props.speed })
    setInterval(this.snakeMovement, this.state.speed)
    document.onkeydown = this.snakeControls
  }

  componentDidUpdate() {
    this.checkTouchingBorders();
    this.checkTouchSelf();
    this.checkEat();
  }

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

  checkTouchingBorders = () => {
    const { snakeDots } = this.state;
    let head = snakeDots[snakeDots.length - 1];
    if (head[0] >= 100 || head[0] < 0 || head[1] >= 100 || head[1] < 0) {
      this.gameOver()
    }
  }

  checkTouchSelf = () => {
    let snake = [...this.state.snakeDots];
    let head = snake[snake.length - 1];

    snake.pop();
    snake.forEach(dot => {
      if (head[0] == dot[0] && head[1] == dot[1]) this.gameOver()
    })
  }

  checkEat = () => {
    const { snakeDots, snakeFood } = this.state;
    let snake = snakeDots[snakeDots.length - 1];
    if (snake[0] === snakeFood[0] && snake[1] === snakeFood[1]) {
      this.setState({ snakeFood: getRandomFoodCoordinates() })
      this.enlargeSnake()
    }
  }

  enlargeSnake = () => {
    let newSnake = [...this.state.snakeDots];

    newSnake.unshift([]);
    this.setState({
      snakeDots: newSnake
    })
  }

  gameOver = () => {
    const { snakeDots } = this.state;

    alert(`Game Over! The snake length is ${snakeDots.length}`);
    this.setState({
      snakeDots: [
        [0, 0],
      ],
      snakeFood: getRandomFoodCoordinates(),
      direction: 'RIGHT',
      speed: 100,
    })
  }

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

  render() {
    const { snakeDots, snakeFood } = this.state;
    const { grid } = this.props;
    const style = {
      width: `${grid}px`,
      height: `${grid}px`
    }

    return (
      <div className="gameArea" style={style}>
          <Snake snakeDots={snakeDots} />
          <SnakeFood dots={snakeFood} />
      </div>

    );
  }

}

export default Game;
