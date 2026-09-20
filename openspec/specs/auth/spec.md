# Web Authentication Spec (Frontend only)

## Requirement: Device Authorization Flow initiation via URL parameterThe frontend MUST accept a device code via URL hash parameter and prepare it for explicit approval after web authentication.

### Scenario: Device code extraction from hash
- GIVEN the user arrives at /auth or any route that redirects to auth after clicking a Device URL from CLI
- AND the URL contains a hash fragment with parameter ?code=XXXX
- THEN the frontend extracts the deviceCode value from window.location.hash (supports both ?code= and &code=)
- AND stores it in memory for use after Supabase authentication completes
- AND does NOT expose the deviceCode in logs or console

### Scenario: Missing device code handling
- GIVEN the user visits /auth directly without a device code in URL
- THEN the frontend still shows the authentication modal (email/password, Google)
- AND no device approval step is expected post-login (used for self-signup or device-less access)
- AND the UI does not show device-specific messaging

## Requirement: Supabase authentication methodsThe frontend MUST offer email/password and Google OAuth via Supabase Auth (already integrated).

### Scenario: Available sign-in methods
- GIVEN the AuthModal is opened
- THEN it displays:
  - Email input with type="email"
  - Password input with type="password"
  - "Iniciar sesión" button that triggers Supabase signInWithEmailAndPassword
  - "Inicio de sesión con Google" button that triggers Supabase signInWithOAuth
- AND both methods use PKCE where required by the OAuth flow (no need to add PKCE to direct password flow)
- AND error handling shows localized messages for invalid credentials, network issues, etc.

## Requirement: Explicit device approval screen (security hardening)The frontend MUST NOT auto-approve a device upon web session sign-in; requires explicit user confirmation.

### Scenario: Approval screen mandate (per AUTH-DECISION.md breach)
- GIVEN the user has completed Supabase authentication (SIGNED_IN state)
- AND a deviceCode is pending from URL extraction
- THEN the frontend MUST show an intermediate confirmation screen BEFORE calling /device/approve
- AND that screen displays:
  - The device code to authorize (masked or full? Show full for user to match with CLI)
  - Human-readable prompt: "Autorizar este equipo"
  - Information about what is being authorized: e.g., "Estás a punto de autorizar [hostname or 'este equipo'] para acceder a tu cuenta CISPAR"
  - Two buttons:
    - "Cancelar" (returns to login or clears pending code)
    - "Autorizar este equipo" (proceeds to call POST /device/approve)
- AND the automatic approval on SIGNED_IN (current behavior) is considered a vulnerability and MUST be replaced by this explicit flow

### Scenario: Approval screen without pending device code
- GIVEN the user completes Supabase authentication
- AND there is NO pending deviceCode (e.g., self-signup)
- THEN the frontend proceeds normally (e.g., shows success, redirects to landing or dashboard)
- AND no device approval screen is shown

## Requirement: Secure transmission to platform API

The frontend MUST send the public user code and Supabase token to the CISPAR Platform API over HTTPS with proper headers.

### Scenario: Device approval request
- GIVEN the user has confirmed device approval on the explicit screen
- THEN the frontend makes a POST request to ${VITE_PLATFORM_API_URL}/device/approve
- AND the request body is JSON: { userCode: string, supabaseToken: string }
- AND the supabaseToken is the access_token from Supabase.auth.session()
- AND the request includes header Content-Type: application/json
- AND the platform API URL is configured via environment variable (VITE_PLATFORM_API_URL)

## Requirement: Handling of license server responsesThe frontend MUST interpret responses from the license server and update UI accordingly.

### Scenario: Successful authorization
- GIVEN the POST /device/approve returns HTTP 200 with { status: "authorized", token: "...", customer: {...} }
- THEN the frontend:
  - Closes the AuthModal
  - Persists the CISPAR token (from response) and customer data via AuthContext (or localStorage for future use)
  - Redirects the user to the landing page (/) or intended route
  - Shows a transient success message if desired

### Scenario: Expired or invalid device code
- GIVEN the POST /device/approve returns HTTP 400 or 404 (device not found/expired) or the server explicitly indicates expiration
- THEN the frontend:
  - Shows an error message: "El código de dispositivo ha expirado o es inválido. Inicie el proceso nuevamente desde su terminal."
  - Clears the pending deviceCode
  - Allows the user to restart authentication (does not auto-retry)
  - Does NOT consider the web session as authorized for device access

### Scenario: Server validation of Supabase token
- GIVEN the license server validates the supabaseToken via supabase.auth.getUser()
- AND that validation fails (token invalid, user not found)
- THEN the frontend treats it as an invalid request and shows credentials error (though this should rarely happen post-Supabase SIGNED_IN)

## Requirement: Logout clears device authorization stateThe frontend MUST clear pending device codes and auth state on logout.

### Scenario: Logout behavior
- GIVEN the user is authenticated (has Supabase session)
- AND there may be a pending deviceCode from URL
- AND the user clicks "Cerrar sesión"
- THEN the frontend:
  - Calls Supabase signOut()
  - Clears any pending deviceCode from memory
  - Removes persisted CISPAR token and customer data (if stored)
  - Redirects to landing page
  - Does NOT retain device approval state across sessions

## Requirement: Respect for reduced motion in auth modalThe authentication modal MUST honor prefers-reduced-motion for animations.

### Scenario: Motion reduction in modal
- GIVEN the user has set prefers-reduced-motion: reduce
- THEN the AuthModal open/close transition uses a fade (max 150-220ms) instead of sliding or zooming
- AND internal animations (e.g., button hovers, input focus) are non-distracting
- AND essential feedback (form validation errors, button presses) remains perceivable

## Requirement: Accessible form labels and error announcementsThe authentication form MUST be accessible to screen readers and announce errors.

### Scenario: Form accessibility
- GIVEN a screen reader user navigates the AuthModal
- THEN:
  - Each input has an associated <label> (or aria-label) descriptive of its purpose
  - Inputs announce their type (email, password) and required state
  - Form submission errors are announced via aria-live or alert role
  - Focus is trapped within the modal while open
  - Escape key closes the modal
  - Tab order is logical
