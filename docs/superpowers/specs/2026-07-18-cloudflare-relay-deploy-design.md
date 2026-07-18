# Cloudflare Relay Deployment Design

## Goal

Replace Harbor's API-token-based relay deployment with Cloudflare's official Deploy to Cloudflare flow for `harborstremio/together-relay`.

## User flow

### Host

1. Harbor explains that only the person hosting Watch Together needs a relay in their Cloudflare account.
2. The host's primary action opens:
   `https://deploy.workers.cloudflare.com/?url=https://github.com/harborstremio/together-relay`
3. Cloudflare authenticates the user, clones the repository, provisions its Durable Object, and deploys the Worker.
4. The host copies the resulting `workers.dev` URL and pastes it into Harbor.
5. Harbor validates and stores the relay URL using the existing connection-test flow.
6. The host creates a room and shares Harbor's invite link.

### Participant

1. The participant opens the host's Harbor invite link.
2. The invite supplies both the host's relay URL and room code to Harbor.
3. The participant joins without deploying a Worker, creating a Cloudflare token, or manually entering the relay URL.

## Removed behavior

- Creating and pasting a Cloudflare API token.
- Selecting a Cloudflare account through Harbor.
- Deploying, redeploying, or deleting the Worker through Cloudflare's API.
- Persisting Cloudflare API tokens and account IDs.
- Exporting backups of Cloudflare credentials.
- Manual deployment instructions that duplicate Cloudflare's deploy flow.

Existing stored credentials remain ignored for backward compatibility; this change does not need a settings migration.

## Interface

The relay settings panel keeps the existing URL input and health check. Host deployment and update actions open the official Cloudflare deploy URL. The deployment panel becomes a short two-step host guide: deploy on Cloudflare, then paste the resulting Worker URL. Participant-facing copy directs them to open or paste the host's invite link instead of deploying their own relay.

The Watch Together popover continues to direct users to Relay settings instead of duplicating deployment controls.

## Error handling

Harbor cannot observe Cloudflare's external deployment. It therefore reports errors only when the pasted relay URL fails the existing health check. Deployment, authentication, and provisioning errors remain visible in Cloudflare's flow.

## Verification

- Confirm every deployment/redeployment action opens the official repository deploy URL.
- Confirm no UI requests or stores a Cloudflare API token.
- Confirm an existing relay URL can still be entered, tested, copied, forgotten, and used.
- Run formatting, TypeScript checks, and the frontend test suite.
