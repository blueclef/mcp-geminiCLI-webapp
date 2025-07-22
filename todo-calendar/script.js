const monthYearElement = document.getElementById('month-year');
const datesElement = document.getElementById('dates');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const todoList = document.getElementById('todo-list');
const todoInput = document.getElementById('todo-input');
const addTodoButton = document.getElementById('add-todo');

let currentDate = new Date();
let selectedDate = new Date();
let todos = {};

function renderCalendar() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    monthYearElement.textContent = `${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(currentDate)} ${year}`;

    datesElement.innerHTML = '';

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayOfMonth; i++) {
        const emptyDate = document.createElement('div');
        emptyDate.classList.add('date');
        datesElement.appendChild(emptyDate);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const dateElement = document.createElement('div');
        dateElement.classList.add('date');
        dateElement.textContent = i;
        dateElement.setAttribute('draggable', 'true');
        dateElement.dataset.date = date.toDateString();

        if (date.toDateString() === new Date().toDateString()) {
            dateElement.classList.add('today');
        }

        if (date.toDateString() === selectedDate.toDateString()) {
            dateElement.classList.add('selected');
        }

        dateElement.addEventListener('click', () => {
            selectedDate = date;
            renderCalendar();
            renderTodos();
        });

        dateElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('text/plain', date.toDateString());
        });

        dateElement.addEventListener('dragover', (event) => {
            event.preventDefault(); // Allow drop
        });

        dateElement.addEventListener('drop', (event) => {
            event.preventDefault();
            const sourceDateString = event.dataTransfer.getData('text/plain');
            const targetDateString = date.toDateString();

            if (sourceDateString && todos[sourceDateString]) {
                todos[targetDateString] = JSON.parse(JSON.stringify(todos[sourceDateString]));
                alert(`Todos from ${sourceDateString} copied to ${targetDateString} via drag and drop.`);
                renderCalendar();
                renderTodos();
            } else if (!todos[sourceDateString]) {
                alert('No todos found for the dragged date.');
            }
        });

        datesElement.appendChild(dateElement);
    }
}

function renderTodos() {
    todoList.innerHTML = '';
    const dateString = selectedDate.toDateString();

    if (todos[dateString]) {
        todos[dateString].forEach((todo, index) => {
            const todoItem = document.createElement('li');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.selected || false; // Initialize with selected state
            checkbox.addEventListener('change', () => {
                todo.selected = checkbox.checked;
            });

            const todoTextSpan = document.createElement('span');
            todoTextSpan.textContent = todo.text;

            if (todo.completed) {
                todoTextSpan.classList.add('completed');
            }

            const buttonsContainer = document.createElement('div');
            buttonsContainer.classList.add('todo-buttons');

            const doneButton = document.createElement('button');
            doneButton.textContent = 'Done';
            doneButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent parent li click event from toggling completion
                todo.completed = true;
                renderTodos();
            });

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', (event) => {
                event.stopPropagation(); // Prevent parent li click event

                const currentText = todo.text;
                const inputField = document.createElement('input');
                inputField.type = 'text';
                inputField.value = currentText;
                inputField.classList.add('edit-todo-input');

                todoItem.textContent = ''; // Clear existing text
                todoItem.appendChild(checkbox);
                todoItem.appendChild(inputField);
                inputField.focus();

                const saveChanges = () => {
                    const newText = inputField.value.trim();
                    if (newText && newText !== currentText) {
                        todo.text = newText;
                    }
                    renderTodos(); // Re-render to show updated text or original if empty
                };

                inputField.addEventListener('blur', saveChanges);
                inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        saveChanges();
                    }
                });
            });

            buttonsContainer.appendChild(doneButton);
            buttonsContainer.appendChild(editButton);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', (event) => {
                event.stopPropagation();
                todos[dateString].splice(index, 1);
                renderTodos();
            });
            buttonsContainer.appendChild(deleteButton);

            todoItem.appendChild(checkbox);
            todoItem.appendChild(todoTextSpan);
            todoItem.appendChild(buttonsContainer);
            todoList.appendChild(todoItem);
        });
    }
}

addTodoButton.addEventListener('click', () => {
    const todoText = todoInput.value.trim();

    if (todoText) {
        const dateString = selectedDate.toDateString();
        if (!todos[dateString]) {
            todos[dateString] = [];
        }
        todos[dateString].push({ text: todoText, completed: false, selected: false }); // Add selected property
        todoInput.value = '';
        renderTodos();
    }
});

prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

const copyDateInput = document.getElementById('copy-date-input');
const copyButton = document.getElementById('copy-button');

copyButton.addEventListener('click', () => {
    const sourceDateString = selectedDate.toDateString();
    const targetDate = new Date(copyDateInput.value);

    if (isNaN(targetDate.getTime())) {
        alert('Please select a valid date to copy to.');
        return;
    }

    const targetDateString = targetDate.toDateString();

    if (todos[sourceDateString]) {
        // Deep copy the todos to avoid reference issues
        todos[targetDateString] = JSON.parse(JSON.stringify(todos[sourceDateString]));
        alert(`Todos from ${sourceDateString} copied to ${targetDateString}`);
        renderCalendar(); // Re-render calendar to update any visual cues for new todos
        renderTodos(); // Re-render todos for the currently selected date if it's the target
    } else {
        alert('No todos found for the selected date to copy.');
    }
});

const copyWeeklyButton = document.getElementById('copy-weekly-button');

copyWeeklyButton.addEventListener('click', () => {
    const sourceDateString = selectedDate.toDateString();

    if (todos[sourceDateString]) {
        for (let i = 1; i <= 4; i++) { // Copy for the next 4 weeks
            const targetDate = new Date(selectedDate);
            targetDate.setDate(selectedDate.getDate() + (7 * i));
            const targetDateString = targetDate.toDateString();

            todos[targetDateString] = JSON.parse(JSON.stringify(todos[sourceDateString]));
        }
        alert(`Todos from ${sourceDateString} copied weekly for the next 4 weeks.`);
        renderCalendar();
        renderTodos();
    } else {
        alert('No todos found for the selected date to copy weekly.');
    }
});

renderCalendar();
renderTodos();