/**
 * Timeline Extract - Tool #185
 */
function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('extractBtn').addEventListener('click', extract);
}

function loadSample() {
    document.getElementById('textInput').value = `1976年，蘋果公司由 Steve Jobs、Steve Wozniak 和 Ronald Wayne 在加州創立。

1984年1月24日，蘋果推出了革命性的 Macintosh 電腦。

1997年，Steve Jobs 回歸蘋果公司擔任 CEO。

2001年10月23日，蘋果發布了第一代 iPod。

2007年1月9日，Steve Jobs 在 Macworld 大會上發布了 iPhone。

2010年4月3日，iPad 正式上市銷售。

2011年10月5日，Steve Jobs 逝世。

2015年，Apple Watch 正式推出。

2020年，蘋果發布了搭載 M1 晶片的 Mac 電腦。`;
}

function extract() {
    const text = document.getElementById('textInput').value.trim();
    if (!text) return;

    const events = extractEvents(text);
    displayTimeline(events);
}

function extractEvents(text) {
    const events = [];
    const sentences = text.split(/[。！？\n]+/).filter(s => s.trim());

    // Date patterns
    const datePatterns = [
        { regex: /(\d{4})年(\d{1,2})月(\d{1,2})日/g, format: (m) => ({ year: m[1], month: m[2], day: m[3], display: `${m[1]}年${m[2]}月${m[3]}日` }) },
        { regex: /(\d{4})年(\d{1,2})月/g, format: (m) => ({ year: m[1], month: m[2], day: '1', display: `${m[1]}年${m[2]}月` }) },
        { regex: /(\d{4})年/g, format: (m) => ({ year: m[1], month: '1', day: '1', display: `${m[1]}年` }) },
        { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/g, format: (m) => ({ year: m[1], month: m[2], day: m[3], display: `${m[1]}-${m[2]}-${m[3]}` }) },
        { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/g, format: (m) => ({ year: m[3], month: m[1], day: m[2], display: `${m[3]}-${m[1]}-${m[2]}` }) }
    ];

    sentences.forEach(sentence => {
        for (const pattern of datePatterns) {
            const regex = new RegExp(pattern.regex.source, 'g');
            let match;
            while ((match = regex.exec(sentence)) !== null) {
                const dateInfo = pattern.format(match);
                const sortKey = parseInt(dateInfo.year) * 10000 + parseInt(dateInfo.month) * 100 + parseInt(dateInfo.day);

                events.push({
                    date: dateInfo.display,
                    sortKey,
                    text: sentence.trim()
                });
                break; // One date per sentence
            }
        }
    });

    // Sort by date
    events.sort((a, b) => a.sortKey - b.sortKey);

    // Remove duplicates
    return events.filter((e, i, arr) => i === 0 || e.text !== arr[i - 1].text);
}

function displayTimeline(events) {
    document.getElementById('eventCount').textContent = `${events.length} 個事件`;

    if (events.length === 0) {
        document.getElementById('timeline').innerHTML = '<p style="color: var(--text-secondary);">未找到時間相關事件</p>';
    } else {
        document.getElementById('timeline').innerHTML = events.map(e => `
            <div class="timeline-item">
                <div class="timeline-date">📅 ${escapeHtml(e.date)}</div>
                <div class="timeline-event">
                    <div class="timeline-text">${escapeHtml(e.text)}</div>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('timelineSection').style.display = 'block';
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

init();
