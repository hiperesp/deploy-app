const kUpdateStatus = Symbol("updateStatus");
const kUpdateMessage   = Symbol("updateMessage");
const kUpdateNotes  = Symbol("updateNotes");

const UPDATE_STATUS = {
    CHECKING: "CHECKING",
    UP_TO_DATE: "UP_TO_DATE",
    OUT_OF_DATE: "OUT_OF_DATE",
    ERROR: "ERROR",
    UNAVAILABLE: "UNAVAILABLE"
}

export default class UpdateCheck {
    [kUpdateStatus] = null;
    [kUpdateMessage]   = null;
    [kUpdateNotes]  = null;

    async check() {

        if(!process.env.DEPLOY_APP_GIT) {
            this[kUpdateStatus] = UPDATE_STATUS.UNAVAILABLE;
            this[kUpdateMessage] = "We can't check for updates because the environment variable DEPLOY_APP_GIT is not set.";
            this[kUpdateNotes] = null;
            return;
        }
        if(!process.env.GIT_REV) {
            this[kUpdateStatus] = UPDATE_STATUS.UNAVAILABLE;
            this[kUpdateMessage] = "We can't check for updates because the environment variable GIT_REV is not set.";
            this[kUpdateNotes] = null;
            return;
        }

        const deployAppGit = JSON.parse(process.env.DEPLOY_APP_GIT);
        if(!deployAppGit.REPO || !deployAppGit.REF) {
            this[kUpdateStatus] = UPDATE_STATUS.UNAVAILABLE;
            this[kUpdateMessage] = "We can't check for updates because the environment variable DEPLOY_APP_GIT is not set correctly.";
            this[kUpdateNotes] = null;
            return;
        }

        const httpsClone = (function() {
            const httpsCloneUrlTest = (function() {
                const sshMatch = deployAppGit.REPO.match(/^git@(.+):(.+)/);
                if(sshMatch) {
                    return `https://${sshMatch[1]}/${sshMatch[2]}`;
                }
                return deployAppGit.REPO;
            })();
            try {
                new URL(httpsCloneUrlTest);
            } catch(e) {
                return null;
            }
            return httpsCloneUrlTest;
        })();

        if(!httpsClone) {
            this[kUpdateStatus] = UPDATE_STATUS.UNAVAILABLE;
            this[kUpdateMessage] = "We can't check for updates because the environment variable DEPLOY_APP_GIT is not set correctly.";
            this[kUpdateNotes] = null;
            return;
        }

        const httpsCloneUrl = new URL(httpsClone);

        const isGithub = httpsCloneUrl.hostname === "github.com";

        if(!isGithub) {
            this[kUpdateStatus] = UPDATE_STATUS.UNAVAILABLE;
            this[kUpdateMessage] = "We can't check for updates because the repository is not hosted in GitHub.";
            this[kUpdateNotes] = null;
            return;
        }

        const httpsClonePathnameParts = httpsCloneUrl.pathname.replace(/\.git$/, "").split("/");
        const githubUsername = httpsClonePathnameParts[1];
        const githubRepo = httpsClonePathnameParts[2];

        this[kUpdateStatus] = UPDATE_STATUS.CHECKING;
        this[kUpdateMessage] = "Checking for updates...";
        this[kUpdateNotes] = null;

        const githubApiUrl = `https://api.github.com/repos/${githubUsername}/${githubRepo}/compare/${process.env.GIT_REV}...${deployAppGit.REF}`;

        try {
            const response = await fetch(githubApiUrl, {
                headers: {
                    "Accept": "application/vnd.github.v3+json"
                }
            });
            if(!response.ok) {
                this[kUpdateStatus] = UPDATE_STATUS.ERROR;
                this[kUpdateMessage] = `We can't check for updates because the GitHub API returned an error: ${response.status} ${response.statusText}`;
                this[kUpdateNotes] = null;
                console.log(this[kUpdateMessage]);
                return;
            }
            const responseJson = await response.json();
            if(responseJson.status==="ahead") {
                const tags = await (async function() {
                    try {
                        const tags = await fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/tags`, {
                            headers: {
                                "Accept": "application/vnd.github.v3+json"
                            }
                        });
                        if(!tags.ok) {
                            return [];
                        }
                        const tagsJson = await tags.json();

                        const response = [];
                        for(const tag of tagsJson) {
                            response[tag.commit.sha] = tag.name;
                        }

                        return response;
                    } catch(e) {
                        return [];
                    }
                })();
                const lastCommitSha = responseJson.commits[responseJson.commits.length-1].sha;

                this[kUpdateStatus] = UPDATE_STATUS.OUT_OF_DATE;
                this[kUpdateMessage] = `There is a new version available: ${tags[lastCommitSha] || lastCommitSha}`;
                this[kUpdateNotes] = (function() {
                    const updateNotes = [];
                    let messageAppend = "";
                    for(const commit of responseJson.commits) {
                        messageAppend+= `${commit.commit.message}`;
                        if(tags[commit.sha]) {
                            updateNotes.push({
                                "version": tags[commit.sha],
                                "versionStr": `v${tags[commit.sha]}`,
                                "sha": commit.sha,
                                "date": commit.commit.author.date,
                                "commitMessage": messageAppend,
                                "changesUrl": commit.html_url,
                                "author": {
                                    "login": commit.author.login,
                                    "name": commit.author.name,
                                    "email": commit.author.email,
                                    "avatarUrl": commit.author.avatar_url,
                                    "verified": commit.author.login===githubUsername,
                                }
                            });
                            messageAppend = "";
                        } else {
                            messageAppend+= "\n";
                        }
                    }
                    return updateNotes;
                })();
                return;
            }
            this[kUpdateStatus] = UPDATE_STATUS.UP_TO_DATE;
            this[kUpdateMessage]   = "You are running the latest version.";
            this[kUpdateNotes]  = null;
        } catch(e) {
            this[kUpdateStatus] = UPDATE_STATUS.ERROR;
            this[kUpdateMessage] = `We can't check for updates because the GitHub API returned an error: ${e.message}`;
            this[kUpdateNotes] = null;
            console.log(this[kUpdateMessage]);
            return;
        }
    }

    get status() {
        return this[kUpdateStatus];
    }
    get message() {
        return this[kUpdateMessage];
    }
    get notes() {
        return this[kUpdateNotes];
    }

    toJson() {
        return {
            status: this.status,
            message: this.message,
            notes: this.notes,
        }
    }

}