/**
 * Lyrics Generator - Tool #235
 * AI-powered lyrics generation
 */

let currentLang = 'zh';

const templates = {
    zh: {
        pop: {
            verse: [
                ['在那個{time}的{place}', '我們{action}著{emotion}', '你的{feature}像{nature}', '{feeling}我的心'],
                ['走過{place}的街道', '{weather}輕輕{action}', '想起你的{feature}', '那些{time}的{memory}'],
                ['每當{time}來臨', '我總會想起你', '那{emotion}的眼神', '還有{feeling}的笑']
            ],
            chorus: [
                ['我{feeling}著你', '在每個{time}', '不管{distance}多遠', '心依然{emotion}'],
                ['讓我{action}你', '穿越{distance}', '用我全部的{emotion}', '換一個{future}'],
                ['這份{emotion}', '永遠不會{change}', '就像{nature}', '永恆{feeling}']
            ]
        },
        rock: {
            verse: [
                ['撕裂{time}的{barrier}', '我們{action}向前', '不管{obstacle}多大', '絕不{surrender}'],
                ['燃燒的{emotion}', '照亮{place}的夜', '我們的{belief}', '無人能{stop}']
            ],
            chorus: [
                ['衝破一切', '我們{action}', '{emotion}燃燒', '永不{surrender}'],
                ['這是我們的{time}', '屬於我們的{place}', '大聲{action}', '讓世界{hear}']
            ]
        },
        folk: {
            verse: [
                ['坐在{place}的樹下', '聽著{nature}的聲音', '想起{time}的故事', '心中滿是{emotion}'],
                ['走過{place}的小路', '{nature}輕輕搖曳', '那些{time}的記憶', '像{weather}般溫柔']
            ],
            chorus: [
                ['時光{flow}', '帶走{time}', '留下{emotion}', '在心底{stay}'],
                ['讓{nature}見證', '這份{emotion}', '如{weather}般', '永遠{feeling}']
            ]
        },
        hiphop: {
            verse: [
                ['yo 這是我的{place}', '我{action}我的{belief}', '不需要{approval}', '因為我有{strength}'],
                ['街頭的{light}下', '我{action}著{dream}', '每一步都{firm}', '向著{future}前進']
            ],
            chorus: [
                ['這是我的{time}', '我的{style}', '不需要{explain}', '我就是{identity}'],
                ['{action}你的{dream}', '永不{stop}', '這就是{life}', '這就是{me}']
            ]
        },
        ballad: {
            verse: [
                ['窗外{weather}飄落', '想起你的{feature}', '那{time}的{place}', '還有你的{emotion}'],
                ['翻開舊{memory}', '每頁都是你', '那{feeling}的{time}', '如今只剩{remains}']
            ],
            chorus: [
                ['我多想{action}你', '再一次{together}', '可惜{time}已過', '只剩{emotion}'],
                ['若能{return}', '回到{time}', '我會更{cherish}', '每個{moment}']
            ]
        }
    },
    en: {
        pop: {
            verse: [
                ['In the {time} of {place}', 'We were {action} with {emotion}', 'Your {feature} like {nature}', '{feeling} my heart'],
                ['Walking through the {place}', '{weather} gently {action}', 'Thinking of your {feature}', 'Those {time} {memory}']
            ],
            chorus: [
                ['I {feeling} you', 'In every {time}', 'No matter the {distance}', 'My heart stays {emotion}'],
                ['Let me {action} you', 'Across the {distance}', 'With all my {emotion}', 'For our {future}']
            ]
        },
        rock: {
            verse: [
                ['Breaking through the {barrier}', 'We {action} forward', 'No matter the {obstacle}', 'We never {surrender}'],
                ['Burning {emotion}', 'Lighting up the {place}', 'Our {belief}', 'Cannot be {stop}']
            ],
            chorus: [
                ['Breaking free', 'We {action}', '{emotion} burning', 'Never {surrender}'],
                ['This is our {time}', 'This is our {place}', '{action} loud', 'Let the world {hear}']
            ]
        },
        folk: {
            verse: [
                ['Sitting under the {place} tree', 'Listening to {nature}', 'Remembering {time} stories', 'Heart full of {emotion}'],
                ['Walking down {place} roads', '{nature} gently swaying', 'Those {time} memories', 'Soft like {weather}']
            ],
            chorus: [
                ['Time {flow}', 'Taking {time}', 'Leaving {emotion}', '{stay} in hearts'],
                ['Let {nature} witness', 'This {emotion}', 'Like {weather}', 'Forever {feeling}']
            ]
        },
        hiphop: {
            verse: [
                ['Yo this is my {place}', 'I {action} my {belief}', 'No need for {approval}', 'Cause I got {strength}'],
                ['Under the street {light}', 'I {action} my {dream}', 'Every step is {firm}', 'Moving to {future}']
            ],
            chorus: [
                ['This is my {time}', 'This is my {style}', 'No need to {explain}', 'I am {identity}'],
                ['{action} your {dream}', 'Never {stop}', 'This is {life}', 'This is {me}']
            ]
        },
        ballad: {
            verse: [
                ['Outside {weather} falls', 'Thinking of your {feature}', 'That {time} at {place}', 'And your {emotion}'],
                ['Flipping old {memory}', 'Every page is you', 'That {feeling} {time}', 'Now only {remains}']
            ],
            chorus: [
                ['I wish to {action} you', 'Once more {together}', 'But {time} has passed', 'Only {emotion} remains'],
                ['If I could {return}', 'Back to {time}', 'I would {cherish} more', 'Every {moment}']
            ]
        }
    }
};

