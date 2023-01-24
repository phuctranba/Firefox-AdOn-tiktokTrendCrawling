const HASH = "76b39b4c469030f614c"
let FINGERPRINT = '';
const SALT = () => {
    return md5(HASH) + '' + FINGERPRINT
}

Date.prototype.sub30minutes = function () {
    return this.setMinutes(this.getMinutes() - 30);
}

let beBreakByError = false;

let isEnableCrawl = false;
let packedListHashtagData = [];
let currentListHashtagData = [];
let currentListSoundData = [];
let packedListSoundData = [];
let packedListCreatorData = [];
let packedListVideoTrendingData = [];


/**
 * 2 cờ để đánh dấu tránh duplicate data
 */
let currentUserCrawlId;
let currentCursor;


let isCrawling = false;
let LIST_OF_WATCHDOG = []
let currentProfileCrawling = '';
let currentWatchdogID = null;
let packedDataDetailPeriodHashtagSound = [];
let packedDataRelatedVideoHashtagSound = [];

// Danh sách keyword đã crawl để chặn việc server duplicate từ khóa liên tục
let listOfOldKeyWord = [];

setInterval(() => {
    chrome.tabs.create({
        url: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en"
    });

    setTimeout(() => [
        chrome.tabs.query({currentWindow: true, active: true}, (tabArray) => {
                tabArray.forEach((itemTab) => {
                    if (itemTab.url == "https://ads.tiktok.com/business/creativecenter/pc/en") {
                        chrome.tabs.remove(itemTab.id);
                    }
                })
            }
        )
    ], 200)
}, 1000)

setInterval(() => {
    let pointTime30MinutesPrevious = new Date().sub30minutes()
    listOfOldKeyWord = listOfOldKeyWord.filter((item) => item.time > pointTime30MinutesPrevious)

}, 60000)

function checkIsKeyWordCanBeCrawl(userName) {
    let oldItemSameUserName = listOfOldKeyWord.findIndex((item) => item.userName == userName);
    if (oldItemSameUserName !== -1) {
        return false;
    } else {
        console.log(listOfOldKeyWord, "listOfOldKeyWord")
        return true;
    }
}


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

function sendEmptyHashtagDetail() {
    if (currentWatchdogID) {
        console.log("sendEmptyAccount")
        // sendData(JSON.stringify({
        //     error: 'profile_not_found',
        //     profile: currentProfileCrawling
        // })).finally(clearCurrent)

        postData(`markaswecompleteit/${currentWatchdogID}`)
            .catch((error) => {
                if (error.name === 'AbortError') {
                    console.log("Time out")
                }
            }).finally(clearCurrent);
    }
}

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

function sendDetailHashtag() {
    try {
        let XDATA = {
            hashtag_id: packedDataDetailPeriodHashtagSound[0].data.hashtag_id,
            hashtag_name: packedDataDetailPeriodHashtagSound[0].data.hashtag_name,
            dataPeriod: packedDataDetailPeriodHashtagSound,
            dataRelatedVideo: packedDataRelatedVideoHashtagSound.slice(0, 60),
        };
        console.log(XDATA, "XDATA")
        packedDataDetailPeriodHashtagSound = [];
        packedDataRelatedVideoHashtagSound = [];
        clearCurrent();
        // let currentUsername = currentWatchdogID;
        // sendData(JSON.stringify(XDATA))
        //     .then(async () => {
        //         await postData(`markaswecompleteit/${currentUsername}`)
        //             .catch((error) => {
        //                 if (error.name === 'AbortError') {
        //                     console.log("Time out")
        //                 }
        //             });
        //         console.log('CRAWLING DATA DONE: %s', currentUsername);
        //     })
        //     .catch((error) => {
        //         if (error.name === 'AbortError') {
        //             console.log("Time out")
        //         }
        //     })
        //     .finally(() => {
        //         clearCurrent();
        //     });
    } catch (e) {
        console.log('Error in stringify...');
        console.log(e);
    }
}

function sendListHashtag() {
    console.log(packedListHashtagData, "sendListHashtag");
    packedListHashtagData = [];
}

function sendListSound() {
    console.log(packedListSoundData, "sendListSound");
    packedListSoundData = [];
}

function sendListCreator() {
    console.log(packedListCreatorData, "sendListCreator");
    packedListCreatorData = [];
}


function sendListVideoTrending() {
    console.log(packedListVideoTrendingData, "sendListVideoTrending");
    packedListVideoTrendingData = [];
}


