const HASH = "76b39b4c469030f614c"
let FINGERPRINT = '';
const SALT = () => {
    return md5(HASH) + '' + FINGERPRINT
}

Date.prototype.sub30minutes = function () {
    return this.setMinutes(this.getMinutes() - 30);
}


let beBreakByError = false;


/**
 * 2 cờ để đánh dấu tránh duplicate data
 */
let isMatchUserName = true;
let currentUserCrawlId;
let currentCursor;


let isCrawling = false;
let LIST_OF_WATCHDOG = []
let currentProfileCrawling = '';
let currentWatchdogID = null;
let isEnableCrawl = false;
let packedDataReadyForSendingOneTimeOnly = [];

// Danh sách keyword đã crawl để chặn việc server duplicate từ khóa liên tục
let listOfOldKeyWord = [];

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
        iconUrl: "img/64x64.png"
    };
    chrome.notifications.create("canvas-CLOAKING", options, function () {
    });
}

notifyUser('Chào mừng bạn!', 'Nào, bắt đầu!');

/**
 * First install
 */
chrome.runtime.onInstalled.addListener(function (e) {
    setTimeout(function () {
        if (e.reason === "install") {
            chrome.tabs.create({
                "url": 'https://tiktok.appuni.io?utm_source=extension&utm_medium=from_firefox&utm_campaign=install_addon&utm_id=first_runing',
                "active": true
            })
        }
    }, 3000);
});

/**
 * Link on panel, click then open link
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "open-info") {
        chrome.tabs.create({
            url: "https://tiktok.appuni.io/?utm_source=addon&utm_medium=browser&utm_campaign=pressbutton"
        });
    }
    if (request.action === "sendEmptyAccount") {
        // console.log("akvdsavd")
        sendEmptyAccount();
    }
});

function sendEmptyAccount() {
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

function sendListPost() {
    try {
        let XDATA = {
            itemList: null
        };
        XDATA.itemList = packedDataReadyForSendingOneTimeOnly
        let currentUsername = currentWatchdogID;
        sendData(JSON.stringify(XDATA))
            .then(async () => {
                await postData(`markaswecompleteit/${currentUsername}`)
                    .catch((error) => {
                        if (error.name === 'AbortError') {
                            console.log("Time out")
                        }
                    });
                console.log('CRAWLING DATA DONE: %s', currentUsername);
            })
            .catch((error) => {
                if (error.name === 'AbortError') {
                    console.log("Time out")
                }
            })
            .finally(() => {
                clearCurrent();
            });
    } catch (e) {
        console.log('Error in stringify...');
        console.log(e);
    }

}

function clearCurrent() {
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
                chrome.tabs.create({url: `https://www.tiktok.com/search?q=${watchdog_account_username}&t=${new Date().getTime()}`});
                isMatchUserName = true;
                isCrawling = true;
                packedDataReadyForSendingOneTimeOnly = [];
                console.log('Start crawling %s watchdog ID: %s', currentProfileCrawling, currentWatchdogID);
                setTimeout(() => {
                    chrome.tabs.remove(tabArray[0].id);
                }, 200)
            }
        )
    } else {
        // return home ...
        chrome.tabs.executeScript(null, {code: `window.location.replace('https://www.tiktok.com/vi-VN')`});
        // isMatchUserName = true;
        currentProfileCrawling = '';
        packedDataReadyForSendingOneTimeOnly = [];
    }
}

function cleanTimeOut(error) {
    if (error.name === 'AbortError') {
        console.log("Time out")
        clearCurrent();
    }
}

function listener(details) {

    let filter = browser.webRequest.filterResponseData(details.requestId);

    let encoder = new TextEncoder();

    let data = [];
    filter.ondata = event => {
        data.push(event.data);
    };

    filter.onstop = async event => {
        if (!isEnableCrawl || !isCrawling) return details;
        console.log("1")
        let blob = new Blob(data, {type: 'text/javascript'});
        let str = await blob.text();

        let resultObject = JSON.parse(str || "{}");
        if (resultObject.cursor && isMatchUserName) {
            console.log("2")
            if (resultObject.cursor != currentCursor) {
                currentCursor = resultObject.cursor;
                console.log("3")
                if (typeof resultObject.itemList !== 'undefined') {
                    console.log("4")
                    // check first item
                    // if other, ignore
                    let firstITEMtoCheck = resultObject.itemList[0].author.uniqueId
                    if (firstITEMtoCheck === currentProfileCrawling) {
                        for (let y of resultObject.itemList) {
                            packedDataReadyForSendingOneTimeOnly.push(y);
                        }
                    }
                }
            }
            console.log(packedDataReadyForSendingOneTimeOnly.length, " clip")
            if (!resultObject.hasMore || packedDataReadyForSendingOneTimeOnly.length >= 1000) {
                console.log("5")
                isCrawling = false;
                sendListPost();
            }
        } else {
            if (resultObject.userInfo) {
                console.log("6")
                if (resultObject.userInfo?.user?.id !== currentUserCrawlId) {
                    console.log("7")
                    currentUserCrawlId = resultObject.userInfo?.user?.id;
                    console.log(resultObject.userInfo)
                    console.log(currentProfileCrawling)
                    if (resultObject.userInfo?.user?.uniqueId.trim() == currentProfileCrawling.trim()) {
                        console.log("8")
                        sendData(str)
                            .catch(cleanTimeOut);
                    } else {
                        console.log("9")
                        isCrawling = false;
                        isMatchUserName = false;
                        console.log("set false")
                        postData(`markaswecompleteit/${currentWatchdogID}`)
                            .catch((error) => {
                                if (error.name === 'AbortError') {
                                    console.log("Time out")
                                }
                            }).finally(clearCurrent);
                        console.log('USERNAME DO NOT MATCH: %s: WatchdogID %s =>', currentProfileCrawling, currentWatchdogID);
                    }
                }
            } else {
                if (packedDataReadyForSendingOneTimeOnly.length > 0) {
                    console.log("10")
                    isCrawling = false;
                    sendListPost();
                } else {
                    console.log("11")
                    clearCurrent();
                }
            }
        }


        filter.write(encoder.encode(str));
        filter.close();
    };
}

//   const urlFetch = String(url).search('api/user') > -1 ; /** Used General information*/
//   const itemList = String(url).search('api/post/item_list') > -1 ; /** Used General information*/