const vocabulary = {
    zh: {
        time: ['夏天', '秋天', '那年', '深夜', '黎明', '青春', '過去'],
        place: ['海邊', '城市', '校園', '公園', '山頂', '老家', '街角'],
        action: ['奔跑', '歌唱', '跳舞', '擁抱', '等待', '追逐', '尋找'],
        emotion: ['溫暖', '悲傷', '快樂', '思念', '堅定', '迷茫', '期待'],
        feature: ['笑容', '眼睛', '聲音', '背影', '雙手', '身影'],
        nature: ['陽光', '月光', '星星', '海浪', '微風', '花朵'],
        feeling: ['觸動', '溫暖', '牽動', '震撼', '安撫'],
        weather: ['陽光', '微風', '細雨', '晚霞', '月光'],
        memory: ['回憶', '時光', '故事', '片段', '畫面'],
        distance: ['距離', '時空', '山海', '千里'],
        future: ['未來', '明天', '永恆', '約定'],
        change: ['改變', '消失', '褪色', '遺忘'],
        barrier: ['牆壁', '界限', '枷鎖', '束縛'],
        obstacle: ['困難', '阻礙', '挑戰'],
        surrender: ['放棄', '妥協', '退縮'],
        belief: ['信念', '夢想', '堅持'],
        stop: ['阻擋', '打敗', '動搖'],
        hear: ['聽見', '感受', '震撼'],
        flow: ['流逝', '飛逝', '消逝'],
        stay: ['停留', '駐足', '守候'],
        light: ['燈光', '霓虹', '路燈'],
        dream: ['夢想', '目標', '未來'],
        firm: ['堅定', '踏實', '穩健'],
        approval: ['認可', '許可', '贊同'],
        strength: ['力量', '實力', '底氣'],
        style: ['風格', '態度', '方式'],
        explain: ['解釋', '證明', '說明'],
        identity: ['我', '自己', '本色'],
        life: ['生活', '人生', '命運'],
        me: ['我', '自己', '真我'],
        remains: ['回憶', '思念', '遺憾'],
        together: ['相聚', '重逢', '在一起'],
        return: ['回去', '穿越', '倒流'],
        cherish: ['珍惜', '把握', '守護'],
        moment: ['瞬間', '時刻', '片刻']
    },
    en: {
        time: ['summer', 'autumn', 'that year', 'midnight', 'dawn', 'youth', 'past'],
        place: ['beach', 'city', 'campus', 'park', 'mountain', 'hometown', 'corner'],
        action: ['run', 'sing', 'dance', 'embrace', 'wait', 'chase', 'search'],
        emotion: ['warmth', 'sorrow', 'joy', 'longing', 'resolve', 'confusion', 'hope'],
        feature: ['smile', 'eyes', 'voice', 'silhouette', 'hands', 'shadow'],
        nature: ['sunlight', 'moonlight', 'stars', 'waves', 'breeze', 'flowers'],
        feeling: ['touches', 'warms', 'moves', 'shakes', 'soothes'],
        weather: ['sunshine', 'breeze', 'rain', 'sunset', 'moonlight'],
        memory: ['memories', 'moments', 'stories', 'fragments', 'scenes'],
        distance: ['distance', 'space', 'oceans', 'miles'],
        future: ['future', 'tomorrow', 'eternity', 'promise'],
        change: ['change', 'fade', 'disappear', 'forget'],
        barrier: ['walls', 'limits', 'chains', 'bounds'],
        obstacle: ['challenges', 'obstacles', 'trials'],
        surrender: ['give up', 'compromise', 'retreat'],
        belief: ['belief', 'dream', 'faith'],
        stop: ['stopped', 'defeated', 'shaken'],
        hear: ['hear', 'feel', 'know'],
        flow: ['flows', 'flies', 'fades'],
        stay: ['stays', 'remains', 'lives'],
        light: ['lights', 'neon', 'glow'],
        dream: ['dreams', 'goals', 'vision'],
        firm: ['firm', 'solid', 'steady'],
        approval: ['approval', 'permission', 'validation'],
        strength: ['strength', 'power', 'fire'],
        style: ['style', 'way', 'vibe'],
        explain: ['explain', 'prove', 'justify'],
        identity: ['me', 'myself', 'who I am'],
        life: ['life', 'journey', 'story'],
        me: ['me', 'myself', 'I'],
        remains: ['memories', 'echoes', 'regrets'],
        together: ['together', 'reunited', 'as one'],
        return: ['return', 'go back', 'rewind'],
        cherish: ['cherish', 'treasure', 'hold'],
        moment: ['moment', 'second', 'instant']
    }
};

