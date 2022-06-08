import './assets/reset.css'
import './assets/style.css'
import './assets/mediaqueries.css'

import { todoList, todoInput, addButton, sortSwitch, clearAllButton, emptyListMessage } from './lib/public-variables'
import { getTodoData, setTodoData } from './lib/public-functions'
import { onDrop } from './lib/drag-drop-todo'
import { openEditModal, updateEditTodo, closeEditModal, editModal, editInput, editUpdateButton } from './lib/edit-todo'
import { createTodoItem, addTodo } from './lib/add-remove-todo'

(function loadTodo () {
    localStorage.getItem('todo-data') ?? localStorage.setItem('todo-data', JSON.stringify([]))
    const todoData = getTodoData()
    if (todoData.length === 0) {
        todoList.append(emptyListMessage)
    } else {
        const todoData = getTodoData()
        todoData.forEach(todoObj => todoList.append(createTodoItem(todoObj)))
    }
})()

// <EVENTS>
// -- add & remove event
addButton.addEventListener('click', addTodo)
todoInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) addTodo()
})
clearAllButton.addEventListener('click', () => {
    while (todoList.hasChildNodes()) {
        todoList.removeChild(todoList.firstChild)
    }
    setTodoData([])
    todoList.append(emptyListMessage)
    document.getElementById('sort-switch').checked = false
})

// -- edit event
todoList.addEventListener('dblclick', openEditModal)
editUpdateButton.addEventListener('click', updateEditTodo)
editInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) updateEditTodo()
})
editModal.addEventListener('click', (e) => {
    if (e.target.className === 'modal-wrap') closeEditModal()
})

// -- drag and drop(sort) event
sortSwitch.addEventListener('change', (e) => {
    const sortMode = !!e.target.checked
    const removeButtons = document.querySelectorAll('.btn-remove')
    const sortIcons = document.querySelectorAll('.icon-sort')
    const checkBoxes = document.querySelectorAll('.check-todo')

    for (const child of todoList.childNodes) {
        const checkBox = child.querySelector('.check-todo')
        if (sortMode && !checkBox.checked) {
            child.setAttribute('draggable', 'true')
        } else if (!sortMode && !checkBox.checked) {
            child.removeAttribute('draggable')
        }
    }

    removeButtons.forEach(function (button) {
        button.style.display = sortMode ? 'none' : 'flex'
    })
    sortIcons.forEach(function (icon) {
        icon.style.display = sortMode ? 'flex' : 'none'
    })

    if (sortMode) {
        checkBoxes.forEach(checkBox => checkBox.setAttribute('disabled', ''))
        todoInput.setAttribute('disabled', '')
        addButton.setAttribute('disabled', '')
    } else {
        checkBoxes.forEach(checkBox => checkBox.removeAttribute('disabled'))
        todoInput.removeAttribute('disabled')
        addButton.removeAttribute('disabled')
    }
})
todoList.addEventListener('dragover', function (e) {
    e.preventDefault()
}, false)
todoList.addEventListener('drop', onDrop)

// -- storage event
window.addEventListener('storage', () => {
    getTodoData() ?? setTodoData([])
    if (getTodoData().length === 0 && todoList.hasChildNodes()) {
        while (todoList.hasChildNodes()) {
            todoList.removeChild(todoList.firstChild)
        }
        todoList.append(emptyListMessage)
    }
})
