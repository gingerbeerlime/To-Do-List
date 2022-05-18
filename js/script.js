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
    } else {
        curKey = Number(todoKeys[todoKeys.length - 1]) + 1
    }

    // [func]todoItem(li태그) 생성 함수
    // @param key <string> = localStorage key(오름차순)
    // @param todoValue <object> { txt : todo내용, check : true/false(default) }
    const createTodoItem = (key, todoValue) => {
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
        // @param : todoValue > check
        if (todoValue.check) {
            chkInput.checked = true
            text.className = 'todo-text-done'
        }
        // 체크박스 이벤트
        chkInput.addEventListener('change', (e) => {
            text.className = e.target.checked ? 'todo-text-done' : 'todo-text'
            const targetObj = JSON.parse(localStorage.getItem(key))
            // 이벤트 발생시 [checked] true <=> false 전환
            targetObj.check = !targetObj.check
            localStorage.setItem(key, JSON.stringify(targetObj))
        })

        // @param todoValue > txt
        text.textContent = todoValue.txt
        text.classList.add('todo-text')

        // removeBtn 조작
        removeIcon.className = 'fa-solid fa-trash'
        removeBtn.append(removeIcon)
        removeBtn.type = 'button'
        removeBtn.classList.add('btn-remove')

        // item(li태그) 조작
        // @param key
        item.setAttribute('data-key', key)
        item.append(chkLbl, text, removeBtn)
        item.classList.add('todo-item')

        todoList.append(item)

        // [func]todoItem(li태그) 개별 삭제 함수
        const removeTodo = (key) => {
            const removeItem = document.querySelector(`[data-key="${key}"]`)
            todoList.removeChild(removeItem)
            localStorage.removeItem(key)
        }

        // todoItem(li태그) 개별 삭제 함수 호출
        removeBtn.addEventListener('click', () => {
            removeTodo(key)
            const todoCnt = document.getElementsByTagName('li').length
            if (todoCnt === 0) todoList.append(noItemMsg)
        })
    }

    // [func]처음 로딩시 localStorage 데이터 불러오기
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

    // todo 수정
    const editModal = document.querySelector('.modal-wrap')
    const editInput = document.querySelector('.input-edit')
    const updateBtn = document.querySelector('.btn-update')

    // [func]todo 수정 모달 열기 함수
    const openModal = (e) => {
        editModal.style.display = 'flex'
        // localStorage todo-txt 값 가져와서 input창에 보여주기
        const targetKey = e.target.getAttribute('data-key') ?? e.target.parentNode.getAttribute('data-key')
        const targetObj = JSON.parse(localStorage.getItem(targetKey))
        editInput.value = targetObj.txt
        // 현재 수정 대상 data-key값 sessionStorage 등록
        sessionStorage.setItem('edit', targetKey)
    }

    // [func]todo 수정 업데이트 함수
    const updateTodo = () => {
        // 현재 수정 대상 데이터 가져오기
        const editKey = sessionStorage.getItem('edit')
        const editObj = JSON.parse(localStorage.getItem(editKey))
        const editItem = document.querySelector(`[data-key="${editKey}"]`)
        // span 태그
        const editTxt = editItem.children[1]

        // localStorage 변경된 값 저장
        editObj.txt = editInput.value
        localStorage.setItem(editKey, JSON.stringify(editObj))
        // span태그 text 변경
        editTxt.textContent = editInput.value

        // 모달창 닫기
        closeModal()
    }

    // [func] 모달 닫기 함수
    function closeModal () {
        editModal.style.display = 'none'
    }

    todoList.addEventListener('dblclick', openModal)
    updateBtn.addEventListener('click', updateTodo)
    editInput.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) updateTodo()
    })
    // 외부레이어 클릭 or 닫기 버튼 클릭시 모달 닫기
    editModal.addEventListener('click', (e) => {
        if (e.target.className === 'modal-wrap' || e.target.tagName === 'I') closeModal()
    })
})
