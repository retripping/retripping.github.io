let attempts = {}; // Хранит количество попыток для каждой задачи
let tasksData = []; // Глобальная переменная для хранения загруженных задач
let solutionStates = {}; // Хранит состояние свёрнутости для каждой задачи (expanded/collapsed)

function checkAnswer(taskId, correctAnswers) {
    if (!correctAnswers) {
        console.error('Не переданы правильные ответы для задачи', taskId);
        showError('Ошибка в задаче. Попробуйте позже.');
        return;
    }
    console.log('Функция checkAnswer вызвана с параметрами:', taskId, correctAnswers);

    if (!attempts[taskId]) {
        attempts[taskId] = 0;
    }

    const inputX = document.getElementById(`${taskId}-x`);
    const inputY = document.getElementById(`${taskId}-y`);
    const inputZ = document.getElementById(`${taskId}-z`);
    const checkButton = document.querySelector(`.check-btn[data-task-id="${taskId}"]`); // Находим кнопку "Проверить"
    
    const userX = parseFloat(inputX.value);
    const userY = parseFloat(inputY.value);
    const userZ = parseFloat(inputZ.value);

    console.log('Введенные значения:', userX, userY, userZ);
    console.log('Правильные ответы:', correctAnswers);

    // Проверка заполнения полей
    if (isNaN(userX)) {
        highlightError(inputX);
        showError('Пожалуйста, введите значение X');
        return;
    }
    if (isNaN(userY)) {
        highlightError(inputY);
        showError('Пожалуйста, введите значение Y');
        return;
    }
    if (isNaN(userZ)) {
        highlightError(inputZ);
        showError('Пожалуйста, введите значение Z');
        return;
    }

    // Проверка точности ответов
    const isCorrect = Math.abs(userX - correctAnswers.x) < 0.01 &&
                     Math.abs(userY - correctAnswers.y) < 0.01 &&
                     Math.abs(userZ - correctAnswers.z) < 0.01;

    console.log('Проверка ответа:', isCorrect);

    // Функция для фиксации полей ввода
    const disableInputs = () => {
        inputX.disabled = true;
        inputY.disabled = true;
        inputZ.disabled = true;
    };

    // Функция для фиксации кнопки
    const disableButton = () => {
        checkButton.disabled = true;
    };

    if (isCorrect) {
        markInputsCorrect([inputX, inputY, inputZ]);
        showSolution(taskId);
        showSuccess('Правильно! Решение показано.');
        attempts[taskId] = 0;
        disableInputs(); // Фиксируем поля ввода
        disableButton(); // Фиксируем кнопку
        checkButton.classList.add('success'); // Добавляем класс для стилизации
        checkButton.innerHTML = '<i class="fas fa-check"></i> Успех!'; // Меняем текст для успеха
    } else {
        attempts[taskId]++;
        markInputsIncorrect([inputX, inputY, inputZ]);
        
        if (attempts[taskId] >= 3) {
            showSolution(taskId);
            showError('Вы использовали все 3 попытки. Решение показано.');
            attempts[taskId] = 0;
            disableInputs(); // Фиксируем поля ввода
            disableButton(); // Фиксируем кнопку
            checkButton.innerHTML = '<i class="fas fa-times"></i> Попытки закончились'; // Меняем текст
        } else {
            showError(`Неверно! Осталось попыток: ${3 - attempts[taskId]}`);
        }
    }
}


// Вспомогательные функции для отображения состояния
function highlightError(input) {
    input.classList.add('error-highlight');
    setTimeout(() => input.classList.remove('error-highlight'), 1000);
}

function markInputsCorrect(inputs) {
    inputs.forEach(input => {
        input.classList.add('input-correct');
        input.classList.remove('input-incorrect');
    });
}

function markInputsIncorrect(inputs) {
    inputs.forEach(input => {
        input.classList.add('input-incorrect');
        input.classList.remove('input-correct');
    });
}


