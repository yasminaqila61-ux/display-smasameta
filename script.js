document.addEventListener('DOMContentLoaded', function() {
    // Inisialisasi variabel dan state aplikasi
    let currentQueueNumber = 1;
    let selectedOperator = 1;
    let callHistory = [];
    let lastCalled = null;
    
    // Data operator
    const operators = [
        { id: 1, name: "Operator 1", active: true },
        { id: 2, name: "Operator 2", active: true },
        { id: 3, name: "Operator 3", active: true },
        { id: 4, name: "Operator 4", active: true },
        { id: 5, name: "Operator 5", active: true },
        { id: 6, name: "Operator 6", active: true },
        { id: 7, name: "Operator 7", active: true },
        { id: 8, name: "Operator 8", active: true }
    ];
    
    // Elemen DOM
    const queueNumberInput = document.getElementById('queueNumber');
    const decreaseBtn = document.getElementById('decreaseNumber');
    const increaseBtn = document.getElementById('increaseNumber');
    const resetBtn = document.getElementById('resetQueue');
    const callBtn = document.getElementById('callQueue');
    const operatorButtonsContainer = document.querySelector('.operator-buttons');
    const nextQueueNumberSpan = document.getElementById('nextQueueNumber');
    const nextQueueOperatorSpan = document.getElementById('nextQueueOperator');
    const lastCalledDisplay = document.getElementById('lastCalledDisplay');
    const operatorGridContainer = document.querySelector('.operator-grid');
    const historyBody = document.getElementById('historyBody');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const audioPlayer = document.getElementById('audioPlayer');
    
    // Inisialisasi tampilan
    initializeOperatorButtons();
    initializeOperatorStatus();
    updateDisplay();
    loadFromLocalStorage();
    
    // Event Listeners
    decreaseBtn.addEventListener('click', () => changeQueueNumber(-1));
    increaseBtn.addEventListener('click', () => changeQueueNumber(1));
    resetBtn.addEventListener('click', resetQueueNumber);
    callBtn.addEventListener('click', callQueue);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    queueNumberInput.addEventListener('change', function() {
        const value = parseInt(this.value);
        if (!isNaN(value) && value >= 1) {
            currentQueueNumber = value;
            updateDisplay();
            saveToLocalStorage();
        } else {
            this.value = currentQueueNumber;
        }
    });
    
    // Fungsi untuk mengubah nomor antrian
    function changeQueueNumber(delta) {
        currentQueueNumber += delta;
        if (currentQueueNumber < 1) currentQueueNumber = 1;
        queueNumberInput.value = currentQueueNumber;
        updateDisplay();
        saveToLocalStorage();
    }
    
    // Fungsi untuk reset nomor antrian ke 1
    function resetQueueNumber() {
        currentQueueNumber = 1;
        queueNumberInput.value = currentQueueNumber;
        updateDisplay();
        saveToLocalStorage();
    }
    
    // Fungsi untuk memanggil antrian
    function callQueue() {
        if (!selectedOperator) {
            alert('Silakan pilih operator terlebih dahulu');
            return;
        }
        
        const operator = operators.find(op => op.id === selectedOperator);
        if (!operator) return;
        
        // Update last called
        lastCalled = {
            number: currentQueueNumber,
            operator: operator.name,
            time: new Date()
        };
        
        // Tambahkan ke riwayat
        const historyEntry = {
            time: new Date(),
            number: currentQueueNumber,
            operator: operator.name,
            status: 'Dipanggil'
        };
        
        callHistory.unshift(historyEntry);
        
        // Update tampilan
        updateDisplay();
        updateHistoryTable();
        
        // Panggil dengan suara
        speakQueueNumber(currentQueueNumber, operator.name);
        
        // Increment nomor antrian untuk selanjutnya
        currentQueueNumber++;
        queueNumberInput.value = currentQueueNumber;
        
        // Simpan ke localStorage
        saveToLocalStorage();
    }
    
    // Fungsi untuk mengucapkan nomor antrian dengan suara
    function speakQueueNumber(number, operatorName) {
        // Teks yang akan diucapkan
        const text = `Nomor antrian ${number}, silakan menuju ke ${operatorName}`;
        
        // Gunakan Web Speech API jika tersedia
        if ('speechSynthesis' in window) {
            // Hentikan pembicaraan yang sedang berlangsung
            speechSynthesis.cancel();
            
            // Buat objek SpeechSynthesisUtterance
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Atur pengaturan suara
            utterance.lang = 'id-ID';
            utterance.rate = 0.9; // Kecepatan bicara
            utterance.pitch = 1; // Nada suara
            utterance.volume = 1; // Volume
            
            // Cari suara wanita jika tersedia
            const voices = speechSynthesis.getVoices();
            const femaleVoice = voices.find(voice => 
                voice.lang.includes('id') && 
                voice.name.toLowerCase().includes('female')
            );
            
            if (femaleVoice) {
                utterance.voice = femaleVoice;
            }
            
            // Mulai berbicara
            speechSynthesis.speak(utterance);
            
            // Tambahkan event listener untuk menangani kesalahan
            utterance.onerror = function(event) {
                console.error('Speech synthesis error:', event);
                // Fallback: Gunakan audio pre-recorded jika tersedia
                playFallbackAudio();
            };
        } else {
            // Fallback: Gunakan audio pre-recorded jika Web Speech API tidak tersedia
            console.log('Web Speech API tidak didukung di browser ini');
            playFallbackAudio();
        }
    }
    
    // Fallback audio jika Web Speech API tidak berfungsi
    function playFallbackAudio() {
        // Di implementasi nyata, Anda akan memiliki file audio pre-recorded
        // Untuk demo, kita akan menggunakan SpeechSynthesis dengan cara lain
        alert(`Nomor antrian ${currentQueueNumber}, silakan menuju ke ${operators.find(op => op.id === selectedOperator).name}`);
    }
    
    // Fungsi untuk menginisialisasi tombol operator
    function initializeOperatorButtons() {
        operatorButtonsContainer.innerHTML = '';
        
        operators.forEach(operator => {
            const button = document.createElement('button');
            button.className = `operator-btn ${operator.id === selectedOperator ? 'selected' : ''}`;
            button.textContent = operator.name;
            button.dataset.id = operator.id;
            
            button.addEventListener('click', () => {
                selectedOperator = operator.id;
                updateOperatorButtons();
                updateDisplay();
                saveToLocalStorage();
            });
            
            operatorButtonsContainer.appendChild(button);
        });
    }
    
    // Fungsi untuk menginisialisasi status operator
    function initializeOperatorStatus() {
        operatorGridContainer.innerHTML = '';
        
        operators.forEach(operator => {
            const statusItem = document.createElement('div');
            statusItem.className = `operator-status-item ${operator.active ? 'active' : 'inactive'}`;
            statusItem.innerHTML = `
                <div class="operator-name">${operator.name}</div>
                <div class="operator-id">ID: ${operator.id}</div>
            `;
            
            operatorGridContainer.appendChild(statusItem);
        });
    }
    
    // Fungsi untuk memperbarui tombol operator yang dipilih
    function updateOperatorButtons() {
        const buttons = document.querySelectorAll('.operator-btn');
        buttons.forEach(button => {
            const operatorId = parseInt(button.dataset.id);
            button.classList.toggle('selected', operatorId === selectedOperator);
        });
    }
    
    // Fungsi untuk memperbarui tampilan
    function updateDisplay() {
        // Update nomor antrian berikutnya
        nextQueueNumberSpan.textContent = currentQueueNumber;
        
        // Update operator yang dipilih
        const selectedOperatorObj = operators.find(op => op.id === selectedOperator);
        if (selectedOperatorObj) {
            nextQueueOperatorSpan.textContent = selectedOperatorObj.name;
        }
        
        // Update antrian terakhir dipanggil
        if (lastCalled) {
            lastCalledDisplay.innerHTML = `
                <div class="called-number">${lastCalled.number}</div>
                <div class="called-operator">${lastCalled.operator}</div>
            `;
        }
    }
    
    // Fungsi untuk memperbarui tabel riwayat
    function updateHistoryTable() {
        historyBody.innerHTML = '';
        
        callHistory.forEach(entry => {
            const row = document.createElement('tr');
            
            // Format waktu
            const time = new Date(entry.time);
            const timeString = time.toLocaleTimeString('id-ID', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            
            row.innerHTML = `
                <td>${timeString}</td>
                <td><strong>${entry.number}</strong></td>
                <td>${entry.operator}</td>
                <td><span class="status-badge">${entry.status}</span></td>
            `;
            
            historyBody.appendChild(row);
        });
    }
    
    // Fungsi untuk menghapus riwayat
    function clearHistory() {
        if (confirm('Apakah Anda yakin ingin menghapus semua riwayat panggilan?')) {
            callHistory = [];
            updateHistoryTable();
            saveToLocalStorage();
        }
    }
    
    // Fungsi untuk menyimpan data ke localStorage
    function saveToLocalStorage() {
        const data = {
            currentQueueNumber,
            selectedOperator,
            callHistory,
            lastCalled
        };
        
        localStorage.setItem('queueSystemData', JSON.stringify(data));
    }
    
    // Fungsi untuk memuat data dari localStorage
    function loadFromLocalStorage() {
        const savedData = localStorage.getItem('queueSystemData');
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                currentQueueNumber = data.currentQueueNumber || 1;
                selectedOperator = data.selectedOperator || 1;
                callHistory = data.callHistory || [];
                lastCalled = data.lastCalled || null;
                
                // Update UI dengan data yang dimuat
                queueNumberInput.value = currentQueueNumber;
                updateOperatorButtons();
                updateDisplay();
                updateHistoryTable();
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }
    
    // Tambahkan style untuk badge status
    const style = document.createElement('style');
    style.textContent = `
        .status-badge {
            display: inline-block;
            padding: 4px 8px;
            background-color: #2ecc71;
            color: white;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);
    
    // Inisialisasi Web Speech API voices
    if ('speechSynthesis' in window) {
        // Chrome memerlukan ini untuk memuat daftar voices
        speechSynthesis.onvoiceschanged = function() {
            console.log('Voices loaded:', speechSynthesis.getVoices().length);
        };
    }
    
    // Informasi untuk pengguna tentang dukungan suara
    if (!('speechSynthesis' in window)) {
        console.warn('Browser Anda tidak mendukung Web Speech API. Fitur suara akan terbatas.');
    }
});