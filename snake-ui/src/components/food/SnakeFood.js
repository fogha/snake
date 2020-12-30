import React from 'react'

export default function SnakeFood({ dots }) {

  const style = {
    left: `${dots[0]}%`,
    top: `${dots[1]}%`
  }

  return (
    <div className="snakeFood" style={style}></div>
  )
}
