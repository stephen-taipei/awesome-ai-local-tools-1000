/**
 * Email Writer - Tool #105
 */

const translations = {
    'zh-TW': {
        title: 'Email 撰寫助手',
        subtitle: '快速撰寫專業郵件',
        privacyBadge: '100% 本地處理 · 零資料上傳',
        generateBtn: '生成郵件',
        outputTitle: '生成的郵件',
        copied: '已複製！',
        subjectPrefix: '主旨：'
    },
    'en': {
        title: 'Email Writer',
        subtitle: 'Write professional emails quickly',
        privacyBadge: '100% Local Processing · Zero Data Upload',
        generateBtn: 'Generate Email',
        outputTitle: 'Generated Email',
        copied: 'Copied!',
        subjectPrefix: 'Subject: '
    }
};

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

function t(key) { return translations[currentLang][key] || key; }

const emailTemplates = {
    'zh-TW': {
        business: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '茲因業務需要，特此致函。',
                body: '{content}',
                closing: '如有任何問題，歡迎隨時與我聯繫。',
                regards: '順頌\n商祺',
                signature: '{sender} 敬上'
            },
            semiformal: {
                greeting: '{recipient} 您好：',
                opening: '感謝您撥冗閱讀此信。',
                body: '{content}',
                closing: '期待您的回覆。',
                regards: '祝好',
                signature: '{sender}'
            },
            friendly: {
                greeting: 'Hi {recipient}：',
                opening: '希望這封信找到您一切安好！',
                body: '{content}',
                closing: '有任何問題隨時聯繫我。',
                regards: 'Best regards,',
                signature: '{sender}'
            }
        },
        inquiry: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '我是{sender}，對貴公司的產品/服務深感興趣，特此來函詢問。',
                body: '{content}',
                closing: '懇請撥冗回覆，不勝感激。',
                regards: '順頌\n商祺',
                signature: '{sender} 敬上'
            }
        },
        reply: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '感謝您的來信，已收悉您的詢問。',
                body: '針對您提出的問題，回覆如下：\n\n{content}',
                closing: '如有其他疑問，歡迎隨時聯繫。',
                regards: '順頌\n商祺',
                signature: '{sender} 敬上'
            }
        },
        apology: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '對於造成您的不便，我們深感抱歉。',
                body: '{content}',
                closing: '我們將竭盡所能避免類似情況再次發生。感謝您的諒解。',
                regards: '誠摯地',
                signature: '{sender} 敬上'
            }
        },
        thanks: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '特此致函，向您表達衷心的感謝。',
                body: '{content}',
                closing: '您的協助對我們意義重大。',
                regards: '誠摯感謝',
                signature: '{sender} 敬上'
            }
        },
        invitation: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '謹代表公司，誠摯邀請您參加。',
                body: '{content}',
                closing: '期待您的蒞臨。敬請回覆是否能夠出席。',
                regards: '順頌\n商祺',
                signature: '{sender} 敬上'
            }
        },
        followup: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '承上次討論，特此跟進後續進度。',
                body: '{content}',
                closing: '期待您的回覆。',
                regards: '順頌\n商祺',
                signature: '{sender} 敬上'
            }
        },
        resignation: {
            formal: {
                greeting: '{recipient} 您好：',
                opening: '經過深思熟慮後，我決定向您正式提出辭呈。',
                body: '{content}',
                closing: '感謝公司這段時間的栽培，願意在離職前完成交接工作。',
                regards: '順頌\n商祺',
                signature: '{sender} 敬上'
            }
        }
    },
    'en': {
        business: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'I am writing to you regarding a business matter.',
                body: '{content}',
                closing: 'Please do not hesitate to contact me if you have any questions.',
                regards: 'Sincerely,',
                signature: '{sender}'
            },
            semiformal: {
                greeting: 'Dear {recipient},',
                opening: 'Thank you for taking the time to read this email.',
                body: '{content}',
                closing: 'Looking forward to your reply.',
                regards: 'Best regards,',
                signature: '{sender}'
            },
            friendly: {
                greeting: 'Hi {recipient},',
                opening: 'Hope this email finds you well!',
                body: '{content}',
                closing: 'Feel free to reach out if you have any questions.',
                regards: 'Best,',
                signature: '{sender}'
            }
        },
        inquiry: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'I am writing to inquire about your products/services.',
                body: '{content}',
                closing: 'I would appreciate your response at your earliest convenience.',
                regards: 'Sincerely,',
                signature: '{sender}'
            }
        },
        reply: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'Thank you for your email. I have received your inquiry.',
                body: 'Regarding your questions:\n\n{content}',
                closing: 'Please let me know if you have any other questions.',
                regards: 'Sincerely,',
                signature: '{sender}'
            }
        },
        apology: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'I sincerely apologize for any inconvenience caused.',
                body: '{content}',
                closing: 'We will do our best to prevent this from happening again. Thank you for your understanding.',
                regards: 'Sincerely,',
                signature: '{sender}'
            }
        },
        thanks: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'I am writing to express my sincere gratitude.',
                body: '{content}',
                closing: 'Your assistance means a lot to us.',
                regards: 'With gratitude,',
                signature: '{sender}'
            }
        },
        invitation: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'On behalf of the company, I cordially invite you to attend.',
                body: '{content}',
                closing: 'We look forward to your presence. Please RSVP.',
                regards: 'Sincerely,',
                signature: '{sender}'
            }
        },
        followup: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'Following up on our previous discussion.',
                body: '{content}',
                closing: 'Looking forward to your response.',
                regards: 'Best regards,',
                signature: '{sender}'
            }
        },
        resignation: {
            formal: {
                greeting: 'Dear {recipient},',
                opening: 'After careful consideration, I am formally submitting my resignation.',
                body: '{content}',
                closing: 'I am grateful for the opportunities here and am willing to help with the transition.',
                regards: 'Sincerely,',
                signature: '{sender}'
            }
        }
    }
};

