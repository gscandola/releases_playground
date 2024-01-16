import { Octokit } from "octokit";

const repo = "releases_playground";
const owner = "gscandola";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const repoInfos = { repo, owner };

console.log('Fetching all releases of the repository...')
const data = await octokit.paginate(
  octokit.rest.repos.listReleases.endpoint.merge({
    ...repoInfos,
    per_page: 100,
  })
);
const drafts = data.filter((release) => release.draft);

// Abort final release if draft releases found
if (drafts.length) {
  console.log(
    `Found ${drafts.length} draft release(s): ${drafts.map((p) => p.tag_name).join(",")}`
  );
  console.log(
    "[ABORTING] Final release process ends here. Restart it by doing a release from the draft."
  );
  process.exit(1);
}

const preReleases = data.filter((release) => release.prerelease);

console.log(`${preReleases.length} pre-release(s) found, removing them...`)
preReleases.forEach(async (preRelease) => {
  await octokit.rest.repos.deleteRelease({
    ...repoInfos,
    release_id: preRelease.id,
  });
  console.log(`${preRelease.tag_name} deleted`);
});
console.log('Pre-release(s) deleted.')

console.log('Dispatching repository event to trigger final release...')
await octokit.rest.repos.createDispatchEvent({
    ...repoInfos,
    event_type: 'pre_release_approved'
})
console.log('Event dispatched.')
