/**
 * Emoji Search - Tool #191
 */
const emojis = {
    smileys: [
        { e: '😀', k: '笑 smile grin happy' }, { e: '😃', k: '笑 smile happy' }, { e: '😄', k: '笑 smile grin' },
        { e: '😁', k: '笑 grin teeth' }, { e: '😆', k: '笑 laugh' }, { e: '😅', k: '笑 sweat' },
        { e: '🤣', k: '笑 rofl rolling' }, { e: '😂', k: '笑 cry tears joy' }, { e: '🙂', k: '微笑 smile' },
        { e: '😊', k: '開心 blush happy' }, { e: '😇', k: '天使 angel halo' }, { e: '🥰', k: '愛 love hearts' },
        { e: '😍', k: '愛 love heart eyes' }, { e: '🤩', k: '興奮 star struck' }, { e: '😘', k: '親 kiss' },
        { e: '😗', k: '親 kiss' }, { e: '😚', k: '親 kiss blush' }, { e: '😋', k: '美味 yummy' },
        { e: '😛', k: '吐舌 tongue' }, { e: '😜', k: '眨眼 wink tongue' }, { e: '🤪', k: '瘋狂 crazy' },
        { e: '😝', k: '吐舌 squint' }, { e: '🤑', k: '錢 money' }, { e: '🤗', k: '抱抱 hug' },
        { e: '🤭', k: '捂嘴 giggle' }, { e: '🤫', k: '噓 quiet shush' }, { e: '🤔', k: '思考 think' },
        { e: '😐', k: '無表情 neutral' }, { e: '😑', k: '無表情 expressionless' }, { e: '😶', k: '無言 silent' },
        { e: '😏', k: '得意 smirk' }, { e: '😒', k: '不屑 unamused' }, { e: '🙄', k: '翻白眼 roll eyes' },
        { e: '😬', k: '尷尬 grimace' }, { e: '😮‍💨', k: '嘆氣 exhale' }, { e: '🤥', k: '說謊 lie' },
        { e: '😌', k: '放鬆 relieved' }, { e: '😔', k: '難過 sad pensive' }, { e: '😪', k: '困 sleepy' },
        { e: '🤤', k: '流口水 drool' }, { e: '😴', k: '睡覺 sleep zzz' }, { e: '😷', k: '口罩 mask sick' },
        { e: '🤒', k: '生病 sick thermometer' }, { e: '🤕', k: '受傷 bandage hurt' }, { e: '🤢', k: '噁心 nauseated' },
        { e: '🤮', k: '嘔吐 vomit' }, { e: '🤧', k: '打噴嚏 sneeze' }, { e: '🥵', k: '熱 hot' },
        { e: '🥶', k: '冷 cold freezing' }, { e: '🥴', k: '暈 woozy drunk' }, { e: '😵', k: '暈 dizzy' },
        { e: '🤯', k: '爆炸 mind blown' }, { e: '😎', k: '酷 cool sunglasses' }, { e: '🤓', k: '書呆子 nerd' },
        { e: '😕', k: '困惑 confused' }, { e: '😟', k: '擔心 worried' }, { e: '🙁', k: '不開心 sad' },
        { e: '😮', k: '驚訝 surprised' }, { e: '😯', k: '驚訝 hushed' }, { e: '😲', k: '震驚 astonished' },
        { e: '😳', k: '尷尬 flushed' }, { e: '🥺', k: '可憐 pleading' }, { e: '😦', k: '擔心 frown' },
        { e: '😧', k: '痛苦 anguished' }, { e: '😨', k: '害怕 fearful' }, { e: '😰', k: '焦慮 anxious' },
        { e: '😥', k: '難過 sad relieved' }, { e: '😢', k: '哭 cry tear' }, { e: '😭', k: '大哭 sob crying' },
        { e: '😱', k: '尖叫 scream fear' }, { e: '😖', k: '困擾 confounded' }, { e: '😣', k: '堅持 persevere' },
        { e: '😞', k: '失望 disappointed' }, { e: '😓', k: '冷汗 downcast' }, { e: '😩', k: '疲憊 weary' },
        { e: '😫', k: '累 tired' }, { e: '🥱', k: '打哈欠 yawn' }, { e: '😤', k: '生氣 angry steam' },
        { e: '😡', k: '憤怒 angry red' }, { e: '😠', k: '生氣 angry' }, { e: '🤬', k: '罵人 swear' },
        { e: '💀', k: '骷髏 skull dead' }, { e: '👻', k: '鬼 ghost' }, { e: '👽', k: '外星人 alien' }
    ],
    people: [
        { e: '👋', k: '揮手 wave hi bye' }, { e: '🤚', k: '手 raised back' }, { e: '🖐️', k: '手 five' },
        { e: '✋', k: '停 stop hand' }, { e: '🖖', k: '手 vulcan' }, { e: '👌', k: 'OK 好' },
        { e: '🤌', k: '義大利手勢' }, { e: '🤏', k: '一點點 pinch' }, { e: '✌️', k: '勝利 victory peace' },
        { e: '🤞', k: '祈禱 crossed fingers' }, { e: '🤟', k: '愛你 love you' }, { e: '🤘', k: '搖滾 rock' },
        { e: '🤙', k: '打電話 call me' }, { e: '👈', k: '左 left point' }, { e: '👉', k: '右 right point' },
        { e: '👆', k: '上 up point' }, { e: '👇', k: '下 down point' }, { e: '👍', k: '讚 thumbs up good' },
        { e: '👎', k: '倒讚 thumbs down bad' }, { e: '✊', k: '拳頭 fist' }, { e: '👊', k: '拳頭 punch' },
        { e: '🤛', k: '左拳' }, { e: '🤜', k: '右拳' }, { e: '👏', k: '拍手 clap applause' },
        { e: '🙌', k: '歡呼 raising hands' }, { e: '👐', k: '張開手' }, { e: '🤲', k: '掌心向上' },
        { e: '🤝', k: '握手 handshake' }, { e: '🙏', k: '祈禱 pray please thanks' }, { e: '💪', k: '肌肉 strong muscle' }
    ],
    animals: [
        { e: '🐶', k: '狗 dog' }, { e: '🐱', k: '貓 cat' }, { e: '🐭', k: '老鼠 mouse' },
        { e: '🐹', k: '倉鼠 hamster' }, { e: '🐰', k: '兔子 rabbit bunny' }, { e: '🦊', k: '狐狸 fox' },
        { e: '🐻', k: '熊 bear' }, { e: '🐼', k: '熊貓 panda' }, { e: '🐨', k: '無尾熊 koala' },
        { e: '🐯', k: '老虎 tiger' }, { e: '🦁', k: '獅子 lion' }, { e: '🐮', k: '牛 cow' },
        { e: '🐷', k: '豬 pig' }, { e: '🐸', k: '青蛙 frog' }, { e: '🐵', k: '猴子 monkey' },
        { e: '🐔', k: '雞 chicken' }, { e: '🐧', k: '企鵝 penguin' }, { e: '🐦', k: '鳥 bird' },
        { e: '🦆', k: '鴨 duck' }, { e: '🦅', k: '老鷹 eagle' }, { e: '🦉', k: '貓頭鷹 owl' },
        { e: '🦇', k: '蝙蝠 bat' }, { e: '🐺', k: '狼 wolf' }, { e: '🐗', k: '野豬 boar' },
        { e: '🐴', k: '馬 horse' }, { e: '🦄', k: '獨角獸 unicorn' }, { e: '🐝', k: '蜜蜂 bee' },
        { e: '🐛', k: '蟲 bug caterpillar' }, { e: '🦋', k: '蝴蝶 butterfly' }, { e: '🐌', k: '蝸牛 snail' },
        { e: '🐙', k: '章魚 octopus' }, { e: '🦑', k: '烏賊 squid' }, { e: '🦐', k: '蝦 shrimp' },
        { e: '🦞', k: '龍蝦 lobster' }, { e: '🦀', k: '螃蟹 crab' }, { e: '🐠', k: '魚 fish' },
        { e: '🐬', k: '海豚 dolphin' }, { e: '🐳', k: '鯨魚 whale' }, { e: '🦈', k: '鯊魚 shark' },
        { e: '🐊', k: '鱷魚 crocodile' }, { e: '🐢', k: '烏龜 turtle' }, { e: '🦎', k: '蜥蜴 lizard' },
        { e: '🐍', k: '蛇 snake' }, { e: '🐉', k: '龍 dragon' }, { e: '🦕', k: '恐龍 dinosaur' }
    ],
    food: [
        { e: '🍎', k: '蘋果 apple red' }, { e: '🍐', k: '梨 pear' }, { e: '🍊', k: '橘子 orange' },
        { e: '🍋', k: '檸檬 lemon' }, { e: '🍌', k: '香蕉 banana' }, { e: '🍉', k: '西瓜 watermelon' },
        { e: '🍇', k: '葡萄 grapes' }, { e: '🍓', k: '草莓 strawberry' }, { e: '🫐', k: '藍莓 blueberry' },
        { e: '🍒', k: '櫻桃 cherry' }, { e: '🍑', k: '桃子 peach' }, { e: '🥭', k: '芒果 mango' },
        { e: '🍍', k: '鳳梨 pineapple' }, { e: '🥥', k: '椰子 coconut' }, { e: '🥝', k: '奇異果 kiwi' },
        { e: '🍅', k: '番茄 tomato' }, { e: '🥑', k: '酪梨 avocado' }, { e: '🥦', k: '花椰菜 broccoli' },
        { e: '🥬', k: '青菜 leafy green' }, { e: '🥒', k: '小黃瓜 cucumber' }, { e: '🌶️', k: '辣椒 pepper hot' },
        { e: '🌽', k: '玉米 corn' }, { e: '🥕', k: '胡蘿蔔 carrot' }, { e: '🧄', k: '蒜 garlic' },
        { e: '🍞', k: '麵包 bread' }, { e: '🥐', k: '可頌 croissant' }, { e: '🥖', k: '法棍 baguette' },
        { e: '🍕', k: '披薩 pizza' }, { e: '🍔', k: '漢堡 burger hamburger' }, { e: '🍟', k: '薯條 fries' },
        { e: '🌭', k: '熱狗 hotdog' }, { e: '🥪', k: '三明治 sandwich' }, { e: '🌮', k: '墨西哥夾餅 taco' },
        { e: '🍜', k: '拉麵 noodles ramen' }, { e: '🍝', k: '義大利麵 pasta spaghetti' }, { e: '🍲', k: '火鍋 pot stew' },
        { e: '🍣', k: '壽司 sushi' }, { e: '🍱', k: '便當 bento' }, { e: '🍛', k: '咖哩 curry' },
        { e: '🍚', k: '飯 rice' }, { e: '🥟', k: '餃子 dumpling' }, { e: '🍰', k: '蛋糕 cake' },
        { e: '🎂', k: '生日蛋糕 birthday cake' }, { e: '🧁', k: '杯子蛋糕 cupcake' }, { e: '🍩', k: '甜甜圈 donut' },
        { e: '🍪', k: '餅乾 cookie' }, { e: '🍫', k: '巧克力 chocolate' }, { e: '🍿', k: '爆米花 popcorn' },
        { e: '☕', k: '咖啡 coffee' }, { e: '🍵', k: '茶 tea' }, { e: '🧋', k: '珍珠奶茶 bubble tea boba' },
        { e: '🍺', k: '啤酒 beer' }, { e: '🍷', k: '紅酒 wine' }, { e: '🥤', k: '飲料 drink cup' }
    ],
    activities: [
        { e: '⚽', k: '足球 soccer football' }, { e: '🏀', k: '籃球 basketball' }, { e: '🏈', k: '美式足球 football' },
        { e: '⚾', k: '棒球 baseball' }, { e: '🥎', k: '壘球 softball' }, { e: '🎾', k: '網球 tennis' },
        { e: '🏐', k: '排球 volleyball' }, { e: '🏉', k: '橄欖球 rugby' }, { e: '🥏', k: '飛盤 frisbee' },
        { e: '🎱', k: '撞球 pool billiards' }, { e: '🏓', k: '桌球 ping pong' }, { e: '🏸', k: '羽毛球 badminton' },
        { e: '🥊', k: '拳擊 boxing' }, { e: '🥋', k: '武術 martial arts' }, { e: '⛳', k: '高爾夫 golf' },
        { e: '🎿', k: '滑雪 ski' }, { e: '🏂', k: '滑雪板 snowboard' }, { e: '🏊', k: '游泳 swimming' },
        { e: '🚴', k: '騎腳踏車 cycling bike' }, { e: '🏃', k: '跑步 running' }, { e: '🧗', k: '攀岩 climbing' },
        { e: '🎯', k: '飛鏢 dart target' }, { e: '🎮', k: '遊戲 gaming controller' }, { e: '🎲', k: '骰子 dice' },
        { e: '🎨', k: '畫畫 art painting' }, { e: '🎤', k: '唱歌 microphone karaoke' }, { e: '🎧', k: '音樂 headphones' },
        { e: '🎹', k: '鋼琴 piano keyboard' }, { e: '🎸', k: '吉他 guitar' }, { e: '🎺', k: '小號 trumpet' },
        { e: '🎻', k: '小提琴 violin' }, { e: '🥁', k: '鼓 drum' }, { e: '🎬', k: '電影 movie film' }
    ],
    objects: [
        { e: '📱', k: '手機 phone mobile' }, { e: '💻', k: '電腦 laptop computer' }, { e: '🖥️', k: '桌機 desktop' },
        { e: '⌨️', k: '鍵盤 keyboard' }, { e: '🖱️', k: '滑鼠 mouse' }, { e: '📷', k: '相機 camera' },
        { e: '📺', k: '電視 TV television' }, { e: '📻', k: '收音機 radio' }, { e: '⏰', k: '鬧鐘 alarm clock' },
        { e: '⌚', k: '手錶 watch' }, { e: '🔋', k: '電池 battery' }, { e: '💡', k: '燈泡 light bulb idea' },
        { e: '🔦', k: '手電筒 flashlight' }, { e: '📖', k: '書 book reading' }, { e: '📚', k: '書本 books' },
        { e: '✏️', k: '鉛筆 pencil' }, { e: '🖊️', k: '筆 pen' }, { e: '📝', k: '筆記 note memo' },
        { e: '📁', k: '資料夾 folder' }, { e: '📎', k: '迴紋針 paperclip' }, { e: '✂️', k: '剪刀 scissors' },
        { e: '🔑', k: '鑰匙 key' }, { e: '🔒', k: '鎖 lock locked' }, { e: '🔓', k: '開鎖 unlock' },
        { e: '💰', k: '錢 money bag' }, { e: '💵', k: '美金 dollar money' }, { e: '💳', k: '信用卡 credit card' },
        { e: '🎁', k: '禮物 gift present' }, { e: '🎈', k: '氣球 balloon' }, { e: '🎉', k: '慶祝 party celebration' }
    ],
    symbols: [
        { e: '❤️', k: '愛心 heart love red' }, { e: '🧡', k: '橘心 orange heart' }, { e: '💛', k: '黃心 yellow heart' },
        { e: '💚', k: '綠心 green heart' }, { e: '💙', k: '藍心 blue heart' }, { e: '💜', k: '紫心 purple heart' },
        { e: '🖤', k: '黑心 black heart' }, { e: '🤍', k: '白心 white heart' }, { e: '💔', k: '心碎 broken heart' },
        { e: '💕', k: '雙心 two hearts' }, { e: '💞', k: '旋轉心 revolving hearts' }, { e: '💓', k: '心跳 beating heart' },
        { e: '💗', k: '心 growing heart' }, { e: '💖', k: '閃亮心 sparkling heart' }, { e: '💘', k: '丘比特 cupid arrow' },
        { e: '⭐', k: '星星 star' }, { e: '🌟', k: '閃亮星 glowing star' }, { e: '✨', k: '閃爍 sparkles' },
        { e: '💫', k: '暈 dizzy star' }, { e: '🔥', k: '火 fire hot' }, { e: '💥', k: '爆炸 boom collision' },
        { e: '💢', k: '生氣 anger symbol' }, { e: '💤', k: '睡覺 zzz sleep' }, { e: '💦', k: '汗 sweat drops' },
        { e: '💨', k: '風 dash wind' }, { e: '🕳️', k: '洞 hole' }, { e: '💬', k: '對話 speech bubble' },
        { e: '💭', k: '思考 thought bubble' }, { e: '✅', k: '確認 check done' }, { e: '❌', k: '錯誤 cross wrong' },
        { e: '❓', k: '問號 question' }, { e: '❗', k: '驚嘆號 exclamation' }, { e: '⚠️', k: '警告 warning' },
        { e: '🚫', k: '禁止 prohibited' }, { e: '♻️', k: '回收 recycle' }, { e: '✔️', k: '勾 check mark' },
        { e: '➕', k: '加 plus add' }, { e: '➖', k: '減 minus' }, { e: '➗', k: '除 divide' },
        { e: '💯', k: '一百 hundred perfect' }, { e: '🔢', k: '數字 numbers' }, { e: '#️⃣', k: '井號 hashtag' }
    ]
};

