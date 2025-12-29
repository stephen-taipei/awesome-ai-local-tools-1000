/**
 * Resume Writer - Tool #110
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

const templates = {
    'zh-TW': {
        professional: {
            intro: ['我是{name}，擁有豐富的專業經驗，現正積極尋求{position}的職位機會。', '您好，我叫{name}，是一位經驗豐富的專業人士，對{position}領域充滿熱情。'],
            education: ['在學術背景方面，我畢業於{education}，這段學習歷程為我奠定了紮實的理論基礎。'],
            experience: ['在職涯發展上，我累積了豐富的實務經驗：{experience}。這些經歷讓我培養出專業的工作態度與解決問題的能力。'],
            skills: ['專業技能方面，我精通{skills}等技術，能夠快速適應新環境並持續學習成長。'],
            closing: ['我相信自己的專業能力與工作熱忱，能為貴公司帶來價值。期待有機會與您進一步詳談，謝謝。']
        },
        creative: {
            intro: ['故事要從這裡說起——我是{name}，一個對{position}領域充滿無限熱情的探索者。'],
            education: ['求學時期，{education}的歷練讓我學會了如何將創意與邏輯完美結合。'],
            experience: ['一路走來，{experience}，每一段經歷都是我成長的養分。'],
            skills: ['我的工具箱裡有：{skills}——這些都是我表達創意的畫筆。'],
            closing: ['如果您正在尋找一個既有專業又充滿創意的夥伴，那就是我了！期待與您相遇。']
        },
        academic: {
            intro: ['本人{name}，致力於{position}相關領域之研究與實務工作。'],
            education: ['學術背景：{education}。在學期間，培養了嚴謹的研究態度與批判性思考能力。'],
            experience: ['研究與實務經歷如下：{experience}。透過這些經驗，累積了深厚的專業知識。'],
            skills: ['專業能力涵蓋：{skills}。持續關注該領域之最新發展與研究趨勢。'],
            closing: ['期望能貢獻所學，與貴單位共同推動相關領域之發展。敬請惠予面試機會。']
        }
    },
    'en': {
        professional: {
            intro: ['I am {name}, an experienced professional actively seeking a {position} position.', 'Hello, my name is {name}, a passionate professional in the {position} field.'],
            education: ['In terms of academic background, I graduated from {education}, which laid a solid foundation for my career.'],
            experience: ['Throughout my career, I have accumulated rich practical experience: {experience}. These experiences have cultivated my professional attitude and problem-solving abilities.'],
            skills: ['In terms of professional skills, I am proficient in {skills}, and I can quickly adapt to new environments while continuously learning and growing.'],
            closing: ['I believe my professional abilities and work enthusiasm can bring value to your company. I look forward to discussing this opportunity further. Thank you.']
        },
        creative: {
            intro: ['Let me tell you a story—I\'m {name}, an explorer passionate about {position}.'],
            education: ['During my academic journey at {education}, I learned to perfectly combine creativity with logic.'],
            experience: ['Along the way, {experience}—each experience has nurtured my growth.'],
            skills: ['My toolkit includes: {skills}—these are my brushes for expressing creativity.'],
            closing: ['If you\'re looking for a partner who is both professional and creative, that\'s me! Looking forward to meeting you.']
        },
        academic: {
            intro: ['I am {name}, dedicated to research and practical work in the {position} field.'],
            education: ['Academic background: {education}. During my studies, I developed rigorous research attitudes and critical thinking skills.'],
            experience: ['Research and practical experience: {experience}. Through these experiences, I have accumulated profound professional knowledge.'],
            skills: ['Professional competencies include: {skills}. I continuously follow the latest developments and research trends in this field.'],
            closing: ['I hope to contribute my learning and work with your organization to advance the field. I respectfully request an interview opportunity.']
        }
    }
};

function generateResume(name, position, education, experience, skills, type, length) {
    const t = templates[currentLang][type];
    const lengthMultiplier = length === 'short' ? 0.5 : length === 'medium' ? 1 : 1.5;

    name = name || (currentLang === 'zh-TW' ? '(您的姓名)' : '(Your Name)');
    position = position || (currentLang === 'zh-TW' ? '(目標職位)' : '(Target Position)');
    education = education || (currentLang === 'zh-TW' ? '(您的學歷)' : '(Your Education)');

    const expList = experience.split('\n').filter(e => e.trim());
    const expText = expList.length > 0 ? expList.join('；') : (currentLang === 'zh-TW' ? '(您的經歷)' : '(Your Experience)');

    skills = skills || (currentLang === 'zh-TW' ? '(您的技能)' : '(Your Skills)');

    let resume = '';

    resume += t.intro[Math.floor(Math.random() * t.intro.length)]
        .replace('{name}', name)
        .replace('{position}', position) + '\n\n';

    resume += t.education[0].replace('{education}', education) + '\n\n';

    if (lengthMultiplier >= 1) {
        resume += t.experience[0].replace('{experience}', expText) + '\n\n';
    }

    resume += t.skills[0].replace('{skills}', skills) + '\n\n';

    resume += t.closing[0];

    return resume;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const name = document.getElementById('nameInput').value.trim();
        const position = document.getElementById('positionInput').value.trim();
        const education = document.getElementById('educationInput').value.trim();
        const experience = document.getElementById('experienceInput').value;
        const skills = document.getElementById('skillsInput').value.trim();
        const type = document.getElementById('typeSelect').value;
        const length = document.getElementById('lengthSelect').value;

        const resume = generateResume(name, position, education, experience, skills, type, length);
        document.getElementById('resumePreview').textContent = resume;
        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('resumePreview').textContent;
        navigator.clipboard.writeText(text);
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const text = document.getElementById('resumePreview').textContent;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
}

init();
