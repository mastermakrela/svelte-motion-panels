export const GROUPS = [
	{
		items: [
			{ id: 'install', title: 'Install' },
			{ id: 'quick-start', title: 'Quick start' }
		],
		title: 'Start'
	},
	{
		items: [
			{ id: 'separator', title: 'Separator' },
			{ id: 'orientation', title: 'Orientation' },
			{ id: 'collapsing', title: 'Collapsing and folds' },
			{ id: 'pinning', title: 'Pinning' }
		],
		title: 'Panels'
	},
	{
		items: [
			{ id: 'nesting', title: 'Nesting' },
			{ id: 'reordering', title: 'Reordering' },
			{ id: 'both-edges', title: 'Both edges' }
		],
		title: 'Layouts'
	},
	{
		items: [
			{ id: 'under-the-hood', title: 'Under the hood' },
			{ id: 'styling', title: 'Styling' },
			{ id: 'api', title: 'API' }
		],
		title: 'Reference'
	}
];

export const SECTIONS = GROUPS.flatMap((group) => group.items);
