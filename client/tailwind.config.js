// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');
//
// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
const { buildConfig } = require('../libs/shacdn-utils/src/tailwind.config');
const plugins = [
    require('@tailwindcss/typography'),
];

module.exports = buildConfig(__dirname, { plugins });
