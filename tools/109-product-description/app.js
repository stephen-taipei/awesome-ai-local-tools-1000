/**
 * Product Description - Tool #109
 */

let currentLang = 'zh-TW';

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`lang-${lang === 'zh-TW' ? 'zh' : 'en'}`).classList.add('active');
}

const templates = {
    'zh-TW': {
        taglines: {
            professional: ['專業之選，品質保證', '精工製造，卓越品質', '專業級性能，完美體驗'],
            friendly: ['讓生活更美好', '為您而設計', '品質生活，從這裡開始'],
            luxury: ['尊貴典雅，極致奢華', '奢華體驗，盡在其中', '頂級工藝，非凡品味'],
            minimalist: ['簡約不簡單', '少即是多', '回歸本質']
        },
        descriptions: {
            electronics: ['採用最新科技，為您帶來卓越的使用體驗。', '智能設計，讓科技融入生活的每個角落。'],
            fashion: ['精選優質面料，打造時尚與舒適的完美結合。', '引領潮流，展現您的獨特風格。'],
            beauty: ['嚴選天然成分，溫和呵護您的肌膚。', '科學配方，為您的美麗保駕護航。'],
            food: ['嚴選優質原料，堅持傳統工藝。', '新鮮美味，讓每一口都是享受。'],
            home: ['精心設計，讓居家空間更加溫馨舒適。', '實用與美觀兼具，提升生活品質。'],
            sports: ['專業設計，助您突破極限。', '科技加持，讓運動更高效。']
        },
        benefits: {
            general: ['品質保證', '超值價格', '快速出貨', '售後服務'],
            professional: ['專業認證', '技術支援', '企業解決方案', '客製化服務'],
            youth: ['時尚設計', '社群推薦', '限量款式', '潮流必備'],
            luxury: ['頂級材質', '限量典藏', '尊榮服務', 'VIP專屬']
        }
    },
    'en': {
        taglines: {
            professional: ['Professional Choice, Quality Guaranteed', 'Precision Crafted Excellence', 'Professional Performance'],
            friendly: ['Making Life Better', 'Designed for You', 'Quality Living Starts Here'],
            luxury: ['Elegant and Luxurious', 'Experience Luxury', 'Premium Craftsmanship'],
            minimalist: ['Simply Perfect', 'Less is More', 'Back to Basics']
        },
        descriptions: {
            electronics: ['Featuring the latest technology for an exceptional experience.', 'Smart design integrating technology into every aspect of life.'],
            fashion: ['Premium fabrics combining fashion with comfort.', 'Leading trends, expressing your unique style.'],
            beauty: ['Carefully selected natural ingredients for gentle skin care.', 'Scientific formulas protecting your beauty.'],
            food: ['Premium ingredients with traditional craftsmanship.', 'Fresh and delicious, every bite is a delight.'],
            home: ['Thoughtfully designed for a cozy living space.', 'Practical and beautiful, enhancing quality of life.'],
            sports: ['Professional design to help you break limits.', 'Technology-enhanced for efficient workouts.']
        },
        benefits: {
            general: ['Quality Guaranteed', 'Great Value', 'Fast Shipping', 'After-sales Service'],
            professional: ['Certified', 'Technical Support', 'Enterprise Solutions', 'Customization'],
            youth: ['Trendy Design', 'Social Recommended', 'Limited Edition', 'Must-have'],
            luxury: ['Premium Materials', 'Limited Collection', 'VIP Service', 'Exclusive']
        }
    }
};

function generateDescription(name, category, features, audience, style) {
    const t = templates[currentLang];
    const tagline = t.taglines[style][Math.floor(Math.random() * t.taglines[style].length)];
    const desc = t.descriptions[category][Math.floor(Math.random() * t.descriptions[category].length)];
    const benefits = t.benefits[audience];

    const featureList = features.split('\n').filter(f => f.trim());
    const allFeatures = [...featureList, ...benefits].slice(0, 6);

    return {
        title: name || (currentLang === 'zh-TW' ? '優質產品' : 'Premium Product'),
        tagline,
        description: desc,
        features: allFeatures
    };
}

function init() {
    setLanguage(navigator.language.startsWith('zh') ? 'zh-TW' : 'en');

    document.getElementById('lang-zh').addEventListener('click', () => setLanguage('zh-TW'));
    document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

    document.getElementById('generateBtn').addEventListener('click', () => {
        const name = document.getElementById('nameInput').value.trim();
        const category = document.getElementById('categorySelect').value;
        const features = document.getElementById('featuresInput').value;
        const audience = document.getElementById('audienceSelect').value;
        const style = document.getElementById('styleSelect').value;

        const product = generateDescription(name, category, features, audience, style);

        document.getElementById('productTitle').textContent = product.title;
        document.getElementById('productTagline').textContent = product.tagline;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('productFeatures').innerHTML = product.features.map(f => `<li>${f}</li>`).join('');
        document.getElementById('outputSection').style.display = 'block';
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const title = document.getElementById('productTitle').textContent;
        const tagline = document.getElementById('productTagline').textContent;
        const desc = document.getElementById('productDescription').textContent;
        const features = [...document.querySelectorAll('#productFeatures li')].map(li => '• ' + li.textContent).join('\n');
        navigator.clipboard.writeText(`${title}\n${tagline}\n\n${desc}\n\n${features}`);
    });
}

init();
