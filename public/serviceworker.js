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
                    messagesCache.match(urlToMessagesCache).then((users) => {
                        users.json().then((parsedUsers) => {
                            self.clients.matchAll().then((clients) => {
                                clients.forEach((client) => {
                                    console.log("__offline__parsedUsers", {})
                                    client.postMessage(parsedUsers)
                                    client.postMessage({ type: "OFFLINE" })
                                })
                            })
                        })
                    })
                })

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
            const messageType = event.data.type
            const newMessage = event.data.message

            const users = await cache.match(urlToMessagesCache)

            const parsedUsers = await users.json()

            const myName = event.data.myName
            const toUser =
                newMessage.to.toLowerCase() === myName.toLowerCase()
                    ? newMessage.from
                    : newMessage.to

            if (messageType === "GET_MESSAGES") {
                let oldMessages = parsedUsers[newMessage.to]

                if (parsedUsers[myName]) {
                    oldMessages = [
                        ...oldMessages,
                        ...parsedUsers[myName].filter(
                            ({ to }) => to !== toUser
                        ),
                    ]

                    const toMinutes = (strTime) =>
                        strTime
                            .split(":")
                            .reduce((prev, curr) => +prev * 60 + +curr)

                    oldMessages.sort(
                        (a, b) => toMinutes(a.time) - toMinutes(b.time)
                    )
                }

                self.clients.matchAll().then((clients) => {
                    clients.forEach((client) =>
                        client.postMessage({
                            type: "GET_MESSAGES",
                            messages: oldMessages,
                            users: Object.keys(parsedUsers).filter(
                                (userName) => userName !== myName
                            ),
                        })
                    )
                })

                cache.put(
                    urlToMessagesCache,
                    new Response(JSON.stringify(parsedUsers))
                )
            } else {
                const oldMessages = parsedUsers[toUser]

                const updatedMessages = oldMessages
                    ? [...oldMessages, newMessage]
                    : [newMessage]

                console.log(`updatedMessages`, updatedMessages)

                cache.put(
                    urlToMessagesCache,
                    new Response(
                        JSON.stringify({
                            ...parsedUsers,
                            [toUser]: updatedMessages,
                        })
                    )
                )
            }
        })
    )
})
