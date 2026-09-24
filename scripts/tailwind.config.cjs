module.exports = {
  content: ['./tools/**/*.{html,js}'],
  safelist: [{ pattern: /^(bg|text|border)-(red|green|blue|yellow|purple|indigo|gray|orange|pink|teal|cyan|emerald)-(50|100|200|300|400|500|600|700|800|900)$/ }],
  theme: { extend: {} },
  plugins: []
};
