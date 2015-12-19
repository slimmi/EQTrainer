/**
 * [Polyfill] Console
 * @link https://github.com/paulmillr/console-polyfill
 */
+function () {
	'use strict';

	window.console = window.console || {};

	var con = window.console,
		methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(','),
		properties = 'memory'.split(','),
		empty = {},
		dummy = function() {},
		prop, method;

	while (prop = properties.pop()) {
		if (!con[prop]) {
			con[prop] = empty;
		}
	}

	while (method = methods.pop()) {
		if (!con[method]) {
			con[method] = dummy;
		}
	}
}();


/**
 * Audio loader.
 */
+function ($) {
	'use strict';

	var audioContext = null;

	var AudioContext = function () {
		if (audioContext === null) {
			audioContext = new (window.AudioContext || window.webkitAudioContext)();
		}

		return audioContext;
	}

	var AudioLoader = function (files, callback) {
		if (typeof files !== 'object') {
			// Sorry
			console.error('AudioLoader: Object type is needed', files);
			return;
		}

		this.files = files;
		
		// Count files
		this.filesLength = Object.keys(this.files).length;

		if (typeof callback === 'function') {
			this.ready = callback;
		}

		return this;
	};

	AudioLoader.prototype = {
		filesLength: 0,
		buffer: {},
		bufferLength: 0,
		ready: function () {},

		load: function () {
			var name;

			for (name in this.files) {
				// var index = name;

				if (this.files.hasOwnProperty(name)) {
					// Load an audio file
					this.loadAudio(name, this.files[name]);
				}
			}

			return this;
		},

		loadAudio: function (index, file) {
			var self = this,
				request = new XMLHttpRequest();

			request.open('GET', file['path'], true);
			request.responseType = 'arraybuffer';
			request.onload = function () {
				var undecodedAudio = this.response,
					context = AudioContext(),
					source;

				context.decodeAudioData(undecodedAudio, function (buffer) {
					if (!buffer) {
						self.filesLength--;
						console.error('AudioLoader.loadAudio: can\'t load - : ' + file['path']);
						return;
					}

					// source = context.createBufferSource();
					// source.buffer = buffer;
					self.buffer[index] = {
						path: file['path'],
						range: file['range'],
						buffer: buffer
					};

					if (++self.bufferLength === self.filesLength) {
						self.ready();
					}
				},
				function (error) {
					console.error('AudioLoader.loadAudio: decodeAudioData - ' + file['path'], error);
				});
			};
			request.send();
		},

		get: function (index) {
			var buffer = null,
				countIndex = 0,
				type = typeof index,
				property;

			if (this.bufferLength > 0) {
				if (type === 'number') {
					for (property in this.buffer) {
						if (this.buffer.hasOwnProperty(property) && index === countIndex++) {
							buffer = this.buffer[property];
							break;
						}
					}
				}

				if (type === 'string') {
					buffer = this.buffer[index];
				}
			}

			return buffer;
		}
	};

	var AudioPlayStop = {
		isPlaying: false,

		play: function (time) {
			if (this.isPlaying) {
				return;
			}

			this.isPlaying = true;
			time = time || 0;
			this.source.start(time);
		},

		stop: function () {
			if (!this.isPlaying) {
				return;
			}

			this.isPlaying = false;
			this.source.stop();
		},

		loop: function (loop) {
			loop = loop || false;
			this.source.loop = loop;
		},

		connect: function () {
			this.source.connect(this.context.destination);

			return this;
		},

		disconnect: function () {
			this.source.disconnect(0);

			return this;
		},

		getSource: function () {
			return this.source;
		},

		getContext: function () {
			return this.context;
		}
	};

	var AudioPlayer = function (audio) {
		var self = this;

		this.buffer = audio;
		this.context = AudioContext();
		this.source = this.context.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.onended = function () {
			self.isPlaying = false;
		};
		this.source.connect(this.context.destination);
	}

	AudioPlayer.prototype = AudioPlayStop;

	var AudioFilter = function (audio) {
		var self = this;

		this.buffer = audio;
		this.context = AudioContext();
		this.source = this.context.createBufferSource();
		this.source.buffer = this.buffer;
		this.source.onended = function () {
			self.isPlaying = false;
		};

		// Create the filter
		this.filter = this.context.createBiquadFilter();

		// Connect source to filter
		this.source.connect(this.filter);

		// Connect filter to destination
		this.filter.connect(this.context.destination);
	}

	AudioFilter.prototype = $.extend({}, AudioPlayStop, {
		connect: function () {
			this.source.connect(this.filter);
			this.filter.connect(this.context.destination);

			return this;
		},

		disconnect: function () {
			this.source.disconnect(0);
			this.filter.disconnect(0);

			return this;
		},

		getFilter: function () {
			return this.filter;
		},

		setType: function (type) {
			this.filter.type = type;
		},

		setQ: function (Q) {
			this.filter.Q.value = Q;
		},

		setFrequency: function (frequency) {
			this.filter.frequency.value = frequency;
		},

		setGain: function (gain) {
			this.filter.gain.value = gain;
		}
	});

	window.AudioLoader = window['AudioLoader'] = AudioLoader;
	window.AudioPlayer = window['AudioPlayer'] = AudioPlayer;
	window.AudioFilter = window['AudioFilter'] = AudioFilter;
}(jQuery);


