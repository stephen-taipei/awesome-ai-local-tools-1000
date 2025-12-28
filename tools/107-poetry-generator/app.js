/**
 * Poetry Generator - Tool #107
 */

const translations = {
    'zh-TW': {
        title: 'AI 詩詞生成',
        subtitle: '創作優美詩句，抒發情感',
        copied: '已複製！'
    },
    'en': {
        title: 'Poetry Generator',
        subtitle: 'Create beautiful verses',
        copied: 'Copied!'
    }
};

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

const poemTemplates = {
    'zh-TW': {
        modern: {
            romantic: [
                '{theme}如詩\n你是我心中最美的風景\n每一個瞬間\n都是永恆的回憶\n\n在這{theme}的季節\n我把思念寫成詩句\n願風帶去我的心意\n跨越千山萬水',
                '當{theme}來臨\n我想起你的微笑\n如同清晨的陽光\n溫暖我的心房\n\n時光匆匆\n唯有愛意綿長'
            ],
            melancholy: [
                '{theme}無聲\n落葉飄零似我的思念\n獨自徘徊在街頭\n尋找那遺失的夢\n\n歲月無情\n帶走了多少美好\n只留下\n這份淡淡的憂傷',
                '在這{theme}的夜裡\n我獨自望著星空\n那些逝去的時光\n如流水般\n再也無法挽回'
            ],
            joyful: [
                '{theme}時節\n萬物欣欣向榮\n陽光灑落大地\n一切都那麼美好\n\n讓我們歡笑\n讓我們歌唱\n為這美麗的時刻\n獻上讚歌',
                '歡樂的{theme}\n帶來無限希望\n讓心靈自由飛翔\n擁抱每一個明天'
            ],
            nostalgic: [
                '記憶中的{theme}\n總是那麼溫柔\n老街的青石板路\n依舊迴響著往日的笑聲\n\n時光荏苒\n物是人非\n唯有那份情懷\n永遠鮮活',
                '想起那年{theme}\n我們一起走過的路\n那些單純的快樂\n如今只能在夢中追尋'
            ],
            peaceful: [
                '{theme}靜好\n歲月安然\n一杯清茶\n一本好書\n便是人間至樂\n\n雲淡風輕\n心如止水\n這便是生活\n最美的模樣',
                '靜靜地\n感受{theme}的氣息\n讓心沉澱\n讓靈魂安息'
            ]
        },
        haiku: {
            romantic: ['{theme}花開\n思念如蝶舞翩翩\n情深意更濃'],
            melancholy: ['{theme}殘夢\n落花流水去無蹤\n獨自空惆悵'],
            joyful: ['{theme}喜悅\n萬物生機盎然然\n心中樂開懷'],
            nostalgic: ['{theme}往事\n舊時光影猶在目\n歲月催人老'],
            peaceful: ['{theme}寧靜\n雲淡風輕心自在\n萬籟俱無聲']
        },
        quatrain: {
            romantic: ['相思{theme}夜，\n月照離人淚。\n但願情長久，\n千里共嬋娟。'],
            melancholy: ['{theme}風蕭瑟，\n落葉滿長亭。\n歸路遙無盡，\n孤燈照獨行。'],
            joyful: ['{theme}喜氣洋，\n萬戶盡歡顏。\n共舉杯中酒，\n人間勝天堂。'],
            nostalgic: ['憶昔{theme}時，\n少年意氣發。\n如今鬢已白，\n往事隨風去。'],
            peaceful: ['{theme}閑坐久，\n雲深不知處。\n悠然見南山，\n心靜萬物舒。']
        },
        regulated: {
            romantic: ['情繫{theme}夢未央，\n相思一曲斷人腸。\n月明千里同相望，\n風送柔情入畫堂。\n\n紅豆生南國，\n此物最相思。\n願君多採擷，\n此物最相思。'],
            melancholy: ['{theme}蕭瑟感時傷，\n落葉紛飛滿地黃。\n獨倚闌干望遠處，\n天涯何處是故鄉。'],
            joyful: ['{theme}佳節喜相逢，\n萬戶笙歌樂融融。\n共飲瓊漿千杯少，\n人生得意須盡歡。'],
            nostalgic: ['往事如煙{theme}夢，\n少年壯志今何在。\n白髮漸生憶當年，\n風華正茂意氣發。'],
            peaceful: ['{theme}閒居避塵囂，\n竹林深處有茅廬。\n采菊東籬下，\n悠然見南山。']
        },
        free: {
            romantic: ['在{theme}的某個角落\n我遇見了你\n\n從此\n我的世界\n有了色彩'],
            melancholy: ['{theme}\n帶走了什麼\n又留下了什麼\n\n我不知道\n只知道\n心，有點空'],
            joyful: ['{theme}！\n多麼美好的存在\n讓我想要\n擁抱整個世界'],
            nostalgic: ['如果時光可以倒流\n我想回到那個{theme}\n重新開始\n或者\n只是看看'],
            peaceful: ['就這樣靜靜地\n感受{theme}\n什麼都不想\n什麼都不做\n\n這就夠了']
        }
    },
    'en': {
        modern: {
            romantic: ['Like poetry, {theme} unfolds\nYou are the most beautiful scene in my heart\nEvery moment\nIs an eternal memory\n\nIn this season of {theme}\nI write my longing into verses\nMay the wind carry my heart\nAcross mountains and seas'],
            melancholy: ['Silent {theme}\nFalling leaves like my thoughts\nWandering alone on the street\nSearching for lost dreams\n\nTime is merciless\nTaking away so much beauty\nLeaving only\nThis faint sorrow'],
            joyful: ['In this time of {theme}\nAll things flourish\nSunlight falls upon the earth\nEverything is so beautiful\n\nLet us laugh\nLet us sing\nFor this beautiful moment'],
            nostalgic: ['The {theme} in my memory\nAlways so gentle\nThe cobblestone streets\nStill echo with laughter of the past'],
            peaceful: ['{theme} is serene\nTime flows peacefully\nA cup of tea\nA good book\nThis is bliss']
        },
        haiku: {
            romantic: ['{theme} blooms bright\nLove floats like butterflies\nHearts beat as one'],
            melancholy: ['{theme} fades away\nLike dreams dissolving at dawn\nAlone I remain'],
            joyful: ['{theme} brings joy\nAll nature celebrates life\nHappy hearts abound'],
            nostalgic: ['Old {theme} days\nMemories linger like mist\nTime marches on still'],
            peaceful: ['Quiet {theme} day\nMind at rest, soul at peace\nAll is well within']
        },
        quatrain: {
            romantic: ['In {theme}\'s embrace I dream of you,\nBeneath the moon\'s soft silver hue.\nAcross the miles my heart does fly,\nTo where you are, beneath same sky.'],
            melancholy: ['The {theme} wind blows cold and grey,\nAs autumn leaves have blown away.\nThe lonely path stretches so far,\nA single lamp, my guiding star.'],
            joyful: ['{theme} brings such happy cheer,\nWith laughter ringing far and near.\nRaise your glass and celebrate,\nFor life is grand and truly great.'],
            nostalgic: ['I recall that {theme} of old,\nWhen we were young and brave and bold.\nNow silver streaks my aging hair,\nBut memories still linger there.'],
            peaceful: ['In quiet {theme} I find my rest,\nAmong the hills and nature blessed.\nThe clouds drift by without a care,\nAnd peace descends upon me there.']
        },
        regulated: {
            romantic: ['Love blooms eternal in {theme}\'s light,\nTwo hearts entwined through day and night.\nAcross the seas, beneath the stars,\nNo distance keeps true love apart.\n\nThrough seasons change and years go by,\nOur love remains and will not die.\nForever bound by fate\'s sweet thread,\nUntil the last breath I have left.'],
            melancholy: ['The {theme} brings memories of pain,\nLike autumn leaves in falling rain.\nI stand alone and wonder why,\nBeneath the vast and empty sky.'],
            joyful: ['Rejoice! For {theme} has come at last,\nForgetting sorrows of the past.\nWith friends and family gathered near,\nWe celebrate another year.'],
            nostalgic: ['Those {theme} days of long ago,\nWhen life was simple, time was slow.\nWe\'d wander freely, young and free,\nNot knowing what the future\'d be.'],
            peaceful: ['In {theme}\'s calm I find my way,\nAway from noise of every day.\nAmong the trees and flowing streams,\nI rest in nature\'s peaceful dreams.']
        },
        free: {
            romantic: ['In some corner of {theme}\nI found you\n\nSince then\nMy world\nHas color'],
            melancholy: ['{theme}\nWhat did it take\nWhat did it leave\n\nI don\'t know\nI only know\nMy heart feels empty'],
            joyful: ['{theme}!\nWhat a wonderful thing\nMaking me want to\nEmbrace the whole world'],
            nostalgic: ['If time could rewind\nI\'d go back to that {theme}\nStart again\nOr maybe\nJust look'],
            peaceful: ['Just like this, quietly\nFeeling {theme}\nThinking nothing\nDoing nothing\n\nThis is enough']
        }
    }
};

function generatePoem(theme, type, mood) {
    const templates = poemTemplates[currentLang][type][mood];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return template.replace(/{theme}/g, theme || (currentLang === 'zh-TW' ? '時光' : 'time'));
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    const generate = () => {
        const theme = document.getElementById('themeInput').value.trim();
        const type = document.getElementById('typeSelect').value;
        const mood = document.getElementById('moodSelect').value;

        const poem = generatePoem(theme, type, mood);
        document.getElementById('poemDisplay').textContent = poem;
        document.getElementById('outputSection').style.display = 'block';
    };

    document.getElementById('generateBtn').addEventListener('click', generate);
    document.getElementById('regenerateBtn').addEventListener('click', generate);

    document.getElementById('copyBtn').addEventListener('click', () => {
        const text = document.getElementById('poemDisplay').textContent;
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.getElementById('copyBtn');
            btn.textContent = translations[currentLang].copied;
            setTimeout(() => btn.textContent = '複製', 2000);
        });
    });
}

init();
