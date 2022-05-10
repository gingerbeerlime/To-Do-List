document.addEventListener('DOMContentLoaded', () => {
    const inputTodo = document.querySelector('.input-todo')
    const addBtn = document.querySelector('.btn-add')
    const todoList = document.querySelector('.todo-list')
    const clearAllBtn = document.querySelector('.btn-clear-all')
    // todolist 비었을 때 msg
    const noItemMsg = document.createElement('p')
    noItemMsg.textContent = 'To Do List가 비어있습니다.'
    noItemMsg.classList.add('no-item')

    // localStorage key 불러오기
    const todoKeys = Object.keys(localStorage).sort(function (a, b) { return a - b })

    // 추가될 todo item의 key값 부여
    let curKey
    if (localStorage.length === 0) {
        curKey = 0
        todoList.append(noItemMsg)
    } else curKey = Number(todoKeys[todoKeys.length - 1]) + 1

    // [func]todoItem(li태그) 생성 함수
    const createTodoItem = (key, todoValue) => {
    // @param key = key
    // @param todoValue <object> { txt : todotext, check : false }
        const item = document.createElement('li')
        const chkLbl = document.createElement('label')
        const chkInput = document.createElement('input')
        const chkIcon = document.createElement('span')
        const text = document.createElement('span')
        const removeBtn = document.createElement('button')
        const removeIcon = document.createElement('i')

        // 체크박스 조작(label, input, span)
        chkInput.type = 'checkbox'
        chkIcon.classList.add('check-icon')
        chkLbl.append(chkInput, chkIcon)
        // 체크박스 표시
        if (todoValue.check) {
            chkInput.checked = true
            text.className = 'todo-text-done'
        }
        // 체크박스 이벤트
        chkInput.addEventListener('change', (e) => {
            text.className = e.target.checked ? 'todo-text-done' : 'todo-text'
            const targetObj = JSON.parse(localStorage.getItem(key))

            targetObj.check = !targetObj.check
            // targetObj.check ? targetObj.check = false : targetObj.check = true

            localStorage.setItem(key, JSON.stringify(targetObj))
        })

        // @param <object> todoValue { txt : todo내용, check: true/false }
        text.textContent = todoValue.txt
        text.classList.add('todo-text')

        // removeBtn 조작
        removeIcon.className = 'fa-solid fa-trash'
        removeBtn.append(removeIcon)
        removeBtn.type = 'button'
        removeBtn.classList.add('btn-remove')

        // item 조작
        // item key값 속성 부여 @param key
        item.setAttribute('data-key', key)
        item.append(chkLbl, text, removeBtn)
        item.classList.add('todo-item')
        // todolist(<ul>)에 item(<li>)추가
        todoList.append(item)

        // [func]todoItem(li태그) 개별 삭제 함수
        const removeTodo = (key) => {
            const removeItem = document.querySelector(`[data-key="${key}"]`)
            todoList.removeChild(removeItem)
            // localStorage 해당 데이터 삭제
            localStorage.removeItem(key)
        }

        // todoItem(li태그) 개별 삭제 함수 호출
        // ?여기서 key랑 상위 스코프 key랑 구분되는 이유,,?
        // 이벤트 버블링, 스코프
        removeBtn.addEventListener('click', () => {
            removeTodo(key)
            const todoCnt = document.getElementsByTagName('li').length
            if (todoCnt === 0) todoList.append(noItemMsg)
        })
    }

    // 처음 로딩시 localStorage 데이터 불러오기
    (function loadTodo () {
        let todoValue
        for (const key of todoKeys) {
            todoValue = JSON.parse(localStorage.getItem(key))
            // todoItem(li태그) 생성 함수 호출
            createTodoItem(key, todoValue)
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

        // localStorage에 저장할 todo Key
        const key = curKey++
        // localStorage에 저장할 todo Value
        const todoValue = {}
        todoValue.txt = todoText
        todoValue.check = false
        // localStorage 데이터 저장
        localStorage.setItem(key, JSON.stringify(todoValue))

        // todoItem(li태그) 생성 함수 호출
        createTodoItem(key, todoValue)

        // todoItem 추가 후 입력창 초기화
        inputTodo.value = null

        // li태그 개수 세기
        const todoCnt = document.getElementsByTagName('li').length
        if (todoCnt === 1) todoList.removeChild(noItemMsg)
    }

    // todo 추가 함수 호출
    addBtn.addEventListener('click', addTodo)
    inputTodo.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) addTodo()
    })

    // todo 초기화(전체 삭제)
    clearAllBtn.addEventListener('click', () => {
        while (todoList.hasChildNodes()) {
            todoList.removeChild(todoList.firstChild)
        }
        localStorage.clear()
        todoList.append(noItemMsg)
    })
})
