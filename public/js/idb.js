let db;

const request = indexedDB.open('budget-pal', 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('transactions', { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    if (navigator.onLine) {
        uploadTransactions();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(['transactions'], 'readwrite');

    const transObjectStore = transaction.objectStore('transactions');
    
    transObjectStore.add(record);
};

function uploadTransactions() {
    const transaction = db.transaction(['transactions'], 'readwrite');

    const transObjectStore = transaction.objectStore('transactions');

    const getAll = transObjectStore.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['transactions'], 'readwrite');

                    const transObjectStore = transaction.objectStore('transactions');

                    transObjectStore.clear();

                    alert('All saved transactions have been submit!');
                })
                .catch(err => {
                    console.log(err);
                });
        }
    };
};

window.addEventListener('online', uploadTransactions);