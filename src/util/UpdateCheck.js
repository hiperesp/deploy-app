const kSetStatus = Symbol("setStatus");

const kUpdateStatus = Symbol("updateStatus");
const kUpdateMessage   = Symbol("updateMessage");
const kUpdateNotesUrl  = Symbol("updateNotesUrl");

const UPDATE_STATUS = {
    CHECKING: "CHECKING",
    UP_TO_DATE: "UP_TO_DATE",
    OUT_OF_DATE: "OUT_OF_DATE",
    ERROR: "ERROR",
    UNAVAILABLE: "UNAVAILABLE"
}

export default class UpdateCheck {
    [kUpdateStatus] = null;
    [kUpdateMessage] = null;
    [kUpdateNotesUrl]  = null;

    async check(appEnvironment) {
        if(!appEnvironment.DEPLOY_APP_GIT || !appEnvironment.GIT_REV) {
            return this[kSetStatus](UPDATE_STATUS.UNAVAILABLE, "We can't check for updates because the environment variable DEPLOY_APP_GIT is not set.");
        }

        const gitConfig = JSON.parse(appEnvironment.DEPLOY_APP_GIT);
        const gitRepo = gitConfig.REPO;
        const gitRef = gitConfig.REF;
        const currentGitRef = appEnvironment.GIT_REV;

        if(!gitRepo || !gitRef) {
            return this[kSetStatus](UPDATE_STATUS.UNAVAILABLE, "We can't check for updates because the environment variable DEPLOY_APP_GIT is not set correctly.");
        }

        const httpsClone = (function() {
            const httpsCloneUrlTest = (function() {
                const sshMatch = gitRepo.match(/^git@(.+):(.+)/);
                if(sshMatch) {
                    return `https://${sshMatch[1]}/${sshMatch[2]}`;
                }
                return gitRepo;
            })();
            try {
                new URL(httpsCloneUrlTest);
            } catch(e) {
                return null;
            }
            return httpsCloneUrlTest;
        })();

        if(!httpsClone) {
            return this[kSetStatus](UPDATE_STATUS.UNAVAILABLE, "We can't check for updates because the environment variable DEPLOY_APP_GIT is not set correctly.");
        }

        this[kSetStatus](UPDATE_STATUS.CHECKING, "Checking for updates...");

        const httpsCloneUrl = new URL(httpsClone);

        switch(httpsCloneUrl.hostname) {

            case "github.com":
                const httpsClonePathnameParts = httpsCloneUrl.pathname.replace(/\.git$/, "").split("/");
                const githubUsername = httpsClonePathnameParts[1];
                const githubRepo = httpsClonePathnameParts[2];

                try {
                    const response = await fetch(`https://api.github.com/repos/${githubUsername}/${githubRepo}/compare/${currentGitRef}...${gitRef}`, { headers: { "Accept": "application/vnd.github.v3+json" } });
                    if(!response.ok) return this[kSetStatus](UPDATE_STATUS.ERROR, `We can't check for updates because the GitHub API returned an error: ${response.status} ${response.statusText}`);

                    const responseJson = await response.json();

                    switch(responseJson.status) {
                        case "identical":
                            return this[kSetStatus](UPDATE_STATUS.UP_TO_DATE, "You are running the latest version.");
                        default:
                            const notes = responseJson.html_url;
                            return this[kSetStatus](UPDATE_STATUS.OUT_OF_DATE, `There is a new update available.`, notes);
                    }
                } catch(e) {
                    return this[kSetStatus](UPDATE_STATUS.ERROR, `We can't check for updates because the GitHub API returned an error: ${e.message}`);
                }
            default:
                return this[kSetStatus](UPDATE_STATUS.UNAVAILABLE, "We can't check for updates because the repository is not hosted in GitHub.");
        }
    }

    [kSetStatus](status, message, notes = null) {
        const inconclusiveStatuses = [ null, UPDATE_STATUS.CHECKING, UPDATE_STATUS.UNAVAILABLE, UPDATE_STATUS.ERROR ];

        const currentStatusIsInconclusive = inconclusiveStatuses.includes(this[kUpdateStatus]);
        const newStatusIsInconclusive = inconclusiveStatuses.includes(status);

        if(newStatusIsInconclusive && !currentStatusIsInconclusive) {
            return;
        }

        this[kUpdateStatus] = status;
        this[kUpdateMessage] = message;
        this[kUpdateNotesUrl] = notes;
    }

    get status() {
        return this[kUpdateStatus];
    }
    get message() {
        return this[kUpdateMessage];
    }
    get notes() {
        return this[kUpdateNotesUrl];
    }

    toJson() {
        return {
            status: this.status,
            message: this.message,
            notes: this.notes,
        }
    }

}