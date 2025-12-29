/**
 * Dialogue Generator - Tool #108
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

const dialogueTemplates = {
    'zh-TW': {
        formal: {
            greetings: ['您好，', '早安，', '午安，'],
            responses: ['好的，我了解了。', '沒問題，我會處理。', '是的，我明白您的意思。'],
            questions: ['請問這件事的進度如何？', '能否說明一下詳情？', '有什麼需要我協助的嗎？'],
            statements: ['根據目前的情況，我認為...', '從專業角度來看...', '這個問題的關鍵在於...'],
            endings: ['謝謝您的時間。', '期待您的回覆。', '我們保持聯繫。']
        },
        casual: {
            greetings: ['嗨！', '你好啊～', '哈囉！'],
            responses: ['好啊！', '沒問題～', '這樣啊，我懂了。'],
            questions: ['最近怎麼樣啊？', '這個你覺得如何？', '要不要一起去？'],
            statements: ['我覺得這樣不錯耶。', '說真的...', '其實我想說...'],
            endings: ['那回頭聊！', '掰掰～', '有空再約！']
        },
        humorous: {
            greetings: ['又是美好的一天！', '猜猜誰來了？', '驚不驚喜，意不意外？'],
            responses: ['哈哈，太有趣了！', '這個梗我給滿分！', '笑死我了～'],
            questions: ['你是認真的嗎？', '這是什麼神展開？', '還有這種操作？'],
            statements: ['說出來你可能不信...', '我的天才腦袋告訴我...', '根據我的不可靠消息來源...'],
            endings: ['我先笑為敬！', '這個故事告訴我們...什麼都不告訴我們。', '好啦好啦，下次見！']
        },
        dramatic: {
            greetings: ['終於等到你了。', '事情比我們想像的還要複雜。', '我有話必須告訴你。'],
            responses: ['不可能...這怎麼可能！', '我從沒想過會是這樣。', '原來如此...一切都說得通了。'],
            questions: ['你確定這是真的嗎？', '我們該怎麼辦？', '你願意相信我嗎？'],
            statements: ['命運讓我們相遇，必有其意義。', '有些真相，不得不面對。', '時間會證明一切。'],
            endings: ['無論如何，我都站在你這邊。', '這場戰鬥，才剛剛開始。', '讓我們拭目以待。']
        }
    },
    'en': {
        formal: {
            greetings: ['Good morning,', 'Hello,', 'Good afternoon,'],
            responses: ['I understand.', 'Certainly, I\'ll take care of it.', 'Yes, I see your point.'],
            questions: ['Could you update me on the progress?', 'Would you mind elaborating?', 'Is there anything I can assist with?'],
            statements: ['Based on the current situation, I believe...', 'From a professional standpoint...', 'The key issue here is...'],
            endings: ['Thank you for your time.', 'I look forward to your response.', 'Let\'s stay in touch.']
        },
        casual: {
            greetings: ['Hey!', 'What\'s up?', 'Hi there!'],
            responses: ['Sure thing!', 'No problem~', 'Got it!'],
            questions: ['How\'s it going?', 'What do you think?', 'Wanna join?'],
            statements: ['I think that\'s pretty cool.', 'Honestly...', 'Actually, I wanted to say...'],
            endings: ['Catch you later!', 'Bye~', 'Let\'s hang out soon!']
        },
        humorous: {
            greetings: ['Another beautiful day!', 'Guess who\'s here?', 'Surprise!'],
            responses: ['Haha, that\'s hilarious!', '10/10 for that joke!', 'I\'m dying!'],
            questions: ['Are you serious?', 'What kind of plot twist is this?', 'Is that even possible?'],
            statements: ['You might not believe this but...', 'My genius brain tells me...', 'According to my unreliable sources...'],
            endings: ['I\'ll be laughing about this all day!', 'And the moral of the story is... nothing.', 'Alright, see ya!']
        },
        dramatic: {
            greetings: ['I\'ve been waiting for you.', 'It\'s more complicated than we thought.', 'There\'s something I must tell you.'],
            responses: ['Impossible... How can this be!', 'I never imagined it would be like this.', 'I see now... It all makes sense.'],
            questions: ['Are you certain this is true?', 'What should we do?', 'Will you trust me?'],
            statements: ['Fate brought us together for a reason.', 'Some truths must be faced.', 'Time will tell.'],
            endings: ['No matter what, I\'m on your side.', 'This battle has just begun.', 'Let\'s wait and see.']
        }
    }
};

function generateDialogue(scene, roleA, roleB, topic, style, turns) {
    const templates = dialogueTemplates[currentLang][style];
    const numTurns = parseInt(turns);
    const dialogue = [];

    roleA = roleA || (currentLang === 'zh-TW' ? 'A' : 'A');
    roleB = roleB || (currentLang === 'zh-TW' ? 'B' : 'B');
    topic = topic || (currentLang === 'zh-TW' ? '這件事' : 'this matter');

    for (let i = 0; i < numTurns; i++) {
        let aText, bText;

        if (i === 0) {
            aText = templates.greetings[Math.floor(Math.random() * templates.greetings.length)] +
                    (currentLang === 'zh-TW' ? `關於${topic}，` : `Regarding ${topic}, `) +
                    templates.questions[Math.floor(Math.random() * templates.questions.length)];
        } else if (i === numTurns - 1) {
            aText = templates.statements[Math.floor(Math.random() * templates.statements.length)] +
                    templates.endings[Math.floor(Math.random() * templates.endings.length)];
        } else {
            aText = templates.statements[Math.floor(Math.random() * templates.statements.length)];
        }

        bText = templates.responses[Math.floor(Math.random() * templates.responses.length)] + ' ' +
                templates.statements[Math.floor(Math.random() * templates.statements.length)];

        dialogue.push({ role: roleA, text: aText, isRoleA: true });
        dialogue.push({ role: roleB, text: bText, isRoleA: false });
    }

    return dialogue;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const scene = document.getElementById('sceneInput').value.trim();
        const roleA = document.getElementById('roleAInput').value.trim();
        const roleB = document.getElementById('roleBInput').value.trim();
        const topic = document.getElementById('topicInput').value.trim();
        const style = document.getElementById('styleSelect').value;
        const turns = document.getElementById('turnsSelect').value;

        const dialogue = generateDialogue(scene, roleA, roleB, topic, style, turns);

        const container = document.getElementById('dialogueDisplay');
        container.innerHTML = dialogue.map(line => `
            <div class="dialogue-line ${line.isRoleA ? 'role-a' : 'role-b'}">
                <span class="dialogue-role">${line.role}:</span>
                <span class="dialogue-text">${line.text}</span>
            </div>
        `).join('');

        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const lines = document.querySelectorAll('.dialogue-line');
        let text = '';
        lines.forEach(line => {
            text += line.querySelector('.dialogue-role').textContent + ' ';
            text += line.querySelector('.dialogue-text').textContent + '\n\n';
        });
        navigator.clipboard.writeText(text);
    });
}

init();
