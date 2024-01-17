import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const repoInfos = {
  repo: process.env.CIRCLE_PROJECT_REPONAME,
  owner: process.env.CIRCLE_PROJECT_USERNAME,
};

// Retrieve all the repository releases
console.log("Fetching all releases of the repository...");
const data = await octokit.paginate(
  octokit.rest.repos.listReleases.endpoint.merge({
    ...repoInfos,
    per_page: 100,
  })
);
console.log(`${data.length} release(s) retrieved.`);

// Look for drafts releases
const drafts = data.filter((release) => release.draft);

// Abort final release if draft releases found
if (drafts.length) {
  console.log(
    `Found ${drafts.length} draft release(s): ${drafts
      .map((p) => p.tag_name)
      .join(",")}`
  );
  console.log(
    "[ABORTING] Final release process ends here. Restart it by doing a release from the draft."
  );
  process.exit(1);
}

// Looking for pre-releases
const preReleases = data.filter((release) => release.prerelease);

console.log(`${preReleases.length} pre-release(s) found, removing...`);
// Wait for all async removal process to end
await Promise.all(
  preReleases.map(async (preRelease) => {
    // Remove the release from Github
    await octokit.rest.repos.deleteRelease({
      ...repoInfos,
      release_id: preRelease.id,
    });
    // Delete the tag from git
    await octokit.rest.git.deleteRef({
      ...repoInfos,
      ref: `tags/${preRelease.tag_name}`,
    });
    console.log(`- ${preRelease.tag_name}: Github release & Git tag deleted`);
  })
);
console.log("Pre-release(s) deleted.");

console.log("Dispatching repository event to trigger final release...");
await octokit.rest.repos.createDispatchEvent({
  ...repoInfos,
  event_type: "pre_release_approved",
});
console.log("Event dispatched.");
