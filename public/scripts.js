const addTodoButton = document.getElementById('addTodoButton');
const todoInput = document.getElementById('exampleFormControlInput1');
const todoList = document.querySelector('.todo-list');
const dueDateInput = document.getElementById('dueDateInput'); 

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
    todos.forEach(addTodoElement);
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
    checkboxWrapper.appendChild(checkbox);

    const text = document.createElement('p');
    text.classList.add('lead', 'fw-normal', 'mb-0', 'w-100', 'ms-n2', 'ps-2', 'py-1', 'rounded');
    text.textContent = todo.text;

      const deleteButton = document.createElement('a');
    deleteButton.classList.add('text-danger', 'd-none'); // Add 'd-none' class
    deleteButton.href = '#!';
    deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
    deleteButton.addEventListener('click', deleteTodo);

    listItem.appendChild(checkboxWrapper);
    listItem.appendChild(text);
    
    if (todo.dueDate) {
        const dueDateWrapper = document.createElement('a');
        dueDateWrapper.href = "#!";
        dueDateWrapper.classList.add('text-muted');
        dueDateWrapper.setAttribute('data-mdb-toggle', 'tooltip');
        dueDateWrapper.setAttribute('title', 'Created date');
    
        const dueDate = document.createElement('p');
        dueDate.classList.add('small', 'mb-0');
    
        const infoIcon = document.createElement('i');
        infoIcon.classList.add('fas', 'fa-info-circle', 'me-2');
        dueDate.appendChild(infoIcon);
    
        dueDate.textContent += new Date(todo.dueDate).toLocaleDateString();
        dueDateWrapper.appendChild(dueDate);
        listItem.appendChild(dueDateWrapper);
    }
    
    listItem.appendChild(deleteButton);
    todoList.appendChild(listItem);
    listItem.addEventListener('mouseenter', () => {
        deleteButton.classList.remove('d-none');
    });

    listItem.addEventListener('mouseleave', () => {
        deleteButton.classList.add('d-none');
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