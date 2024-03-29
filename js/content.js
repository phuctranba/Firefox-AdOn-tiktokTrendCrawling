let extensionReady = false;

chrome.runtime.sendMessage({method: "getLocalStorage", key: "isOn"}, function (response) {
    if (response === "true") {
        extensionReady = true;
    }
});

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.action === 'loadMore') {
        clickLoadMore()
    }
    if (msg.action === 'clickToNextIndustryOption') {
        clickToNextIndustryOption()
    }
    if (msg.action === 'clickToNextPeriodOption') {
        clickToNextPeriodOption()
    }
    if (msg.action === 'clickToShowRelatedVideo') {
        clickToShowRelatedVideo()
    }
    if (msg.action === 'clickToOtherRankTypeSound') {
        clickToOtherRankTypeSound()
    }
});


let listOptionIndustry;
let indexOptionIndustry = 0;

let listOptionPeriod;
let indexOptionPeriod = 4;

function clickLoadMore() {
    console.log("clickLoadMore")
    let btnLoadMore = document.querySelectorAll('div[data-testid="cc_contentArea_viewmore_btn"]');

    if (btnLoadMore.length > 0) {
        // intervalToClickShowMore = setInterval(() => {

        // let itemOfList = document.querySelectorAll('div[id="hashtagItemContainer"]');
        // if (itemOfList.length >= 110) {
        //     clearInterval(intervalToClickShowMore);
        //     let indexToClick = 0;
        //     intervalToClickItem = setInterval(() => {
        //         itemOfList[indexToClick].click()
        //         if (indexToClick === 5) {
        //             clearInterval(intervalToClickItem)
        //         } else {
        //             indexToClick++;
        //         }
        //     }, 1000)
        //     console.log("done industry")
        // } else {
        //     btnLoadMore[0].click();
        // }

        // btnLoadMore[0].click();

        // }, 1000)

        setTimeout(() => {
            btnLoadMore[0].click();
        }, 2000)
    }
}

function clickToNextIndustryOption() {
    console.log("clickToNextIndustryOption")
    indexOptionIndustry = indexOptionIndustry + 1;
    if (listOptionIndustry.length > indexOptionIndustry)
        listOptionIndustry[indexOptionIndustry].click();
}

function clickToNextPeriodOption() {
    console.log("clickToNextPeriodOption")
    indexOptionPeriod = indexOptionPeriod - 1;
    if (indexOptionPeriod >= 0)
        listOptionPeriod[indexOptionPeriod].click();
}

function clickToShowRelatedVideo() {
    console.log("clickToShowRelatedVideo")
    if(String(window.location.href).search("business/creativecenter/hashtag/")>=0){
        document.querySelectorAll('div[class^="user-action-wrap"]')[0].children[1].click()
    }else {
        document.querySelectorAll('div[class^="pcbwrap"]')[0].children[0].click()
    }
}

function clickToOtherRankTypeSound() {
    console.log("clickToOtherRankTypeSound")
    document.querySelectorAll('span[data-testid^="cc_commonCom_tabChange_"]')[1].click()
}

window.addEventListener('load', function () {
    /**
     * if not turn on ... don't work
     */
    if (!extensionReady) return;

    /**!SECTION
     * Jamviet.com improve
     */
    function startCrawl() {
        let listHashtagPageVisible = String(window.location.href).search("business/creativecenter/inspiration/popular/hashtag")
        if (listHashtagPageVisible >= 0) {
            //Xử lý khi là list danh sách hashtag trending
            setTimeout(() => {
                listOptionIndustry = Array.from(document.querySelectorAll('div[class="byted-popover-inner"]')[2].querySelectorAll('div[class="byted-list-item-inner-wrapper byted-select-option-inner-wrapper"]'))
                listOptionIndustry[indexOptionIndustry].click();
            }, 2000)
        } else {

            let listHashtagPageVisible = String(window.location.href).search("business/creativecenter/inspiration/popular/creator")
            if (listHashtagPageVisible >= 0) {
                //Xử lý khi là list danh sách creator trending
                setTimeout(() => {
                    listOptionIndustry = Array.from(document.querySelectorAll('div[class="byted-popover-inner"]')[2].querySelectorAll('div[class="byted-list-item-inner-wrapper byted-select-option-inner-wrapper"]'))
                    listOptionIndustry[listOptionIndustry.length - 1].click();
                }, 2000)
            } else {
                let detailHashtagPageVisible = String(window.location.href).search("business/creativecenter/hashtag/")
                let detailSoundPageVisible = String(window.location.href).search("/business/creativecenter/song/")
                if (detailHashtagPageVisible + detailSoundPageVisible >= 0) {
                    //Xử lý khi là detail hashtag, sound
                    setTimeout(() => {
                        listOptionPeriod = Array.from(document.querySelectorAll('div[class="byted-popover-inner"]')[detailHashtagPageVisible >= 0 ? 2 : 3].querySelectorAll('div[class="byted-list-item-inner-wrapper byted-select-option-inner-wrapper"]'));
                        indexOptionPeriod = listOptionPeriod.length-1;
                        listOptionPeriod[indexOptionPeriod].click();
                    }, 2000)
                }
            }
        }
    }

    startCrawl();
});

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
