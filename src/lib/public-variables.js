const todoList = document.querySelector('.todo-list')
const todoInput = document.querySelector('.input-todo')
const addButton = document.querySelector('.btn-add')
const sortSwitch = document.getElementById('input-sort')
const clearAllButton = document.querySelector('.btn-clear-all')
const emptyListMessage = document.createElement('p')
emptyListMessage.textContent = 'To Do List가 비어있습니다.'
emptyListMessage.classList.add('empty-todo')

const cssRoot = document.querySelector(':root')
const commonStyle = window.getComputedStyle(cssRoot)
const pointColor = commonStyle.getPropertyValue('--color-point')
const divColorDefault = commonStyle.getPropertyValue('--color-divbox-default')

export {
    todoList,
    todoInput,
    addButton,
    sortSwitch,
    clearAllButton,
    emptyListMessage,
    pointColor,
    divColorDefault
}
