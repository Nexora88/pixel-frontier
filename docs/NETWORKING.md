# Networking Architecture

- Server owns player positions, inventory, resource nodes and structures.
- Clients send intent, never authoritative coordinates or inventory values.
- Inputs are validated and rate-limited.
- Snapshots are broadcast less frequently than simulation ticks.
- Future chunk interest management sends deltas only to subscribed nearby chunks.
- Reconnection restores a server-owned session; client-provided player IDs are never trusted.
- Production requires explicit origin policy, TLS, payload limits and monitoring.
