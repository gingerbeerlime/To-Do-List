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
    const targetLI = eTarget.tagName === 'LI' ? eTarget : findParentLINode(eTarget)
    const idx = [...todoItems].findIndex(item => item === targetLI)
    return idx
}

const countTodoItem = () => document.getElementsByTagName('LI').length

export {
    getTodoData,
    setTodoData,
    findParentLINode,
    getIndex,
    countTodoItem
}
