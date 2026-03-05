# Contributing

Thanks for your interest in contributing to Secure Repo.

## Open Source + Paid Product

This project is open-core. The free templates (`templates/free/`) are open source and accept community contributions. Pro, premium, and preset templates are maintained by the project owner.

**Community contributions go into `templates/free/` and `examples/` only.** If your contribution would fit better in the pro or preset directories, the maintainer may adapt it there — but you are not expected to contribute to paid content.

Contributors are not paid. You contribute because you want better security templates for your own projects and the community. Your name appears on the repo as a contributor.

## Ground Rules

1. **Never weaken security defaults.** The whole point of this project is to make repos more secure. PRs that relax rules, remove checks, or add permissive patterns will be rejected.

2. **Keep templates generic.** Main templates (under `templates/free/`) must work for any stack. Stack-specific content goes in `templates/presets/`.

3. **Be opinionated.** These templates are valuable because they make decisions for teams. Vague advice like "consider using encryption" is not useful. "All data in transit must use TLS. No exceptions." is useful.

4. **Include a "why."** Every rule should have a reason. If you can't explain why a rule matters, it probably shouldn't be a rule.

5. **Keep it practical.** Every checklist item should be verifiable. Every pattern should be copy-pastable. Theoretical security advice belongs in blog posts, not here.

## How To Contribute

### Fixing typos or improving clarity
- Open a PR with the fix. No issue needed.

### Adding a new template
1. Open an issue first describing what the template covers and why it's needed.
2. Follow the existing template style: title, intro paragraph, "Rules (MUST FOLLOW)" section, patterns, and "Required Checks Before Merge" section.
3. Place it in the correct directory (`free/`, `pro/`, `premium/`, or `presets/`).

### Adding a stack preset
1. Open an issue describing the stack and what templates you're adapting.
2. Create a directory under `templates/presets/your-stack/`.
3. Only include files that differ meaningfully from the generic versions.

### Adding a code example
1. Examples go in `examples/`.
2. Must be self-contained and copy-pastable.
3. Must include comments explaining security-relevant decisions.

## PR Requirements

Every PR must:

- [ ] Not weaken any existing security rule
- [ ] Follow the existing template style and tone
- [ ] Include a description of what changed and why
- [ ] Pass any CI checks

## Style Guide

- Use Markdown headings consistently (`##` for sections, `###` for subsections).
- Use tables for structured data.
- Use checklists (`- [ ]`) for actionable items.
- Use code blocks with language tags for examples.
- Be direct. Lead with the rule, then explain why.
- No emojis in templates.

## Questions?

Open an issue. We'll respond as quickly as we can.
