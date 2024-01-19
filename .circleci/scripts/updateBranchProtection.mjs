import { Octokit } from "octokit";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const argv = yargs(hideBin(process.argv))
  .options({
    l: {
      alias: "lock",
      description: "Lock the main branch of the repository",
      type: "boolean",
    },
    u: {
      alias: "unlock",
      description: "Unlock the main branch of the repository",
      type: "boolean",
    },
  })
  .check((argv) => {
    if (!("l" in argv) && !("u" in argv)) {
      throw new Error("You must provide either `-l` or `-u` option");
    }

    if ("l" in argv && "u" in argv) {
      throw new Error("You cannot provide both `-l` and `-u` options");
    }

    return true;
  })
  .parse();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const repoPayload = {
  repo: process.env.CIRCLE_PROJECT_REPONAME,
  owner: process.env.CIRCLE_PROJECT_USERNAME,
};

const branchPayload = {
  ...repoPayload,
  branch: "main",
};

console.log('Fetching current branch protection....')
const { data } = await octokit.rest.repos.getBranchProtection(branchPayload);
console.log('Current branch protection fetched.')

const {
  // omit url, contexts_url and contexts (deprecated)
  required_status_checks: {
    url: a,
    contexts_url,
    contexts,
    ...required_status_checks
  },
  enforce_admins: { enabled: enforce_admins },
  // omit url
  required_pull_request_reviews: { url: c, ...required_pull_request_reviews },
  required_linear_history: { enabled: required_linear_history },
  allow_force_pushes: { enabled: allow_force_pushes },
  allow_deletions: { enabled: allow_deletions },
  block_creations: { enabled: block_creations },
  required_conversation_resolution: {
    enabled: required_conversation_resolution,
  },
  allow_fork_syncing: { enabled: allow_fork_syncing },
} = data;

const parameters = {
  required_status_checks,
  enforce_admins,
  required_pull_request_reviews,
  // No restrictions currently in place, hardcode null here
  restrictions: null,
  required_linear_history,
  allow_force_pushes,
  allow_deletions,
  block_creations,
  required_conversation_resolution,
  lock_branch: argv.l,
  allow_fork_syncing,
};

console.log(`Updating branch protection to ${argv.l ? 'lock' : 'unlock'} the branch...`)
octokit.rest.repos.updateBranchProtection({
  ...branchPayload,
  ...parameters,
});
console.log('Update done.')

