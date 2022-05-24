document.addEventListener('DOMContentLoaded', () => {
    const inputTodo = document.querySelector('.input-todo')
    const addBtn = document.querySelector('.btn-add')
    const todoList = document.querySelector('.todo-list')
    const clearAllBtn = document.querySelector('.btn-clear-all')

    // todolist 비었을 때 msg
    const noItemMsg = document.createElement('p')
    noItemMsg.textContent = 'To Do List가 비어있습니다.'
    noItemMsg.classList.add('no-item')

    // [class]localStorage value값<object> 생성 클래스
    class Todo {
        constructor (txt) {
            this.txt = txt
            this.checked = false
        }
    }

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
        if (!eventTarget) return itemList.length
        for (let idx = 0; idx < itemList.length; idx++) {
            if (eventTarget === itemList[idx]) return idx
        }
    }

    // [func]parentNode 중 특정 태그 찾는 함수
    // @param tagName : 찾고싶은 tag종류 전달
    function findParentNode (eTarget, tagName) {
        if (eTarget.tagName === tagName) return eTarget
        else if (eTarget.tagName === 'UL') return null
        while (eTarget.parentNode.tagName !== tagName) {
            eTarget = eTarget.parentNode
        }
        return eTarget.parentNode
    }

    // [func]todoItem(li태그) 생성 함수
    // @param todoObj <object> { txt : todo내용, checked : true/false(default) }
    const createTodoItem = (todoObj) => {
        const item = document.createElement('li')
        const wrapper = document.createElement('div')
        const chkLbl = document.createElement('label')
        const chkInput = document.createElement('input')
        const chkIcon = document.createElement('span')
        const text = document.createElement('span')
        const removeBtn = document.createElement('button')
        const removeIcon = document.createElement('i')
        const sortIcon = document.createElement('i')

        // checkbox 조작(label, input, span)
        chkInput.type = 'checkbox'
        chkInput.classList.add('check-todo')
        chkIcon.classList.add('check-icon')
        chkLbl.classList.add('check-label')
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

        // ordering icon 조작
        sortIcon.style.display = 'none'
        sortIcon.className = 'fa-solid fa-sort'

        // wrapper 조작
        wrapper.append(chkLbl, text, removeBtn, sortIcon)
        wrapper.classList.add('todo-wrap')

        // item(li태그) 조작
        item.setAttribute('draggable', false)
        item.append(wrapper)
        item.classList.add('todo-item')

        // todolist(<ul>)에 item(<li>) 추가
        todoList.append(item)

        // -[func]todoItem localStorage 삭제 함수
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
            // 노드 삭제
            todoList.removeChild(removeItem)
            // todo Count
            const todoCnt = document.getElementsByTagName('LI').length
            if (todoCnt === 0) todoList.append(noItemMsg)
        })

        // -[event]checkbox check 이벤트
        chkInput.addEventListener('change', (e) => {
            const eventTarget = findParentNode(e.target, 'LI')
            const idx = getIndex(eventTarget)
            const todoData = getTodoData()

            // text 스타일 변경
            text.className = e.target.checked ? 'todo-text-done' : 'todo-text'

            // 체크된 값 변경, 이동
            todoData[idx].checked = !todoData[idx].checked

            if (todoData[idx].checked) {
                // Node 이동
                todoList.append(todoList.removeChild(todoList.children[idx]))
                // localStorage 값 이동
                todoData.push(...todoData.splice(idx, 1))
            } else {
                // 체크해제시 체크된 값 앞으로 이동
                console.log(e.target)
                // todoList.insertBefore(todoList.children[idx], todoList.children[dropIdx])
                // todoList.insertBefore(todoList.removeChild(todoList.children[idx]), 가장 첫번째 체크된 인덱스)
            }

            setTodoData(todoData)
        })
    }

    // [func]처음 로딩시 localStorage 데이터 불러오기
    (function loadTodo () {
        localStorage.getItem('todo-data') ?? localStorage.setItem('todo-data', JSON.stringify([]))
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
        const editTxt = editItem.firstChild.children[1]

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

    // ----------------------------------------------------//
    // drag and drop(todo 순서 바꾸기)

    // [func]drag start : 이동시킬 데이터 저장
    function onDragStart (e) {
        e.dataTransfer.setData('idx', getIndex(e.target))
        // <div>wrapper</div>
        const todoWrap = e.currentTarget.firstChild
        todoWrap.style.backgroundColor = '#588b8d'
        // <span>text</span>
        todoWrap.children[1].style.color = 'white'
        // <i>sort icon</i>
        todoWrap.children[3].style.color = 'white'
    }

    // [func]drop : 데이터 순서 정렬
    function onDrop (e) {
        const idx = Number(e.dataTransfer.getData('idx'))
        const dropIdx = getIndex(findParentNode(e.target, 'LI'))
        if (dropIdx === todoList.childElementCount) {
            todoList.append(todoList.children[idx])
        } else {
            todoList.insertBefore(todoList.children[idx], todoList.children[dropIdx])
        }

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
        const todoWrap = e.currentTarget.firstChild
        todoWrap.style.backgroundColor = '#c2e0d8de'
        todoWrap.children[3].style.color = '#588b8d'
        todoWrap.children[1].style.color = '#000'
    }

    const todoItems = document.getElementsByTagName('li')
    const chkSort = document.querySelector('.sort-check')

    // [event]수동 정렬 상태 전환(체크박스)
    chkSort.addEventListener('change', (e) => {
        const status = !!e.target.checked
        const removeBtns = document.querySelectorAll('.btn-remove')
        const sortIcons = document.querySelectorAll('.fa-sort')

        // drag 가능<->불가능 상태 전환
        for (const child of todoList.childNodes) {
            child.setAttribute('draggable', status)
        }

        // 수동정렬 상태일 때 휴지통 아이콘 -> 정렬 아이콘
        removeBtns.forEach(function (btn) {
            btn.style.display = status ? 'none' : 'flex'
        })
        sortIcons.forEach(function (icon) {
            icon.style.display = status ? 'flex' : 'none'
        })
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
            todoList.append(noItemMsg)
        }
    })
})
