function scrolltoBottomOfPage() {
    let checkListTag = document.querySelector('div[data-e2e="challenge-item-list"]');
    if ( ! checkListTag ) return;
    if (document.URL.includes("https://www.tiktok.com/tag/")) {
        document.documentElement.scrollTop = document.documentElement.scrollHeight - 3000;
        setTimeout(()=>{
            document.documentElement.scrollTop = document.documentElement.scrollHeight - 300;
        },1000)
    }
}
scrolltoBottomOfPage();
