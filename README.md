Telecom SR Anomaly Assistant (static demo)

Overview
- Static single-page demo for managing business rules, documentation, warnings and feedback for a telecom SR anomaly detection workflow.
- Built with plain HTML/CSS/JS and uses localStorage to persist data in the browser.

Pages
- Business Rules: Add/edit/delete rules describing conditions and actions (escalate/reject/handle/transfer).
- Documentation: Upload PDFs or slides for onboarding (stored locally in browser for demo).
- Chatbot: Placeholder with feedback capture and export to JSON.
- Warnings: Add predicted SR explosion warnings, provide reasons and star feedback.

Styling
- Rosy / reddish theme suitable for alerting and emphasis.

Sharing / hosting
1. GitHub Pages
   - Create a new GitHub repository and push these files.
   - In repo settings enable Pages to serve from the main branch (root) — the site will then have a public URL.
2. Netlify / Vercel
   - Drag-and-drop the folder or connect your repository to publish. Both provide a public link and easy redeploys.

Next steps for production
- Add authentication and authorization for edits (who can add/remove rules/docs).
- Replace localStorage with a backend API (Node, Python, .NET) + database (Postgres, SQL Server, Cosmos) to support multi-user collaboration and analytics.
- Add storage for uploaded docs (S3, Blob storage) and serve them securely.
- Implement the chatbot using an LLM or internal rules engine and capture signals for model training.
- Add export endpoints and monitoring pipelines for model/data analysis.

License: MIT (demo)
