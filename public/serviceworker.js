const CACHE_NAME = "version-1"
const CACHE_NAME_MESSAGES = "chat-messages"

const urlToMessagesCache = "messages.json"
const urlsToCache = ["index.html", "offline.html", "assets/style.css"]

const self = this

// Install SW
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
    )

    caches.has(CACHE_NAME_MESSAGES).then((includes) => {
        if (!includes) {
            event.waitUntil(
                caches.open(CACHE_NAME_MESSAGES).then((cache) => {
                    const options = {
                        method: "GET",
                        headers: new Headers({
                            "Content-Type": "application/json",
                        }),
                    }

                    return cache.add(new Request(urlToMessagesCache, options))
                })
            )
        }
    })
})

// Listen for requests
self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request).then(() => {
            return fetch(event.request).catch(() => {
                caches.open(CACHE_NAME_MESSAGES).then((messagesCache) => {
                    messagesCache
                        .match(urlToMessagesCache)
                        .then((oldMessages) => {
                            oldMessages.json().then((parsedOldMessages) => {
                                self.clients.matchAll().then((clients) => {
                                    clients.forEach((client) => {
                                        console.log(
                                            "__offline__parsedOldMessages"
                                        )
                                        client.postMessage(parsedOldMessages)
                                    })
                                })
                            })
                        })
                })

                console.log(`event.request`, event.request.url)

                if (
                    event.request.url ===
                    "http://localhost:3000/assets/style.css"
                )
                    return caches.match("assets/style.css")

                return caches.match("offline.html")
            })
        })
    )
})

// Activate the SW
self.addEventListener("activate", (event) => {
    const cacheWhitelist = []
    cacheWhitelist.push(CACHE_NAME)
    cacheWhitelist.push(CACHE_NAME_MESSAGES)

    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        return caches.delete(cacheName)
                    }
                })
            )
        )
    )
})

// Messages
self.addEventListener("message", function (event) {
    // console.log("👾SW: message from CLIENT -", event.data) // event.data = newMessage

    event.waitUntil(
        caches.open(CACHE_NAME_MESSAGES).then(async (cache) => {
            const oldMessages = await cache.match(urlToMessagesCache)

            const parsedOldMessages = await oldMessages.json()

            if (parsedOldMessages.length > 30) {
                // save last 30 messages
                parsedOldMessages.shift()
            }

            if (event.data === "GET_MESSAGES") {
                self.clients.matchAll().then((clients) => {
                    clients.forEach((client) =>
                        client.postMessage(parsedOldMessages)
                    )
                })

                cache.put(
                    urlToMessagesCache,
                    new Response(JSON.stringify([...parsedOldMessages]))
                )
            } else {
                cache.put(
                    urlToMessagesCache,
                    new Response(
                        JSON.stringify([...parsedOldMessages, event.data])
                    )
                )
            }

            // cache.put(
            //     urlToMessagesCache,
            //     new Response(JSON.stringify([...parsedOldMessages, event.data]))
            // )
        })
    )

    // self.clients.matchAll().then((clients) => {
    //     clients.forEach((client) => client.postMessage("Hello from SW!"))
    // })
})
