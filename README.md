# snake
A snake game using ReactJs for the frontend and a python api for the CRUD operations in the backend


## FrontEnd
The front end is built using reactJs

After cloning the repo you will have to run the following commands:
  1.  ```cd snake-ui```
  1.  ```npm install``` - to install packages
  1.  ```npm start```
    
Navigate to http://localhost:3000/ to see the app running.
  
In order to get the backend running, you will also have to run the 
following commands, assuming you already have python3, flask and pip installed:
  1.  ```cd snake-api```
  1.   ```virtualenv -p python venv``` - creating a virtual environment called venv
  1.  ```source ./venv/bin/activate ``` - to activate the virtual environment
  1.  ```pip install Flask ``` - to install flask
  1.   ```pip install Flask-SQLAlchemy```- to install SQLAlchemy
  1.  ```python app.py```

Navigate to http://localhost:5000/api to see the api running.
