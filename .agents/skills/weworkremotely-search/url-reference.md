# We Work Remotely — API reference (recon)

- **Endpoint:** category RSS, `GET https://weworkremotely.com/categories/<feed>.rss` (XML). Feeds: `remote-programming-jobs`, `remote-full-stack-programming-jobs`, `remote-front-end-programming-jobs`, `remote-back-end-programming-jobs`, `remote-devops-sysadmin-jobs`, `remote-design-jobs`.
- **robots.txt:** `Allow: /` except account/admin/edit paths; category feeds allowed.
- **Item fields:** `title` (`"Company: Role"`), `region`→location, `category`, `description` (entity-encoded HTML), `pubDate` (RFC-822), `link`/`guid` (listing URL).
- **No id/salary:** id derived from the link slug; filtering client-side.
