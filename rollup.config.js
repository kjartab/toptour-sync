// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';


export default {
  entry: 'src/toptour.js',
  dest: 'build/main.min.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    commonjs()
  ]

};