browser.webRequest.onBeforeRequest.addListener(
    listener,
    {
        urls: ["https://www.tiktok.com/api/user/*", "https://www.tiktok.com/api/post/item_list/*"],
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
                chrome.tabs.create({url: `https://www.tiktok.com/search?q=${watchdog_account_username}&t=${new Date().getTime()}`});
                isCrawling = true;
                isMatchUserName = true;
                packedDataReadyForSendingOneTimeOnly = [];
                console.log('Start crawling %s watchdog ID: %s', currentProfileCrawling, currentWatchdogID);
                setTimeout(() => {
                    chrome.tabs.remove(tabArray[0].id);
                }, 200)
            }
        )
    }
}


/*

//create the tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
  getTabs(tabs, function(full_mail_link){
    chrome.tabs.create({ url: full_mail_link }, callBackOnCreate);
  });
});

function callBackOnCreate(tab)
{
   globalCreatedTab = tab.id;
}

function calllbackOnRemove(tab) {
  // globalCreatedTab = tab.id;
  console.log(tab.id);
}

setInterval(function() {

  //lastFocusedWindow: true
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    for (var i = 0; i < tabs.length; ++i)
    {
        {
          // chrome.tabs.create({ url: 'https://www.jamviet.com' }, callBackOnCreate);
            // chrome.tabs.remove(tabs[i].id, calllbackOnRemove);
        }
    }

});
}, 10000);

*/


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
}, 6000);

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
