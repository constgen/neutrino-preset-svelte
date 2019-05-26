import Entry from '__entry__'; // eslint-disable-line import/no-unresolved

if (module.hot) {
	// console.clear(); // eslint-disable-line no-console
	require('webpack/hot/log').setLogLevel('none');
}

export default new Entry({
	target: document.body, // eslint-disable-line no-undef
	props: {}
});