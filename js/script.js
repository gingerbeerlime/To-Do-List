document.addEventListener('DOMContentLoaded', () => {
    const inputTodo = document.querySelector('.input-todo');
    const addBtn = document.querySelector('.btn-add');
    const toDoList = document.querySelector('.to-do-list');
    const clearAllBtn = document.querySelector('.btn-clear-all');
    
    // 로컬스토리지temp
    const todoKeyArr = Object.keys(localStorage).sort(function(a, b) {return a - b; });

    // 브라우저 로딩시 로컬스토리지 데이터 가져와서 표시하기
    (function setTodo() {
        for(let key of todoKeyArr) {
            // 태그 생성
            const item = document.createElement('li');
            const chkLbl = document.createElement('label');
            const chkInput = document.createElement('input');
            const chkIcon = document.createElement('span');
            const text = document.createElement('span');
            const removeBtn = document.createElement('button');
            const removeIcon = document.createElement('i');

            // item key값 부여
            item.setAttribute('data-key', key);

            // 체크박스 조작(label, input, span)
            chkInput.type = 'checkbox';
            chkIcon.classList.add('check-icon');
            chkLbl.append(chkInput, chkIcon);
            // 체크시 text 스타일 변화
            chkInput.addEventListener('change', (e) => {
                text.className = e.target.checked ? 'to-do-text-done' : 'to-do-text';
            })

            // text 조작(**다른 부분)
            text.textContent = localStorage.getItem(key);
            text.classList.add('to-do-text');
            // todo 로컬 스토리지 저장(**다른 부분, 삭제)
            // localStorage.setItem(key, todoText);

            // removeBtn 조작
            removeIcon.className = 'fa-solid fa-trash';
            removeBtn.append(removeIcon);
            removeBtn.type = 'button';
            removeBtn.classList.add('btn-remove');

            // item 조작
            item.append(chkLbl, text, removeBtn);
            item.classList.add('to-do-item');

            // toDoList에 아이템 추가
            toDoList.append(item);

            // 1-2) 투두 삭제 함수
            const removeTodo = (key) => {
                const removeItem = document.querySelector(`[data-key="${key}"]`);
                toDoList.removeChild(removeItem);
                // 로컬스토리지에서 데이터 삭제
                localStorage.removeItem(key);
            }

            // 투두 삭제 함수 호출
            removeBtn.addEventListener('click', () => {
                removeTodo(key);
                todoCnt = document.getElementsByTagName('li').length;
                if(todoCnt === 0) toDoList.append(noItemMsg);
            });

        }  
    })();

    // todo item key부여
    let curKey;
    if(localStorage.length === 0) curKey = 0;
    else curKey = Number(todoKeyArr[todoKeyArr.length - 1]) + 1;
    
    // todo item 0개일 때 표시메시지
    const noItemMsg = document.createElement('p');
    noItemMsg.textContent = 'To Do List가 비어있습니다.';
    noItemMsg.classList.add('no-to-do-item');
    if(localStorage.length === 0) toDoList.append(noItemMsg);

    // 1) 투두 추가 함수
    const addTodo = () => {
        // 태그 생성
        const item = document.createElement('li');
        const chkLbl = document.createElement('label');
        const chkInput = document.createElement('input');
        const chkIcon = document.createElement('span');
        const text = document.createElement('span');
        const removeBtn = document.createElement('button');
        const removeIcon = document.createElement('i');          

        // 입력값 유효성 검증
        const todoText = inputTodo.value.trim();
        if(!todoText) {
            alert("할 일을 입력해주세요");
            inputTodo.value = null;
            inputTodo.focus();
            return;
        } 

        let key = curKey++;
        item.setAttribute('data-key', key);

        // 체크박스 조작(label, input, span)
        chkInput.type = 'checkbox';
        chkIcon.classList.add('check-icon');
        chkLbl.append(chkInput, chkIcon);
        // 체크시 text 스타일 변화
        chkInput.addEventListener('change', (e) => {
            text.className = e.target.checked ? 'to-do-text-done' : 'to-do-text';
        })

        // text 조작
        text.textContent = todoText;
        text.classList.add('to-do-text');
        // todo 로컬 스토리지 저장
        localStorage.setItem(key, todoText);

        // removeBtn 조작
        removeIcon.className = 'fa-solid fa-trash';
        removeBtn.append(removeIcon);
        removeBtn.type = 'button';
        removeBtn.classList.add('btn-remove');

        // item 조작
        item.append(chkLbl, text, removeBtn);
        item.classList.add('to-do-item');

        // toDoList에 아이템 추가
        toDoList.append(item);

        // 아이템 추가 후 입력값 초기화
        inputTodo.value = null;

        // li태그 개수 세기
        let todoCnt = document.getElementsByTagName('li').length;
        if(todoCnt === 1) toDoList.removeChild(noItemMsg);

        // 1-2) 투두 삭제 함수
        const removeTodo = (key) => {
            const removeItem = document.querySelector(`[data-key="${key}"]`);
            toDoList.removeChild(removeItem);
            // 로컬스토리지에서 데이터 삭제
            localStorage.removeItem(key);
        }

        // 투두 삭제 함수 호출
        removeBtn.addEventListener('click', () => {
            removeTodo(key);
            todoCnt = document.getElementsByTagName('li').length;
            if(todoCnt === 0) toDoList.append(noItemMsg);
        });
        // removeBtn.addEventListener('click', removeTodo) 작동안함
    }

    // 투두 추가 함수 호출
    addBtn.addEventListener('click', addTodo);
    inputTodo.addEventListener('keyup', (e) => {
        if(e.keyCode === 13) addTodo();
    })

    // 2) 초기화(전체 삭제)
    clearAllBtn.addEventListener('click', () => {
        while(toDoList.hasChildNodes()) {
            toDoList.removeChild(toDoList.firstChild);
        }
        // 로컬스토리지 초기화
        localStorage.clear();
        toDoList.append(noItemMsg);
    })  
})