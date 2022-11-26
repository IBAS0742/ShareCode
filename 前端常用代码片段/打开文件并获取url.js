function openFileAndGetUrl() {
    function getObjectURL(file) {
        var url = null
        if (window.createObjectURL != undefined) { // basic
            url = window.createObjectURL(file)
        } else if (window.URL != undefined) { // mozilla(firefox)
            url = window.URL.createObjectURL(file)
        } else if (window.webkitURL != undefined) { // webkit or chrome
            url = window.webkitURL.createObjectURL(file)
        }
        return url;
    }
    let inp = document.createElement('input');
    inp.style.display = 'none';
    inp.type = 'file';
    document.body.appendChild(inp);
    inp.onchange = function () {
        if (inp.files.length) {
            console.log(getObjectURL(inp.files[0]));
        }
        inp.remove();
    }
    inp.click();
}