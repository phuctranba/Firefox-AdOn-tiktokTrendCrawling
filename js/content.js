let extensionReady = false;

chrome.runtime.sendMessage({method: "getLocalStorage", key: "isOn"}, function (response) {
    if (response === "true") {
        extensionReady = true;
    }
});

let intervalCheck;
let intervalIdlePage;

window.addEventListener('load', function () {
    /**
     * if not turn on ... don't work
     */
    if (!extensionReady) return;

    clearInterval(intervalCheck)
    clearInterval(intervalIdlePage)
    let timeToReloadIdle = 1800000 + Math.floor(Math.random() * 100000);
    intervalIdlePage = setInterval(() => {
        window.location.href = 'https://tiktok.com';
    }, timeToReloadIdle)

    /**!SECTION
     * Jamviet.com improve
     */
    intervalCheck = setInterval(function () {
        let searchPageVisible = String(window.location.href).search(/search\?q=/g)
        if (searchPageVisible < 0) {
            return;
        }
        let suggestVideo = document.querySelectorAll('div[data-e2e="search_top-item"]');
        if (suggestVideo.length > 0) {
            let valueSearch = document.querySelectorAll('input[data-e2e="search-user-input"]')[0].value;
            let suggestUsers = document.querySelectorAll('a[data-e2e="search-user-info-container"]');
            let suggestUserNames = document.querySelectorAll('p[data-e2e="search-user-unique-id"]');

            if (suggestUsers.length > 0) {
                let isHasUser = false;

                for (let i = 0; i < suggestUsers.length; i++) {
                    if (suggestUserNames[i].textContent.trim().toLocaleString() == valueSearch.trim().toLocaleString()) {
                        suggestUsers[i].click();
                        isHasUser = true;
                    }
                }

                if (!isHasUser) sendEmptyAccount()
            } else {
                sendEmptyAccount()
            }
        }

    }, 1000);

});

function sendEmptyAccount() {
    chrome.runtime.sendMessage({action: "sendEmptyAccount"}, function (response) {

    });
}

function canvas() {
    try {
        var canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 180;
        canvas.style.display = 'inline';
        var ctx = canvas.getContext('2d');
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = 'rgb(255,0,255)';
        ctx.beginPath();
        ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = 'rgb(255,0,255)';

        ctx.textBaseline = 'alphabetic'
        ctx.fillStyle = '#f60'
        ctx.fillRect(125, 1, 62, 20)
        ctx.fillStyle = '#069'
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)'
        ctx.font = '28pt Arial'
        ctx.fillText('JAMVIET.COM', 4, 45)
        ctx.fillStyle = 'rgb(0,111,255)'
        ctx.beginPath()
        ctx.arc(100, 50, 50, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fill()

        ctx.fillStyle = 'rgb(0,255,255)'
        ctx.beginPath()
        ctx.arc(999, 50, 99, 0, Math.PI * 2, true)
        ctx.closePath()
        ctx.fill()

        ctx.arc(75, 75, 75, 0, Math.PI * 2, true);
        ctx.arc(75, 75, 25, 0, Math.PI * 2, true);
        ctx.fill('evenodd');

        let canvasFingerPrint = canvas.toDataURL();

        if (!canvasFingerPrint) {
            return false;
        }

        chrome.runtime.sendMessage({method: "setFingerPrint", key: canvasFingerPrint}, function (response) {
        })
    } catch (e) {
        return false;
    }
}

canvas();