/**
 * EQTrainer.
 */
+function ($) {
	'use strict';

	var EQGame = function (spectrum, selector, selectorFQ, hz, cheeringMessage, rightFQ, rightFQLabel, lives, score, buttonEQ, buttonFlat, sounds, quitGame, onQuit, onWon, onLose) {
		var self = this;

		// Spectrum
		this.spectrum = spectrum;
		this.spectrumOffset = spectrum.offset();
		this.spectrumTop = this.spectrumOffset.top;
		this.spectrumLeft = this.spectrumOffset.left;
		this.spectrumWidth = spectrum.width();
		this.spectrumHeight = spectrum.height();

		// Selector
		this.selector = selector;
		this.selectorWidth = selector.width();
		this.selectorFQ = selectorFQ;
		this.selectorFQWidth = selectorFQ.width();
		this.selectorFQLeft = parseInt(selectorFQ.css('left'), 10) || 0;

		// Hz
		this.hz = hz;

		// Cheering message
		this.cheeringMessage = cheeringMessage;

		// The right answer
		this.rightFQ = rightFQ;
		this.rightFQLabel = rightFQLabel;
		this.rightFQLabelWidth = rightFQLabel.width();
		this.rightFQLeft = 0;

		// Lives
		this.livesBlock = lives;

		// Score
		this.scoreBlock = score;

		// Toggle buttons
		this.buttonEQ = buttonEQ;
		this.buttonFlat = buttonFlat;

		// Sounds
		this.sounds = sounds;

		// Game control
		this.quitGame = quitGame;

		// Levels of this game
		this.levels = EQLevels;

		// Events
		if (typeof onQuit === 'function') {
			this.onQuit = onQuit;
		}

		if (typeof onWon === 'function') {
			this.onWon = onWon;
		}

		if (typeof onLose === 'function') {
			this.onLose = onLose;
		}

		$(window).on('resize.eqgame', function () {
			self.reCalculateBlocks();
		});
	};

	EQGame.prototype = {
		TIMEOUT_BETWEEN_GAMES: 2000,

		EQed: true,
		lives: 0,
		score: 0,
		currentLevel: -1,
		currentRound: 0,
		rightFrequency: null,
		currentAudio: null,
		onQuit: function () {},
		onWon: function () {},
		onLose: function () {},

		start: function () {
			var self = this;
			
			this.initToggleButtons();
			this.initGameControl();
			this.nextLevel();
		},

		reCalculateBlocks: function () {
			this.spectrumOffset = this.spectrum.offset();
			this.spectrumTop = this.spectrumOffset.top;
			this.spectrumLeft = this.spectrumOffset.left;
			this.spectrumWidth = this.spectrum.width();
			this.spectrumHeight = this.spectrum.height();

			// Selector
			this.selectorWidth = this.selector.width();
			this.selectorFQ = this.selectorFQ;
			this.selectorFQWidth = this.selectorFQ.width();
			this.selectorFQLeft = parseInt(this.selectorFQ.css('left'), 10) || 0;

			// Right frequency
			this.rightFQLabelWidth = this.rightFQLabel.width();
			this.rightFQLeft = 0;
		},

		initSpectrum: function () {
			var self = this;

			this.spectrum.on('mousemove touchmove', function (e) {
				var event = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
					mouseLeft = event.pageX - self.spectrumLeft,
					left = self.getPercents(Math.floor(mouseLeft - self.selectorWidth / 2)),
					minLeft = self.getPercents(-(self.selectorWidth / 2)),
					maxLeft = self.getPercents(Math.floor(self.spectrumWidth - self.selectorWidth / 2));

				if (left < minLeft || left > maxLeft) {
					return;
				}

				self.selector.css('left', left + '%');

				e.preventDefault();
			});

			this.hz.on('click', function (e) {
				var event = e.originalEvent.touches ? e.originalEvent.touches[0] : e,
					children = $(this).find('.hz'),
					mouseLeft = event.pageX,
					minHz, maxHz, element, elementLeft, HzInPx, chosenHz;

				// Add parent
				children.push($(this));

				children.each(function() {
					element = $(this);

					if (element.is(event.target)) {
						minHz = element.data('hz-min');
						maxHz = element.data('hz-max');
						elementLeft = element.offset().left;

						// How many Hz in a pixel
						HzInPx = (maxHz - minHz) / element.width();

						chosenHz = Math.round(minHz + Math.abs(mouseLeft - elementLeft) * HzInPx);

						self.selectorFQ
							.removeClass('hide')
							.text(chosenHz);

						if (mouseLeft - self.spectrumLeft + self.selectorFQWidth + self.selectorFQLeft > self.spectrumWidth) {
							// Fix the position for the chosen frequency
							self.selectorFQ.addClass('left');
						} else {
							self.selectorFQ.removeClass('left');
						}

						// Check the result
						self.result(mouseLeft);

						// Deinitialize
						self.deinitSpectrum();

						console.log(element);
					}
				});

				e.preventDefault();
			});
		},

		deinitSpectrum: function () {
			this.spectrum.off('mousemove');
			this.hz.off('click');
		},

		initToggleButtons: function () {
			var self = this,
				onclick = function () {
					self.toggleFilter();

					if (self.EQed) {
						self.buttonEQ.addClass('active');
						self.buttonFlat.removeClass('active');
					} else {
						self.buttonEQ.removeClass('active');
						self.buttonFlat.addClass('active');
					}
				};

			// Reset
			this.buttonEQ.removeClass('active');
			this.buttonFlat.removeClass('active');

			if (this.EQed) {
				this.buttonEQ.addClass('active');
			} else {
				this.buttonFlat.addClass('active');
			}

			this.buttonEQ.on('click', function () {
				onclick();
			});

			this.buttonFlat.on('click', function () {
				onclick();
			});
		},

		deinitToggleButtons: function () {
			// Reset
			this.EQed = true;

			this.buttonEQ
				.removeClass('active')
				.off('click');

			this.buttonFlat
				.removeClass('active')
				.off('click');
		},

		initGameControl: function () {
			var self = this;

			this.quitGame.on('click', function () {
				self.quit();
			});
		},

		deinitGameControl: function () {
			this.quitGame.off('click');
		},

		getPercents: function (position) {
			return position * 100 / this.spectrumWidth;
		},

		result: function (mouseLeft) {
			var self = this,
				min = mouseLeft - this.spectrumLeft - this.selectorWidth / 2,
				max = mouseLeft - this.spectrumLeft + this.selectorWidth / 2,
				message;

			// Stop playing the sound
			this.currentAudio.stop();

			// Show the right frequency
			this.showRightFrequency();

			if (min <= this.rightFQLeft && this.rightFQLeft <= max) {
				// Answered right!
				this.currentRound++;

				// Calculate score
				this.calculateScore(mouseLeft);

				// Update score
				this.updateScore();

				if (this.currentRound === this.levels[this.currentLevel].rounds) {
					message = 'Level Up';
				} else {
					// Show the cheering message
					message = this.levels[this.currentLevel].thankMessages[this.randomNumber(0, this.levels[this.currentLevel].thankMessages.length - 1)];
				}
			} else {
				// Decrease lives
				this.lives--;

				// Update lives
				this.updateLive();
				
				message = this.levels[this.currentLevel].cheeringMessages[this.randomNumber(0, this.levels[this.currentLevel].cheeringMessages.length - 1)];
			}

			if (this.lives >= 0) {
				// Show the cheering message
				this.showMessage(message);

				setTimeout(function () {
					// Hide the cheering message
					self.hideMessage();

					// Run next question
					self.nextRound();
				}, this.TIMEOUT_BETWEEN_GAMES);
			} else {
				setTimeout(function () {
					// Game is over
					self.lose();
				}, this.TIMEOUT_BETWEEN_GAMES);
			}
		},

		showRightFrequency: function () {
			var self = this,
				weightElement = 20000,
				element, elementLeft, minHz, maxHz, rightElement, weight, PxInHz, leftPx;

			// Look for for the right `div.hr`
			// With minimal frequencies in between
			this.hz.each(function () {
				element = $(this);
				
				if (element.is(':visible')) {
					minHz = element.data('hz-min');
					maxHz = element.data('hz-max');
					weight = maxHz - minHz;

					if (minHz <= self.rightFrequency && self.rightFrequency <= maxHz && weightElement > weight) {
						rightElement = element;
						weightElement = weight;
					}
				}
			});

			minHz = rightElement.data('hz-min');
			maxHz = rightElement.data('hz-max');
			elementLeft = rightElement.offset().left;

			// How many pixels in a Hz
			PxInHz = rightElement.width() / (maxHz - minHz);
			leftPx = elementLeft - this.spectrumLeft + (this.rightFrequency - minHz) * PxInHz;

			// Show the right answer
			this.rightFQ
				.css('left', this.getPercents(leftPx) + '%')
				.removeClass('hide');

			if (leftPx + this.rightFQLabelWidth > this.spectrumWidth) {
				// Fix the position for the right frequency
				this.rightFQLabel.addClass('left');
			} else {
				this.rightFQLabel.removeClass('left');
			}

			this.rightFQLabel.text(this.rightFrequency);

			// Store the position
			this.rightFQLeft = leftPx;
		},

		calculateScore: function (mouseLeft) {
			var coefficient = 1 - Math.abs(mouseLeft - this.spectrumLeft - this.rightFQLeft) / (this.selectorWidth / 2);

			// Increase score
			this.score += Math.round(this.levels[this.currentLevel].score * coefficient);
		},

		nextRound: function () {
			// Reset everything
			this.rightFQ.addClass('hide');
			this.rightFQLabel.text('');
			this.selectorFQ.text('');

			if (this.currentRound === this.levels[this.currentLevel].rounds) {
				// This level is over
				this.nextLevel();
				return;
			}

			// Choose an audio file
			this.currentAudio = this.sounds.get(this.levels[this.currentLevel].audios[this.randomNumber(0, this.levels[this.currentLevel].audios.length - 1)]);

			// Random frequency
			this.rightFrequency = this.generateFrequency();
			console.log('Right frequency', this.rightFrequency);

			this.currentAudio = new AudioFilter(this.currentAudio['buffer']);
			this.currentAudio.loop(true);
			this.currentAudio.setType('peaking');
			this.currentAudio.setQ(this.levels[this.currentLevel].Q);
			this.currentAudio.setFrequency(this.rightFrequency);
			this.currentAudio.setGain(this.levels[this.currentLevel].gain);
			this.currentAudio.play();

			this.initSpectrum();
			this.deinitToggleButtons();
			this.initToggleButtons();
		},

		nextLevel: function () {
			if (this.currentLevel === this.levels.length - 1) {
				this.won();
				return;
			}

			this.currentRound = 0;
			this.currentLevel++;
			this.lives += this.levels[this.currentLevel].lives;
			this.selector.css('width', this.levels[this.currentLevel].range + '%');
			
			console.log('Level', this.levels[this.currentLevel].level);

			this.updateLive();
			this.updateScore();
			this.reCalculateBlocks();
			this.nextRound();
		},

		stopGame: function () {
			this.currentAudio.stop();
			this.deinitSpectrum();
			this.deinitToggleButtons();
			this.deinitGameControl();
		},

		resetGame: function () {
			// Reset everything
			this.EQed = true;
			this.lives = 0;
			this.score = 0;
			this.currentLevel = -1;
			this.currentRound = 0;
			this.rightFrequency = null;
			this.currentAudio = null;
		},

		quit: function () {
			this.stopGame();
			this.resetGame();
			this.onQuit();
		},

		won: function () {
			this.stopGame();
			this.onWon(this.score);
			this.resetGame();
		},

		lose: function () {
			this.stopGame();
			this.onLose(this.score);
			this.resetGame();
		},

		generateFrequency: function () {
			var section = this.randomNumber(1, 12),
				frequency;

			switch (section) {
				// 20 - 100 Hz
				case 1:
					frequency = this.randomNumber(20, 120);
					break;

				// 100 - 2000 Hz
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
					frequency = this.randomNumber(120, 2000);
					break;

				// 2000 - 8000 Hz
				case 7:
				case 8:
				case 9:
				case 10:
					frequency = this.randomNumber(2000, 8000);
					break;

				// 8000 - 12000 Hz
				case 11:
					frequency = this.randomNumber(8000, 12000);
					break;

				// 12000 - 20000 Hz
				case 12:
					frequency = this.randomNumber(12000, 20000);
					break;
			}

			return frequency;
		},

		toggleFilter: function () {
			this.currentAudio.disconnect();

			this.EQed = !this.EQed;

			if (this.EQed) {
				// Connect through the filter
				this.currentAudio.connect();
			} else {
				this.currentAudio.getSource().connect(this.currentAudio.getContext().destination);
			}
		},

		randomNumber: function (min, max) {
			return Math.floor(Math.random() * (max - min + 1) + min);
		},

		updateScore: function () {
			this.scoreBlock.text(this.score);
		},

		showMessage: function (message, cheering) {
			message = message || null;
			cheering = cheering || false;

			this.cheeringMessage
				.removeClass('hide')
				.text(message);
		},

		hideMessage: function () {
			this.cheeringMessage
				.addClass('hide')
				.text('');
		},

		updateLive: function () {
			this.livesBlock.text(this.lives < 0 ? 0 : this.lives);
		}
	};

	window.EQGame = window['EQGame'] = EQGame;
}(jQuery);


