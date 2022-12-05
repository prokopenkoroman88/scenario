//https://ourcodeworld.com/articles/read/1627/how-to-easily-generate-a-beep-notification-sound-with-javascript

const frequencies=[
{letter:'C', note:'до', frequency:280-18, },
{letter:'C#', note:'до#', frequency:280-3, },
{letter:'D', note:'ре', frequency:300-6, },
{letter:'D#', note:'ре#', frequency:300+12, },
{letter:'E', note:'ми', frequency:350-20, },
{letter:'F', note:'фа', frequency:350, },
{letter:'F#', note:'фа#', frequency:350+20, },
{letter:'G', note:'соль', frequency:400-8, },
{letter:'G#', note:'соль#', frequency:400+16, },
{letter:'A', note:'ля', frequency:440, },
{letter:'A#', note:'ля#', frequency:440+26, },
{letter:'B', note:'си', frequency:500-6, },
//{letter:'', note:'', frequency:, },
];

const notes_dieses=[//0..6, 0..1
[0,1],//C
[2,3],//D
[4,4],//E -
[5,6],//F
[7,8],//G
[9,10],//A
[11,11],//B -
];


function calcFrequency(tone,dies=0){
	let freq = (tone-1)%7;//rename freq!!!
	let octava = Math.floor((tone-1)/7);
	let nd = notes_dieses[freq][dies];
	let f = frequencies[nd].frequency;
	//if(octava==1)
	//	f*=2;
	f*=Math.pow(2,octava);
	//console.log('calcFrequency', tone, freq, octava, nd, f);
	return f;
}



class Player{

	constructor(){
		// The browser will limit the number of concurrent audio contexts
		// So be sure to re-use them whenever you can
		this.myAudioContext = new AudioContext();
		this.notes=[];

		// Set the type of oscillator
		this.oscillatorType='sine';//sine,square,sawtooth,triangle
		this.waveList=[];

		this.addPeriodicWave('my new',[1,0,0,1,0,0]);
		this.addPeriodicWave('my second',[0.3,1,1,0,0.4,0]);
		//this.oscillatorType='custom';
		this.selectPeriodicWave('my new');//second
	}

	mayDiese(tone){//1..14
		tone = (tone-1)%7;
		return notes_dieses[tone][0]<notes_dieses[tone][1];
	}

	addPeriodicWave(name, harmonics){
		let periodicWave={
			name:name,
			real: new Float32Array(harmonics.length+1),
			imag: new Float32Array(harmonics.length+1),
			wave:null,
		};

		harmonics.map((harmonic,index)=>{
			periodicWave.real[index+1] = harmonic;
			periodicWave.imag[index+1] = 0;
		});

		periodicWave.real[0] = 0;
		periodicWave.imag[0] = 0;
		periodicWave.wave = this.myAudioContext.createPeriodicWave(periodicWave.real, periodicWave.imag);

		return this.waveList.push(periodicWave);
	}

	selectPeriodicWave(name){
		this.waveList.forEach( (wave)=>{
			if(wave.name==name)
				this.wave=wave.wave;
		}, this);
		if(this.wave)
			this.oscillatorType='custom';
		return this.wave;
	}

/**
 * Helper function to emit a beep sound in the browser using the Web Audio API.
 * 
 * @param {number} duration - The duration of the beep sound in milliseconds.
 * @param {number} frequency - The frequency of the beep sound.
 * @param {number} volume - The volume of the beep sound.
 * 
 * @returns {Promise} - A promise that resolves when the beep sound is finished.
 */
	beep(duration, frequency, volume){
		return new Promise((resolve, reject) => {
			// Set default duration if not provided
//			duration = duration || 200;
//			frequency = frequency || 440;
//			volume = volume || 100;

			try{
				let oscillatorNode = this.myAudioContext.createOscillator();
				let gainNode = this.myAudioContext.createGain();

				if(this.oscillatorType=='custom'){
					oscillatorNode.setPeriodicWave(this.wave);
				}
				else{
					// Set the type of oscillator
					oscillatorNode.type=this.oscillatorType;//square,sine,sawtooth,triangle
				};

				oscillatorNode.connect(gainNode);
				gainNode.connect(this.myAudioContext.destination);


				// Set the oscillator frequency in hertz
				oscillatorNode.frequency.value = frequency;


				// Set the gain to the volume
				gainNode.gain.value = volume * 0.01;

				// Start audio with the desired duration
				oscillatorNode.start(this.myAudioContext.currentTime);
				oscillatorNode.stop(this.myAudioContext.currentTime + duration * 0.001);//sec

				// Resolve the promise when the sound is finished
				oscillatorNode.onended = () => {
					resolve();
				};
			}catch(error){
				reject(error);
			}
		});
	}

	delay(duration) {
		return new Promise((resolve) => {
			setTimeout(() => resolve(), duration);
		});
	}

	play(notes=null){
		if(notes)
			this.notes=notes;

		let delay=0;
		this.timeouts = new Array(this.notes.length);
		this.notes.forEach((note,index)=>{
			let noteDelay=note.delay//100;//1000 500 250 125
			if(!noteDelay)
				noteDelay=0;
			//console.log('noteDelay',index,noteDelay);
			noteDelay=Math.pow(2,noteDelay)*1000;
			//console.log('noteDelay',index,noteDelay);

			if(note.tone>0)
			this.timeouts[index]=setTimeout(()=>{
				this.beep(noteDelay, calcFrequency(note.tone,note.diese?1:0), 10)
			}, delay);
			delay+=noteDelay;
		}, this);

	}

}


export default Player;
