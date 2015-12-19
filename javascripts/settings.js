/**
 * Settings
 */
+function () {
	'use strict';

	window.GameAudios = {
		fillerloop012: {
			path: '/audios/FillerLoop012.wav',
			range: [20, 20000]
		},
		fillerloop021: {
			path: '/audios/FillerLoop021.wav',
			range: [20, 20000]
		},
		pinknoise: {
			path: '/audios/PinkNoise.wav',
			range: [20, 20000]
		},
		vpe2loop11: {
			path: '/audios/VPE2Loop11.wav',
			range: [20, 20000]
		},
		vpe2melodyloop01: {
			path: '/audios/VPE2MelodyLoop01.wav',
			range: [20, 20000]
		},
		vpe2melodyloop05: {
			path: '/audios/VPE2MelodyLoop05.wav',
			range: [20, 20000]
		},
		vuf3offshoreleadchords4bars: {
			path: '/audios/VUF3OffshoreLeadChords4Bars.wav',
			range: [20, 20000]
		}
	};

	window.EQLevels = [
		{
			level: 1,
			range: 40,
			lives: 3,
			score: 1000,
			rounds: 3,
			Q: 0.5,
			gain: 8,
			audios: ['pinknoise', 'fillerloop012', 'vpe2melodyloop01'],
			thankMessages: ['Good', 'Nice', 'Yes!'],
			cheeringMessages: ['Keep going', 'You can']
		},
		{
			level: 2,
			range: 30,
			lives: 0,
			score: 1500,
			rounds: 4,
			Q: 0.8,
			gain: 7,
			audios: ['pinknoise', 'fillerloop012', 'vpe2melodyloop01'],
			thankMessages: ['Good', 'Nice', 'Yes!', 'Bravo!'],
			cheeringMessages: ['Keep going', 'You can', 'Practice']
		},
		{
			level: 3,
			range: 20,
			lives: 0,
			score: 1800,
			rounds: 4,
			Q: 1,
			gain: 6,
			audios: ['pinknoise', 'fillerloop012', 'fillerloop021', 'vpe2melodyloop01', 'vpe2melodyloop05'],
			thankMessages: ['Good', 'Nice', 'Yes!', 'Bravo!', 'Keep it up', 'Amazing'],
			cheeringMessages: ['Keep going', 'You can', 'Practice!', 'Do it!']
		},
		{
			level: 4,
			range: 15,
			lives: 1,
			score: 2000,
			rounds: 5,
			Q: 1.4,
			gain: 6.5,
			audios: ['pinknoise', 'fillerloop012', 'fillerloop021', 'vpe2melodyloop01', 'vpe2melodyloop05'],
			thankMessages: ['Good', 'Nice', 'Yes!', 'Bravo!', 'Keep it up', 'Amazing', 'Unbelievable!'],
			cheeringMessages: ['Keep going', 'You can', 'Practice!', 'Do it!', 'Just do it!']
		},
		{
			level: 5,
			range: 8,
			lives: 0,
			score: 3000,
			rounds: 6,
			Q: 2,
			gain: 5,
			audios: ['fillerloop012', 'fillerloop021', 'pinknoise', 'vpe2loop11', 'vpe2melodyloop01', 'vpe2melodyloop05', 'vuf3offshoreleadchords4bars'],
			thankMessages: ['Good', 'Nice', 'Yes!', 'Bravo!', 'Keep it up', 'Amazing', 'Unbelievable!'],
			cheeringMessages: ['Keep going', 'You can', 'Practice!', 'Do it!', 'Just do it!', 'Next time']
		}
	];
}();
