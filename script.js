// Variables to store calculator state
let currentInput = '0';
let previousInput = '0';
let currentOperator = null;
let shouldResetScreen = false;

// DOM element for result display
const resultDisplay = document.getElementById('result');

// Function to update display
function updateDisplay() {
    resultDisplay.textContent = currentInput;
}

// Function to append number to current input
function appendNumber(number) {
    if (shouldResetScreen) {
        currentInput = '0';
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
    shouldResetScreen = true;
}

// Function to calculate result
function calculate() {
    if (currentOperator === null || shouldResetScreen) return;
    
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
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
        case '%':
            result = (prev * current) / 100;
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
    } else {
        currentInput = result;
    }
    
    currentOperator = null;
    shouldResetScreen = true;
    updateDisplay();
}

// Function to clear display
function clearDisplay() {
    currentInput = '0';
    previousInput = '0';
    currentOperator = null;
    shouldResetScreen = false;
    updateDisplay();
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

// Initialize display on page load
window.addEventListener('DOMContentLoaded', () => {
    updateDisplay();
});

// Add keyboard support
document.addEventListener('keydown', (event) => {
    if (event.key >= '0' && event.key <= '9') appendNumber(event.key);
    if (event.key === '.') appendNumber('.');
    
    if (event.key === '+') appendOperator('+');
    if (event.key === '-') appendOperator('-');
    if (event.key === '*') appendOperator('*');
    if (event.key === '/') appendOperator('/');
    if (event.key === '%') appendOperator('%');
    
    if (event.key === 'Enter' || event.key === '=') calculate();
    if (event.key === 'Escape') clearDisplay();
    if (event.key === 'Backspace') backspace();
});
