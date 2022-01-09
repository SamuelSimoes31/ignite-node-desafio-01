const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({error: 'Username not found'});
  }
  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  if(!username){
    return response.status(400).json({error: 'Missing property username on body'});
  }

  if(!name){
    return response.status(400).json({error: 'Missing property name on body'});
  }

  const userAlreadyExists = users.some(user => user.username === username);
  if(userAlreadyExists) {
    return response.status(400).json({error: 'User already exists'});
  }

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.status(200).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(200).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;
  const { user } = request;

  const todoFound = user.todos.find(todo => todo.id === id);

  if(!todoFound) {
    return response.status(404).json({error: 'Todo not found.'});
  }

  if(title) todoFound.title = title;
  if(deadline) todoFound.deadline = deadline;

  return response.status(200).json(todoFound);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoFound = user.todos.find(todo => todo.id === id);

  if(!todoFound) {
    return response.status(404).json({error: 'Todo not found.'});
  }

  todoFound.done = true;

  return response.status(200).json(todoFound);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoFound = user.todos.find(todo => todo.id === id);

  if(!todoFound) {
    return response.status(404).json({error: 'Todo not found.'});
  }

  user.todos = user.todos.filter(todo => todo !== todoFound);

  return response.status(200).json(user.todos);
});

module.exports = app;