const addTodoButton = document.getElementById('addTodoButton');
const todoInput = document.getElementById('exampleFormControlInput1');
const todoList = document.querySelector('.todo-list');
const dueDateInput = document.getElementById('dueDateInput');

const filterSelect = document.querySelector('.custom-select');
const sortSelect = document.querySelectorAll('.custom-select')[1];

filterSelect.addEventListener('change', fetchTodos);
sortSelect.addEventListener('change', fetchTodos);

function filterTodos(todos, filter) {
    switch (filter) {
      case '2': // Completed
        return todos.filter((todo) => todo.completed);
      case '3': // Active
        return todos.filter((todo) => !todo.completed);
      case '4': // Has due date
        return todos.filter((todo) => todo.dueDate);
      default: // All
        return todos;
    }
  }


  function sortTodos(todos, sortBy) {
    const sortedTodos = [...todos];
    switch (sortBy) {
      case '2': // Due date
        return sortedTodos.sort((a, b) => {
          if (a.dueDate && b.dueDate) {
            return new Date(a.dueDate) - new Date(b.dueDate);
          }
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
        });
      default: // Added date
        // Assuming your server returns todos with a createdDate property
        return sortedTodos.sort((a, b) => new Date(a.createdDate) - new Date(b.createdDate));
    }
  }

  

addTodoButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const text = todoInput.value.trim();
    if (!text) return;

    const dueDate = dueDateInput.value;

    const todo = {
        text,
        completed: false,
        dueDate, // 2. Update todo object to include dueDate property
    };

    const response = await fetch('/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
    });

    const newTodo = await response.json();
    addTodoElement(newTodo);
    todoInput.value = '';
    dueDateInput.value = ''; // Clear due date input after adding a todo
});

async function fetchTodos() {
    const response = await fetch('/todos');
    const todos = await response.json();
    
    // Get the selected filter and sort values
    const filterValue = filterSelect.value;
    const sortValue = sortSelect.value;
  
    // Filter and sort todos
    const filteredTodos = filterTodos(todos, filterValue);
    const sortedTodos = sortTodos(filteredTodos, sortValue);
  
    // Clear the existing todo list
    todoList.innerHTML = '';
  
    // Add filtered and sorted todos to the list
    sortedTodos.forEach(addTodoElement);
  }
function addTodoElement(todo) {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'd-flex', 'align-items-center', 'ps-0', 'pe-3', 'py-1', 'rounded-0' );
    listItem.dataset.id = todo._id;
console.log(todo._id);
    const checkboxWrapper = document.createElement('div');
    checkboxWrapper.classList.add('form-check');

    const checkbox = document.createElement('input');
    checkbox.classList.add('form-check-input', 'me-0');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed; // Set initial checkbox state
    checkbox.addEventListener('change', async (event) => {
        const isChecked = event.target.checked;
        todo.completed = isChecked;
        await updateTodoCompletedStatus(listItem);
        fetchTodos(); // Refetch todos to update the list based on the new completed status
      });
    checkboxWrapper.appendChild(checkbox);

    const text = document.createElement('p');
    text.classList.add('lead', 'fw-normal', 'mb-0', 'w-100', 'ms-n2', 'ps-2', 'py-1', 'rounded');
    text.textContent = todo.text;



 


      const deleteButton = document.createElement('a');
      deleteButton.classList.add('text-danger');
      deleteButton.style.visibility = 'hidden';
    deleteButton.href = '#!';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt fa-lg"></i>';
    deleteButton.addEventListener('click', deleteTodo);

    const editButton = document.createElement('a');
    editButton.classList.add('text-warning', 'me-2');
    editButton.style.visibility = 'hidden';
    editButton.href = '#!';
    editButton.innerHTML = '<i class="fas fa-edit fa-lg"></i>';
    editButton.addEventListener('click', toggleEditMode);

    listItem.appendChild(checkboxWrapper);

    listItem.appendChild(text);

    if (todo.dueDate) {
        const dueDateWrapper = document.createElement('a');
        dueDateWrapper.href = "#!";
        dueDateWrapper.classList.add('darker-text');
        dueDateWrapper.setAttribute('data-mdb-toggle', 'tooltip');
        dueDateWrapper.setAttribute('title', 'Created date');
    
        const dueDate = document.createElement('p');
        dueDate.classList.add('lead','mb-0', 'me-3');
    
        // const infoIcon = document.createElement('i');
        // infoIcon.classList.add('fas', 'fa-info-circle', 'me-2');
        // dueDate.appendChild(infoIcon);
    
        dueDate.textContent += new Date(todo.dueDate).toLocaleDateString();
        dueDateWrapper.appendChild(dueDate);
        listItem.appendChild(dueDateWrapper);
    }
    listItem.appendChild(editButton);
    listItem.appendChild(deleteButton);
    todoList.appendChild(listItem);
    
    listItem.addEventListener('mouseenter', () => {
        deleteButton.style.visibility = 'visible';
        editButton.style.visibility = 'visible';
    });

    listItem.addEventListener('mouseleave', () => {
        deleteButton.style.visibility = 'hidden';
        editButton.style.visibility = 'hidden';
    });
}

async function updateTodoCompletedStatus(listItem) {
    const id = listItem.dataset.id;
    const completed = listItem.querySelector('input[type="checkbox"]').checked;
  
    await fetch('/todos/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, completed }),
    });
  }

async function toggleEditMode(event) {
    const listItem = event.target.parentElement.parentElement;
    const textElement = listItem.querySelector('p');
    const currentText = textElement.textContent;

    const newText = prompt("Edit the todo text:", currentText);

    if (newText === null || newText.trim() === '') {

        return;
    }

    if (newText !== currentText) {
        textElement.textContent = newText;
        await updateTodoText(listItem);
    }
}

async function updateTodoText(listItem) {
    const id = listItem.dataset.id;
    const newText = listItem.querySelector('p').textContent;

    await fetch(`/todos/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, text: newText }),
    });
}
async function deleteTodo(event) {
    const listItem = event.target.parentElement.parentElement;
    const id = listItem.dataset.id;

    await fetch(`/todosdelete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });

    listItem.remove();
  }
  
  fetchTodos();