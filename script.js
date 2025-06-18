// Variables to store calculator state
let currentInput = '0';
let previousInput = '0';
let currentOperator = null;
let shouldResetScreen = false;
let currentExpression = '';
let calculationHistory = [];

// Check if we have history in localStorage
if (localStorage.getItem('calculatorHistory')) {
    try {
        calculationHistory = JSON.parse(localStorage.getItem('calculatorHistory'));
    } catch (e) {
        calculationHistory = [];
    }
}

// DOM element for result display
let resultDisplay;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    resultDisplay = document.getElementById('result');
    
    // Initialize display
    if (resultDisplay) {
        updateDisplay();
    }
    
    // Initialize history if we're on history page
    if (window.location.pathname.includes('history.html')) {
        displayHistory();
        
        // Add event listener to clear history button
        const clearHistoryButton = document.getElementById('clear-history');
        if (clearHistoryButton) {
            clearHistoryButton.addEventListener('click', clearHistory);
        }
    }
});

// Function to update display
function updateDisplay() {
    if (!resultDisplay) return;
    resultDisplay.value = currentInput;
}

// Function to append number to current input
function appendNumber(number) {
    if (shouldResetScreen) {
        currentInput = '0';
        currentExpression = '';
        shouldResetScreen = false;
    }
    
    // Handle decimal point
    if (number === '.') {
        if (currentInput.includes('.')) return;
        currentInput += '.';
    } else {
        // Replace initial 0 with number unless it's a decimal
        if (currentInput === '0' && number !== '.') {
            currentInput = number;
        } else {
            currentInput += number;
        }
    }
    
    updateDisplay();
}

// Function to append operator
function appendOperator(operator) {
    if (currentOperator !== null) calculate();
    
    previousInput = currentInput;
    currentOperator = operator;
    currentExpression = previousInput + ' ' + currentOperator;
    shouldResetScreen = true;
}

// Function to calculate result
function calculate() {
    if (currentOperator === null || shouldResetScreen) return;
    
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    // Complete the expression
    currentExpression = prev + ' ' + currentOperator + ' ' + current;
    
    switch (currentOperator) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                result = 'Error';
            } else {
                result = prev / current;
            }
            break;
        default:
            return;
    }
    
    // Format result to avoid excessively long decimals
    if (typeof result === 'number') {
        currentInput = result.toString();
        if (currentInput.includes('.')) {
            const parts = currentInput.split('.');
            if (parts[1].length > 8) {
                currentInput = result.toFixed(8).replace(/\.?0+$/, '');
            }
        }
        
        // Save to history
        saveToHistory(currentExpression, currentInput);
    } else {
        currentInput = result;
    }
    
    currentOperator = null;
    shouldResetScreen = true;
    updateDisplay();
}

// Function to save calculation to history
function saveToHistory(expression, result) {
    // Only save valid calculations
    if (expression && result && result !== 'Error') {
        calculationHistory.unshift({
            expression: expression,
            result: result,
            timestamp: new Date().toISOString()
        });
        
        // Limit history to 50 items
        if (calculationHistory.length > 50) {
            calculationHistory.pop();
        }
        
        // Save to localStorage
        localStorage.setItem('calculatorHistory', JSON.stringify(calculationHistory));
    }
}

// Function to display history
function displayHistory() {
    const historyContainer = document.getElementById('history-container');
    
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    if (calculationHistory.length === 0) {
        // Add a message if history is empty
        historyContainer.innerHTML = `
            <div class="flex items-center justify-center p-10">
                <p class="text-[#60748a] text-sm">No calculation history yet</p>
            </div>
        `;
        return;
    }
    
    // Add each history item
    calculationHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between';
        historyItem.innerHTML = `
            <div class="flex flex-col justify-center">
                <p class="text-[#111418] text-base font-medium leading-normal line-clamp-1">${item.result}</p>
                <p class="text-[#60748a] text-sm font-normal leading-normal line-clamp-2">${item.expression}</p>
            </div>
            <div class="shrink-0">
                <div class="text-[#111418] flex size-7 items-center justify-center" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
                    </svg>
                </div>
            </div>
        `;
        
        // Add event listener to restore this calculation
        historyItem.querySelector('.shrink-0').addEventListener('click', () => {
            restoreCalculation(index);
        });
        
        historyContainer.appendChild(historyItem);
    });
}

// Function to restore calculation from history
function restoreCalculation(index) {
    const item = calculationHistory[index];
    
    if (item) {
        // Store the value in localStorage to restore in the calculator page
        localStorage.setItem('calculatorRestore', JSON.stringify({
            result: item.result,
            expression: item.expression
        }));
        
        // Navigate to calculator
        window.location.href = 'index.html';
    }
}

// Function to check for restored calculation on calculator page
function checkForRestoredCalculation() {
    if (!resultDisplay) return;
    
    const restored = localStorage.getItem('calculatorRestore');
    
    if (restored) {
        try {
            const data = JSON.parse(restored);
            currentInput = data.result;
            updateDisplay();
            
            // Clear the restored data
            localStorage.removeItem('calculatorRestore');
        } catch (e) {
            console.error('Failed to restore calculation:', e);
        }
    }
}

// Function to clear display
function clearDisplay() {
    currentInput = '0';
    previousInput = '0';
    currentOperator = null;
    currentExpression = '';
    shouldResetScreen = false;
    updateDisplay();
}

// Function to clear history
function clearHistory() {
    calculationHistory = [];
    localStorage.removeItem('calculatorHistory');
    displayHistory();
}

// Function for backspace operation
function backspace() {
    if (currentInput === '0' || currentInput === 'Error' || 
        currentInput.length === 1 || shouldResetScreen) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Check if we need to restore a calculation
    if (window.location.pathname.includes('index.html') || 
        window.location.pathname.endsWith('/')) {
        checkForRestoredCalculation();
    }
});

// Add keyboard support
document.addEventListener('keydown', (event) => {
    if (window.location.pathname.includes('history.html')) return;
    
    if (event.key >= '0' && event.key <= '9') appendNumber(event.key);
    if (event.key === '.') appendNumber('.');
    
    if (event.key === '+') appendOperator('+');
    if (event.key === '-') appendOperator('-');
    if (event.key === '*') appendOperator('*');
    if (event.key === '/') appendOperator('/');
    
    if (event.key === 'Enter' || event.key === '=') calculate();
    if (event.key === 'Escape') clearDisplay();
    if (event.key === 'Backspace') backspace();
});
