export function formatRange(value) {
	return String(value).replace(/(\d)\s*-\s*(\d)/g, '$1–$2');
}

export function matchesQuery(entry, query) {
	const q = (query ?? '').trim().toLowerCase();
	if (!q) return true;
	return [
		entry.bean,
		entry.roaster,
		entry.notes,
		entry.brewer,
		entry.method_name,
		...getGrinds(entry).map(g => g.type)
	]
		.filter(Boolean)
		.join(' ')
		.toLowerCase()
		.includes(q);
}

export function getGrinds(entry) {
	const typed = Object.keys(entry)
		.map(key => ({ key, match: key.match(/^grind\((.*)\)$/) }))
		.filter(({ match }) => match)
		.map(({ key, match }) => ({ setting: entry[key], type: match[1].trim() || null }));

	if (typed.length > 0) return typed;
	if (entry.grind !== undefined && entry.grind !== null) return [{ setting: entry.grind, type: null }];
	return [];
}
