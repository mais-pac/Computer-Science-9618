# Push this repository to your GitHub account

The repository is already a real git repo with one commit. You need to do the push, because the push
needs your credentials — nothing here can log in as you.

---

## Option A — one command with a Personal Access Token (fastest)

1. Create a fine-grained token: **GitHub → Settings → Developer settings → Personal access tokens →
   Fine-grained tokens → Generate new token**
   - *Repository access*: All repositories (or just the new empty repo)
   - *Permissions*: **Contents → Read and write** (plus *Metadata → Read*)
   - Expiration: 7 days is enough
2. Copy the token (`github_pat_...`).
3. In the folder that contains this repo, run:

```bash
cd cs9618-topical-quiz
./push-to-github.sh <your-github-username> <your-token> [repo-name]
```

Default repo name is **`cs9618-topical-quiz`**. The script creates the repo through the GitHub API
(public by default), adds the remote, pushes `main`, and prints the Pages URL to enable.

Or do it by hand:

```bash
cd cs9618-topical-quiz
curl -X POST -H "Authorization: Bearer $TOKEN" \
     -H "Accept: application/vnd.github+json" \
     https://api.github.com/user/repos \
     -d '{"name":"cs9618-topical-quiz","private":false}'
git remote add origin https://$USERNAME:$TOKEN@github.com/$USERNAME/cs9618-topical-quiz.git
git push -u origin main
```

Then remove the token from the remote so it is not stored on disk:

```bash
git remote set-url origin https://github.com/$USERNAME/cs9618-topical-quiz.git
```

---

## Option B — GitHub CLI (if you have `gh` installed and logged in)

```bash
cd cs9618-topical-quiz
gh repo create cs9618-topical-quiz --public --source=. --remote=origin --push
```

---

## Option C — no terminal at all

1. On GitHub: **New repository** → name `cs9618-topical-quiz` → **Create repository** (no README).
2. On the repo page: **uploading an existing file** → drag in **all** files and folders from
   `cs9618-topical-quiz/` → **Commit changes**.
3. Note: the upload dialog keeps folder structure if you drag the whole folder contents; `content/`,
   `assets/`, `scripts/`, `.github/` must all come across.

---

## Turn on GitHub Pages (so it runs on your phone)

1. Repo → **Settings → Pages**.
2. *Build and deployment → Source*: **GitHub Actions**.
3. Push to `main` (or re-run the *Deploy static site* workflow under the **Actions** tab).
4. Your site: `https://<username>.github.io/cs9618-topical-quiz/`

The workflow at `.github/workflows/pages.yml` does not build anything — the site is already static and
`content/data.js` is committed. It just uploads the folder.

---

## After the push, every class test is two commands

```bash
cp content/exams/_TEMPLATE.json content/exams/ch6-security-2026-12-01.json
# ...paste the questions in, add the entry to content/index.json...
npm run build && git add -A && git commit -m "chapter 6 test" && git push
```

The site redeploys itself in about a minute.

---

## If the push is rejected

| Message | Fix |
|---|---|
| `remote: Repository not found` | the repo does not exist yet, or the token has no access to it |
| `Support for password authentication was removed` | you used your account password — use a token instead |
| `Updates were rejected because the remote contains work…` | the new repo has a README/commit: `git pull --rebase origin main` then push |
| `refusing to allow a Personal Access Token to create…` | the token lacks **Contents: write** |
