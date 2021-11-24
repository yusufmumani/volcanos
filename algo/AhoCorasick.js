/* A Trie node */
class Node {
    parent;
    key;
    ch;
    childLinks;
    childLinksMap;
    suffixLink;
    dictionaryLink;
    isRoot;
    inDict;

    constructor(ch) {
        this.ch = ch;
        this.childLinks = [];
        this.childLinksMap = {};
        this.isRoot = ch === null;
    }

    addChildLink(node) {
        this.childLinks.push(node);
        this.childLinksMap[node.ch.toLowerCase()] = node;
    }
}

class AhoCorasick {
    root;

    constructor(query) {
        this.root = new Node(null);
        let keys = query.split(/\s+/);
        for (let i = 0; i < keys.length; i++) {
            this.createChildLinks(this.root, keys[i], 0);
        }
        this.createSuffixAndDictLinks(this.root);
    }

    createChildLinks(node, key, pos) {
        if (key.length === pos)
            return;
        let child = node.childLinksMap[key[pos].toLowerCase()];
        if (child == null) {
            child = new Node(key[pos]);
            node.addChildLink(child);
        }
        if (!child.inDict) {
            child.inDict = pos === key.length - 1;
            child.key = key;
        }
        this.createChildLinks(child, key, pos + 1);
    }

    createSuffixAndDictLinks(root) {
        let Queue = [root];
        while (Queue.length) {
            let v = Queue.shift();
            let n;
            if (!v.isRoot) {
                if (v.parent === root) {
                    v.suffixLink = root;
                } else {
                    n = v.parent.suffixLink;
                    while (!this.isMyParentOrRoot(n, v))
                        n = n.suffixLink;
                }

                n = v;
                let m = n.suffixLink;
                if (m.inDict)
                    n.dictionaryLink = m;
                else
                    n.dictionaryLink = m.dictionaryLink;
            }

            for (let i = 0; i < v.childLinks.length; i++) {
                let w = v.childLinks[i];
                w.parent = v;
                Queue.push(w);
            }
        }
    }

    isMyParentOrRoot(suffixLink, me) {
        let child = suffixLink.childLinksMap[me.ch.toLowerCase()];
        if (child) {
            me.suffixLink = child;
            return true;
        }
        if (suffixLink.isRoot) {
            me.suffixLink = suffixLink;
            return true;
        }
        return false;
    }

    search(string) {
        var results = [];
        let curr = this.root;
        for (let pos = 0; pos < string.length; pos++) {
            let chAtPos = string[pos];
            if (curr.childLinksMap[chAtPos.toLowerCase()]) {
                curr = curr.childLinksMap[chAtPos.toLowerCase()];
                if (curr.inDict)
                    results.push([[pos - curr.key.length + 1, pos], [string.substring(pos - curr.key.length + 1, pos + 1)]]);

                let dictionaryLink = curr.dictionaryLink;
                while (dictionaryLink) {
                    results.push([[pos - dictionaryLink.key.length + 1, pos], [string.substring(pos - dictionaryLink.key.length + 1, pos + 1)]]);
                    dictionaryLink = dictionaryLink.dictionaryLink;
                }
            } else {
                if (!curr.isRoot && curr.suffixLink) {
                    curr = curr.suffixLink;
                    pos--;
                }
            }
        }
        // Absorb overlaps
        let toBeRemoved = {};
        let toBeRemovedArr = [];
        for (let i = 0; i < results.length; i++)
            for (let j = 0; j < results.length; j++)
                if (i !== j) {
                    let startI = results[i][0][0];
                    let endI = results[i][0][1];
                    let startJ = results[j][0][0];
                    let endJ = results[j][0][1];
                    if (startJ >= startI && endJ <= endI)
                        if (!toBeRemoved[j]) {
                            toBeRemoved[j] = true;
                            toBeRemovedArr.push(j);
                        }

                }

        if (toBeRemovedArr.length) {
            toBeRemovedArr.sort();
            for (let i = toBeRemovedArr.length - 1; i >= 0; i--)
                results.splice(toBeRemovedArr[i], 1);
        }
        return results;
    }
}

module.exports = AhoCorasick;