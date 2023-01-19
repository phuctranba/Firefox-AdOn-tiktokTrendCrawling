const HASH = "76b39b4c469030f614c"
let FINGERPRINT = '';
const SALT = () => {
    return md5(HASH) + '' + FINGERPRINT
}

let beBreakByError = false;

let isEnableCrawl = false;
let packedDataReadyForSendingOneTimeOnly = [];


async function fetchWithTimeout(resource, options = {}) {
    const {timeout = 30000} = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

function notifyUser(title, message) {
    var options = {
        type: "basic", title,
        message: message,
        iconUrl: "img/logo-treding.png"
    };
    chrome.notifications.create("canvas-CLOAKING", options, function () {
    });
}

notifyUser('Chào mừng bạn!', 'Nào, bắt đầu!');

/**
 * Link on panel, click then open link
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "open-info") {
        chrome.tabs.create({
            url: "https://tiktok.appuni.io/?utm_source=addon&utm_medium=browser&utm_campaign=pressbutton"
        });
    }
});

function sendData(data) {
    console.log('Sending Data >>>')
    return fetchWithTimeout('http://tiktok.appuni.io:8081', {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'x-origin': 'moz-app-t31',
            'x-salt': SALT(),
            'x-fingerprint': FINGERPRINT
            // 'Content-Type': 'text/plain',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: (data) // body data type must match "Content-Type" header
    });

}


function getData(_endpoint) {
    return fetchWithTimeout('http://tiktok.appuni.io:8081/' + _endpoint + '?v=' + Math.random(), {
        method: 'GET', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            // 'Content-Type': 'application/json',
            'x-origin': 'moz-app-t31',
            'x-salt': SALT(),
            'x-fingerprint': FINGERPRINT
            // 'Content-Type': 'text/plain',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });
}

// connect first
let checkAndRegWithServer = setInterval(function () {
    if (FINGERPRINT !== '') {
        clearInterval(checkAndRegWithServer);
        getData('connect')
            .catch(cleanTimeOut);
    }
}, 2000);

setInterval(() => {
    if (FINGERPRINT !== '') {
        getData('connect')
            .catch(cleanTimeOut);
    }
}, 180000)

function postData(_endpoint) {
    return fetchWithTimeout('http://tiktok.appuni.io:8081/' + _endpoint, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            // 'Content-Type': 'application/json',
            'x-origin': 'moz-app-t31',
            'x-salt': SALT(),
            'x-fingerprint': FINGERPRINT
            // 'Content-Type': 'text/plain',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    });

}

function sendListPost() {
    try {
        console.log("data")
    } catch (e) {
        console.log('Error in stringify...');
        console.log(e);
    }

}

function sendDataToServer() {
    console.log(packedDataReadyForSendingOneTimeOnly, "data");
    packedDataReadyForSendingOneTimeOnly = [];
}

function clearCurrent() {
    packedDataReadyForSendingOneTimeOnly = [];
}

function cleanTimeOut(error) {
    if (error.name === 'AbortError') {
        console.log("Time out")
        clearCurrent();
    }
}

function listenerListHashtag(details) {

    let filter = browser.webRequest.filterResponseData(details.requestId);

    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = async event => {
        // if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (details.url.includes("industry_id") && resultObject.data && Array.isArray(resultObject.data.list)) {
            if (packedDataReadyForSendingOneTimeOnly.length === 0)
                chrome.tabs.sendMessage(details.tabId, {action: "loadMore"});

            packedDataReadyForSendingOneTimeOnly = [...packedDataReadyForSendingOneTimeOnly, ...resultObject.data.list]

            if (packedDataReadyForSendingOneTimeOnly.length === 6) {
                sendDataToServer();
                chrome.tabs.sendMessage(details.tabId, {action: "clickToNextOption"});
            }
        }

        filter.write(encoder.encode(str));
        filter.close();
    };
}

function listenerDetailHashtag(details) {

    let filter = browser.webRequest.filterResponseData(details.requestId);

    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = async event => {
        // if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        console.log(resultObject, "listenerDetailHashtag")

        filter.write(encoder.encode(str));
        filter.close();
    };
}

//   const urlFetch = String(url).search('api/user') > -1 ; /** Used General information*/
//   const itemList = String(url).search('api/post/item_list') > -1 ; /** Used General information*/

browser.webRequest.onBeforeRequest.addListener(
    listenerListHashtag,
    {
        urls: ["https://ads.tiktok.com/creative_radar_api/v1/popular_trend/hashtag/list*"],
        types: ["script", "main_frame", "xmlhttprequest"]
    },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    listenerDetailHashtag,
    {
        urls: ["https://ads.tiktok.com/creative_radar_api/v1/popular_trend/hashtag/detail*"],
        types: ["script", "main_frame", "xmlhttprequest"]
    },
    ["blocking"]
);

browser.webRequest.onResponseStarted.addListener(
    (detail) => {
        if (detail.statusCode >= 400) {
            beBreakByError = true;
            clearCurrent()
            setTimeout(() => {
                chrome.tabs.executeScript(null, {code: `window.location.replace('https://www.tiktok.com/search?q=keyword&t=${new Date().getTime()}')`});
            }, 60000)

            localStorage.setItem("isOn", "false")
            chrome.storage.local.set({"isOn": "false"})
        } else {
            if (beBreakByError) {
                beBreakByError = false;
                localStorage.setItem("isOn", "true")
                chrome.storage.local.set({"isOn": "true"})
            }
        }
        return detail;
    },
    {
        urls: ["https://www.tiktok.com/search*"],
        types: ["script", "main_frame", "xmlhttprequest"]
    }
);


/************************************************************************************************ *
 * Tabs
 * important: this will ask server to open an tabs automatically ...
 /************************************************************************************************ */

function getElementInArray(_array, elementtosearch) {
    if (!Array.isArray(_array)) return false;
    for (let ele of _array) {
        if (typeof ele[elementtosearch] !== 'undefined') return ele;
    }
    return false;
}

function removeElementInArray(_array, elementtosearch) {
    if (!Array.isArray(_array)) return false;
    return _array = _array.filter((ele) => {
        return Object.keys(ele).indexOf(elementtosearch) < 0;
    });
}

/**
 * Check if ask me from the content that i should work or not ...
 */
/************************************************************************************************
 * Bộ tính thời gian của tab, quá 20 giây thì die mọe nó đi
 */

let firstTimeNeverDie = false;
let tabTime = [];

function backOfficeManageTabsAndScrollContent() {
    /**
     * nhanh quá Tiktok nó khóa!
     * scroll khoang 2 giây một phát thui!
     */
    setInterval(() => {
        chrome.tabs.executeScript(null, {file: "js/scroller.js"});
    }, 2000);

    firstTimeNeverDie = false;
    tabTime = [];
    setInterval(function () {
        if (!isEnableCrawl) return;
        let allUIDsInthisWuery = [];
        chrome.tabs.query({currentWindow: true}, function (tabs) {
            for (var i = 0; i < tabs.length; ++i) {
                let tabID = tabs[i].id;
                allUIDsInthisWuery.push(tabID);
                if (!getElementInArray(tabTime, tabID))
                    tabTime.push({[tabID]: new Date().getTime()});
            }
            firstTimeNeverDie = Math.min(...allUIDsInthisWuery);
        });
    }, 1000);


    /*******************************
     * Close any tab if timestamp more than 30 seconds
     */
    setInterval(function () {
        if (!isEnableCrawl) return;
        if (Array.isArray(tabTime))
            if (tabTime.length > 1)
                for (let tab of tabTime) {
                    let tabID = Object.keys(tab)[0];
                    let currentTime = new Date().getTime();
                    let timestamps = Object.values(tab)[0];
                    if ((Number(timestamps) + 20000) < currentTime) {
                        // must kill
                        if (Number(firstTimeNeverDie) !== Number(tabID)) {
                            chrome.tabs.remove(Number(tabID), () => { // debug
                                tabTime = removeElementInArray(tabTime, tabID);
                            });
                        }
                    }
                }
    }, 5000);
}


/**
 * Main cronjob
 */
// backOfficeManageTabsAndScrollContent();
// setInterval(async () => {
//     let stateRun = localStorage.getItem("isOn");
//     if (stateRun === "true") {
//         isEnableCrawl = true;
//         if (!isCrawling) await queryAllUnWatchdog();
//     } else {
//         isEnableCrawl = false;
//     }
// }, 6000);

/**
 * Jamviet.com
 * Helper: content can not access to localStorage, what the fuke
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method === "getLocalStorage") {
        sendResponse(localStorage[request.key]);
    } else {
        sendResponse("false"); // snub them.
    }
});

/**!SECTION
 * Jamviet.com set finger print signature...
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.method === "setFingerPrint") {
        FINGERPRINT = md5(request.key);
        window.localStorage.setItem('fingerprint', FINGERPRINT)
    }
});
