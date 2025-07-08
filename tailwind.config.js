/* eslint-env node */
/* global module */
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	theme: {
		extend: {
			colors: {
				bronze: "#b07a5c",
				"brand-blue": "#001e60",
				"egg-shell": "#f6f5f3",
				"brand-blue-50": "rgba(0, 30, 96, 0.5)",
				"brand-text": "#7a7a7a",
			},
			fontFamily: {
				helvetica: ['"Helvetica Neue"', "sans-serif"],
				roboto: ["Roboto", "sans-serif"],
				"roboto-slab": ['"Roboto Slab"', "serif"],
			},
			boxShadow: {
				store: "6px 6px 9px rgba(0, 0, 0, 0.2)",
			},
		},
	},
	plugins: [],
};
