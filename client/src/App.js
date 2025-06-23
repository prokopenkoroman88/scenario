import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
//import Client from './Client.jsx'
import ClientEditor from './editors/ClientEditor.jsx'

function App() {
	const client = new ClientEditor(null);
	return (
		<div className="App">
			{/*<Client/>*/}
			{client.render()}
			{/*<footer></footer>*/}
		</div>
	);
}

export default App;
