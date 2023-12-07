// los aan te roepen script; geen deel van de app
// run met
// $ NODE_ENV=stemvan node src/util/budgeting-count-result.js


const db = require('../db');

let voteResult = {};

db.BudgetVote
	.findAll()
	.then(result => {
		if (!result) return console.log('(Nog) geen resultaten');
		result.forEach((entry) => {
			let vote = JSON.parse(entry.vote)
			vote.forEach(id => {
				if (typeof voteResult[id] != 'undefined') {
					voteResult[id]++;
				} else {
					voteResult[id] = 1;
				}
			});
		});
		return result;
	})
	.then(result => {
		// haal de resources erbij om de leesbaarheid te vergroten
		db.Resource
			.findAll({ where: { id: Object.keys(voteResult) } })
			.then(result => {
				result.forEach((resource) => {
					voteResult[resource.id] = {
						title: resource.title,
						noOfVotes: voteResult[resource.id],
					}
				});

				process.exit();
			})
			.catch(err => {
				console.log(err);
				process.exit();
			});
	})
	.catch(err => {
		console.log(err);
				process.exit();
	});