const moodAdjustments = {
    happy: { emotion: ['快樂', '歡笑', '幸福'], feeling: ['溫暖', '開心'] },
    sad: { emotion: ['悲傷', '淚水', '心痛'], feeling: ['心碎', '難過'] },
    romantic: { emotion: ['浪漫', '甜蜜', '心動'], feeling: ['心動', '陶醉'] },
    inspiring: { emotion: ['堅強', '勇敢', '希望'], feeling: ['激勵', '振奮'] },
    nostalgic: { emotion: ['懷念', '思念', '回憶'], feeling: ['感傷', '追憶'] }
};

const texts = {
    zh: {
        title: '歌詞生成',
        subtitle: 'AI 自動生成歌詞',
        privacy: '100% 本地處理 · 零資料上傳',
        theme: '主題關鍵字',
        themePlaceholder: '輸入主題，如：愛情、夢想、旅行...',
        style: '風格',
        pop: '流行情歌', rock: '搖滾', hiphop: '嘻哈', folk: '民謠', ballad: '抒情',
        lyricsLang: '語言',
        chinese: '中文', english: '英文',
        structure: '段落結構',
        verseChorus: '主歌-副歌',
        verseChorusBridge: '主歌-副歌-橋段',
        aaba: 'AABA 結構',
        mood: '情感基調',
        happy: '歡樂', sad: '憂傷', romantic: '浪漫', inspiring: '勵志', nostalgic: '懷舊',
        generate: '生成歌詞',
        copy: '📋 複製',
        regenerate: '🔄 重新生成',
        sectionCount: '段落數',
        lineCount: '行數',
        verse: '【主歌】',
        chorus: '【副歌】',
        bridge: '【橋段】',
        copied: '已複製！'
    },
    en: {
        title: 'Lyrics Generator',
        subtitle: 'AI-powered lyrics generation',
        privacy: '100% Local Processing · No Data Upload',
        theme: 'Theme Keywords',
        themePlaceholder: 'Enter theme: love, dreams, journey...',
        style: 'Style',
        pop: 'Pop', rock: 'Rock', hiphop: 'Hip-Hop', folk: 'Folk', ballad: 'Ballad',
        lyricsLang: 'Language',
        chinese: 'Chinese', english: 'English',
        structure: 'Structure',
        verseChorus: 'Verse-Chorus',
        verseChorusBridge: 'Verse-Chorus-Bridge',
        aaba: 'AABA Form',
        mood: 'Mood',
        happy: 'Happy', sad: 'Sad', romantic: 'Romantic', inspiring: 'Inspiring', nostalgic: 'Nostalgic',
        generate: 'Generate Lyrics',
        copy: '📋 Copy',
        regenerate: '🔄 Regenerate',
        sectionCount: 'Sections',
        lineCount: 'Lines',
        verse: '[Verse]',
        chorus: '[Chorus]',
        bridge: '[Bridge]',
        copied: 'Copied!'
    }
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => switchLang('zh'));
    document.getElementById('lang-en').addEventListener('click', () => switchLang('en'));

    document.getElementById('generateBtn').addEventListener('click', generateLyrics);
    document.getElementById('copyBtn').addEventListener('click', copyLyrics);
    document.getElementById('regenerateBtn').addEventListener('click', generateLyrics);
}

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`lang-${lang}`).classList.add('active');

    const t = texts[lang];
    document.querySelector('h1').textContent = t.title;
    document.querySelector('.subtitle').textContent = t.subtitle;
    document.querySelector('.privacy-badge span:last-child').textContent = t.privacy;

    document.querySelector('.control-group.full-width label').textContent = t.theme;
    document.getElementById('themeInput').placeholder = t.themePlaceholder;

    const labels = document.querySelectorAll('.control-group:not(.full-width) label');
    labels[0].textContent = t.style;
    labels[1].textContent = t.lyricsLang;
    labels[2].textContent = t.structure;
    labels[3].textContent = t.mood;

    const styleSelect = document.getElementById('styleSelect');
    styleSelect.options[0].text = t.pop;
    styleSelect.options[1].text = t.rock;
    styleSelect.options[2].text = t.hiphop;
    styleSelect.options[3].text = t.folk;
    styleSelect.options[4].text = t.ballad;

    const lyricsLangSelect = document.getElementById('lyricsLangSelect');
    lyricsLangSelect.options[0].text = t.chinese;
    lyricsLangSelect.options[1].text = t.english;

    const structureSelect = document.getElementById('structureSelect');
    structureSelect.options[0].text = t.verseChorus;
    structureSelect.options[1].text = t.verseChorusBridge;
    structureSelect.options[2].text = t.aaba;

    const moodSelect = document.getElementById('moodSelect');
    moodSelect.options[0].text = t.happy;
    moodSelect.options[1].text = t.sad;
    moodSelect.options[2].text = t.romantic;
    moodSelect.options[3].text = t.inspiring;
    moodSelect.options[4].text = t.nostalgic;

    document.getElementById('generateBtn').textContent = t.generate;
    document.getElementById('copyBtn').textContent = t.copy;
    document.getElementById('regenerateBtn').textContent = t.regenerate;

    document.querySelectorAll('.info-label')[0].textContent = t.sectionCount;
    document.querySelectorAll('.info-label')[1].textContent = t.lineCount;
}