function generateEmail(type, recipient, sender, subject, content, tone) {
    const templates = emailTemplates[currentLang][type] || emailTemplates[currentLang].business;
    const template = templates[tone] || templates.formal;

    const email = [
        template.greeting.replace('{recipient}', recipient || (currentLang === 'zh-TW' ? '先生/女士' : 'Sir/Madam')),
        '',
        template.opening.replace('{sender}', sender),
        '',
        template.body.replace('{content}', content || (currentLang === 'zh-TW' ? '（請在此填寫郵件內容）' : '(Please fill in the email content here)')),
        '',
        template.closing,
        '',
        template.regards,
        template.signature.replace('{sender}', sender || (currentLang === 'zh-TW' ? '（您的姓名）' : '(Your Name)'))
    ].join('\n');

    return { subject: subject || (currentLang === 'zh-TW' ? '（請填寫主旨）' : '(Please fill in subject)'), body: email };
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const type = document.getElementById('typeSelect').value;
        const recipient = document.getElementById('recipientInput').value.trim();
        const sender = document.getElementById('senderInput').value.trim();
        const subject = document.getElementById('subjectInput').value.trim();
        const content = document.getElementById('contentInput').value.trim();
        const tone = document.getElementById('toneSelect').value;

        const email = generateEmail(type, recipient, sender, subject, content, tone);

        document.getElementById('emailSubject').textContent = t('subjectPrefix') + email.subject;
        document.getElementById('emailBody').textContent = email.body;
        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const subject = document.getElementById('emailSubject').textContent;
        const body = document.getElementById('emailBody').textContent;
        navigator.clipboard.writeText(subject + '\n\n' + body).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = t('copied');
            setTimeout(() => btn.textContent = '複製', 2000);
        });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        const subject = document.getElementById('emailSubject').textContent;
        const body = document.getElementById('emailBody').textContent;
        const blob = new Blob([subject + '\n\n' + body], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'email.txt';
        a.click();
        URL.revokeObjectURL(url);
    });
}

init();
