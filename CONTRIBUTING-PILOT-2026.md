# Contributing Guidelines Project - Pilot Uitvoeringskracht 2026

These guidelines describe how we collaborate on GitHub during the Pilot Uitvoeringskracht 2026. When successful, we incorporate this way of working into the general contributing docs.

They exist to keep our codebase consistent, our history readable, and our collaboration smooth. They are not bureaucracy for its own sake — each rule has a reason, and understanding that reason is more useful than following it blindly.

Please read this document before opening your first pull request.

## Git Workflow

Our code is open source and used by dozens of municipalities. This context makes it vital to keep our decisions and change history transparent. A clear version control strategy helps with this.

We follow [GitHub flow](https://docs.github.com/en/get-started/using-github/github-flow): all work happens on short-lived feature branches. For the pilot, we work from a sprint branch that is cut from `main` to isolate pilot work per sprint. Feature branches should be branched from `branch-sprint-1` and merged back into `branch-sprint-1` via a pull request.

Feature branches should be small and focused. This keeps continuous integration fast, reduces the chance of merge conflicts, and limits the scope of code reviews. Aim to merge within days, not weeks.

Once you have pushed a branch to the remote, do not rebase it. Rebasing rewrites history and forces your collaborators to reset their local copies. If you need to incorporate upstream changes, merge `branch-sprint-1` into your branch instead.

### Branch Naming

Branch names should start with the issue type and issue ID, followed by a slash and a brief description of the work. Use issue types that are used in GitHub (feature, bug, task).

```text
feature-6803/add-tests-to-map-widget
```

The ID lets you quickly find the branch belonging to a given Issue. The short description makes it clear at a glance what the branch is about, without having to open it.

## Pull Requests

### PR Title

We squash-merge all PRs, which means the PR title becomes the commit message in `branch-sprint-1`’s history. When you trace a specific line of code years from now, a well-written title makes it immediately clear what exactly was changed.

A good PR title should complete the sentence _“If applied, this commit will…”_:

1. Use the imperative mood (example: “Update spacing values”)
2. Capitalize the first word
3. Do not end with a period

All together, a good PR title looks like this: _“Enable sorting on users in the admin”_

For more information, see [How to Write a Git Commit Message](https://cbea.ms/git-commit/).

### PR Template

The PR title records _what_ changed; the PR description records _why_. Please fill out [the template](../.github/PULL_REQUEST_TEMPLATE.md) — both sections matter.

Most IDEs can navigate from any line of code to the commit that last changed it, and from there directly to the PR. A well-filled template means that when someone traces a specific line of code years from now, they can immediately understand the reasoning behind the change, not just what it was.

### Authoring

A PR is a proposal, not a finished product — it is an invitation to complete the work together. The author remains responsible for driving the PR to completion.

If you need early feedback — a sanity check on the approach, a look at the diff before you are done — open the PR in draft mode. Draft PRs suppress review notifications and make clear that the work is still in progress.

- **Keep PRs small and focused.** One PR per bug fix or feature. Do not include unrelated refactors or reformats. Smaller PRs are faster to review, easier to revert, and less likely to cause merge conflicts.
- **[Resolve merge conflicts yourself](https://help.github.com/en/github/collaborating-with-issues-and-pull-requests/resolving-a-merge-conflict-on-github)** before requesting a human review.
- **Fix CI failures promptly.** Push a fix if your PR fails to build or pass tests.
- **Resolve AI-generated review comments yourself** before requesting a human review.
- **The author merges** once the PR is approved.

### Reviewing

Invest the time to fully understand the PR. Read the title and description, check out the branch locally, and test the functionality. For this pilot, each PR must be reviewed by at least one participant from the other organization (Draad or Amsterdam).

Use GitHub’s **suggestion** feature to propose specific changes inline. The author can apply them with one click, which is clearer and faster than describing a change in prose.

#### Resolving comments

The reviewer resolves their own comments after verifying the change was addressed — this ensures no implemented change goes unseen. AI-generated comments are the exception: the author handles those before requesting human review.

Once all comments are resolved, approve the PR. The author then merges.
