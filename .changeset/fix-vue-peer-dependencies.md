---
"@xsbcme/vue-tab-router": major
---

Replace the custom KeepAlive implementation with Vue's built-in KeepAlive and tab-scoped wrapper components.
Redesign tab guard types and close APIs. Tab guards can now cancel navigation and close operations by returning `false`; close APIs now accept explicit options instead of the previous boolean force parameter.
