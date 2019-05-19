import Entry from '__entry__'; // eslint-disable-line import/no-unresolved

function renderEntry () {
	console.clear(); // eslint-disable-line no-console
	new Entry({
		target: document.body // eslint-disable-line no-undef
	});
}

if (module.hot) {
	require('webpack/hot/log').setLogLevel('none');
	module.hot.accept('__entry__', renderEntry);
	module.hot.accept();
}

renderEntry();