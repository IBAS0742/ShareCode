let timeUtils = (function () {
    let d = new Date();
    return {
        ts2YMD(ts) {
            d.setTime(ts);
            return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
        },
        // 0 => 0:30
        // 1 => 1:00
        ind2HalfHour(ind) {
            return `${parseInt(ind / 2)}:${ind % 2 ? '00' : '30'}`
        }
    }
})();
let getFlag = (function () {
    let strs = '.,';
    for (let i = 0;i < 26;i++) {
        strs += String.fromCharCode(97 + i);
        strs += String.fromCharCode(65 + i);
    }
    for (let i = 0;i < 10;i++) {
        strs += String.fromCharCode(48 + i);
    }
    let zs = '000000';
    function tolen(s) {
        s = s + '';
        if (s.length < 6) {
            return zs.substring(s.length) + s;
        }
        return s;
    }
    // 000001 => 'a'
    return {
        encode:function (flags) {
            let f = '';
            flags = flags.join('');
            for (let i = 0;i < 48;i += 6) {
                f += strs[parseInt(flags.substring(i, i + 6),'2')];
            }
            return f;
        },
        // 'a' => 000001
        decode:function (flags) {
            let date = timeUtils.ts2YMD(flags.date);
            let list = flags.record.split('').map(_ => strs.indexOf(_))
                .map(_ => tolen(_.toString(2)).split('').map(_=>+_))
                .flatMap(_=>_);
            return {
                list: list,
                time: list.map((_,ind) => `${date} ${timeUtils.ind2HalfHour(ind)}`)
            };
        }
    };
})();