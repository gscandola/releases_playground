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

## Know caveat

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