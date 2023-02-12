const http = require('http');
const express = require('express');
const jiraJs = require('jira.js');

function getJiraClient({ host, email, token }) {
	if (!host || !email || !token) throw new Error('Invalid Jira Credentials');
	return new jiraJs.Version3Client({
		host: host,
		authentication: {
			basic: {
				username: email,
				password: token,
			},
		},
		newErrorHandling: true, // This flag enable new error handling.
	});
}

const app = express();

app.get('/api/issue/:key/update', async (req, res) => {
	try {
		const { jirahost, jiraemail, jiratoken } = req.headers;
		const jira2 = getJiraClient({
			email: jiraemail,
			host: jirahost,
			token: jiratoken,
		});
		const resp = await jira2.issues.editIssue({
			issueIdOrKey: req.params.key,
			fields: { summary: 'Something Else' },
		});

		res.status(200).json({ msg: 'Working', resp });
	} catch (E) {
		res.status(400).json({ error: `${E}` });
	}
});

app.get('/api/issue/:key', async (req, res) => {
	try {
		const { jirahost, jiraemail, jiratoken } = req.headers;
		const jira2 = getJiraClient({
			email: jiraemail,
			host: jirahost,
			token: jiratoken,
		});
		const resp = await jira2.issues.getIssue({
			issueIdOrKey: req.params.key,
		});
		res.status(200).json({ msg: 'Working', resp });
	} catch (E) {
		res.status(400).json({ error: `${E}` });
	}
});

app.get('/api/issues', async (req, res) => {
	try {
		const { jirahost, jiraemail, jiratoken } = req.headers;
		const jira2 = getJiraClient({
			email: jiraemail,
			host: jirahost,
			token: jiratoken,
		});

		const { total: totalIssues } =
			await jira2.issueSearch.searchForIssuesUsingJql({
				jql: 'project = "PER" and (type = Epic or status in ("To Do", "In Progress")) ORDER BY created DESC',
				maxResults: 0,
			});

		const issues = [];
		for (let i = 0; i < Math.ceil(totalIssues / 100); i++) {
			const { issues: newIssues } =
				await jira2.issueSearch.searchForIssuesUsingJql({
					jql: 'project = "PER" and (type = Epic or status in ("To Do", "In Progress")) ORDER BY created DESC',
					startAt: 100 * i,
				});
			issues.push(...(newIssues || []));
		}

		res.status(200).json({ msg: 'Working', issues: issues });
	} catch (E) {
		res.status(400).json({ error: `${E}` });
	}
});

const port = process.env.PORT || 3000;

const server = http.createServer(app);
server.listen(port);

console.log(`Server: http://localhost:${port}`);
