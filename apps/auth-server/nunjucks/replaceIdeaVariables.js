var dateFilter = require('./dateFilter');

function replaceIdeaVariables(text, idea) {
	const variables = [{
			key: '%meeting%',
			value: idea &&  idea.agendas && idea.agendas.length > 0 ? dateFilter(idea.agendas[0].start_date, 'dddd D MMM, YYYY') : ''
		},
		{
			key: '%explanation_approved%',
			value: idea &&  idea.info && idea.info.explanation_budget_approval ? idea.info.explanation_budget_approval : '',
		},
		{
			key: '%explanation_declined%',
			value: idea &&  idea.info && idea.info.explanation_budget_rejection ? idea.info.explanation_budget_rejection : ''
		},
	];

	variables.forEach(function(variable){
	  text = text.replace(variable.key, variable.value);
	});

	return text;
}

module.exports = replaceIdeaVariables;
