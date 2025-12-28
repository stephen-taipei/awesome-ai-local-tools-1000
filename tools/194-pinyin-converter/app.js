/**
 * Pinyin Converter - Tool #194
 */

// Common Chinese characters to pinyin mapping
const pinyinDict = {
    '你':'nǐ','好':'hǎo','我':'wǒ','是':'shì','的':'de','不':'bù','在':'zài','有':'yǒu','這':'zhè','他':'tā',
    '她':'tā','它':'tā','們':'men','和':'hé','了':'le','就':'jiù','都':'dōu','也':'yě','很':'hěn','會':'huì',
    '能':'néng','要':'yào','可':'kě','以':'yǐ','說':'shuō','到':'dào','去':'qù','來':'lái','為':'wéi','什':'shén',
    '麼':'me','沒':'méi','人':'rén','那':'nà','個':'gè','大':'dà','小':'xiǎo','中':'zhōng','上':'shàng','下':'xià',
    '看':'kàn','想':'xiǎng','知':'zhī','道':'dào','時':'shí','間':'jiān','年':'nián','月':'yuè','日':'rì','天':'tiān',
    '地':'dì','東':'dōng','西':'xī','南':'nán','北':'běi','家':'jiā','國':'guó','學':'xué','生':'shēng','老':'lǎo',
    '師':'shī','工':'gōng','作':'zuò','事':'shì','情':'qíng','問':'wèn','題':'tí','話':'huà','文':'wén','字':'zì',
    '書':'shū','讀':'dú','寫':'xiě','聽':'tīng','說':'shuō','愛':'ài','心':'xīn','手':'shǒu','頭':'tóu','眼':'yǎn',
    '睛':'jīng','嘴':'zuǐ','耳':'ěr','朵':'duǒ','腳':'jiǎo','身':'shēn','體':'tǐ','水':'shuǐ','火':'huǒ','風':'fēng',
    '雨':'yǔ','雲':'yún','山':'shān','海':'hǎi','河':'hé','路':'lù','車':'chē','門':'mén','窗':'chuāng','房':'fáng',
    '子':'zǐ','女':'nǚ','男':'nán','父':'fù','母':'mǔ','兄':'xiōng','弟':'dì','姐':'jiě','妹':'mèi','朋':'péng',
    '友':'yǒu','吃':'chī','喝':'hē','睡':'shuì','覺':'jiào','走':'zǒu','跑':'pǎo','站':'zhàn','坐':'zuò','起':'qǐ',
    '開':'kāi','關':'guān','進':'jìn','出':'chū','回':'huí','過':'guò','用':'yòng','給':'gěi','把':'bǎ','讓':'ràng',
    '快':'kuài','慢':'màn','高':'gāo','低':'dī','長':'cháng','短':'duǎn','新':'xīn','舊':'jiù','多':'duō','少':'shǎo',
    '白':'bái','黑':'hēi','紅':'hóng','綠':'lǜ','藍':'lán','黃':'huáng','一':'yī','二':'èr','三':'sān','四':'sì',
    '五':'wǔ','六':'liù','七':'qī','八':'bā','九':'jiǔ','十':'shí','百':'bǎi','千':'qiān','萬':'wàn','錢':'qián',
    '電':'diàn','話':'huà','腦':'nǎo','網':'wǎng','機':'jī','器':'qì','力':'lì','氣':'qì','動':'dòng','靜':'jìng',
    '明':'míng','暗':'àn','冷':'lěng','熱':'rè','乾':'gān','濕':'shī','甜':'tián','苦':'kǔ','酸':'suān','辣':'là',
    '香':'xiāng','臭':'chòu','美':'měi','醜':'chǒu','對':'duì','錯':'cuò','真':'zhēn','假':'jiǎ','先':'xiān','後':'hòu',
    '前':'qián','裡':'lǐ','外':'wài','左':'zuǒ','右':'yòu','遠':'yuǎn','近':'jìn','早':'zǎo','晚':'wǎn','今':'jīn',
    '昨':'zuó','明':'míng','樂':'lè','歡':'huān','喜':'xǐ','怒':'nù','哀':'āi','樂':'yuè','笑':'xiào','哭':'kū',
    '感':'gǎn','謝':'xiè','對':'duì','起':'qǐ','請':'qǐng','再':'zài','見':'jiàn','歡':'huān','迎':'yíng','已':'yǐ',
    '經':'jīng','但':'dàn','還':'hái','只':'zhǐ','每':'měi','當':'dāng','然':'rán','最':'zuì','其':'qí','此':'cǐ',
    '如':'rú','果':'guǒ','因':'yīn','所':'suǒ','把':'bǎ','被':'bèi','比':'bǐ','與':'yǔ','或':'huò','而':'ér'
};

