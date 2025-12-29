/**
 * Code Generator - Tool #151
 */
const templates = {
    javascript: {
        function: (name, params, desc) => `/**
 * ${desc || name}
 * @param {${params.map(p => `any`).join(', ')}} ${params.join(', ')}
 * @returns {any}
 */
function ${name}(${params.join(', ')}) {
    // TODO: Implement ${name}
    ${params.length > 0 ? `console.log(${params[0]});` : ''}
    return null;
}`,
        class: (name, params, desc) => `/**
 * ${desc || name}
 */
class ${name} {
    constructor(${params.join(', ')}) {
        ${params.map(p => `this.${p} = ${p};`).join('\n        ')}
    }

    initialize() {
        // TODO: Initialize
    }

    dispose() {
        // TODO: Cleanup
    }
}`,
        api: (name, params, desc) => `/**
 * ${desc || name} API endpoint
 */
app.get('/api/${name.toLowerCase()}', async (req, res) => {
    try {
        const { ${params.join(', ')} } = req.query;
        // TODO: Implement logic
        const result = {};
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});`,
        component: (name, params, desc) => `/**
 * ${desc || name} Component
 */
function ${name}({ ${params.join(', ')} }) {
    const [state, setState] = React.useState(null);

    React.useEffect(() => {
        // TODO: Initialize
    }, []);

    return (
        <div className="${name.toLowerCase()}">
            <h2>${name}</h2>
            {/* TODO: Add content */}
        </div>
    );
}`,
        model: (name, params, desc) => `/**
 * ${desc || name} Model
 */
const ${name}Schema = {
    ${params.map(p => `${p}: { type: String, required: true }`).join(',\n    ')}
};

const ${name} = {
    create: (data) => ({ ...data, id: Date.now() }),
    validate: (data) => Object.keys(${name}Schema).every(k => data[k] !== undefined)
};`,
        test: (name, params, desc) => `/**
 * Tests for ${name}
 */
describe('${name}', () => {
    beforeEach(() => {
        // Setup
    });

    it('should work correctly', () => {
        const result = ${name}(${params.map(() => 'null').join(', ')});
        expect(result).toBeDefined();
    });

    it('should handle edge cases', () => {
        // TODO: Add edge case tests
    });
});`
    },
    python: {
        function: (name, params, desc) => `def ${name}(${params.join(', ')}):
    """
    ${desc || name}

    Args:
        ${params.map(p => `${p}: Description`).join('\n        ')}

    Returns:
        Result value
    """
    # TODO: Implement ${name}
    ${params.length > 0 ? `print(${params[0]})` : 'pass'}
    return None`,
        class: (name, params, desc) => `class ${name}:
    """${desc || name}"""

    def __init__(self, ${params.join(', ')}):
        ${params.map(p => `self.${p} = ${p}`).join('\n        ')}

    def initialize(self):
        """Initialize the instance."""
        pass

    def __repr__(self):
        return f"${name}(${params.map(p => `{self.${p}}`).join(', ')})"`,
        api: (name, params, desc) => `from flask import Flask, request, jsonify

@app.route('/api/${name.toLowerCase()}', methods=['GET'])
def ${name}():
    """${desc || name} API endpoint"""
    try:
        ${params.map(p => `${p} = request.args.get('${p}')`).join('\n        ')}
        # TODO: Implement logic
        result = {}
        return jsonify({'success': True, 'data': result})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500`,
        component: (name, params, desc) => `import tkinter as tk

class ${name}(tk.Frame):
    """${desc || name} Component"""

    def __init__(self, master, ${params.join(', ')}):
        super().__init__(master)
        ${params.map(p => `self.${p} = ${p}`).join('\n        ')}
        self._create_widgets()

    def _create_widgets(self):
        self.label = tk.Label(self, text="${name}")
        self.label.pack()`,
        model: (name, params, desc) => `from dataclasses import dataclass
from typing import Optional

@dataclass
class ${name}:
    """${desc || name} Model"""
    ${params.map(p => `${p}: str`).join('\n    ')}
    id: Optional[int] = None

    def to_dict(self):
        return {${params.map(p => `'${p}': self.${p}`).join(', ')}}

    @classmethod
    def from_dict(cls, data):
        return cls(${params.map(p => `${p}=data.get('${p}')`).join(', ')})`,
        test: (name, params, desc) => `import unittest

class Test${name}(unittest.TestCase):
    """Tests for ${name}"""

    def setUp(self):
        # Setup test fixtures
        pass

    def test_basic_functionality(self):
        result = ${name}(${params.map(() => 'None').join(', ')})
        self.assertIsNotNone(result)

    def test_edge_cases(self):
        # TODO: Add edge case tests
        pass

if __name__ == '__main__':
    unittest.main()`
    },
    typescript: {
        function: (name, params, desc) => `/**
 * ${desc || name}
 */
function ${name}(${params.map(p => `${p}: any`).join(', ')}): any {
    // TODO: Implement ${name}
    ${params.length > 0 ? `console.log(${params[0]});` : ''}
    return null;
}`,
        class: (name, params, desc) => `/**
 * ${desc || name}
 */
class ${name} {
    ${params.map(p => `private ${p}: any;`).join('\n    ')}

    constructor(${params.map(p => `${p}: any`).join(', ')}) {
        ${params.map(p => `this.${p} = ${p};`).join('\n        ')}
    }

    public initialize(): void {
        // TODO: Initialize
    }

    public dispose(): void {
        // TODO: Cleanup
    }
}`,
        api: (name, params, desc) => `/**
 * ${desc || name} API endpoint
 */
app.get('/api/${name.toLowerCase()}', async (req: Request, res: Response) => {
    try {
        const { ${params.join(', ')} } = req.query as { ${params.map(p => `${p}: string`).join('; ')} };
        // TODO: Implement logic
        const result = {};
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
    }
});`,
        component: (name, params, desc) => `import React, { useState, useEffect } from 'react';

interface ${name}Props {
    ${params.map(p => `${p}: any;`).join('\n    ')}
}

/**
 * ${desc || name} Component
 */
const ${name}: React.FC<${name}Props> = ({ ${params.join(', ')} }) => {
    const [state, setState] = useState<any>(null);

    useEffect(() => {
        // TODO: Initialize
    }, []);

    return (
        <div className="${name.toLowerCase()}">
            <h2>${name}</h2>
            {/* TODO: Add content */}
        </div>
    );
};

export default ${name};`,
        model: (name, params, desc) => `/**
 * ${desc || name} Model
 */
interface I${name} {
    ${params.map(p => `${p}: string;`).join('\n    ')}
    id?: number;
}

class ${name} implements I${name} {
    ${params.map(p => `${p}: string;`).join('\n    ')}
    id?: number;

    constructor(data: Partial<I${name}>) {
        ${params.map(p => `this.${p} = data.${p} || '';`).join('\n        ')}
        this.id = data.id;
    }

    toJSON(): I${name} {
        return { ${params.map(p => `${p}: this.${p}`).join(', ')}, id: this.id };
    }
}`,
        test: (name, params, desc) => `import { describe, it, expect, beforeEach } from 'vitest';

describe('${name}', () => {
    beforeEach(() => {
        // Setup
    });

    it('should work correctly', () => {
        const result = ${name}(${params.map(() => 'null').join(', ')});
        expect(result).toBeDefined();
    });

    it('should handle edge cases', () => {
        // TODO: Add edge case tests
    });
});`
    },
    java: {
        function: (name, params, desc) => `/**
 * ${desc || name}
 */
public Object ${name}(${params.map(p => `Object ${p}`).join(', ')}) {
    // TODO: Implement ${name}
    ${params.length > 0 ? `System.out.println(${params[0]});` : ''}
    return null;
}`,
        class: (name, params, desc) => `/**
 * ${desc || name}
 */
public class ${name} {
    ${params.map(p => `private Object ${p};`).join('\n    ')}

    public ${name}(${params.map(p => `Object ${p}`).join(', ')}) {
        ${params.map(p => `this.${p} = ${p};`).join('\n        ')}
    }

    public void initialize() {
        // TODO: Initialize
    }

    ${params.map(p => `public Object get${p.charAt(0).toUpperCase() + p.slice(1)}() { return this.${p}; }`).join('\n    ')}
}`,
        api: (name, params, desc) => `/**
 * ${desc || name} API endpoint
 */
@RestController
@RequestMapping("/api")
public class ${name}Controller {

    @GetMapping("/${name.toLowerCase()}")
    public ResponseEntity<?> ${name}(${params.map(p => `@RequestParam String ${p}`).join(', ')}) {
        try {
            // TODO: Implement logic
            Map<String, Object> result = new HashMap<>();
            return ResponseEntity.ok(Map.of("success", true, "data", result));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("success", false, "error", e.getMessage()));
        }
    }
}`,
        model: (name, params, desc) => `/**
 * ${desc || name} Model
 */
public class ${name} {
    ${params.map(p => `private String ${p};`).join('\n    ')}
    private Long id;

    public ${name}() {}

    public ${name}(${params.map(p => `String ${p}`).join(', ')}) {
        ${params.map(p => `this.${p} = ${p};`).join('\n        ')}
    }

    ${params.map(p => `public String get${p.charAt(0).toUpperCase() + p.slice(1)}() { return ${p}; }
    public void set${p.charAt(0).toUpperCase() + p.slice(1)}(String ${p}) { this.${p} = ${p}; }`).join('\n    ')}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}`,
        component: (name, params, desc) => `/**
 * ${desc || name} Component
 */
public class ${name}Panel extends JPanel {
    ${params.map(p => `private Object ${p};`).join('\n    ')}

    public ${name}Panel(${params.map(p => `Object ${p}`).join(', ')}) {
        ${params.map(p => `this.${p} = ${p};`).join('\n        ')}
        initComponents();
    }

    private void initComponents() {
        setLayout(new BorderLayout());
        add(new JLabel("${name}"), BorderLayout.NORTH);
        // TODO: Add components
    }
}`,
        test: (name, params, desc) => `import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Tests for ${name}
 */
class ${name}Test {

    @BeforeEach
    void setUp() {
        // Setup
    }

    @Test
    void testBasicFunctionality() {
        Object result = ${name}(${params.map(() => 'null').join(', ')});
        assertNotNull(result);
    }

    @Test
    void testEdgeCases() {
        // TODO: Add edge case tests
    }
}`
    },
    csharp: {
        function: (name, params, desc) => `/// <summary>
/// ${desc || name}
/// </summary>
public object ${name}(${params.map(p => `object ${p}`).join(', ')})
{
    // TODO: Implement ${name}
    ${params.length > 0 ? `Console.WriteLine(${params[0]});` : ''}
    return null;
}`,
        class: (name, params, desc) => `/// <summary>
/// ${desc || name}
/// </summary>
public class ${name}
{
    ${params.map(p => `public object ${p.charAt(0).toUpperCase() + p.slice(1)} { get; set; }`).join('\n    ')}

    public ${name}(${params.map(p => `object ${p}`).join(', ')})
    {
        ${params.map(p => `${p.charAt(0).toUpperCase() + p.slice(1)} = ${p};`).join('\n        ')}
    }

    public void Initialize()
    {
        // TODO: Initialize
    }
}`,
        api: (name, params, desc) => `/// <summary>
/// ${desc || name} API endpoint
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ${name}Controller : ControllerBase
{
    [HttpGet]
    public IActionResult Get(${params.map(p => `[FromQuery] string ${p}`).join(', ')})
    {
        try
        {
            // TODO: Implement logic
            var result = new { };
            return Ok(new { success = true, data = result });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, error = ex.Message });
        }
    }
}`,
        model: (name, params, desc) => `/// <summary>
/// ${desc || name} Model
/// </summary>
public class ${name}
{
    public int Id { get; set; }
    ${params.map(p => `public string ${p.charAt(0).toUpperCase() + p.slice(1)} { get; set; }`).join('\n    ')}

    public ${name}() { }

    public ${name}(${params.map(p => `string ${p}`).join(', ')})
    {
        ${params.map(p => `${p.charAt(0).toUpperCase() + p.slice(1)} = ${p};`).join('\n        ')}
    }
}`,
        component: (name, params, desc) => `/// <summary>
/// ${desc || name} Component
/// </summary>
public partial class ${name}Control : UserControl
{
    ${params.map(p => `private object _${p};`).join('\n    ')}

    public ${name}Control(${params.map(p => `object ${p}`).join(', ')})
    {
        InitializeComponent();
        ${params.map(p => `_${p} = ${p};`).join('\n        ')}
    }

    private void InitializeComponent()
    {
        // TODO: Initialize components
    }
}`,
        test: (name, params, desc) => `using NUnit.Framework;

/// <summary>
/// Tests for ${name}
/// </summary>
[TestFixture]
public class ${name}Tests
{
    [SetUp]
    public void Setup()
    {
        // Setup
    }

    [Test]
    public void TestBasicFunctionality()
    {
        var result = ${name}(${params.map(() => 'null').join(', ')});
        Assert.IsNotNull(result);
    }

    [Test]
    public void TestEdgeCases()
    {
        // TODO: Add edge case tests
    }
}`
    },
    go: {
        function: (name, params, desc) => `// ${name} ${desc || ''}
func ${name}(${params.map(p => `${p} interface{}`).join(', ')}) interface{} {
    // TODO: Implement ${name}
    ${params.length > 0 ? `fmt.Println(${params[0]})` : ''}
    return nil
}`,
        class: (name, params, desc) => `// ${name} ${desc || ''}
type ${name} struct {
    ${params.map(p => `${p.charAt(0).toUpperCase() + p.slice(1)} interface{}`).join('\n    ')}
}

// New${name} creates a new ${name} instance
func New${name}(${params.map(p => `${p} interface{}`).join(', ')}) *${name} {
    return &${name}{
        ${params.map(p => `${p.charAt(0).toUpperCase() + p.slice(1)}: ${p},`).join('\n        ')}
    }
}

// Initialize sets up the instance
func (s *${name}) Initialize() {
    // TODO: Initialize
}`,
        api: (name, params, desc) => `// ${name}Handler ${desc || 'handles requests'}
func ${name}Handler(w http.ResponseWriter, r *http.Request) {
    ${params.map(p => `${p} := r.URL.Query().Get("${p}")`).join('\n    ')}

    // TODO: Implement logic
    result := map[string]interface{}{}

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]interface{}{
        "success": true,
        "data":    result,
    })
}`,
        model: (name, params, desc) => `// ${name} ${desc || 'model'}
type ${name} struct {
    ID   int64  \`json:"id"\`
    ${params.map(p => `${p.charAt(0).toUpperCase() + p.slice(1)} string \`json:"${p}"\``).join('\n    ')}
}

