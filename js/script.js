document.addEventListener('DOMContentLoaded', () => {
    const inputTodo = document.querySelector('.input-todo')
    const addBtn = document.querySelector('.btn-add')
    const todoList = document.querySelector('.todo-list')
    const clearAllBtn = document.querySelector('.btn-clear-all')

    // [class]localStorage value값<object> 생성 클래스
    class Todo {
        constructor (txt) {
            this.txt = txt
            this.checked = false
        }
    }

    // todolist 비었을 때 msg
    const noItemMsg = document.createElement('p')
    noItemMsg.textContent = 'To Do List가 비어있습니다.'
    noItemMsg.classList.add('no-item')

    // 로드시 localStorage 세팅
    localStorage.getItem('todo-data') ?? localStorage.setItem('todo-data', JSON.stringify([]))

    // [func]localStorage 데이터 가져오는 함수 <Array>
    function getTodoData () {
        return JSON.parse(localStorage.getItem('todo-data'))
    }

    // [func]localStorage 데이터 갱신하는 함수
    // @param newData : <Array>로 전달
    function setTodoData (newData) {
        localStorage.setItem('todo-data', JSON.stringify(newData))
    }

    // [func]조작하는 아이템 index 가져오는 함수
    function getIndex (eventTarget) {
        const itemList = document.querySelectorAll('li')
        for (let idx = 0; idx < itemList.length; idx++) {
            if (eventTarget === itemList[idx]) return idx
        }
    }

    // [func]parentNode 중 특정 태그 찾는 함수
    // @param tagName : 찾고싶은 tag종류 전달
    function findParentNode (eTarget, tagName) {
        if (eTarget.tagName === tagName) return eTarget
        while (eTarget.parentNode.tagName !== tagName) {
            eTarget = eTarget.parentNode
        }
        return eTarget.parentNode
    }

    // [func]todoItem(li태그) 생성 함수
    // @param todoObj <object> { txt : todo내용, checked : true/false(default) }
    const createTodoItem = (todoObj) => {
        const item = document.createElement('li')
        const chkLbl = document.createElement('label')
        const chkInput = document.createElement('input')
        const chkIcon = document.createElement('span')
        const text = document.createElement('span')
        const removeBtn = document.createElement('button')
        const removeIcon = document.createElement('i')

        // checkbox 조작(label, input, span)
        chkInput.type = 'checkbox'
        chkIcon.classList.add('check-icon')
        chkLbl.append(chkInput, chkIcon)
        // @param : todoObj.checked
        if (todoObj.checked) {
            chkInput.checked = true
            text.className = 'todo-text-done'
        }

        // text 조작
        // @param : todoObj.txt
        text.textContent = todoObj.txt
        text.classList.add('todo-text')

        // removeBtn 조작
        removeIcon.className = 'fa-solid fa-trash'
        removeBtn.append(removeIcon)
        removeBtn.type = 'button'
        removeBtn.classList.add('btn-remove')

        // item(li태그) 조작
        item.append(chkLbl, text, removeBtn)
        item.classList.add('todo-item')

        // todolist(<ul>)에 item(<li>) 추가
        todoList.append(item)

        // -[func]todoItem(li태그) localStorage 삭제 함수
        const removeTodo = (idx) => {
            const todoData = getTodoData()
            todoData.splice(idx, 1)
            setTodoData(todoData)
        }

        // -[event]todoItem(li태그) 개별 삭제
        removeBtn.addEventListener('click', (e) => {
            const removeItem = findParentNode(e.target, 'LI')
            const idx = getIndex(removeItem)
            // localStorage에서 삭제
            removeTodo(idx)
            // DOM 요소 삭제
            todoList.removeChild(removeItem)
            // todo Count
            const todoCnt = document.getElementsByTagName('LI').length
            if (todoCnt === 0) todoList.append(noItemMsg)
        })

        // -[event]checkbox check 이벤트
        chkInput.addEventListener('change', (e) => {
            const eventTarget = findParentNode(e.target, 'LI')
            const idx = getIndex(eventTarget)
            // localStorage checked 값 갱신
            const todoData = getTodoData()
            todoData[idx].checked = !todoData[idx].checked
            setTodoData(todoData)
            // text 스타일 변경
            text.className = e.target.checked ? 'todo-text-done' : 'todo-text'
        })
    }

    // [func]처음 로딩시 localStorage 데이터 불러오기
    (function loadTodo () {
        const todoData = getTodoData()
        if (todoData.length === 0) {
            todoList.append(noItemMsg)
        } else {
            const todoArr = JSON.parse(localStorage.getItem('todo-data'))
            todoArr.forEach(todoObj => createTodoItem(todoObj))
        }
    })()

    // [func]todo 추가 함수
    const addTodo = () => {
        // 입력값 유효성 검증
        const todoText = inputTodo.value.trim()
        if (!todoText) {
            alert('할 일을 입력해주세요')
            inputTodo.value = null
            inputTodo.focus()
            return
        }

        // localStorage에 저장할 value값<object> 생성
        const todoObj = new Todo(todoText)

        // localStorage 데이터 저장
        const todoArr = getTodoData()
        todoArr.push(todoObj)
        setTodoData(todoArr)

        // todoItem(li태그) 생성 함수 호출
        createTodoItem(todoObj)

        // todoItem 추가 후 입력창 초기화
        inputTodo.value = null

        // li태그 개수 세기
        const todoCnt = document.getElementsByTagName('li').length
        if (todoCnt === 1) todoList.removeChild(noItemMsg)
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
        // 빈 배열 초기화
        setTodoData([])
        todoList.append(noItemMsg)
    })

    // ----------------------------------------------------//
    // todo 수정
    const editModal = document.querySelector('.modal-wrap')
    const editInput = document.querySelector('.input-edit')
    const updateBtn = document.querySelector('.btn-update')

    // [func]모달 열기
    const openModal = (e) => {
        editModal.style.display = 'flex'

        // localStorage txt 값 가져와서 input창에 보여주기
        const eventTarget = findParentNode(e.target, 'LI')
        const idx = getIndex(eventTarget)
        const targetObj = getTodoData()[idx]
        editInput.value = targetObj.txt

        // 수정중인 아이템 인덱스값 세션에 저장
        sessionStorage.setItem('edit', idx)
    }

    // [func]모달 닫기
    function closeModal () {
        editModal.style.display = 'none'
    }

    // [func]todo 수정 업데이트
    const updateTodo = () => {
        // 현재 수정 대상 데이터 가져오기
        const editIdx = sessionStorage.getItem('edit')
        const todoData = getTodoData()
        const editItem = todoList.children[editIdx]
        const editTxt = editItem.children[1]

        // localStorage 변경된 값 저장
        todoData[editIdx].txt = editInput.value
        setTodoData(todoData)

        // span태그 text 변경
        editTxt.textContent = editInput.value

        // 모달창 닫기
        closeModal()
    }

    todoList.addEventListener('dblclick', openModal)
    updateBtn.addEventListener('click', updateTodo)
    editInput.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) updateTodo()
    })
    editModal.addEventListener('click', (e) => {
        if (e.target.className === 'modal-wrap' || e.target.tagName === 'I') closeModal()
    })
})