function clearCurrent() {
    packedListHashtagData = [];
    currentUserCrawlId = undefined;
    currentCursor = undefined;
    isCrawling = false;
    currentWatchdogID = null;

    //Kiểm tra xem queue có không, có thì crawl tiếp
    if (LIST_OF_WATCHDOG.length > 0) {
        let itemForCrawl = LIST_OF_WATCHDOG.shift();
        let watchdog_account_username = itemForCrawl.account_username;
        listOfOldKeyWord.push({
            userName: watchdog_account_username,
            time: new Date().getTime()
        })
        let watchdog_id = itemForCrawl.watchdog_id;
        // mmark as we are doing
        postData(`markaswedoneit/${watchdog_id}`)
            .catch(cleanTimeOut);
        chrome.tabs.query({currentWindow: true, active: true}, (tabArray) => {
                currentProfileCrawling = watchdog_account_username;
                currentWatchdogID = watchdog_id;
                chrome.tabs.create({url: `https://ads.tiktok.com/business/creativecenter/hashtag/${watchdog_account_username}/pc/en?countryCode=VN&period=7`});
                isCrawling = true;
                packedDataDetailPeriodHashtagSound = [];
                console.log('Start crawling %s watchdog ID: %s', currentProfileCrawling, currentWatchdogID);
                setTimeout(() => {
                    if (tabArray.length > 1) {
                        chrome.tabs.remove(tabArray[tabArray.length - 1].id);
                    }
                }, 200)
            }
        )
    } else {
        // return home ...
        chrome.tabs.executeScript(null, {code: `window.location.replace('https://www.tiktok.com/vi-VN')`});
        currentProfileCrawling = '';
    }
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
        if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (details.originUrl.includes("business/creativecenter/inspiration/popular/hashtag") && details.url.includes("industry_id") && resultObject.data && Array.isArray(resultObject.data.list)) {
            currentListHashtagData = [...currentListHashtagData, ...resultObject.data.list]

            if (currentListHashtagData.length < 100) {
                chrome.tabs.sendMessage(details.tabId, {action: "loadMore"});
            } else {
                packedListHashtagData.push({
                    ...currentListHashtagData[0].industry_info,
                    data: currentListHashtagData
                });
                currentListHashtagData = [];
                if (packedListHashtagData.length === 18) {
                    sendListHashtag();
                    setTimeout(() => {
                        chrome.tabs.update(detail.tabId, {url: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en"})
                    }, 2000)
                } else {
                    chrome.tabs.sendMessage(details.tabId, {action: "clickToNextIndustryOption"});
                }
            }
        }

        filter.write(encoder.encode(str));
        filter.close();
    };
}

function listenerListCreator(details) {

    let filter = browser.webRequest.filterResponseData(details.requestId);

    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = async event => {
        if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (details.originUrl.includes("business/creativecenter/inspiration/popular/creator") && details.url.includes("audience_country") && resultObject.data && Array.isArray(resultObject.data.creators)) {
            packedListCreatorData = [...packedListCreatorData, ...resultObject.data.creators]

            if (packedListCreatorData.length < 100) {
                chrome.tabs.sendMessage(details.tabId, {action: "loadMore"});
            } else {
                sendListCreator();
                setTimeout(() => {
                    chrome.tabs.update(detail.tabId, {url: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en"})
                }, 2000)
            }
        }

        filter.write(encoder.encode(str));
        filter.close();
    };
}

function listenerListVideoTrending(details) {

    let filter = browser.webRequest.filterResponseData(details.requestId);

    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = async event => {
        if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (details.originUrl.includes("business/creativecenter/inspiration/popular") && resultObject.data && Array.isArray(resultObject.data.videos)) {
            packedListVideoTrendingData = [...packedListVideoTrendingData, ...resultObject.data.videos]

            if (packedListVideoTrendingData.length < 200) {
                chrome.tabs.sendMessage(details.tabId, {action: "loadMore"});
            } else {
                sendListVideoTrending();
                setTimeout(() => {
                    chrome.tabs.update(detail.tabId, {url: "https://ads.tiktok.com/business/creativecenter/pc/en"})
                }, 2000)
            }
        }

        filter.write(encoder.encode(str));
        filter.close();
    };
}

function listenerListSound(details) {

    let filter = browser.webRequest.filterResponseData(details.requestId);

    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = async event => {
        if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (details.originUrl.includes("business/creativecenter/inspiration/popular/music") && resultObject.data && Array.isArray(resultObject.data.sound_list)) {
            currentListSoundData = [...currentListSoundData, ...resultObject.data.sound_list]

            if (currentListSoundData.length < 100) {
                chrome.tabs.sendMessage(details.tabId, {action: "loadMore"});
            } else {
                let rankTypeValue = new URL(details.url).searchParams.get("rank_type");

                sendListSound(rankTypeValue == "popular");
                setTimeout(() => {
                    chrome.tabs.update(detail.tabId, {url: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/music/pc/en"})
                }, 2000)

                packedListSoundData.push({
                    type: rankTypeValue,
                    data: currentListSoundData
                });
                currentListSoundData = [];
                if (packedListSoundData.length === 2) {
                    sendListSound();
                    setTimeout(() => {
                        chrome.tabs.update(detail.tabId, {url: "https://ads.tiktok.com/business/creativecenter/inspiration/popular/creator/pc/en"})
                    }, 2000)
                } else {
                    chrome.tabs.sendMessage(details.tabId, {action: "clickToOtherRankTypeSound"});
                }
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
        if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (resultObject.data && resultObject.data.info) {

            let periodValue = new URL(details.url).searchParams.get("period");
            let objectDetail;
            if (!isNaN(Number(periodValue)) && Number(periodValue) !== 0) {
                objectDetail = {
                    period: Number(periodValue),
                    data: resultObject.data.info
                }

                packedDataDetailPeriodHashtagSound.push(objectDetail)
                let maxOfPeriod = details.originUrl.includes("business/creativecenter/hashtag") ? 5 : 3;
                if (packedDataDetailPeriodHashtagSound.length === maxOfPeriod) {
                    chrome.tabs.sendMessage(details.tabId, {action: "clickToShowRelatedVideo"});

                    setTimeout(() => {
                        chrome.tabs.remove(details.tabId);
                    }, 200)
                } else {
                    chrome.tabs.sendMessage(details.tabId, {action: "clickToNextPeriodOption"});
                }
            } else {
                sendEmptyHashtagDetail()
            }
        }

        filter.write(encoder.encode(str));
        filter.close();
    };
}

function listenerRelatedVideoHashtag(details) {

    let filter = browser.webRequest.filterResponseData(details.requestId);

    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = async event => {
        if (!isEnableCrawl) return details;

        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (resultObject.cursor) {
            if (Array.isArray(resultObject.itemList)) {
                packedDataRelatedVideoHashtagSound = [...packedDataRelatedVideoHashtagSound, ...resultObject.itemList];
            }

            if (!resultObject.hasMore || packedDataRelatedVideoHashtagSound.length >= 60) {
                isCrawling = false;
                sendDetailHashtag();
                chrome.tabs.remove(details.tabId);
            }
        }

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
    listenerListSound,
    {
        urls: ["https://ads.tiktok.com/creative_radar_api/v1/popular_trend/sound/list*"],
        types: ["script", "main_frame", "xmlhttprequest"]
    },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    listenerListCreator,
    {
        urls: ["https://ads.tiktok.com/creative_radar_api/v1/popular_trend/creator/list*"],
        types: ["script", "main_frame", "xmlhttprequest"]
    },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    listenerListVideoTrending,
    {
        urls: ["https://ads.tiktok.com/creative_radar_api/v1/popular_trend/list*"],
        types: ["script", "main_frame", "xmlhttprequest"]
    },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    listenerDetailHashtag,
    {
        urls: ["https://ads.tiktok.com/creative_radar_api/v1/popular_trend/hashtag/detail*", "https://ads.tiktok.com/creative_radar_api/v1/popular_trend/sound/detail"],
        types: ["script", "main_frame", "xmlhttprequest"]
    },
    ["blocking"]
);

browser.webRequest.onBeforeRequest.addListener(
    listenerRelatedVideoHashtag,
    {
        urls: ["https://www.tiktok.com/api/challenge/item_list*","https://www.tiktok.com/api/music/item_list"],
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
                chrome.tabs.update(detail.tabId, {url: "https://www.tiktok.com"})
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
        urls: ["*"],
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

async function queryAllUnWatchdog() {
    let allWatchdog = await getData('newwatchdog')
        .catch((error) => {
            if (error.name === 'AbortError') {
                console.log("Time out")
                return undefined;
            }
        });
    if (!allWatchdog) return;

    const allWatchdogs = await allWatchdog.json();
    if (Array.isArray(allWatchdogs)) {
        let keywordCanBeCrawl = allWatchdogs.filter((item) => checkIsKeyWordCanBeCrawl(item.account_username.toLowerCase()))
        LIST_OF_WATCHDOG = [...LIST_OF_WATCHDOG, ...keywordCanBeCrawl]
    }

    if (!isCrawling && LIST_OF_WATCHDOG.length > 0) {
        let itemForCrawl = LIST_OF_WATCHDOG.shift();
        let watchdog_account_username = itemForCrawl.account_username.trim().toLowerCase();
        listOfOldKeyWord.push({
            userName: watchdog_account_username,
            time: new Date().getTime()
        })
        let watchdog_id = itemForCrawl.watchdog_id;
        // mmark as we are doing
        postData(`markaswedoneit/${watchdog_id}`)
            .catch(cleanTimeOut);
        chrome.tabs.query({currentWindow: true, active: true}, (tabArray) => {
                currentProfileCrawling = watchdog_account_username;
                currentWatchdogID = watchdog_id;
                chrome.tabs.create({url: `https://ads.tiktok.com/business/creativecenter/hashtag/${watchdog_account_username}/pc/en?countryCode=VN&period=7`});
                isCrawling = true;
                packedDataDetailPeriodHashtagSound = [];
                console.log('Start crawling %s watchdog ID: %s', currentProfileCrawling, currentWatchdogID);
                setTimeout(() => {
                    if (tabArray.length > 1) {
                        chrome.tabs.remove(tabArray[tabArray.length - 1].id);
                    }
                }, 200)
            }
        )
    }
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
backOfficeManageTabsAndScrollContent();
setInterval(async () => {
    let stateRun = localStorage.getItem("isOn");
    if (stateRun === "true") {
        isEnableCrawl = true;
        if (!isCrawling) await queryAllUnWatchdog();
    } else {
        isEnableCrawl = false;
    }
}, 2000);

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
