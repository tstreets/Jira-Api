const http = require('http');
const express = require('express');
const jiraJs = require('jira.js');

const jira = new jiraJs.Version3Client({
	host: 'https://ty-streets-dev.atlassian.net',
	authentication: {
		basic: {
			username: 'streetso71@gmail.com',
			password: 'API_TOKEN',
		},
	},
	newErrorHandling: true, // This flag enable new error handling.
});

const app = express();

app.get('/api/issue/:key', async (req, res) => {
	try {
		const resp = await jira.issues.getIssue({
			issueIdOrKey: req.params.key,
		});
		res.status(200).json({ msg: 'Working', resp });
	} catch (E) {
		res.status(400).json({ error: E });
	}
});

app.get('/api/issues', async (req, res) => {
	try {
		const { total: totalIssues } =
			await jira.issueSearch.searchForIssuesUsingJql({
				jql: 'project = "PER" and (type = Epic or status in ("To Do", "In Progress")) ORDER BY created DESC',
				maxResults: 0,
			});

		const issues = [];
		for (let i = 0; i < Math.ceil(totalIssues / 100); i++) {
			const { issues: newIssues } =
				await jira.issueSearch.searchForIssuesUsingJql({
					jql: 'project = "PER" and (type = Epic or status in ("To Do", "In Progress")) ORDER BY created DESC',
					startAt: 100 * i,
				});
			issues.push(...(newIssues || []));
		}

		res.status(200).json({ msg: 'Working', issues: issues });
	} catch (E) {
		res.status(400).json({ error: E });
	}
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(port);

console.log(`Server: http://localhost:${port}`);
