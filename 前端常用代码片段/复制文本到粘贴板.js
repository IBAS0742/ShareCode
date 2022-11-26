function copy(text) {
    var input = document.createElement('input');
    input.setAttribute('readonly', 'readonly'); // 防止手机上弹出软键盘
    input.setAttribute('value', text);
    document.body.appendChild(input);
    // input.setSelectionRange(0, 9999);
    input.select();
    var res = document.execCommand('copy');
    document.body.removeChild(input);
    return res;
}