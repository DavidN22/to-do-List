const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
require('dotenv').config();

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const todoSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  dueDate: Date,
});
app.use(express.static(path.join(__dirname, 'public')));
const Todo = mongoose.model('Todo', todoSchema);

app.get('/todos', async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/todos', async (req, res) => {
  const todo = new Todo(req.body);
  await todo.save();
  res.json(todo);
});

app.put('/todos/:id', async (req, res) => {
  const todo = await Todo.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(todo);
});

app.delete('/todosdelete', async (req, res) => {
  let id = req.body.id;
  await Todo.findByIdAndDelete(id);
  res.sendStatus(204);
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
