# Design System Specification

## Purpose

Define the presentation guarantees the app makes to its users — that text is readable in either theme, that keyboard users can see where they are, that type renders in the intended typeface, and that feedback does not block the interface — so that these properties hold by construction rather than being patched per element.

## Requirements

### Requirement: Theme Support
The app SHALL render correctly in both light and dark themes, following the operating system preference.

#### Scenario: Dark system preference
- **WHEN** a user whose system is set to dark mode opens any screen
- **THEN** every surface, text element, input, and control renders in the dark theme, with no element retaining a light-theme background or a light-theme text colour

#### Scenario: Light system preference
- **WHEN** a user whose system is set to light mode opens any screen
- **THEN** every surface and control renders in the light theme

#### Scenario: Switching preference while open
- **WHEN** the operating system theme changes while the app is open
- **THEN** the app follows the change without requiring a reload

#### Scenario: No partially themed surface
- **WHEN** any screen, dialog, or overlay is rendered in either theme
- **THEN** its foreground and background come from the same theme, so no surface mixes one theme's background with the other's text

### Requirement: Readable Text Contrast
Text SHALL meet the WCAG AA contrast minimum against the background it is actually rendered on, in both themes.

#### Scenario: Text entered into a form field
- **WHEN** a user types into any input, including the workout weight, reps, and comment fields
- **THEN** the entered text is legible against that field's background in both themes

#### Scenario: Placeholder text
- **WHEN** an input shows placeholder text
- **THEN** that placeholder is distinguishable from entered text while remaining legible

#### Scenario: Text on inverted surfaces
- **WHEN** text is placed on a dark card in light theme, or a light card in dark theme
- **THEN** it meets the contrast minimum against that surface rather than against the page background

#### Scenario: Contrast does not depend on per-element overrides
- **WHEN** a new text element is added to an existing surface without specifying a colour
- **THEN** it inherits a colour that meets the contrast minimum for that surface

### Requirement: Visible Keyboard Focus
Every interactive control SHALL show a visible focus indicator when focused by keyboard.

#### Scenario: Tabbing through a screen
- **WHEN** a keyboard user tabs through any screen
- **THEN** each focused control shows an indicator that is visible against its own background in both themes

#### Scenario: Focus is never suppressed without replacement
- **WHEN** a control removes the browser's default focus outline
- **THEN** it provides its own visible focus indicator in place of it

### Requirement: Intended Typography
Text SHALL render in the typeface the app loads, without any element falling back to a system default.

#### Scenario: Default typeface applies
- **WHEN** any text is rendered anywhere in the app
- **THEN** it uses the loaded application typeface, without needing a per-element class to opt in

#### Scenario: New surfaces inherit it
- **WHEN** a new component is added without specifying a font
- **THEN** it renders in the application typeface rather than a browser default

### Requirement: Non-Blocking Feedback
Success and failure messages SHALL be shown within the app without blocking interaction.

#### Scenario: Operation succeeds
- **WHEN** an action such as saving a workout succeeds
- **THEN** a confirmation appears in the app, does not block interaction, and dismisses without requiring the user to acknowledge it

#### Scenario: Operation fails
- **WHEN** an action fails
- **THEN** an error message appears in the app, remains visible long enough to be read, and does not prevent the user from retrying or continuing to edit

#### Scenario: Feedback is themed and responsive
- **WHEN** feedback is shown in either theme, on a narrow mobile viewport
- **THEN** it is legible, fits the viewport, and does not obscure the controls needed to act on it

#### Scenario: Feedback is announced
- **WHEN** a message appears
- **THEN** it is exposed to assistive technology rather than being a purely visual change

### Requirement: Confirmation for Destructive Actions
Deleting a cycle or a workout session SHALL require an explicit in-app confirmation that identifies what will be deleted.

#### Scenario: Confirming a delete
- **WHEN** the user confirms the deletion dialog for a cycle or a workout session
- **THEN** the deletion proceeds

#### Scenario: Dismissing a delete
- **WHEN** the user dismisses the dialog, by cancelling, pressing Escape, or clicking outside it
- **THEN** nothing is deleted

#### Scenario: Consequences are stated
- **WHEN** the confirmation for deleting a cycle is shown
- **THEN** it states that the cycle's workout history will also be removed

#### Scenario: Dialog is keyboard accessible
- **WHEN** the confirmation dialog opens
- **THEN** focus moves into it, Tab stays within it while it is open, and focus returns to the triggering control when it closes
