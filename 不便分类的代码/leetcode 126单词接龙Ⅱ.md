[题目](https://leetcode.cn/problems/word-ladder-ii/)

[bilibili](https://www.bilibili.com/read/preview/17711592)

```javascript

var maxDist = 500;
var dist = [];
function Relative(_parent,_child,_pind,strs) {
    this.p = [_parent];
    this.c = _child;
    this.pind = [_pind];
}
var getDist = function(w1,w2) {
    if (w1.length === w2.length) {
        w1 = w1.split('');
        let dif = w2.split('').filter((w,ind) => w !== w1[ind]);
        if (dif.length === 1) {
            return 1;
        } else {
            return maxDist;
        }
    } else {
        return maxDist;
    }
};

var findLand = function (fromIndex,endIndex) {
    let hash = {};
    // 讲 Relative(p,c,pind) => 改成 [p,c,pind]
    let visitNodes = [];    // 祖父级节点
    let parentNodes = [fromIndex];   // 当前的父级节点
    let childNodes = [];    // 当前的子节点
    let relativeRecords = [[]];
    while (parentNodes.length) {
        let tmp = [];
        for (let i = 0;i < parentNodes.length;i++) {
            let _parent = parentNodes[i];
            for (let j = 0;j < dist.length;j++) {
                // 对角线、无穷大距离、已经是祖父级的节点、或者已经在当前的父级节点中了，都不要了
                if (!(j === _parent || dist[_parent][j] === maxDist || visitNodes.includes(j) || parentNodes.includes(j))) {
                    let hash_key = `${j}_${_parent}`;
                    if (hash_key in hash) {
                        tmp[hash[hash_key]].pind.push(i);
                        tmp[hash[hash_key]].p.push(_parent);
                    } else {
                        childNodes.push(j);
                        tmp.push(new Relative(_parent,j,i))
                        hash[hash_key] = tmp.length - 1;
                    }
                    // childNodes.push(j);
                    // tmp.push(new Relative(_parent,j,i))
                    // tmp.push([_parent,j,i])
                }
            }
        }
        if (tmp.length) {
            relativeRecords.push(tmp);
        }
        visitNodes = visitNodes.concat(...parentNodes);
        if (childNodes.includes(endIndex)) {
            break;
        }
        parentNodes = childNodes;
        childNodes = [];
    }
    // relativeRecords.reverse();
    let result = [];
    let level = relativeRecords.length - 1;
    let l = level;
    // console.log(dist.map(_ => _.join('\t')).join('\r\n'));
    // console.log(JSON.stringify(relativeRecords,'','\t'));
    let tmpResult = [];
    if (relativeRecords.length === 1) {
        return [];
    }
    let getStrings = function (level,pind) {
        if (!level) {
            tmpResult.push(fromIndex)
            result.push(JSON.parse(JSON.stringify(tmpResult)).reverse());
            tmpResult.pop();
        } else if (pind === -1) {
            for (let i = 0;i < relativeRecords[level].length;i++) {
                tmpResult = [];
                let rr = relativeRecords[level][i];
                if (rr.c !== endIndex) {
                    continue;
                }
                for (let j = 0;j < rr.pind.length;j++) {
                    tmpResult.push(rr.c);
                    getStrings(level - 1,rr.pind[j]);
                    tmpResult.pop();
                }
            }
        } else {
            let rr = relativeRecords[level][pind];
            for (let j = 0;j < rr.pind.length;j++) {
                tmpResult.push(rr.c);
                getStrings(level - 1,rr.pind[j]);
                tmpResult.pop();
            }
        }
    };
    getStrings(level,-1);
    // // console.log(relativeRecords);
    return result;
}

/**
 * @param {string} beginWord
 * @param {string} endWord
 * @param {string[]} wordList
 * @return {string[][]}
 */
var findLadders = function(beginWord, endWord, wordList) {
    if (!wordList.includes(beginWord)) {
        wordList.push(beginWord);
    }
    if (!wordList.includes(endWord)) {
        return [];
    }
    let size = wordList.length;
    let i = 0,j = 0;
    dist = [];
    for (i = 0;i < size;i++) {
        let row = [];
        for (j = 0;j < i;j++) {
            row.push(dist[j][i]);
        }
        row.push(maxDist);
        for (j = i + 1;j < size;j++) {
            row.push(getDist(wordList[i],wordList[j]));
        }
        dist.push(row);
    }
    let fromIndex = wordList.indexOf(beginWord);
    let endIndex = wordList.indexOf(endWord);
    let ret = findLand(fromIndex,endIndex);
    // console.log(minLandRecord.map(_ => _.map(__ => wordList[__])));
    return ret.map(_ => _.map(__ => wordList[__]));
};
```