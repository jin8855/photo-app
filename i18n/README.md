# Resource Key Rules

- Keep keys in `domain.section.item` form.
- Use page namespaces such as `uploadPage.*`, `historyPage.*`, and `historyDetailPage.*`.
- Keep buttons and direct actions under `form`, `actions`, or a feature-specific action group.
- Keep empty, loading, and error copy under `states`.
- Keep generator-only copy under a dedicated namespace such as `analysisPrompt.*` or `commerceGenerator.*`.
- Do not return user-facing copy directly from services when the UI can map a stable key instead.
- Store mock content and prompt examples in resource files when they are shown to users or shape user-visible output.
- New locales should keep the same structure as `ko.json`.
