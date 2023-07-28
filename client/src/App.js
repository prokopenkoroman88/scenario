import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Client from './Client.js'

function App() {
	return (
		<div className="App">
			<Client
			>
			</Client>
			<footer></footer>
		</div>
	);
}

export default App;
