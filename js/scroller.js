function scrolltoBottomOfPage() {
    let checkListTag = document.querySelector('div[data-e2e="challenge-item-list"]');
    let checkListMusic = document.querySelector('div[data-e2e="music-item-list"]');
    if ( ! checkListTag && !checkListMusic ) return;
    if (document.URL.includes("https://www.tiktok.com/tag/")||document.URL.includes("https://www.tiktok.com/music/")) {
        document.documentElement.scrollTop = document.documentElement.scrollHeight - 3000;
        setTimeout(()=>{
            document.documentElement.scrollTop = document.documentElement.scrollHeight - 300;
        },1000)
    }
}
scrolltoBottomOfPage();
