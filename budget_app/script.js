const balance = document.getElementById('balance');
const transactionForm = document.getElementById('transaction-form');
const typeSelect = document.getElementById('type');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const categoryInput = document.getElementById('category');
const transactionList = document.getElementById('transaction-list');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function calculateBalance() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    balance.innerText = `${totalIncome - totalExpense}원`;
}

function addTransactionDOM(transaction) {
    const listItem = document.createElement('li');
    listItem.classList.add(transaction.type);
    listItem.innerHTML = `
        <span class="date">${transaction.date}</span>
        <span>${transaction.description} (${transaction.category})</span>
        <span class="amount">${transaction.type === 'income' ? '+' : '-'}${transaction.amount}원</span>
        <button class="delete-btn" onclick="deleteTransaction(${transaction.id})">x</button>
    `;
    transactionList.appendChild(listItem);
}

function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    updateLocalStorage();
    init();
}

function init() {
    transactionList.innerHTML = '';
    transactions.forEach(addTransactionDOM);
    calculateBalance();
}

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTransaction = {
        id: generateID(),
        type: typeSelect.value,
        description: descriptionInput.value,
        amount: +amountInput.value,
        category: categoryInput.value,
        date: new Date().toLocaleDateString()
    };

    transactions.push(newTransaction);
    addTransactionDOM(newTransaction);
    calculateBalance();
    updateLocalStorage();

    descriptionInput.value = '';
    amountInput.value = '';
    categoryInput.value = '';
});

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

init();