// Tone mark to number mapping
const toneToNumber = {
    'ā':'a1','á':'a2','ǎ':'a3','à':'a4',
    'ē':'e1','é':'e2','ě':'e3','è':'e4',
    'ī':'i1','í':'i2','ǐ':'i3','ì':'i4',
    'ō':'o1','ó':'o2','ǒ':'o3','ò':'o4',
    'ū':'u1','ú':'u2','ǔ':'u3','ù':'u4',
    'ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4'
};

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('loadSampleBtn').addEventListener('click', loadSample);
    document.getElementById('convertBtn').addEventListener('click', convert);
    document.getElementById('copyBtn').addEventListener('click', copyResult);
}

function loadSample() {
    document.getElementById('inputText').value = '你好，歡迎使用拼音轉換工具。';
}

function convert() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return;

    const format = document.querySelector('input[name="format"]:checked').value;
    const separator = document.getElementById('separator').value;
    const capitalize = document.getElementById('capitalize').checked;

    const results = [];
    const annotations = [];

    for (const char of text) {
        let pinyin = pinyinDict[char];

        if (pinyin) {
            // Convert format
            if (format === 'number') {
                pinyin = toneMarkToNumber(pinyin);
            } else if (format === 'none') {
                pinyin = removeTone(pinyin);
            }

            if (capitalize) {
                pinyin = pinyin.charAt(0).toUpperCase() + pinyin.slice(1);
            }

            results.push(pinyin);
            annotations.push({ char, pinyin });
        } else if (/[\u4e00-\u9fff]/.test(char)) {
            // Unknown Chinese character
            results.push('?');
            annotations.push({ char, pinyin: '?' });
        } else {
            // Non-Chinese character, keep as is
            results.push(char);
        }
    }

    // Join with separator (but don't add separator around punctuation)
    let output = '';
    for (let i = 0; i < results.length; i++) {
        if (i > 0 && /[a-zA-Z]/.test(results[i]) && /[a-zA-Z]/.test(results[i-1])) {
            output += separator;
        }
        output += results[i];
    }

    document.getElementById('pinyinOutput').textContent = output;

    // Build annotation view
    const annotationHtml = annotations
        .filter(a => /[\u4e00-\u9fff]/.test(a.char))
        .map(a => `<div class="char-pair"><span class="char">${a.char}</span><span class="pinyin">${a.pinyin}</span></div>`)
        .join('');
    document.getElementById('annotationView').innerHTML = annotationHtml;

    document.getElementById('resultsSection').style.display = 'block';
}

function toneMarkToNumber(pinyin) {
    let result = pinyin;
    let tone = '';

    for (const [mark, replacement] of Object.entries(toneToNumber)) {
        if (result.includes(mark)) {
            result = result.replace(mark, replacement[0]);
            tone = replacement[1];
            break;
        }
    }

    return result + tone;
}

function removeTone(pinyin) {
    let result = pinyin;
    for (const [mark, replacement] of Object.entries(toneToNumber)) {
        result = result.replace(mark, replacement[0]);
    }
    return result;
}

function copyResult() {
    const output = document.getElementById('pinyinOutput').textContent;
    navigator.clipboard.writeText(output).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製', 2000);
    });
}

init();
