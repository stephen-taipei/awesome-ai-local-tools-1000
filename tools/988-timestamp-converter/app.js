// Timestamp Converter - Tool #988
// Convert between Unix timestamps and dates locally

(function() {
    'use strict';

    // DOM Elements
    const liveClock = document.getElementById('live-clock');
    const liveDate = document.getElementById('live-date');
    const liveTimestampS = document.getElementById('live-timestamp-s');
    const liveTimestampMs = document.getElementById('live-timestamp-ms');

    const timestampInput = document.getElementById('timestamp-input');
    const nowBtn = document.getElementById('now-btn');
    const tsToDateBtn = document.getElementById('ts-to-date-btn');
    const tsResult = document.getElementById('ts-result');

    const dateInput = document.getElementById('date-input');
    const timeInput = document.getElementById('time-input');
    const timezoneSelect = document.getElementById('timezone-select');
    const dateToTsBtn = document.getElementById('date-to-ts-btn');
    const dateResult = document.getElementById('date-result');

    const allFormats = document.getElementById('all-formats');

    const diffTs1 = document.getElementById('diff-ts1');
    const diffTs2 = document.getElementById('diff-ts2');
    const calcDiffBtn = document.getElementById('calc-diff-btn');
    const diffResult = document.getElementById('diff-result');

    // ========== Live Clock ==========

    function updateLiveClock() {
        const now = new Date();
        liveClock.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        liveDate.textContent = now.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        liveTimestampS.textContent = Math.floor(now.getTime() / 1000);
        liveTimestampMs.textContent = now.getTime();
    }

    setInterval(updateLiveClock, 1000);
    updateLiveClock();

    // ========== Timestamp to Date ==========

    nowBtn.addEventListener('click', () => {
        const unit = document.querySelector('input[name="ts-unit"]:checked').value;
        const now = Date.now();
        timestampInput.value = unit === 's' ? Math.floor(now / 1000) : now;
    });

    tsToDateBtn.addEventListener('click', convertTimestampToDate);
    timestampInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') convertTimestampToDate();
    });

    function convertTimestampToDate() {
        const input = timestampInput.value.trim();
        if (!input) {
            showNotification('Please enter a timestamp', 'warning');
            return;
        }

        const unit = document.querySelector('input[name="ts-unit"]:checked').value;
        let timestamp = parseInt(input);

        if (isNaN(timestamp)) {
            showNotification('Invalid timestamp', 'error');
            return;
        }

        // Convert to milliseconds if in seconds
        if (unit === 's') {
            timestamp *= 1000;
        }

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) {
            showNotification('Invalid timestamp', 'error');
            return;
        }

        tsResult.classList.remove('hidden');
        tsResult.innerHTML = `
            <div class="format-card p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Local Time</div>
                <div class="code-text text-gray-800">${date.toLocaleString()}</div>
            </div>
            <div class="format-card p-3 bg-gray-50 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">UTC</div>
                <div class="code-text text-gray-800">${date.toUTCString()}</div>
            </div>
        `;

        updateAllFormats(date);
        showNotification('Converted', 'success');
    }

    // ========== Date to Timestamp ==========

    // Set default to current date/time
    const now = new Date();
    dateInput.value = now.toISOString().split('T')[0];
    timeInput.value = now.toTimeString().slice(0, 8);

    dateToTsBtn.addEventListener('click', convertDateToTimestamp);

    function convertDateToTimestamp() {
        const dateValue = dateInput.value;
        const timeValue = timeInput.value || '00:00:00';

        if (!dateValue) {
            showNotification('Please select a date', 'warning');
            return;
        }

        let date;
        const dateTimeStr = `${dateValue}T${timeValue}`;

        if (timezoneSelect.value === 'UTC') {
            date = new Date(dateTimeStr + 'Z');
        } else {
            date = new Date(dateTimeStr);
        }

        if (isNaN(date.getTime())) {
            showNotification('Invalid date', 'error');
            return;
        }

        const timestampS = Math.floor(date.getTime() / 1000);
        const timestampMs = date.getTime();

        dateResult.classList.remove('hidden');
        dateResult.innerHTML = `
            <div class="format-card p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                    <div class="text-xs text-gray-500 mb-1">Seconds</div>
                    <div class="code-text text-gray-800">${timestampS}</div>
                </div>
                <button class="copy-btn px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded" data-value="${timestampS}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
            <div class="format-card p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                <div>
                    <div class="text-xs text-gray-500 mb-1">Milliseconds</div>
                    <div class="code-text text-gray-800">${timestampMs}</div>
                </div>
                <button class="copy-btn px-2 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded" data-value="${timestampMs}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `;

        // Add copy listeners
        dateResult.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(btn.dataset.value);
                    showNotification('Copied', 'success');
                } catch (e) {}
            });
        });

        updateAllFormats(date);
        showNotification('Converted', 'success');
    }

    // ========== All Formats ==========

    function updateAllFormats(date) {
        const formats = [
            { name: 'ISO 8601', value: date.toISOString() },
            { name: 'RFC 2822', value: date.toUTCString() },
            { name: 'Unix (seconds)', value: Math.floor(date.getTime() / 1000) },
            { name: 'Unix (milliseconds)', value: date.getTime() },
            { name: 'Local Date', value: date.toLocaleDateString() },
            { name: 'Local Time', value: date.toLocaleTimeString() },
            { name: 'Local DateTime', value: date.toLocaleString() },
            { name: 'Year', value: date.getFullYear() },
            { name: 'Month', value: date.getMonth() + 1 },
            { name: 'Day', value: date.getDate() },
            { name: 'Day of Week', value: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()] },
            { name: 'Hours', value: date.getHours() },
            { name: 'Minutes', value: date.getMinutes() },
            { name: 'Seconds', value: date.getSeconds() },
            { name: 'Week of Year', value: getWeekNumber(date) },
            { name: 'Day of Year', value: getDayOfYear(date) }
        ];

        allFormats.innerHTML = formats.map(f => `
            <div class="format-card flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                    <div class="text-xs text-gray-500">${f.name}</div>
                    <div class="code-text text-sm text-gray-800">${f.value}</div>
                </div>
                <button class="copy-format-btn px-2 py-1 text-gray-400 hover:text-indigo-600" data-value="${f.value}">
                    <i class="fas fa-copy"></i>
                </button>
            </div>
        `).join('');

        // Add copy listeners
        allFormats.querySelectorAll('.copy-format-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(btn.dataset.value);
                    showNotification('Copied', 'success');
                } catch (e) {}
            });
        });
    }

    function getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    function getDayOfYear(date) {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = date - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    // ========== Time Difference ==========

    calcDiffBtn.addEventListener('click', calculateDifference);

    function calculateDifference() {
        const ts1 = parseInt(diffTs1.value.trim());
        const ts2 = parseInt(diffTs2.value.trim());

        if (isNaN(ts1) || isNaN(ts2)) {
            showNotification('Please enter valid timestamps', 'warning');
            return;
        }

        // Auto-detect if milliseconds (> 10 digits likely means ms)
        const ts1Ms = ts1.toString().length > 10 ? ts1 : ts1 * 1000;
        const ts2Ms = ts2.toString().length > 10 ? ts2 : ts2 * 1000;

        const diffMs = Math.abs(ts2Ms - ts1Ms);
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        const hours = diffHours % 24;
        const minutes = diffMinutes % 60;
        const seconds = diffSeconds % 60;

        diffResult.classList.remove('hidden');
        diffResult.innerHTML = `
            <div class="text-center">
                <div class="text-2xl font-bold text-indigo-600 mb-2">
                    ${diffDays}d ${hours}h ${minutes}m ${seconds}s
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                    <div class="p-2 bg-white rounded">
                        <div class="text-gray-500">Total Days</div>
                        <div class="font-mono">${(diffMs / (1000 * 60 * 60 * 24)).toFixed(2)}</div>
                    </div>
                    <div class="p-2 bg-white rounded">
                        <div class="text-gray-500">Total Hours</div>
                        <div class="font-mono">${(diffMs / (1000 * 60 * 60)).toFixed(2)}</div>
                    </div>
                    <div class="p-2 bg-white rounded">
                        <div class="text-gray-500">Total Minutes</div>
                        <div class="font-mono">${(diffMs / (1000 * 60)).toFixed(2)}</div>
                    </div>
                    <div class="p-2 bg-white rounded">
                        <div class="text-gray-500">Total Seconds</div>
                        <div class="font-mono">${diffSeconds}</div>
                    </div>
                </div>
            </div>
        `;

        showNotification('Calculated', 'success');
    }

    // ========== Utility Functions ==========

    function showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const notification = document.createElement('div');
        notification.className = `fixed bottom-4 right-4 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

})();
