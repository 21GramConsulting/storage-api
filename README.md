# The Concept

Given the stable, widespread and mature interface,
the [`Storage` API](https://developer.mozilla.org/en-US/docs/Web/API/Storage)
we always envisioned certain use cases for the interface, besides the
well-knowns:

* [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
* [sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage)

Why couldn't the same interface as Storage API work for in-memory data? How
about REST API served Resources? Or even better, mediate between client-side
persisted data and a server-side REST API without any added programmer
complexity?

The vision for this project is to provide as much Storage API utilities as
possible in hope, that one day data models handled by JavaScript / TypeScript
apps become flexible, and interchangeable without a framework or idiomatic BS
lock-in.

# API Docs

We generate API docs using [TypeDoc](https://github.com/TypeStrong/typedoc).  
[Click here](https://21gramconsulting.github.io/storage-api/) to access [21Gram Consulting's Storage API docs](https://21gramconsulting.github.io/storage-api/)