function showAlert(message, type) {
    // Создаем контейнер если его нет
    let container = document.querySelector('.alert-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'alert-container';
        document.body.appendChild(container);
    }
    
    // Создаем уведомление
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    console.log('Создан alert:', alert);
    console.log('Контейнер:', container);
    // Добавляем иконку в зависимости от типа
    const iconClass = type === 'error' 
        ? 'fas fa-exclamation-circle' 
        : 'fas fa-check-circle';
    
    alert.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
    `;
    
    // Добавляем в DOM
    container.appendChild(alert);
    
    // Удаляем через 3 секунды
    setTimeout(() => {
        alert.style.animation = 'alertFadeOut 0.3s forwards';
        setTimeout(() => alert.remove(), 300);
    }, 3000);
}

// Обновленные функции для вызова
function showError(message) {
    console.log('showError вызвана с сообщением:', message);
    showAlert(message, 'error');
}

function showSuccess(message) {
    showAlert(message, 'success');
}

function createAlertContainer() {
    const container = document.createElement('div');
    container.className = 'alert-container';
    document.body.appendChild(container);
    return container;
}

function getIconClass(type) {
    return type === 'error' ? 'fa-solid fa-circle-exclamation' 
                          : 'fa-solid fa-circle-check';
}

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

async function loadTasks() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        const data = await response.json();
        
        if (!data.tasks) throw new Error('Поле tasks отсутствует в JSON');
        
        tasksData = data.tasks;
        console.log('Загруженные задачи:', tasksData); // Отладочное сообщение
        displayTasks(tasksData);
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showError('Не удалось загрузить задачи. Пожалуйста, попробуйте позже.');
    }
}

function displayTasks(tasks) {
    const tasksContainer = document.getElementById('tasks-container');
    if (!tasksContainer) return;

    tasksContainer.innerHTML = tasks.map(task => {
        const correctAnswers = task.correctAnswers;
        console.log('Правильные ответы из JSON:', correctAnswers);

        return `
        <div class="task-card">
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <div class="formula-container">
                <div class="input-group">
                    ${['x', 'y', 'z'].map(v => `
                    <div class="input-field">
                        <label>${v} =</label>
                        <input type="number" id="${task.id}-${v}" placeholder="0" step="any">
                    </div>
                    `).join('')}
                </div>
                <button class="check-btn" data-task-id="${task.id}">
                    <i class="fas fa-check"></i> Проверить
                </button>
            </div>
            <div id="${task.id}-solution" class="solution"></div>
        </div>`;
    }).join('');

    // Добавляем обработчики событий
    document.querySelectorAll('.check-btn').forEach(button => {
        const taskId = button.getAttribute('data-task-id');
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            button.addEventListener('click', () => {
                console.log('Кнопка нажата для задачи:', taskId); // Отладка
                checkAnswer(taskId, task.correctAnswers);
            });
        }
    });

    if (typeof MathJax !== 'undefined') {
        MathJax.typeset();
    }
}

function submitAnswer(taskId, correctAnswers) {
    const input = document.getElementById(`${taskId}-input`);
    if (!input) return;
    
    const userAnswer = input.value;
    if (!userAnswer) {
        alert('Пожалуйста, введите ответ');
        return;
    }
    
    checkAnswer(taskId, userAnswer, correctAnswers);
}


function showSolution(taskId) {
    console.log('Показываем решение для задачи:', taskId);
    
    const solution = document.getElementById(`${taskId}-solution`);
    const task = tasksData.find(t => t.id === taskId);
    
    if (!task || !solution) {
        console.error('Решение или задача не найдены');
        return;
    }

    // Инициализируем состояние, если оно ещё не задано
    if (!solutionStates[taskId]) {
        solutionStates[taskId] = 'expanded'; // Изначально решение развёрнуто
    }

    const isCollapsed = solutionStates[taskId] === 'collapsed';
    const initialIconClass = isCollapsed ? 'fas fa-chevron-down rotate-down' : 'fas fa-chevron-up rotate-up';
    const initialText = isCollapsed ? 'Показать решение' : 'Скрыть решение';
    const initialDisplay = isCollapsed ? 'none' : 'block';
    const initialBarClass = isCollapsed ? 'toggle-solution-bar' : 'toggle-solution-bar active';

    solution.innerHTML = `
        <div class="${initialBarClass}" onclick="toggleSolutionContent('${taskId}')">
            <span class="toggle-solution-text">${initialText}</span>
            <i class="${initialIconClass}"></i>
        </div>
        <div class="solution-content">
            <div class="method-toggle">
                <button class="method-btn active" onclick="showMethod('${taskId}', 'kramer')">
                    <i class="fas fa-calculator"></i> Метод Крамера
                </button>
                <button class="method-btn" onclick="showMethod('${taskId}', 'gauss')">
                    <i class="fas fa-table"></i> Метод Гаусса
                </button>
            </div>
            <div id="${taskId}-method-content" class="method-content">
                <h4>Решение методом Крамера</h4>
                <ol>
                    ${task.solutions.kramer.steps.map(step => `
                        <li><strong>${step.title}:</strong> ${step.content}</li>
                    `).join('')}
                </ol>
                <p><strong>Ответ:</strong> ${task.solutions.kramer.answer}</p>
            </div>
        </div>
    `;

    const solutionContent = solution.querySelector('.solution-content');
    solutionContent.style.display = initialDisplay;

    solution.classList.add('visible');

    if (typeof MathJax !== 'undefined' && typeof MathJax.typesetPromise !== 'undefined') {
        console.log('Запускаем MathJax для рендеринга...');
        MathJax.typesetPromise([solution]).then(() => {
            console.log('MathJax рендеринг завершён');
            solution.style.display = 'block';
        }).catch(err => {
            console.error('Ошибка MathJax:', err);
            solution.style.display = 'block';
        });
    } else {
        console.warn('MathJax не найден, отображаем без рендеринга');
        solution.style.display = 'block';
    }
}

function showMethod(taskId, method) {
    const methodContent = document.getElementById(`${taskId}-method-content`);
    const task = tasksData.find(t => t.id === taskId);
    const buttons = document.querySelectorAll(`#${taskId}-solution .method-btn`);

    if (!methodContent || !task) {
        console.error('Контейнер метода или задача не найдены:', taskId);
        return;
    }

    console.log('Переключаем метод на:', method);

    // Обновляем активную кнопку
    buttons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.includes(method === 'kramer' ? 'Крамера' : 'Гаусса')) {
            btn.classList.add('active');
        }
    });

    // Обновляем содержимое
    if (method === 'kramer') {
        methodContent.innerHTML = `
            <h4>Решение методом Крамера</h4>
            <ol>
                ${task.solutions.kramer.steps.map(step => `
                    <li><strong>${step.title}:</strong> ${step.content}</li>
                `).join('')}
            </ol>
            <p><strong>Ответ:</strong> ${task.solutions.kramer.answer}</p>
        `;
    } else {
        methodContent.innerHTML = `
            <h4>Решение методом Гаусса</h4>
            <ol>
                ${task.solutions.gauss.steps.map(step => `
                    <li><strong>${step.title}:</strong> ${step.content}</li>
                `).join('')}
            </ol>
            <p><strong>Ответ:</strong> ${task.solutions.gauss.answer}</p>
        `;
    }

    console.log('Содержимое метода обновлено:', methodContent.innerHTML);

    if (typeof MathJax !== 'undefined') {
        console.log('Запускаем MathJax для метода...');
        MathJax.typesetPromise([methodContent]).then(() => {
            console.log('MathJax рендеринг метода завершён');
        }).catch(err => {
            console.error('Ошибка MathJax при рендеринге метода:', err);
        });
    } else {
        console.warn('MathJax не найден');
    }
}

function toggleSolutionContent(taskId) {
    const solution = document.getElementById(`${taskId}-solution`);
    const solutionContent = solution.querySelector('.solution-content');
    const toggleBar = solution.querySelector('.toggle-solution-bar');
    const toggleIcon = toggleBar.querySelector('i');
    const toggleText = toggleBar.querySelector('.toggle-solution-text');

    if (solutionContent.style.display === 'none') {
        // Разворачиваем
        solutionContent.style.display = 'block';
        toggleIcon.className = 'fas fa-chevron-up rotate-up'; // Стрелка вверх
        toggleText.textContent = 'Скрыть решение';
        toggleBar.classList.add('active'); // Добавляем класс active
        solutionStates[taskId] = 'expanded'; // Обновляем состояние
    } else {
        // Сворачиваем
        solutionContent.style.display = 'none';
        toggleIcon.className = 'fas fa-chevron-down rotate-down'; // Стрелка вниз
        toggleText.textContent = 'Показать решение';
        toggleBar.classList.remove('active'); // Удаляем класс active
        solutionStates[taskId] = 'collapsed'; // Обновляем состояние
    }
}

document.addEventListener('DOMContentLoaded', loadTasks);
