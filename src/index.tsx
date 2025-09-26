/* @refresh reload */
import { render } from 'solid-js/web'
import './index.css'
import App from './App.tsx'
import 'flowbite';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import 'flowbite/dist/flowbite.js';

const root = document.getElementById('root')

render(() => <App />, root!)

