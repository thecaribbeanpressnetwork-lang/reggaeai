# ReggaeAI Google OAuth setup

Use **reggaeitt@gmail.com** as the primary ReggaeAI storage/admin Google identity. `bossbeatstt@gmail.com` may remain an alternate founder admin.

## Google Cloud configuration

Create or select a Google Cloud project named `ReggaeAI`, enable the **Google Drive API**, and configure the OAuth consent screen.

Keep the app in **Testing** while ReggaeAI is pre-launch and add `reggaeitt@gmail.com` as a test user. This avoids pretending the OAuth app is generally approved before it is.

Create a **Web application** OAuth 2.0 client.

Authorized JavaScript origin:

`https://reggaeai-live-production.up.railway.app`

Authorized redirect URI for ReggaeAI sign-in:

`https://reggaeai-live-production.up.railway.app/api/auth/callback/google`

For the backend Google Drive storage authorization, obtain an offline refresh token for `reggaeitt@gmail.com` with the Google Drive scope needed to access the dedicated ReggaeAI Media folders. Because those folders already exist and were created outside this OAuth client, the simplest temporary configuration is:

`https://www.googleapis.com/auth/drive`

ReggaeAI code still confines storage writes to the configured ReggaeAI folder IDs. A later storage migration can move to a service account or narrower picker-based `drive.file` authorization.

## Railway variables

Set these secrets in the `reggaeai-live` production service:

- `AUTH_GOOGLE_ID` = Google OAuth client ID
- `AUTH_GOOGLE_SECRET` = Google OAuth client secret
- `GOOGLE_DRIVE_CLIENT_ID` = same client ID unless a separate storage client is created
- `GOOGLE_DRIVE_CLIENT_SECRET` = same client secret unless separate
- `GOOGLE_DRIVE_REFRESH_TOKEN` = offline refresh token for `reggaeitt@gmail.com`

These are already configured separately and should not be changed unless the Drive folder structure changes:

- `GOOGLE_DRIVE_MEDIA_ROOT_ID`
- `GOOGLE_DRIVE_AUDIO_FOLDER_ID`
- `GOOGLE_DRIVE_ARTWORK_FOLDER_ID`
- `GOOGLE_DRIVE_VIDEO_FOLDER_ID`
- `GOOGLE_DRIVE_IMPORT_FOLDER_ID`

## Verification gate

OAuth is complete only when all of the following are verified against the live Railway deployment:

1. Google sign-in succeeds at `/signin`.
2. `/api/health` reports `auth: READY`.
3. `/api/health` reports `controlledStorage: READY_GOOGLE_DRIVE`.
4. A real Treblo generation reaches SUCCESS and is copied into the configured Audio Masters folder.
5. The corresponding `media_assets` row changes from `external_temporary` to `controlled` with `storage_provider='google_drive'`.

Do not mark Drive storage or auth complete before these checks pass.
