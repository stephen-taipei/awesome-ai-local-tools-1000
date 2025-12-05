// Cron Generator - Tool #995
// Build and validate cron expressions visually

(function() {
    'use strict';

    // DOM Elements
    const cronExpression = document.getElementById('cron-expression');
    const cronDescription = document.getElementById('cron-description');
    const copyCron = document.getElementById('copy-cron');
    const presetBtns = document.querySelectorAll('.preset-btn');
    const nextRuns = document.getElementById('next-runs');
    const cronInput = document.getElementById('cron-input');
    const parseBtn = document.getElementById('parse-btn');

    // Field elements
    const fields = ['minute', 'hour', 'dom', 'month', 'dow'];

    // Day and Month names
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    // ========== Initialize ==========

    fields.forEach(field => {
        const typeSelect = document.getElementById(`${field}-type`);
        typeSelect.addEventListener('change', () => {
            updateFieldVisibility(field);
            generateCron();
        });

        // Add change listeners to all inputs
        document.querySelectorAll(`[id^="${field}-"]`).forEach(el => {
            if (el.id !== `${field}-type`) {
                el.addEventListener('change', generateCron);
                el.addEventListener('input', generateCron);
            }
        });
    });

    // ========== Field Visibility ==========

    function updateFieldVisibility(field) {
        const type = document.getElementById(`${field}-type`).value;
        const specificEl = document.getElementById(`${field}-specific`);
        const rangeEl = document.getElementById(`${field}-range`);
        const stepEl = document.getElementById(`${field}-step`);

        if (specificEl) specificEl.classList.toggle('hidden', type !== 'specific');
        if (rangeEl) rangeEl.classList.toggle('hidden', type !== 'range');
        if (stepEl) stepEl.classList.toggle('hidden', type !== 'step');
    }

    // ========== Generate Cron ==========

    function generateCron() {
        const parts = fields.map(field => getFieldValue(field));
        const cron = parts.join(' ');

        cronExpression.textContent = cron;
        cronDescription.textContent = describeCron(cron);
        calculateNextRuns(cron);
    }

    function getFieldValue(field) {
        const type = document.getElementById(`${field}-type`).value;

        switch (type) {
            case '*':
                return '*';
            case 'specific':
                const valueEl = document.getElementById(`${field}-value`);
                return valueEl ? valueEl.value : '*';
            case 'range':
                const start = document.getElementById(`${field}-start`).value;
                const end = document.getElementById(`${field}-end`).value;
                return `${start}-${end}`;
            case 'step':
                const step = document.getElementById(`${field}-step-value`).value;
                return `*/${step}`;
            default:
                return '*';
        }
    }

    // ========== Describe Cron ==========

    function describeCron(cron) {
        const parts = cron.split(' ');
        if (parts.length !== 5) return 'Invalid cron expression';

        const [minute, hour, dom, month, dow] = parts;

        // Common patterns
        if (cron === '* * * * *') return 'Every minute';
        if (cron === '0 * * * *') return 'Every hour, on the hour';
        if (cron === '0 0 * * *') return 'Every day at midnight';
        if (cron === '0 0 * * 0') return 'Every Sunday at midnight';
        if (cron === '0 0 1 * *') return 'First day of every month at midnight';
        if (cron === '0 0 1 1 *') return 'Every January 1st at midnight';

        let desc = 'At ';

        // Minute
        if (minute === '*') {
            desc = 'Every minute';
        } else if (minute.includes('/')) {
            desc = `Every ${minute.split('/')[1]} minutes`;
        } else if (minute.includes('-')) {
            desc = `Every minute from ${minute}`;
        } else {
            desc = `At minute ${minute}`;
        }

        // Hour
        if (hour !== '*') {
            if (hour.includes('/')) {
                desc += ` past every ${hour.split('/')[1]} hours`;
            } else if (hour.includes('-')) {
                desc += ` during hours ${hour}`;
            } else {
                const h = parseInt(hour);
                desc += ` at ${h > 12 ? h - 12 : h}:${minute.padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
            }
        }

        // Day of month
        if (dom !== '*') {
            if (dom.includes('/')) {
                desc += `, every ${dom.split('/')[1]} days`;
            } else if (dom.includes('-')) {
                desc += `, on days ${dom} of the month`;
            } else {
                desc += `, on day ${dom} of the month`;
            }
        }

        // Month
        if (month !== '*') {
            if (month.includes('-')) {
                const [start, end] = month.split('-').map(m => parseInt(m));
                desc += `, ${monthNames[start]} through ${monthNames[end]}`;
            } else {
                desc += `, in ${monthNames[parseInt(month)]}`;
            }
        }

        // Day of week
        if (dow !== '*') {
            if (dow.includes('-')) {
                const [start, end] = dow.split('-').map(d => parseInt(d));
                desc += `, ${dayNames[start]} through ${dayNames[end]}`;
            } else {
                desc += `, on ${dayNames[parseInt(dow)]}`;
            }
        }

        return desc;
    }

    // ========== Calculate Next Runs ==========

    function calculateNextRuns(cron) {
        const parts = cron.split(' ');
        if (parts.length !== 5) {
            nextRuns.innerHTML = '<div class="text-red-500">Invalid cron expression</div>';
            return;
        }

        const runs = [];
        let date = new Date();
        date.setSeconds(0);
        date.setMilliseconds(0);

        // Simple next run calculation (basic implementation)
        for (let i = 0; i < 500 && runs.length < 5; i++) {
            date = new Date(date.getTime() + 60000); // Add 1 minute

            if (matchesCron(date, parts)) {
                runs.push(new Date(date));
            }
        }

        if (runs.length === 0) {
            nextRuns.innerHTML = '<div class="text-gray-500">No upcoming executions found</div>';
            return;
        }

        nextRuns.innerHTML = runs.map((run, idx) => `
            <div class="flex items-center gap-3 p-2 bg-gray-50 rounded">
                <span class="w-6 h-6 flex items-center justify-center bg-indigo-100 text-indigo-600 rounded-full text-xs font-medium">${idx + 1}</span>
                <span class="code-text text-sm">${formatDate(run)}</span>
                <span class="text-xs text-gray-500 ml-auto">${getRelativeTime(run)}</span>
            </div>
        `).join('');
    }

    function matchesCron(date, parts) {
        const [minute, hour, dom, month, dow] = parts;

        return matchField(date.getMinutes(), minute) &&
               matchField(date.getHours(), hour) &&
               matchField(date.getDate(), dom) &&
               matchField(date.getMonth() + 1, month) &&
               matchField(date.getDay(), dow);
    }

    function matchField(value, field) {
        if (field === '*') return true;

        // Step values (*/n)
        if (field.includes('/')) {
            const step = parseInt(field.split('/')[1]);
            return value % step === 0;
        }

        // Range (n-m)
        if (field.includes('-')) {
            const [start, end] = field.split('-').map(n => parseInt(n));
            return value >= start && value <= end;
        }

        // List (n,m,o)
        if (field.includes(',')) {
            return field.split(',').map(n => parseInt(n)).includes(value);
        }

        // Specific value
        return value === parseInt(field);
    }

    function formatDate(date) {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getRelativeTime(date) {
        const now = new Date();
        const diff = date - now;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `in ${days} day${days > 1 ? 's' : ''}`;
        if (hours > 0) return `in ${hours} hour${hours > 1 ? 's' : ''}`;
        return `in ${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    // ========== Presets ==========

    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cron = btn.dataset.cron;
            parseCronExpression(cron);

            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // ========== Parse Cron ==========

    parseBtn.addEventListener('click', () => {
        const cron = cronInput.value.trim();
        if (cron) {
            parseCronExpression(cron);
        }
    });

    cronInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cron = cronInput.value.trim();
            if (cron) {
                parseCronExpression(cron);
            }
        }
    });

    function parseCronExpression(cron) {
        const parts = cron.split(/\s+/);
        if (parts.length !== 5) {
            showNotification('Invalid cron format. Expected 5 fields.', 'error');
            return;
        }

        const [minute, hour, dom, month, dow] = parts;

        // Set minute
        setFieldFromCron('minute', minute, 0, 59);
        setFieldFromCron('hour', hour, 0, 23);
        setFieldFromCron('dom', dom, 1, 31);
        setFieldFromCron('month', month, 1, 12);
        setFieldFromCron('dow', dow, 0, 6);

        generateCron();
        showNotification('Cron expression parsed', 'success');
    }

    function setFieldFromCron(field, value, min, max) {
        const typeSelect = document.getElementById(`${field}-type`);

        if (value === '*') {
            typeSelect.value = '*';
        } else if (value.includes('/')) {
            typeSelect.value = 'step';
            const stepValue = document.getElementById(`${field}-step-value`);
            if (stepValue) stepValue.value = value.split('/')[1];
        } else if (value.includes('-')) {
            typeSelect.value = 'range';
            const [start, end] = value.split('-');
            document.getElementById(`${field}-start`).value = start;
            document.getElementById(`${field}-end`).value = end;
        } else {
            typeSelect.value = 'specific';
            const valueEl = document.getElementById(`${field}-value`);
            if (valueEl) valueEl.value = value;
        }

        updateFieldVisibility(field);
    }

    // ========== Copy ==========

    copyCron.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(cronExpression.textContent);
            showNotification('Copied to clipboard', 'success');
        } catch (e) {
            showNotification('Failed to copy', 'error');
        }
    });

    // ========== Utility ==========

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

    // Initialize
    generateCron();

})();
