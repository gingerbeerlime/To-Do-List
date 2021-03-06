import { todoList, pointColor, divColorDefault } from './public-variables'
import { getTodoData, setTodoData, getIndex } from './public-functions'

const onDragStart = (e) => {
    if (!e.currentTarget.hasAttribute('draggable')) return

    e.dataTransfer.setData('idx', getIndex(e.target))
    const todoBox = e.currentTarget.querySelector('.todo-box')
    todoBox.style.backgroundColor = pointColor
    todoBox.querySelector('.todo-text').classList.add('ondrag')
    todoBox.querySelector('.icon-sort').style.color = '#fff'
}

const onDrop = (e) => {
    if (e.dataTransfer.getData('idx') === '') return

    const dragIdx = Number(e.dataTransfer.getData('idx'))
    const firstCheckedIdx = getTodoData().findIndex(todo => !!todo.checked)
    let dropIdx = getIndex(e.target)
    if (firstCheckedIdx !== -1 && dropIdx >= firstCheckedIdx) {
        dropIdx = firstCheckedIdx
    }

    todoList.insertBefore(todoList.children[dragIdx], todoList.children[dropIdx])

    const todoData = getTodoData()
    const dragData = todoData.slice(dragIdx, dragIdx + 1)
    todoData.splice(dropIdx, 0, ...dragData)
    if (dragIdx === dropIdx) {
        return
    } else {
        todoData.splice(dragIdx + (dragIdx > dropIdx ? 1 : 0), 1)
    }
    setTodoData(todoData)

    e.dataTransfer.clearData()
}

const onDragEnd = (e) => {
    if (!e.currentTarget.hasAttribute('draggable')) return

    const todoBox = e.currentTarget.querySelector('.todo-box')
    todoBox.style.backgroundColor = divColorDefault
    todoBox.querySelector('.todo-text').classList.remove('ondrag')
    todoBox.querySelector('.icon-sort').style.color = pointColor
}

export {
    onDragStart,
    onDrop,
    onDragEnd
}
