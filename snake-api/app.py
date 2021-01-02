from flask import Flask, jsonify, request, json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import asc, desc

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///game.db"
db = SQLAlchemy(app)

class Game(db.Model):
  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.Text,)
  points = db.Column(db.Integer, nullable=False)
  snake = db.Column(db.PickleType)
  completed = db.Column(db.Integer, nullable=False)

  def __str__(self):
    return f'{self.id} {self.name} {self.points} {self.snake} {self.completed}'

def game_serializer(game):
  return {
    'id': game.id,
    'name': game.name,
    'points': game.points,
    'snake': game.snake,
    'completed': game.completed
  }

@app.route('/api', methods=['GET'])
def index():
  return jsonify([*map(game_serializer, Game.query.all())])

@app.route('/api/leaderboard', methods=['GET'])
def highScores():
  return jsonify([*map(game_serializer, Game.query.order_by(desc(Game.points)))])

@app.route('/api/create', methods=['POST'])
def create():
  game_data = json.loads(request.data)
  game = Game(name=game_data['name'], points=game_data['points'], snake=game_data['snake'], completed=game_data['completed'])

  db.session.add(game)
  db.session.commit()

  return{
    "httpCode": "201",
    "message": "Game saved successfully"
  }


@app.route('/api/update/<int:id>', methods=['POST'])
def update(id):
  game_to_update = Game.query.get(id)
  new_game_data = json.loads(request.data)
  game_to_update.points = new_game_data['points']
  game_to_update.snake = new_game_data['snake']

  db.session.commit()
  
  return{
    "httpCode": "201",
    "message": "Game updated successfully"
  }

if __name__ == '__main__':
  app.run(debug=True)