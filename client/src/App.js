import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import Client from './Client.jsx'

function App() {
	return (
		<div className="App">
			<Client/>
			<footer></footer>
		</div>
	);
}

export default App;
