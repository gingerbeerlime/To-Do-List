import { todoList } from './public-variables'
import { getTodoData, setTodoData, getIndex } from './public-functions'

export const editModal = document.querySelector('.modal-wrap')
export const editInput = document.querySelector('.input-edit')
export const editUpdateButton = document.querySelector('.btn-update')

const openEditModal = (editTarget) => {
    editModal.style.display = 'flex'
    const idx = getIndex(editTarget)
    const editTodoData = getTodoData()[idx]
    editInput.value = editTodoData.txt
    sessionStorage.setItem('edit', idx)
}

const updateEditTodo = () => {
    const editIdx = sessionStorage.getItem('edit')
    const editItem = todoList.children[editIdx]
    const editTxt = editItem.querySelector('.todo-text')
    const todoData = getTodoData()

    todoData[editIdx].txt = editInput.value
    setTodoData(todoData)

    editTxt.textContent = editInput.value

    closeEditModal()
}

const closeEditModal = () => {
    editModal.style.display = 'none'
}

export {
    openEditModal,
    updateEditTodo,
    closeEditModal
}
