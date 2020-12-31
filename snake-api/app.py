from flask import Flask, jsonify, request, json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import asc, desc

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///game.db"
db = SQLAlchemy(app)

class Game(db.Model):
  name = db.Column(db.Text, primary_key=True)
  points = db.Column(db.Integer, nullable=False)
  snake = db.Column(db.PickleType, nullable=False)

  def __str__(self):
    return f'{self.name} {self.points} {self.snake}'

class SaveGame(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.Text, nullable=False)
  points = db.Column(db.Integer, nullable=False)

  def __str__(self):
    return f'{self.name} {self.points}'


def game_serializer(game):
  return {
    'name': game.name,
    'points': game.points,
    'snake': game.snake
  }

def SaveGame_serializer(gameData):
  return {
    'name': gameData.name,
    'points': gameData.points,
  }


@app.route('/api', methods=['GET'])
def index():
  return jsonify([*map(game_serializer, Game.query.all())])

@app.route('/api/leaderboard', methods=['GET'])
def highScores():
  return jsonify([*map(SaveGame_serializer, SaveGame.query.order_by(desc(SaveGame.points)))])

@app.route('/api/create', methods=['POST'])
def create():
  game_data = json.loads(request.data)
  game = Game(name=game_data['name'], points=game_data['points'], snake=game_data['snake'])

  db.session.add(game)
  db.session.commit()
  
  return{
    "httpCode": "201",
    "message": "Game saved successfully"
  }

@app.route('/api/save-game', methods=['POST'])
def save():
  game_data = json.loads(request.data)
  game = SaveGame(name=game_data['name'], points=game_data['points'])

  db.session.add(game)
  db.session.commit()
  
  return{
    "httpCode": "201",
    "message": "Game data saved successfully"
  }

if __name__ == '__main__':
  app.run(debug=True)