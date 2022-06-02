document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.querySelector('.input-todo')
    const addButton = document.querySelector('.btn-add')
    const todoList = document.querySelector('.todo-list')
    const clearAllButton = document.querySelector('.btn-clear-all')
    const editModal = document.querySelector('.modal-wrap')
    const editInput = document.querySelector('.input-edit')
    const editUpdateButton = document.querySelector('.btn-update')
    const sortSwitch = document.getElementById('input-sort')

    const cssRoot = document.querySelector(':root')
    const commonStyle = window.getComputedStyle(cssRoot)
    const pointColor = commonStyle.getPropertyValue('--color-point')
    const divColorDefault = commonStyle.getPropertyValue('--color-divbox-default')

    const emptyListMessage = document.createElement('p')
    emptyListMessage.textContent = 'To Do List가 비어있습니다.'
    emptyListMessage.classList.add('empty-todo')

    // <CLASS>
    // localStorage value값<object> 생성 클래스
    class Todo {
        constructor (txt) {
            this.txt = txt
            this.checked = false
        }
    }

    // <FUNCTIONS>
    const getTodoData = () => {
        return JSON.parse(localStorage.getItem('todo-data'))
    }

    // @param newData <Array>
    const setTodoData = (newData) => {
        localStorage.setItem('todo-data', JSON.stringify(newData))
    }

    const findParentLINode = (eTarget) => {
        while (eTarget.parentNode.tagName !== 'LI') {
            eTarget = eTarget.parentNode
        }
        return eTarget.parentNode
    }

    const getIndex = (eTarget) => {
        const todoItems = document.querySelectorAll('li')
        // ul drop 에러 처리
        const targetLI = eTarget.tagName === 'LI' ? eTarget : findParentLINode(eTarget)
        const idx = [...todoItems].findIndex(item => item === targetLI)
        return idx
    }

    const countTodoItem = () => document.getElementsByTagName('LI').length

    // -- drag and drop
    const onDragStart = (e) => {
        e.dataTransfer.setData('idx', getIndex(e.target))
        const todoBox = e.currentTarget.querySelector('.todo-box')
        todoBox.style.backgroundColor = pointColor
        todoBox.querySelector('.todo-text').classList.add('ondrag')
        todoBox.querySelector('.icon-sort').style.color = '#fff'
    }

    const onDrop = (e) => {
        const dragIdx = Number(e.dataTransfer.getData('idx'))
        const firstCheckedIdx = getTodoData().findIndex(todo => todo.checked === true)
        let dropIdx = getIndex(e.target)
        if (firstCheckedIdx !== -1 && dropIdx >= firstCheckedIdx) dropIdx = firstCheckedIdx

        todoList.insertBefore(todoList.children[dragIdx], todoList.children[dropIdx])

        const todoData = getTodoData()
        const dragData = todoData.slice(dragIdx, dragIdx + 1)
        todoData.splice(dropIdx, 0, ...dragData)
        if (dragIdx === dropIdx) return
        else todoData.splice(dragIdx + (dragIdx > dropIdx ? 1 : 0), 1)
        setTodoData(todoData)

        e.dataTransfer.clearData()
    }

    const onDragEnd = (e) => {
        const todoBox = e.currentTarget.querySelector('.todo-box')
        todoBox.style.backgroundColor = divColorDefault
        todoBox.querySelector('.todo-text').classList.remove('ondrag')
        todoBox.querySelector('.icon-sort').style.color = pointColor
    }

    // -- add & remove Todo
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
                if (checkedIdx !== (firstCheckedIdx - 1)) {
                    const checkedTodo = todoList.removeChild(todoList.children[checkedIdx])
                    todoList.insertBefore(checkedTodo, todoList.children[firstCheckedIdx] ?? null)
                }
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

    // -- edit Todo
    const openEditModal = (e) => {
        editModal.style.display = 'flex'
        const idx = getIndex(e.target)
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
})