/**
 * Initialize everything
 */
+function ($) {
	'use strict';

	$(document).ready(function () {
		var menu = $('.menu-wrapper'),
			menuStartGame = $('.menu-wrapper button'),
			loader = $('.loader-wrapper'),
			playground = $('.playground-wrapper'),
			wonSection = $('.game-won-wrapper'),
			wonSectionButton = $('.game-won-wrapper button'),
			loseSection = $('.game-over-wrapper'),
			loseSectionButton = $('.game-over-wrapper button'),
			spectrum = $('.spectrum'),
			selector = spectrum.find('.selector'),
			selectorFQ = selector.find('.fq'),
			hz = spectrum.find('.hz'),
			message = spectrum.find('.cheering-message'),
			rightFQ = $('.spectrum > .chosen-frequency'),
			rightFQLabel = rightFQ.find('.fq'),
			lives = $('.game-lives'),
			score = $('.game-score'),
			buttonEQ = $('.swicher .btn[data-type="eq"]'),
			buttonFlat = $('.swicher .btn[data-type="flat"]'),
			quitGame = $('.game-control .btn[data-game="quit"]'),
			sounds = new AudioLoader(GameAudios, function () {
				var eqGame = new EQGame(spectrum, selector, selectorFQ, hz, message, rightFQ, rightFQLabel, lives, score, buttonEQ, buttonFlat, sounds, quitGame,
					function () {
						// On quit event
						menu.removeClass('hide');
						playground.addClass('hide');
					},
					function (score) {
						// On won event
						playground.addClass('hide');
						wonSection
							.removeClass('hide')
							.find('.score')
							.text(score);
					},
					function (score) {
						// On lose event
						playground.addClass('hide');
						loseSection
							.removeClass('hide')
							.find('.score')
							.text(score);
					});

				loader.addClass('hide');
				menu.removeClass('hide');

				menuStartGame.on('click', function () {
					menu.addClass('hide');
					playground.removeClass('hide');
					eqGame.start();
				});

				wonSectionButton.on('click', function () {
					wonSection.addClass('hide');
					playground.removeClass('hide');
					eqGame.start();
				});

				loseSectionButton.on('click', function () {
					loseSection.addClass('hide');
					playground.removeClass('hide');
					eqGame.start();
				});

			}).load();
	});
}(jQuery);