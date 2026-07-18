export function getGrinds(entry) {
	const typed = Object.keys(entry)
		.map(key => ({ key, match: key.match(/^grind\((.*)\)$/) }))
		.filter(({ match }) => match)
		.map(({ key, match }) => ({ setting: entry[key], type: match[1].trim() || null }));

	if (typed.length > 0) return typed;
	if (entry.grind !== undefined && entry.grind !== null) return [{ setting: entry.grind, type: null }];
	return [];
}
