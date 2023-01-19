window.addEventListener('load', function () {
    let initStateRun = localStorage.getItem("isOn")
    document.getElementById("btn_switch").innerText = initStateRun === "true" ? "Tắt tool" : "Bật tool";
    document.getElementById("btn_switch").style.background = initStateRun === "true" ? "red" : "green";


    const infoUrl = document.getElementById('open-info');
    infoUrl.addEventListener('click', function () {
        chrome.runtime.sendMessage({action: "open-info"});
        window.close();
    }, false);

    const btnSwitch = document.getElementById('btn_switch');
    btnSwitch.addEventListener('click', function () {

        let stateRun = localStorage.getItem("isOn");

        localStorage.setItem("isOn", (!(stateRun === "true")).toString())
        chrome.storage.local.set({"isOn": (!(stateRun === "true")).toString()})

        document.getElementById("btn_switch").innerText = stateRun === "true" ? "Bật tool" : "Tắt tool";
        document.getElementById("btn_switch").style.background = stateRun === "true" ? "green" : "red";
        browser.tabs.reload();
    }, false);

});