let recent = JSON.parse(localStorage.getItem('recentEmojis') || '[]');
let currentCategory = 'all';

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('searchInput').addEventListener('input', debounce(search, 200));

    document.querySelectorAll('.cat-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.dataset.cat;
            renderEmojis();
        });
    });

    renderEmojis();
    renderRecent();
}

function debounce(fn, delay) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

function getAllEmojis() {
    if (currentCategory === 'all') {
        return Object.values(emojis).flat();
    }
    return emojis[currentCategory] || [];
}

function search() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    if (!query) {
        renderEmojis();
        return;
    }

    const all = Object.values(emojis).flat();
    const results = all.filter(item => item.k.toLowerCase().includes(query));
    renderEmojiList(results);
}

function renderEmojis() {
    renderEmojiList(getAllEmojis());
}

function renderEmojiList(list) {
    const grid = document.getElementById('emojiGrid');
    grid.innerHTML = list.map(item =>
        `<div class="emoji-item" data-emoji="${item.e}" title="${item.k}">${item.e}</div>`
    ).join('');

    grid.querySelectorAll('.emoji-item').forEach(el => {
        el.addEventListener('click', () => copyEmoji(el.dataset.emoji));
    });
}

function copyEmoji(emoji) {
    navigator.clipboard.writeText(emoji).then(() => {
        showToast();
        addToRecent(emoji);
    });
}

function addToRecent(emoji) {
    recent = recent.filter(e => e !== emoji);
    recent.unshift(emoji);
    if (recent.length > 20) recent = recent.slice(0, 20);
    localStorage.setItem('recentEmojis', JSON.stringify(recent));
    renderRecent();
}

function renderRecent() {
    if (recent.length === 0) {
        document.getElementById('recentSection').style.display = 'none';
        return;
    }

    document.getElementById('recentSection').style.display = 'block';
    document.getElementById('recentEmojis').innerHTML = recent.map(e =>
        `<div class="emoji-item" data-emoji="${e}">${e}</div>`
    ).join('');

    document.querySelectorAll('#recentEmojis .emoji-item').forEach(el => {
        el.addEventListener('click', () => copyEmoji(el.dataset.emoji));
    });
}

function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
}

init();
