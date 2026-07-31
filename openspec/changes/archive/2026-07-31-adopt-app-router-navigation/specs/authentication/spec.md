## MODIFIED Requirements

### Requirement: Session Gate
The app SHALL determine on the server whether a request has a valid session, redirecting unauthenticated requests to the authentication screen before any user data is fetched, and rendering data screens only for authenticated requests.

#### Scenario: No session on load
- **WHEN** a visitor without a valid session requests any data screen
- **THEN** the server redirects them to the authentication screen, and no workout data is fetched or included in the response

#### Scenario: Session established
- **WHEN** a visitor signs in successfully
- **THEN** they are taken to the screen they originally requested, or the home dashboard if they requested none, with its data rendered on the server

#### Scenario: Session stored in cookies
- **WHEN** a session is created
- **THEN** it is stored such that both the server and the browser can read it, so a server-rendered screen and a client interaction agree on who is signed in

#### Scenario: Session refresh
- **WHEN** a request arrives with a session that is valid but near expiry
- **THEN** the session is refreshed as part of handling that request, without interrupting the user

### Requirement: Sign Out
A logged-in user SHALL be able to end their session from the home dashboard, and signing out SHALL discard the locally cached data belonging to that session.

#### Scenario: Log out
- **WHEN** the user clicks "Log out" on the home dashboard
- **THEN** the session is ended, its cookies are cleared, and the user is returned to the authentication screen

#### Scenario: Cached data is discarded
- **WHEN** the session ends, whether by an explicit log out or by the session being reported as absent
- **THEN** cached cycles, workout history, and any in-progress workout are cleared, including any state preserved across route navigation

#### Scenario: Switching accounts on a shared device
- **WHEN** one user logs out and a different account logs in on the same device
- **THEN** the second user never sees the first user's cycles or workout history, including on screens the first user had visited

#### Scenario: Signed-out user presses back
- **WHEN** a user signs out and then presses the browser back button to a screen they had visited
- **THEN** they are redirected to the authentication screen rather than shown the previous account's rendered data
