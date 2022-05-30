document.addEventListener('DOMContentLoaded', () => {
    const inputTodo = document.querySelector('.input-todo')
    const addBtn = document.querySelector('.btn-add')
    const todoList = document.querySelector('.todo-list')
    const clearAllBtn = document.querySelector('.btn-clear-all')
    const emptyListMsg = document.createElement('p')
    emptyListMsg.textContent = 'To Do List가 비어있습니다.'
    emptyListMsg.classList.add('empty-todo')

    // [class]localStorage value값<object> 생성 클래스
    class Todo {
        constructor (txt) {
            this.txt = txt
            this.checked = false
        }
    }

    // [function]
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
        const itemList = document.querySelectorAll('li')
        const eventTarget = eTarget.tagName === 'LI' ? eTarget : findParentLINode(eTarget)
        const idx = [...itemList].findIndex(item => item === eventTarget)
        return idx
    }

    // @param todoObj <object> { txt : todo내용, checked : true/false(default) }
    const createTodoItem = (todoObj) => {
        const todoItem = document.createElement('li')
        const todoBox = document.createElement('div')
        const checkboxLabel = document.createElement('label')
        const checkboxInput = document.createElement('input')
        const checkboxIcon = document.createElement('span')
        const todoText = document.createElement('span')
        const removeBtn = document.createElement('button')
        const removeIcon = document.createElement('i')
        const sortIcon = document.createElement('i')

        // Node 트리 구성
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

        // @param : todoObj.txt
        todoText.textContent = todoObj.txt
        todoText.classList.add('todo-text')

        removeIcon.className = 'fa-solid fa-trash'
        sortIcon.className = 'fa-solid fa-sort icon-sort'
        removeBtn.type = 'button'
        removeBtn.classList.add('btn-remove')
        removeBtn.append(removeIcon)

        todoBox.append(checkboxLabel, todoText, removeBtn, sortIcon)
        todoBox.classList.add('todo-box')

        todoItem.append(todoBox)
        todoItem.classList.add('todo-item')

        // [function]
        const removeTodo = (removeIdx) => {
            const todoData = getTodoData()
            const newTodoData = todoData.filter((data, idx) => idx !== removeIdx)
            setTodoData(newTodoData)
            todoList.removeChild(todoList.children[removeIdx])
        }

        const dragDownCheckedTodo = (checkedIdx) => {
            const todoData = getTodoData()
            todoData[checkedIdx].checked = !todoData[checkedIdx].checked
            if (todoData[checkedIdx].checked) {
                todoList.append(todoList.removeChild(todoList.children[checkedIdx]))
                todoData.push(...todoData.splice(checkedIdx, 1))
            } else {
                const firstCheckedIdx = todoData.findIndex(todo => todo.checked === true)
                if (checkedIdx !== (firstCheckedIdx - 1)) {
                    todoList.insertBefore(todoList.removeChild(todoList.children[checkedIdx]), todoList.children[firstCheckedIdx] ?? null)
                    if (firstCheckedIdx !== -1) {
                        todoData.splice(firstCheckedIdx, 0, ...todoData.splice(checkedIdx, 1))
                    }
                }
            }
            setTodoData(todoData)
        }

        // [event]
        removeBtn.addEventListener('click', (e) => {
            removeTodo(getIndex(e.target))
            const todoCount = document.getElementsByTagName('LI').length
            if (todoCount === 0) todoList.append(emptyListMsg)
        })

        checkboxInput.addEventListener('change', (e) => {
            todoText.className = e.target.checked ? 'todo-text-done' : 'todo-text'
            dragDownCheckedTodo(getIndex(e.target))
        })

        return todoItem
    }

    (function loadTodo () {
        localStorage.getItem('todo-data') ?? localStorage.setItem('todo-data', JSON.stringify([]))
        const todoData = getTodoData()
        if (todoData.length === 0) {
            todoList.append(emptyListMsg)
        } else {
            const todoData = getTodoData()
            todoData.forEach(todoObj => todoList.append(createTodoItem(todoObj)))
        }
    })()

    const addTodo = () => {
        const todoText = inputTodo.value.trim()
        if (!todoText) {
            alert('할 일을 입력해주세요')
            inputTodo.value = null
            inputTodo.focus()
            return
        }

        const todoObj = new Todo(todoText)

        const todoData = getTodoData()
        let insertIdx = todoData.findIndex(todo => todo.checked === true)
        if (insertIdx === -1) insertIdx = todoList.childElementCount
        todoData.splice(insertIdx, 0, todoObj)
        setTodoData(todoData)

        todoList.insertBefore(createTodoItem(todoObj), todoList.children[insertIdx])

        inputTodo.value = null

        const todoCount = document.getElementsByTagName('li').length
        if (todoCount === 1) todoList.removeChild(emptyListMsg)
    }

    // [event]todo 추가 함수 호출
    addBtn.addEventListener('click', addTodo)
    inputTodo.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) addTodo()
    })

    // [event]todo 초기화(전체 삭제)
    clearAllBtn.addEventListener('click', () => {
        while (todoList.hasChildNodes()) {
            todoList.removeChild(todoList.firstChild)
        }
        // 빈 배열로 초기화
        setTodoData([])
        todoList.append(emptyListMsg)
        document.getElementById('sort-switch').checked = false
    })

    // ----------------------------------------------------//
    // todo 수정
    const editModal = document.querySelector('.modal-wrap')
    const editInput = document.querySelector('.input-edit')
    const updateBtn = document.querySelector('.btn-update')

    // [function]
    const openModal = (e) => {
        editModal.style.display = 'flex'
        const idx = getIndex(e.target)
        const targetObj = getTodoData()[idx]
        editInput.value = targetObj.txt
        // 수정 아이템 인덱스값 세션에 저장
        sessionStorage.setItem('edit', idx)
    }

    const updateTodo = () => {
        const editIdx = sessionStorage.getItem('edit')
        const editItem = todoList.children[editIdx]
        const editTxt = editItem.querySelector('.todo-text')
        const todoData = getTodoData()

        todoData[editIdx].txt = editInput.value
        setTodoData(todoData)

        editTxt.textContent = editInput.value

        closeModal()
    }

    const closeModal = () => {
        editModal.style.display = 'none'
    }

    todoList.addEventListener('dblclick', openModal)
    updateBtn.addEventListener('click', updateTodo)
    editInput.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) updateTodo()
    })
    editModal.addEventListener('click', (e) => {
        if (e.target.className === 'modal-wrap') closeModal()
    })

    // ----------------------------------------------------//
    // drag and drop(todo 순서 바꾸기)

    // [func]drag start : 이동시킬 데이터 저장
    function onDragStart (e) {
        e.dataTransfer.setData('idx', getIndex(e.target))
        const todoBox = e.currentTarget.querySelector('.todo-box')
        todoBox.style.backgroundColor = '#588b8d'
        todoBox.children[1].style.color = 'white'
        todoBox.children[3].style.color = 'white'
    }

    // [func]drop : 데이터 순서 바꾸기
    function onDrop (e) {
        const idx = Number(e.dataTransfer.getData('idx'))
        const firstChkIdx = getTodoData().findIndex(todo => todo.checked === true)
        let dropIdx = getIndex(e.target)
        if (firstChkIdx !== -1 && dropIdx >= firstChkIdx) dropIdx = firstChkIdx
        // Node 이동
        todoList.insertBefore(todoList.children[idx], todoList.children[dropIdx])
        // localStorage 데이터 교환
        const todoData = getTodoData()
        const dragData = todoData.slice(idx, idx + 1)
        // dragData 복사 후 추가
        todoData.splice(dropIdx, 0, dragData[0])
        // 기존 dragData 삭제
        if (idx === dropIdx) {
            return
        } else if (idx > dropIdx) {
            todoData.splice(idx + 1, 1)
        } else {
            todoData.splice(idx, 1)
        }
        // localStorage 변경 데이터 저장
        setTodoData(todoData)

        e.dataTransfer.clearData()
    }

    // [func]drag end : 이벤트 완료시 원래 style로 복귀
    function onDragEnd (e) {
        const todoBox = e.currentTarget.querySelector('.todo-box')
        todoBox.style.backgroundColor = '#c2e0d8de'
        todoBox.children[3].style.color = '#588b8d'
        todoBox.children[1].style.color = todoBox.children[0].children[0].checked ? '#8f959b' : '#000'
    }

    const todoItems = document.getElementsByTagName('li')
    const chkSort = document.getElementById('input-sort')

    // [event]수동 정렬 상태 전환(체크박스)
    chkSort.addEventListener('change', (e) => {
        console.log('eee')
        const sortMode = !!e.target.checked
        const removeBtns = document.querySelectorAll('.btn-remove')
        const sortIcons = document.querySelectorAll('.icon-sort')
        const chkTodo = document.querySelectorAll('.check-todo')

        // draggable true <-> false 전환
        for (const child of todoList.childNodes) {
            const chkBox = child.querySelector('.check-todo')
            if (sortMode) {
                if (!chkBox.checked) child.setAttribute('draggable', 'true')
            } else {
                if (!chkBox.checked) child.removeAttribute('draggable')
            }
        }
        // 정렬 상태일 때 휴지통 아이콘 -> 정렬 아이콘
        removeBtns.forEach(function (btn) {
            btn.style.display = sortMode ? 'none' : 'flex'
        })
        sortIcons.forEach(function (icon) {
            icon.style.display = sortMode ? 'flex' : 'none'
        })
        // addBtn 활성 <-> 비활성화
        if (sortMode) {
            addBtn.setAttribute('disabled', '')
            chkTodo.forEach(chk => chk.setAttribute('disabled', ''))
            inputTodo.setAttribute('disabled', '')
        } else {
            addBtn.removeAttribute('disabled')
            chkTodo.forEach(chk => chk.removeAttribute('disabled'))
            inputTodo.removeAttribute('disabled')
        }
    })

    // [event]dragevent 함수 연결
    for (const item of todoItems) {
        item.addEventListener('dragstart', onDragStart)
        item.addEventListener('dragend', onDragEnd)
    }
    todoList.addEventListener('dragover', function (e) {
        e.preventDefault()
    }, false)
    todoList.addEventListener('drop', onDrop)

    // [event]storage 이벤트
    window.addEventListener('storage', () => {
        getTodoData() ?? setTodoData([])
        if (getTodoData().length === 0 && todoList.hasChildNodes()) {
            while (todoList.hasChildNodes()) {
                todoList.removeChild(todoList.firstChild)
            }
            todoList.append(emptyListMsg)
        }
    })
})
