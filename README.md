# Releases Playground

This repository exists to play with Github Releases & Pre-releases to check its behavior.

Moreover it attends to also check how CircleCI behave facing releases & pre-releases (even github actions).

## Case 1: Fix

How release process works when dealing when a fix Pull Request.

![fix](./assets/workflow_pre-release-fix.png)

## Case 2: Feature


How release process works when dealing when a feature Pull Request.

![feature](./assets/workflow_pre-release-feature.png)

## Case 3: Fix then feature

How release process works when dealing when a fix Pull Request and another feature Pull Request got merged.

![feature](./assets/workflow_pre-release-fix%20then%20feature.png)

## Case 4: QA Failure

How release process works when the QA Session reveal a failure, which forbid us to deploy this version.

![feature](./assets/workflow_pre-release-qa%20failed.png)

## Case 5: Race condition issue


How release process works when a PR got merged while the CI was awaiting the approval for a previous pre-release version.

![feature](./assets/workflow_pre-release-race%20condition.png)

## Known caveats

### Release content from previous pre-releases

When a pre-release is created (or even more than one) we want that the following "stable" release note (ie: not a pre-release) to contains all the change done in the pre-releases.

Unfortunately Release Drafter does not handle that.

To achieve this goal we have to delete all previous pre-release prior to asking to Release Drafter to generate the "stable" release.

This is achieve with the `.circleci/scripts/createFinalRelease.mjs` script.

## Unsychronized pre-release and stable release

As visible in the ["race condition issue"](#case-5-race-condition-issue) section, when a pre-release exists all following draft release will stick to the existing pre-release version.

This mean that even by merging a feat on main while pre-release change only the PATCH number of the version (ie: fix only) the MINOR number will be unchanged: `v1.0.1-pre.0 --> feat --> v1.0.1-pre.1`.

BUT... since the process triggered when pre-release is approved is to delete all pre-release to trigger Release Drafter to create stable release ... the real "stable" release will follow semver rules :
- Previous = `v1.0.0`
- Fix PR -> `v1.0.1`
- Feature PR -> `v1.1.0`
- Stable release create = `v1.1.0`

It may be confusing since QA was testing for a `v1.0.1-pre.1` version before the final release was generated.

It may be acceptable since it happen on rare case: only when a race condition occurs (#communicationTeam)

## Discarded pre-release content

When the final release is created through ReleaseDrafter there is a process which clean the previous pre-release.

Thus if you made some modification in the body/content of the release: it will be lost.

If the generated body of the final release does not suite your needs: you have to update it even if it was already releases.

Idea: Should we create the final release in "Draft" mode (but this required an additionnal click...)

## Ideas

Use of https://docs.github.com/en/rest/branches/branch-protection?apiVersion=2022-11-28 to "lock" main branch while deploy is in progress ?

How to unlock it automatically if approval is not given ?

## Various notes

To deal with "branch protection" rule through github rest API repository MUST be public OR be part of a Pro account.

Note: Trying to do it through CircleCI

-> bot user have to be admin of the repository

~~I had to update Settings > Actions > General > "Workflow permissions" > Set to "Read and write permission" otherwise the action threw a Resource not accessible by integration~~