function generateLyrics() {
    const style = document.getElementById('styleSelect').value;
    const lyricsLang = document.getElementById('lyricsLangSelect').value;
    const structure = document.getElementById('structureSelect').value;
    const mood = document.getElementById('moodSelect').value;

    const styleTemplates = templates[lyricsLang][style] || templates[lyricsLang].pop;
    const vocab = vocabulary[lyricsLang];
    const t = texts[currentLang];

    let sections = [];
    let lineCount = 0;

    function generateSection(type) {
        const sectionTemplates = styleTemplates[type];
        const template = sectionTemplates[Math.floor(Math.random() * sectionTemplates.length)];

        const lines = template.map(line => {
            return line.replace(/\{(\w+)\}/g, (match, key) => {
                const words = vocab[key];
                return words ? words[Math.floor(Math.random() * words.length)] : match;
            });
        });

        lineCount += lines.length;
        return lines;
    }

    if (structure === 'verse-chorus') {
        sections.push({ type: 'verse', label: t.verse, lines: generateSection('verse') });
        sections.push({ type: 'chorus', label: t.chorus, lines: generateSection('chorus') });
        sections.push({ type: 'verse', label: t.verse, lines: generateSection('verse') });
        sections.push({ type: 'chorus', label: t.chorus, lines: generateSection('chorus') });
    } else if (structure === 'verse-chorus-bridge') {
        sections.push({ type: 'verse', label: t.verse, lines: generateSection('verse') });
        sections.push({ type: 'chorus', label: t.chorus, lines: generateSection('chorus') });
        sections.push({ type: 'verse', label: t.verse, lines: generateSection('verse') });
        sections.push({ type: 'chorus', label: t.chorus, lines: generateSection('chorus') });
        sections.push({ type: 'bridge', label: t.bridge, lines: generateSection('verse') });
        sections.push({ type: 'chorus', label: t.chorus, lines: generateSection('chorus') });
    } else {
        sections.push({ type: 'verse', label: 'A', lines: generateSection('verse') });
        sections.push({ type: 'verse', label: 'A', lines: generateSection('verse') });
        sections.push({ type: 'chorus', label: 'B', lines: generateSection('chorus') });
        sections.push({ type: 'verse', label: 'A', lines: generateSection('verse') });
    }

    displayLyrics(sections);
    document.getElementById('sectionCount').textContent = sections.length;
    document.getElementById('lineCount').textContent = lineCount;
    document.getElementById('resultSection').style.display = 'block';
}

function displayLyrics(sections) {
    const display = document.getElementById('lyricsDisplay');

    display.innerHTML = sections.map(section => `
        <div class="lyrics-section">
            <div class="section-label">${section.label}</div>
            <div class="section-lines">
                ${section.lines.map(line => `<p>${line}</p>`).join('')}
            </div>
        </div>
    `).join('');
}

function copyLyrics() {
    const display = document.getElementById('lyricsDisplay');
    const text = display.innerText;

    navigator.clipboard.writeText(text).then(() => {
        const btn = document.getElementById('copyBtn');
        const originalText = btn.textContent;
        btn.textContent = texts[currentLang].copied;
        setTimeout(() => btn.textContent = originalText, 1500);
    });
}

init();
