function scrolltoBottomOfPage() {
    let checkUserProfile = document.querySelector('div[data-e2e="user-page"]');
    if ( ! checkUserProfile ) return;
    if (document.URL.includes("www.tiktok.com/@")) {
        document.documentElement.scrollTop = document.documentElement.scrollHeight - 3000;
        setTimeout(()=>{
            document.documentElement.scrollTop = document.documentElement.scrollHeight - 300;
        },1000)
    }
}
scrolltoBottomOfPage();
