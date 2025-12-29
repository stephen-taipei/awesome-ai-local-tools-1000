/**
 * Traditional-Simplified Chinese Converter - Tool #193
 */
// Simplified mapping for common Traditional to Simplified conversions
const t2s = {
    '國':'国','學':'学','說':'说','個':'个','開':'开','時':'时','會':'会','裡':'里','機':'机','書':'书',
    '長':'长','門':'门','電':'电','車':'车','見':'见','東':'东','馬':'马','發':'发','業':'业','頭':'头',
    '號':'号','問':'问','來':'来','動':'动','關':'关','點':'点','經':'经','愛':'爱','對':'对','風':'风',
    '場':'场','無':'无','話':'话','萬':'万','錢':'钱','報':'报','過':'过','還':'还','實':'实','當':'当',
    '體':'体','樂':'乐','給':'给','義':'义','題':'题','員':'员','區':'区','聽':'听','種':'种','讓':'让',
    '達':'达','認':'认','親':'亲','氣':'气','離':'离','寫':'写','邊':'边','辦':'办','華':'华','裝':'装',
    '帶':'带','陽':'阳','紅':'红','雲':'云','運':'运','圖':'图','連':'连','訴':'诉','進':'进','線':'线',
    '環':'环','腦':'脑','飛':'飞','網':'网','廣':'广','單':'单','語':'语','專':'专','變':'变','統':'统',
    '買':'买','賣':'卖','觀':'观','節':'节','興':'兴','該':'该','備':'备','歲':'岁','準':'准','營':'营',
    '響':'响','衛':'卫','賽':'赛','類':'类','團':'团','調':'调','屬':'属','圍':'围','論':'论','爾':'尔',
    '師':'师','際':'际','衝':'冲','護':'护','較':'较','鐵':'铁','證':'证','濟':'济','產':'产','農':'农',
    '維':'维','織':'织','結':'结','導':'导','設':'设','層':'层','設':'设','處':'处','識':'识','戰':'战',
    '顯':'显','藝':'艺','險':'险','測':'测','講':'讲','夠':'够','選':'选','獲':'获','質':'质','頁':'页',
    '極':'极','標':'标','權':'权','評':'评','歷':'历','漢':'汉','構':'构','練':'练','視':'视','職':'职',
    '顧':'顾','殺':'杀','劃':'划','濃':'浓','歸':'归','滿':'满','適':'适','隨':'随','龍':'龙','龜':'龟',
    '壓':'压','優':'优','應':'应','夠':'够','廳':'厅','復':'复','禮':'礼','競':'竞','繁':'繁','舉':'举',
    '藥':'药','雜':'杂','難':'难','響':'响','預':'预','領':'领','傳':'传','確':'确','聯':'联','齊':'齐',
    '獨':'独','環':'环','創':'创','聲':'声','廠':'厂','務':'务','勞':'劳','價':'价','係':'系','嗎':'吗',
    '這':'这','們':'们','為':'为','麼':'么','後':'后','與':'与','請':'请','從':'从','總':'总','條':'条',
    '樣':'样','幾':'几','裏':'里','認':'认','離':'离','邊':'边','間':'间','寫':'写','廢':'废','雞':'鸡',
    '雜':'杂','難':'难','響':'响','預':'预','領':'领','傳':'传','確':'确','聯':'联','齊':'齐','獨':'独'
};

// Generate reverse mapping
const s2t = {};
for (const [trad, simp] of Object.entries(t2s)) {
    s2t[simp] = trad;
}

let mode = 't2s'; // 't2s' = Traditional to Simplified, 's2t' = reverse

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('inputText').addEventListener('input', () => {
        updateInputCount();
        if (document.getElementById('autoConvert').checked) convert();
    });
    document.getElementById('switchBtn').addEventListener('click', switchMode);
    document.getElementById('clearBtn').addEventListener('click', clearInput);
    document.getElementById('copyBtn').addEventListener('click', copyOutput);
    document.getElementById('convertBtn').addEventListener('click', convert);
}

function switchMode() {
    mode = mode === 't2s' ? 's2t' : 't2s';
    updateModeUI();
    if (document.getElementById('autoConvert').checked) convert();
}

function updateModeUI() {
    if (mode === 't2s') {
        document.getElementById('inputLabel').textContent = '繁體中文';
        document.getElementById('outputLabel').textContent = '簡體中文';
        document.getElementById('modeText').textContent = '繁 → 簡';
    } else {
        document.getElementById('inputLabel').textContent = '簡體中文';
        document.getElementById('outputLabel').textContent = '繁體中文';
        document.getElementById('modeText').textContent = '簡 → 繁';
    }
}

function convert() {
    const input = document.getElementById('inputText').value;
    const mapping = mode === 't2s' ? t2s : s2t;

    let output = '';
    let converted = 0;

    for (const char of input) {
        if (mapping[char]) {
            output += mapping[char];
            converted++;
        } else {
            output += char;
        }
    }

    document.getElementById('outputText').value = output;
    document.getElementById('outputCount').textContent = output.length;

    // Update stats
    const total = input.replace(/\s/g, '').length;
    document.getElementById('statConverted').textContent = converted;
    document.getElementById('statTotal').textContent = total;
    document.getElementById('statPercent').textContent = total > 0 ? Math.round(converted / total * 100) + '%' : '0%';
    document.getElementById('statsSection').style.display = input.length > 0 ? 'block' : 'none';
}

function updateInputCount() {
    document.getElementById('inputCount').textContent = document.getElementById('inputText').value.length;
}

function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('outputText').value = '';
    document.getElementById('inputCount').textContent = '0';
    document.getElementById('outputCount').textContent = '0';
    document.getElementById('statsSection').style.display = 'none';
}

function copyOutput() {
    const output = document.getElementById('outputText').value;
    navigator.clipboard.writeText(output).then(() => {
        const btn = document.getElementById('copyBtn');
        btn.textContent = '已複製!';
        setTimeout(() => btn.textContent = '複製', 2000);
    });
}

init();
