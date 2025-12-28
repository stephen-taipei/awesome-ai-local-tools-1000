/**
 * Ad Copy Generator - Tool #106
 */

const translations = {
    'zh-TW': {
        title: '廣告文案生成',
        subtitle: '快速生成吸睛廣告文案',
        copied: '已複製！',
        variant: '版本'
    },
    'en': {
        title: 'Ad Copy Generator',
        subtitle: 'Create compelling ad copy',
        copied: 'Copied!',
        variant: 'Version'
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

const adTemplates = {
    'zh-TW': {
        social: {
            headlines: [
                '還在為{problem}煩惱嗎？{product}讓你輕鬆解決！',
                '限時優惠！{product}特價中',
                '超過10,000人的選擇 - {product}',
                '發現{product}的神奇魔力'
            ],
            bodies: [
                '{feature}，讓你的生活更美好。',
                '現在購買即享專屬優惠，數量有限！',
                '客戶好評如潮，立即體驗！',
                '簡單三步驟，輕鬆上手。'
            ]
        },
        search: {
            headlines: [
                '{product} - 官方正品',
                '優惠中 | {product}',
                '{product} | 免運費',
                '熱銷 | {product}'
            ],
            bodies: [
                '品質保證，售後無憂。立即選購！',
                '限時特價，錯過可惜。馬上搶購！',
                '好評如潮，值得信賴。了解更多！'
            ]
        },
        display: {
            headlines: [
                '重新定義{category}',
                '你值得擁有的{product}',
                '改變從{product}開始'
            ],
            bodies: [
                '{feature}，為你打造完美體驗。',
                '創新科技，極致品質。',
                '專業團隊，用心服務。'
            ]
        },
        video: {
            headlines: [
                '你是否曾經遇過這種情況？',
                '讓我來告訴你一個秘密...',
                '這就是為什麼你需要{product}'
            ],
            bodies: [
                '介紹{product}，一個能夠{feature}的創新產品。',
                '從今天開始，改變你的生活方式。',
                '加入數千名滿意客戶的行列。'
            ]
        },
        email: {
            headlines: [
                '專屬優惠：{product}限時特價',
                '不容錯過：{product}新品上市',
                '感謝您的支持：{product}會員專屬'
            ],
            bodies: [
                '親愛的顧客，我們特別為您準備了這份優惠。{feature}，現在就是最佳入手時機。',
                '全新{product}已經上市，擁有{feature}，相信您一定會喜歡。',
                '感謝您一直以來的支持，特別提供會員專屬優惠。'
            ]
        }
    },
    'en': {
        social: {
            headlines: [
                'Still struggling with {problem}? {product} is the solution!',
                'Limited offer! {product} on sale',
                'Over 10,000 people chose {product}',
                'Discover the magic of {product}'
            ],
            bodies: [
                '{feature}, making your life better.',
                'Buy now for exclusive discounts. Limited quantity!',
                'Rave reviews from customers. Try it now!',
                'Three simple steps to get started.'
            ]
        },
        search: {
            headlines: [
                '{product} - Official',
                'On Sale | {product}',
                '{product} | Free Shipping',
                'Best Seller | {product}'
            ],
            bodies: [
                'Quality guaranteed. Shop now!',
                'Limited time offer. Get it now!',
                'Trusted by thousands. Learn more!'
            ]
        },
        display: {
            headlines: [
                'Redefining {category}',
                'The {product} you deserve',
                'Change starts with {product}'
            ],
            bodies: [
                '{feature}, creating the perfect experience.',
                'Innovative technology, premium quality.',
                'Professional team, dedicated service.'
            ]
        },
        video: {
            headlines: [
                'Have you ever experienced this?',
                'Let me tell you a secret...',
                'This is why you need {product}'
            ],
            bodies: [
                'Introducing {product}, an innovative product that {feature}.',
                'Start changing your lifestyle today.',
                'Join thousands of satisfied customers.'
            ]
        },
        email: {
            headlines: [
                'Exclusive: {product} Limited Offer',
                'Don\'t Miss: {product} New Launch',
                'Thank You: {product} Member Special'
            ],
            bodies: [
                'Dear customer, we have prepared a special offer for you. {feature}, now is the best time.',
                'The new {product} is here with {feature}. You\'ll love it.',
                'Thank you for your support. Enjoy this member-exclusive offer.'
            ]
        }
    }
};

const ctaText = {
    'zh-TW': {
        buy: '立即購買 →',
        learn: '了解更多 →',
        signup: '免費註冊 →',
        download: '立即下載 →',
        contact: '聯繫我們 →'
    },
    'en': {
        buy: 'Buy Now →',
        learn: 'Learn More →',
        signup: 'Sign Up Free →',
        download: 'Download Now →',
        contact: 'Contact Us →'
    }
};

function generateAds(product, feature, type, audience, cta) {
    const templates = adTemplates[currentLang][type];
    const ads = [];

    for (let i = 0; i < 3; i++) {
        const headline = templates.headlines[Math.floor(Math.random() * templates.headlines.length)]
            .replace(/{product}/g, product)
            .replace(/{problem}/g, currentLang === 'zh-TW' ? '這個問題' : 'this problem')
            .replace(/{category}/g, currentLang === 'zh-TW' ? '產品' : 'products');

        const body = templates.bodies[Math.floor(Math.random() * templates.bodies.length)]
            .replace(/{product}/g, product)
            .replace(/{feature}/g, feature || (currentLang === 'zh-TW' ? '優質特色' : 'premium features'));

        ads.push({
            headline,
            body,
            cta: ctaText[currentLang][cta]
        });
    }

    return ads;
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const product = document.getElementById('productInput').value.trim() || (currentLang === 'zh-TW' ? '產品' : 'Product');
        const feature = document.getElementById('featureInput').value.trim();
        const type = document.getElementById('typeSelect').value;
        const audience = document.getElementById('audienceSelect').value;
        const cta = document.getElementById('ctaSelect').value;

        const ads = generateAds(product, feature, type, audience, cta);

        const container = document.getElementById('adVariants');
        container.innerHTML = ads.map((ad, i) => `
            <div class="ad-variant">
                <div class="ad-variant-header">
                    <span class="ad-variant-label">${t('variant')} ${i + 1}</span>
                    <button class="ad-variant-copy" data-text="${ad.headline}\n${ad.body}\n${ad.cta}">複製</button>
                </div>
                <div class="ad-headline">${ad.headline}</div>
                <div class="ad-body">${ad.body}</div>
                <div class="ad-cta">${ad.cta}</div>
            </div>
        `).join('');

        document.getElementById('outputSection').style.display = 'block';

        container.querySelectorAll('.ad-variant-copy').forEach(btn => {
            btn.addEventListener('click', () => {
                navigator.clipboard.writeText(btn.dataset.text.replace(/\\n/g, '\n'));
                btn.textContent = t('copied');
                setTimeout(() => btn.textContent = '複製', 2000);
            });
        });
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const ads = document.querySelectorAll('.ad-variant');
        let text = '';
        ads.forEach((ad, i) => {
            text += `--- ${t('variant')} ${i + 1} ---\n`;
            text += ad.querySelector('.ad-headline').textContent + '\n';
            text += ad.querySelector('.ad-body').textContent + '\n';
            text += ad.querySelector('.ad-cta').textContent + '\n\n';
        });
        navigator.clipboard.writeText(text);
    });
}

init();