// New${name} creates a new ${name}
func New${name}(${params.map(p => `${p} string`).join(', ')}) *${name} {
    return &${name}{
        ${params.map(p => `${p.charAt(0).toUpperCase() + p.slice(1)}: ${p},`).join('\n        ')}
    }
}`,
        component: (name, params, desc) => `// ${name} UI component ${desc || ''}
type ${name} struct {
    ${params.map(p => `${p} interface{}`).join('\n    ')}
}

// New${name} creates a new ${name} component
func New${name}(${params.map(p => `${p} interface{}`).join(', ')}) *${name} {
    return &${name}{
        ${params.map(p => `${p}: ${p},`).join('\n        ')}
    }
}

// Render renders the component
func (c *${name}) Render() string {
    return "<div>${name}</div>"
}`,
        test: (name, params, desc) => `package main

import "testing"

func Test${name}(t *testing.T) {
    // Setup

    t.Run("basic functionality", func(t *testing.T) {
        result := ${name}(${params.map(() => 'nil').join(', ')})
        if result == nil {
            t.Error("Expected non-nil result")
        }
    })

    t.Run("edge cases", func(t *testing.T) {
        // TODO: Add edge case tests
    })
}`
    }
};

function generateCode(lang, template, name, params, desc) {
    const langTemplates = templates[lang];
    if (!langTemplates || !langTemplates[template]) return '// Template not found';
    return langTemplates[template](name, params, desc);
}

function init() {
    document.getElementById('lang-zh').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-zh').classList.add('active'); });
    document.getElementById('lang-en').addEventListener('click', () => { document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active')); document.getElementById('lang-en').classList.add('active'); });

    document.getElementById('generateBtn').addEventListener('click', () => {
        const lang = document.getElementById('langSelect').value;
        const template = document.getElementById('templateSelect').value;
        const name = document.getElementById('nameInput').value.trim() || 'myFunction';
        const paramsStr = document.getElementById('paramsInput').value.trim();
        const params = paramsStr ? paramsStr.split(',').map(p => p.trim()).filter(p => p) : [];
        const desc = document.getElementById('descInput').value.trim();

        const code = generateCode(lang, template, name, params, desc);
        document.getElementById('resultSection').style.display = 'block';
        document.getElementById('codeOutput').textContent = code;
    });

    document.getElementById('copyBtn').addEventListener('click', () => {
        const code = document.getElementById('codeOutput').textContent;
        navigator.clipboard.writeText(code).then(() => {
            document.getElementById('copyBtn').textContent = '已複製!';
            setTimeout(() => document.getElementById('copyBtn').textContent = '複製', 2000);
        });
    });

    document.querySelectorAll('.example-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('langSelect').value = btn.dataset.lang;
            document.getElementById('templateSelect').value = btn.dataset.template;
            document.getElementById('nameInput').value = btn.dataset.name;
            document.getElementById('paramsInput').value = btn.dataset.params;
            document.getElementById('generateBtn').click();
        });
    });
}
init();
