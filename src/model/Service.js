const refreshDelay = 60;

class Service {
    constructor(name, url, env) {
        this.name = name;
        this.url = url;
        this.env = env;
        this.lastSeen = 0;
        this.reportedDown = false;
        this.failedChecks = 0;
        this.reportedDownSlackThread = '';
    }

    isAvailable() {
        const now = Date.now();
        return (now - this.lastSeen) <= refreshDelay * 2 * 1000;
    }

    setLastSeen(lastSeenTime) {
        this.lastSeen = lastSeenTime;
    }

    setReportedDown(thread) {
        this.reportedDown = true;
        this.reportedDownSlackThread = thread;
    }

    resetReportedDown() {
        this.reportedDown = false;
        this.reportedDownSlackThread = '';
        this.failedChecks = 0;
    }

    getMarkdownLink() {
        return `<${this.url}/health|${this.name}>`;
    }
}

module.exports = Service;
