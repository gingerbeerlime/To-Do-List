import { todoList, todoInput, emptyListMessage } from './public-variables'
import { getTodoData, setTodoData, getIndex, countTodoItem } from './public-functions'
import { onDragStart, onDragEnd } from './drag-drop-todo'

// localStorage value값<object> 생성 클래스
class Todo {
    constructor (txt) {
        this.txt = txt
        this.checked = false
    }
}

// @param todoObj <object> { txt : todo내용, checked : true/false(default) }
const createTodoItem = (todoObj) => {
    const todoItem = document.createElement('li')
    const todoBox = document.createElement('div')
    const checkboxLabel = document.createElement('label')
    const checkboxInput = document.createElement('input')
    const checkboxIcon = document.createElement('span')
    const todoText = document.createElement('span')
    const removeButton = document.createElement('button')
    const removeIcon = document.createElement('i')
    const sortIcon = document.createElement('i')

    // @param : todoObj.txt
    todoText.textContent = todoObj.txt
    todoText.classList.add('todo-text')

    checkboxInput.type = 'checkbox'
    checkboxInput.classList.add('check-todo')
    checkboxIcon.classList.add('check-icon')
    checkboxLabel.classList.add('check-label')
    checkboxLabel.append(checkboxInput, checkboxIcon)

    // @param : todoObj.checked
    if (todoObj.checked) {
        checkboxInput.checked = true
        todoText.className = 'todo-text-done'
    }

    removeIcon.className = 'fa-solid fa-trash'
    sortIcon.className = 'fa-solid fa-sort icon-sort'
    removeButton.type = 'button'
    removeButton.append(removeIcon)
    removeButton.classList.add('btn-remove')

    todoBox.append(checkboxLabel, todoText, removeButton, sortIcon)
    todoBox.classList.add('todo-box')

    todoItem.append(todoBox)
    todoItem.classList.add('todo-item')
    todoItem.addEventListener('dragstart', onDragStart)
    todoItem.addEventListener('dragend', onDragEnd)

    // [functions]
    const removeTodo = (removeIdx) => {
        const todoData = getTodoData()
        const newTodoData = todoData.filter((_, idx) => idx !== removeIdx)
        setTodoData(newTodoData)
        todoList.removeChild(todoList.children[removeIdx])
    }

    const moveToBottomCheckedTodo = (checkedIdx) => {
        const todoData = getTodoData()
        todoData[checkedIdx].checked = !todoData[checkedIdx].checked
        if (todoData[checkedIdx].checked) {
            todoList.append(todoList.removeChild(todoList.children[checkedIdx]))
            todoData.push(...todoData.splice(checkedIdx, 1))
        } else {
            const firstCheckedIdx = todoData.findIndex(todo => todo.checked === true)
            // 이벤트타겟이 첫번째 체크항목 상단으로 이동되는 조건
            if (checkedIdx !== (firstCheckedIdx - 1)) {
                const checkedTodo = todoList.removeChild(todoList.children[checkedIdx])
                todoList.insertBefore(checkedTodo, todoList.children[firstCheckedIdx] ?? null)
            }
            // localStorage 배열을 재정렬시켜야하는 조건
            if (checkedIdx !== (firstCheckedIdx - 1) && firstCheckedIdx !== -1) {
                todoData.splice(firstCheckedIdx, 0, ...todoData.splice(checkedIdx, 1))
            }
        }
        setTodoData(todoData)
    }

    // [events]
    removeButton.addEventListener('click', (e) => {
        removeTodo(getIndex(e.target))
        if (countTodoItem() === 0) todoList.append(emptyListMessage)
    })

    checkboxInput.addEventListener('change', (e) => {
        todoText.className = e.target.checked ? 'todo-text-done' : 'todo-text'
        moveToBottomCheckedTodo(getIndex(e.target))
    })

    return todoItem
}

const addTodo = () => {
    const todoText = todoInput.value.trim()
    if (!todoText) {
        alert('할 일을 입력해주세요')
        todoInput.value = null
        todoInput.focus()
        return
    }

    const todoObj = new Todo(todoText)

    const todoData = getTodoData()
    let insertIdx = todoData.findIndex(todo => todo.checked === true)
    if (insertIdx === -1) insertIdx = todoList.childElementCount
    const newData = [...todoData.slice(0, insertIdx), todoObj, ...todoData.slice(insertIdx)]
    setTodoData(newData)

    todoList.insertBefore(createTodoItem(todoObj), todoList.children[insertIdx])

    todoInput.value = null

    if (countTodoItem() === 1) todoList.removeChild(emptyListMessage)
}

export {
    createTodoItem,
    addTodo
}
