/**
 * SQL Generator - Tool #159
 */
let currentTab = 'select';

function generateSelect() {
    const table = document.getElementById('selectTable').value.trim() || 'table_name';
    const columns = document.getElementById('selectColumns').value.trim() || '*';
    const where = document.getElementById('selectWhere').value.trim();
    const order = document.getElementById('selectOrder').value.trim();
    const limit = document.getElementById('selectLimit').value.trim();

    let sql = `SELECT ${columns}\nFROM ${table}`;
    if (where) sql += `\nWHERE ${where}`;
    if (order) sql += `\nORDER BY ${order}`;
    if (limit) sql += `\nLIMIT ${limit}`;
    sql += ';';

    return sql;
}

function generateInsert() {
    const table = document.getElementById('insertTable').value.trim() || 'table_name';
    const columns = document.getElementById('insertColumns').value.trim();
    const values = document.getElementById('insertValues').value.trim();

    if (!columns || !values) {
        return '-- 請填寫欄位和值';
    }

    return `INSERT INTO ${table} (${columns})\nVALUES (${values});`;
}

function generateUpdate() {
    const table = document.getElementById('updateTable').value.trim() || 'table_name';
    const set = document.getElementById('updateSet').value.trim();
    const where = document.getElementById('updateWhere').value.trim();

    if (!set) {
        return '-- 請填寫 SET 內容';
    }

    let sql = `UPDATE ${table}\nSET ${set}`;
    if (where) {
        sql += `\nWHERE ${where}`;
    } else {
        sql += '\n-- 警告: 沒有 WHERE 條件會更新所有資料!';
    }
    sql += ';';

    return sql;
}

function generateDelete() {
    const table = document.getElementById('deleteTable').value.trim() || 'table_name';
    const where = document.getElementById('deleteWhere').value.trim();

    let sql = `DELETE FROM ${table}`;
    if (where) {
        sql += `\nWHERE ${where}`;
    } else {
        sql += '\n-- 警告: 沒有 WHERE 條件會刪除所有資料!';
    }
    sql += ';';

    return sql;
}

function generateCreate() {
    const table = document.getElementById('createTable').value.trim() || 'table_name';
    const rows = document.querySelectorAll('#columnsBuilder .column-row');

    const columns = [];
    const pks = [];

    rows.forEach(row => {
        const name = row.querySelector('.col-name').value.trim();
        if (!name) return;

        const type = row.querySelector('.col-type').value;
        const isPK = row.querySelector('.col-pk').checked;
        const isNN = row.querySelector('.col-nn').checked;

        let col = `  ${name} ${type}`;
        if (isPK) {
            col += ' PRIMARY KEY';
            if (type === 'INT') col += ' AUTO_INCREMENT';
        }
        if (isNN && !isPK) col += ' NOT NULL';

        columns.push(col);
    });

    if (columns.length === 0) {
        return '-- 請新增至少一個欄位';
    }

    return `CREATE TABLE ${table} (\n${columns.join(',\n')}\n);`;
}

function generateSQL() {
    switch (currentTab) {
        case 'select': return generateSelect();
        case 'insert': return generateInsert();
        case 'update': return generateUpdate();
        case 'delete': return generateDelete();
        case 'create': return generateCreate();
        default: return '';
    }
}

function addColumnRow() {
    const builder = document.getElementById('columnsBuilder');
    const row = document.createElement('div');
    row.className = 'column-row';
    row.innerHTML = `
        <input type="text" class="col-name" placeholder="欄位名稱">
        <select class="col-type">
            <option value="INT">INT</option>
            <option value="VARCHAR(255)" selected>VARCHAR(255)</option>
            <option value="TEXT">TEXT</option>
            <option value="BOOLEAN">BOOLEAN</option>
            <option value="DATE">DATE</option>
            <option value="DATETIME">DATETIME</option>
            <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
        </select>
        <label><input type="checkbox" class="col-pk"> PK</label>
        <label><input type="checkbox" class="col-nn" checked> NOT NULL</label>
    `;
    builder.appendChild(row);
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            currentTab = btn.dataset.tab;
            document.getElementById(`tab-${currentTab}`).classList.add('active');
        });
    });

    // Add column button
    document.getElementById('addColumnBtn').addEventListener('click', addColumnRow);

    // Generate SQL
    document.getElementById('generateBtn').addEventListener('click', () => {
        const sql = generateSQL();
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('sqlOutput').textContent = sql;
    });

    // Copy button
    document.getElementById('copyBtn').addEventListener('click', () => {
        const sql = document.getElementById('sqlOutput').textContent;
        navigator.clipboard.writeText(sql).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
        });
    });
}
init();
