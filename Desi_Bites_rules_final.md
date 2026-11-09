# Desi Bites — Development & Git Rules

These rules apply to every developer and AI coding assistant working on the Desi Bites project.

## 1. Core Principles
- Protect existing, working functionality.
- Make changes only for the feature or bug fix currently assigned.
- Keep code modular, readable, maintainable, and consistent with the existing architecture.
- Do not introduce libraries or change architecture without explaining the reason first.

## 2. Git Branching Rules
- Never develop directly on `main`.
- Use `develop` as the integration branch if the team has adopted it.
- Create a separate branch for every new feature, authentication task, or bug fix.
- Start each branch from the latest appropriate base branch.
- Use descriptive names, such as `feature/customer-authentication`, `feature/order-management`, or `fix/login-validation`.
- Before creating a branch, inspect `git status`, check the current branch, fetch remote updates, and confirm the correct base branch.
- Preserve all uncommitted work. Never discard, overwrite, or mix another developer's changes.
- Never force-push or merge into shared/protected branches without authorization.

## 3. Existing File Protection
- Inspect the project structure and relevant files before making changes.
- Do not overwrite, delete, rename, or replace existing files without explicit approval.
- Prefer new files for genuinely new modules, screens, services, and components.
- If an existing file must change, explain which file and why, then wait for approval before editing it.
- Preserve existing styles, navigation, APIs, data models, and functionality unless the task explicitly requires a change.
- Never use destructive commands such as `git reset --hard` or `git clean -fd` to resolve conflicts.

## 4. Firebase and Authentication
- Use the project's configured Firebase setup and conventions.
- Do not replace Firebase configuration or create a second Firebase initialization without approval.
- Keep authentication services, validation, and UI responsibilities separated where practical.
- Apply role-based access for customer, delivery partner, and cafe owner.
- Enforce authorization through trusted backend/security rules; hiding UI elements alone is not access control.
- Never hardcode credentials, private keys, service-account files, or secrets.
- Do not weaken Firebase Security Rules or change production data without explicit approval.

## 5. Expo / React Native
- Follow the existing Expo and React Native versions and project structure.
- Check `package.json` before installing or upgrading dependencies.
- Avoid unnecessary dependency changes.
- Do not overwrite app configuration, navigation, environment files, or build settings without approval.
- Keep Android and iOS behavior in mind, and verify that changes do not break app startup or navigation.

## 6. Team Collaboration
- Each developer works on their own feature branch.
- Commit only files relevant to the current task.
- Push completed feature branches to the shared repository.
- Merge into `main` only through the team's approved release process.

## 7. Required Workflow
### Before implementation
1. Understand the task and expected behavior.
2. Inspect relevant files and project conventions.
3. Check the current Git branch and working-tree status.
4. Identify files that need to be created or modified.
5. Present the implementation plan and expected file changes.
6. Wait for approval before modifying existing files or making destructive or architectural changes.

### During implementation
1. Work only on the assigned feature branch.
2. Keep changes limited to the approved task.
3. Follow existing naming, formatting, and coding conventions.
4. Do not silently remove existing behavior or perform unrelated refactors.

### After implementation
1. Run relevant linting, type checks, and tests available in the project.
2. Start the Expo app and verify the affected flow where practical.
3. Review `git diff` and `git status`.
4. Confirm no unrelated files or user changes were included.
5. Report created files, modified files, dependencies, test results, and any remaining issues.
6. Provide the Git commands needed to commit and push the feature branch.

## 8. Stop and Ask
Stop and ask if the working tree contains changes you cannot confidently attribute, the base branch is unclear, an unapproved existing-file change is required, a database/security/architecture change is needed, a dependency upgrade is necessary, or a conflict could affect another developer's work.

Never guess, discard work, or make a risky change just to finish faster.

## 9. Approval Means Implement and Verify in the App
- First present the proposed plan, expected behavior, and files to be created or modified.
- Do not start implementation until the developer approves the plan.
- Once approved, implement the approved changes in the actual project code. Do not stop after giving instructions, a mockup, or a preview.
- Connect the approved feature or UI change to the app's real navigation, state, data, and actions as appropriate. A visual-only mockup is not a completed feature unless the developer explicitly requested a mockup only.
- Keep the browser preview and the Expo Android/iOS app consistent when both are part of the project. Update every applicable implementation, not just one preview.
- Run the app and verify the changed screen or flow where practical. Confirm the change appears in the running app and existing functionality still works.
- If the app cannot be run or verified in the current environment, explain exactly what is blocked and provide steps to verify it. Never claim a change is live, built, installed, or published when it is not.
- Approval applies only to the plan and scope presented. Ask again before making additional changes outside that approved scope.
- Do not publish to app stores, deploy to production, change live Firebase data, or merge into protected branches unless separately authorized.

**Final rule:** Preserve the existing project first. Build each new feature in its own branch. After approval, implement it in the actual app and verify it. Ask before changing existing files or shared behavior.

## 10. Mobile App and Web App Must Stay in Sync

- Every approved UI or feature change must be implemented in both the mobile application and the web application when both platforms are part of the project.
- Do not update only the browser preview or only the mobile app.
- Maintain consistent design, layout, functionality, navigation, and data behavior across both platforms.
- If the platforms share code, update the shared implementation appropriately. If they have separate implementations, update each applicable implementation.
- Run and verify both platforms after implementation where the environment supports it.
- If either platform cannot be updated or tested, explain exactly why and provide the steps needed to verify it.
- Do not claim that both platforms are updated or verified unless that is actually true.
