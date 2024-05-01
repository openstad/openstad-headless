## Message streaming

Message streaming is done through Redis pub/sub. Message streaming is implemented as service in the api and cms server.

Currently the following messages are used:

| message name                 | published by  | subscribers      |
| :--                          | :--           | :--              |
| new-project                  | api           | cms, global      |
| project-urls-update          | api           | cms, global      |
| project-[[id]]-update        | api           | cms, per project |

### TODO:
- in general, libs should be extractable from specific apps, and when that works the message-streaming service should be one gneneric lib





