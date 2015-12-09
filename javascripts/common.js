/*var context = new (window.AudioContext || window.webkitAudioContext)(),
	request = new XMLHttpRequest();

request.open('GET', 'PinkNoise.wav', true);
request.responseType = 'arraybuffer';
request.onload = function () {
	var undecodedAudio = request.response;

	context.decodeAudioData(undecodedAudio, function (buffer) {
		var source = context.createBufferSource();
		var filter;

		source.buffer = buffer;

		// Create the filter
		filter = context.createBiquadFilter();
		filter.type = 'peaking';
		filter.Q.value = 2.5;
		filter.frequency.value = 1000;
		filter.gain.value = 6;

		// Connect source to filter, filter to destination
		source.connect(filter);
		filter.connect(context.destination);
		source[source.start ? 'start' : 'noteOn'](0);
	});
};

request.send();
*/