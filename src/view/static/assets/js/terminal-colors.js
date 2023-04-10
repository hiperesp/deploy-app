/**
 * Modified from https://github.com/rburns/ansi-to-html/blob/master/lib/ansi_to_html.js
 */
function terminalToHtml(input) {
    const defaults = {
        "fg": "#FFF",
        "bg": "#000",
        "newline": false,
        "escapeXML": false,
        "stream": false,
        "colors": {
            "0": "#000",
            "1": "#A00",
            "2": "#0A0",
            "3": "#A50",
            "4": "#00A",
            "5": "#A0A",
            "6": "#0AA",
            "7": "#AAA",
            "8": "#555",
            "9": "#F55",
            "10": "#5F5",
            "11": "#FF5",
            "12": "#55F",
            "13": "#F5F",
            "14": "#5FF",
            "15": "#FFF",
            "16": "#000000",
            "17": "#00005f",
            "18": "#000087",
            "19": "#0000af",
            "20": "#0000d7",
            "21": "#0000ff",
            "22": "#005f00",
            "23": "#005f5f",
            "24": "#005f87",
            "25": "#005faf",
            "26": "#005fd7",
            "27": "#005fff",
            "28": "#008700",
            "29": "#00875f",
            "30": "#008787",
            "31": "#0087af",
            "32": "#0087d7",
            "33": "#0087ff",
            "34": "#00af00",
            "35": "#00af5f",
            "36": "#00af87",
            "37": "#00afaf",
            "38": "#00afd7",
            "39": "#00afff",
            "40": "#00d700",
            "41": "#00d75f",
            "42": "#00d787",
            "43": "#00d7af",
            "44": "#00d7d7",
            "45": "#00d7ff",
            "46": "#00ff00",
            "47": "#00ff5f",
            "48": "#00ff87",
            "49": "#00ffaf",
            "50": "#00ffd7",
            "51": "#00ffff",
            "52": "#5f0000",
            "53": "#5f005f",
            "54": "#5f0087",
            "55": "#5f00af",
            "56": "#5f00d7",
            "57": "#5f00ff",
            "58": "#5f5f00",
            "59": "#5f5f5f",
            "60": "#5f5f87",
            "61": "#5f5faf",
            "62": "#5f5fd7",
            "63": "#5f5fff",
            "64": "#5f8700",
            "65": "#5f875f",
            "66": "#5f8787",
            "67": "#5f87af",
            "68": "#5f87d7",
            "69": "#5f87ff",
            "70": "#5faf00",
            "71": "#5faf5f",
            "72": "#5faf87",
            "73": "#5fafaf",
            "74": "#5fafd7",
            "75": "#5fafff",
            "76": "#5fd700",
            "77": "#5fd75f",
            "78": "#5fd787",
            "79": "#5fd7af",
            "80": "#5fd7d7",
            "81": "#5fd7ff",
            "82": "#5fff00",
            "83": "#5fff5f",
            "84": "#5fff87",
            "85": "#5fffaf",
            "86": "#5fffd7",
            "87": "#5fffff",
            "88": "#870000",
            "89": "#87005f",
            "90": "#870087",
            "91": "#8700af",
            "92": "#8700d7",
            "93": "#8700ff",
            "94": "#875f00",
            "95": "#875f5f",
            "96": "#875f87",
            "97": "#875faf",
            "98": "#875fd7",
            "99": "#875fff",
            "100": "#878700",
            "101": "#87875f",
            "102": "#878787",
            "103": "#8787af",
            "104": "#8787d7",
            "105": "#8787ff",
            "106": "#87af00",
            "107": "#87af5f",
            "108": "#87af87",
            "109": "#87afaf",
            "110": "#87afd7",
            "111": "#87afff",
            "112": "#87d700",
            "113": "#87d75f",
            "114": "#87d787",
            "115": "#87d7af",
            "116": "#87d7d7",
            "117": "#87d7ff",
            "118": "#87ff00",
            "119": "#87ff5f",
            "120": "#87ff87",
            "121": "#87ffaf",
            "122": "#87ffd7",
            "123": "#87ffff",
            "124": "#af0000",
            "125": "#af005f",
            "126": "#af0087",
            "127": "#af00af",
            "128": "#af00d7",
            "129": "#af00ff",
            "130": "#af5f00",
            "131": "#af5f5f",
            "132": "#af5f87",
            "133": "#af5faf",
            "134": "#af5fd7",
            "135": "#af5fff",
            "136": "#af8700",
            "137": "#af875f",
            "138": "#af8787",
            "139": "#af87af",
            "140": "#af87d7",
            "141": "#af87ff",
            "142": "#afaf00",
            "143": "#afaf5f",
            "144": "#afaf87",
            "145": "#afafaf",
            "146": "#afafd7",
            "147": "#afafff",
            "148": "#afd700",
            "149": "#afd75f",
            "150": "#afd787",
            "151": "#afd7af",
            "152": "#afd7d7",
            "153": "#afd7ff",
            "154": "#afff00",
            "155": "#afff5f",
            "156": "#afff87",
            "157": "#afffaf",
            "158": "#afffd7",
            "159": "#afffff",
            "160": "#d70000",
            "161": "#d7005f",
            "162": "#d70087",
            "163": "#d700af",
            "164": "#d700d7",
            "165": "#d700ff",
            "166": "#d75f00",
            "167": "#d75f5f",
            "168": "#d75f87",
            "169": "#d75faf",
            "170": "#d75fd7",
            "171": "#d75fff",
            "172": "#d78700",
            "173": "#d7875f",
            "174": "#d78787",
            "175": "#d787af",
            "176": "#d787d7",
            "177": "#d787ff",
            "178": "#d7af00",
            "179": "#d7af5f",
            "180": "#d7af87",
            "181": "#d7afaf",
            "182": "#d7afd7",
            "183": "#d7afff",
            "184": "#d7d700",
            "185": "#d7d75f",
            "186": "#d7d787",
            "187": "#d7d7af",
            "188": "#d7d7d7",
            "189": "#d7d7ff",
            "190": "#d7ff00",
            "191": "#d7ff5f",
            "192": "#d7ff87",
            "193": "#d7ffaf",
            "194": "#d7ffd7",
            "195": "#d7ffff",
            "196": "#ff0000",
            "197": "#ff005f",
            "198": "#ff0087",
            "199": "#ff00af",
            "200": "#ff00d7",
            "201": "#ff00ff",
            "202": "#ff5f00",
            "203": "#ff5f5f",
            "204": "#ff5f87",
            "205": "#ff5faf",
            "206": "#ff5fd7",
            "207": "#ff5fff",
            "208": "#ff8700",
            "209": "#ff875f",
            "210": "#ff8787",
            "211": "#ff87af",
            "212": "#ff87d7",
            "213": "#ff87ff",
            "214": "#ffaf00",
            "215": "#ffaf5f",
            "216": "#ffaf87",
            "217": "#ffafaf",
            "218": "#ffafd7",
            "219": "#ffafff",
            "220": "#ffd700",
            "221": "#ffd75f",
            "222": "#ffd787",
            "223": "#ffd7af",
            "224": "#ffd7d7",
            "225": "#ffd7ff",
            "226": "#ffff00",
            "227": "#ffff5f",
            "228": "#ffff87",
            "229": "#ffffaf",
            "230": "#ffffd7",
            "231": "#ffffff",
            "232": "#080808",
            "233": "#121212",
            "234": "#1c1c1c",
            "235": "#262626",
            "236": "#303030",
            "237": "#3a3a3a",
            "238": "#444444",
            "239": "#4e4e4e",
            "240": "#585858",
            "241": "#626262",
            "242": "#6c6c6c",
            "243": "#767676",
            "244": "#808080",
            "245": "#8a8a8a",
            "246": "#949494",
            "247": "#9e9e9e",
            "248": "#a8a8a8",
            "249": "#b2b2b2",
            "250": "#bcbcbc",
            "251": "#c6c6c6",
            "252": "#d0d0d0",
            "253": "#dadada",
            "254": "#e4e4e4",
            "255": "#eeeeee"
        }
    };

    /**
     * @param {Array} stack
     * @param {string} token
     * @param {*} data
     * @param {object} options
     */
    function generateOutput(stack, token, data, options) {
        let result;

        if (token === 'text') {
            result = pushText(data, options);
        } else if (token === 'display') {
            result = handleDisplay(stack, data, options);
        } else if (token === 'xterm256Foreground') {
            result = pushForegroundColor(stack, options.colors[data]);
        } else if (token === 'xterm256Background') {
            result = pushBackgroundColor(stack, options.colors[data]);
        } else if (token === 'rgb') {
            result = handleRgb(stack, data);
        }

        return result;
    }

    /**
     * @param {Array} stack
     * @param {string} data
     * @returns {*}
     */
    function handleRgb(stack, data) {
        data = data.substring(2).slice(0, -1);
        const operation = +data.substr(0, 2);

        const color = data.substring(5).split(';');
        const rgb = color.map(function (value) {
            return ('0' + Number(value).toString(16)).substr(-2);
        }).join('');

        return pushStyle(stack, (operation === 38 ? 'color:#' : 'background-color:#') + rgb);
    }

    /**
     * @param {Array} stack
     * @param {number} code
     * @param {object} options
     * @returns {*}
     */
    function handleDisplay(stack, code, options) {
        code = parseInt(code, 10);

        const codeMap = {
            '-1': () => '<br/>',
            0: () => stack.length && resetStyles(stack),
            1: () => pushTag(stack, 'b'),
            3: () => pushTag(stack, 'i'),
            4: () => pushTag(stack, 'u'),
            8: () => pushStyle(stack, 'display:none'),
            9: () => pushTag(stack, 'strike'),
            22: () => pushStyle(stack, 'font-weight:normal;text-decoration:none;font-style:normal'),
            23: () => closeTag(stack, 'i'),
            24: () => closeTag(stack, 'u'),
            39: () => pushForegroundColor(stack, options.fg),
            49: () => pushBackgroundColor(stack, options.bg),
            53: () => pushStyle(stack, 'text-decoration:overline')
        };

        let result;
        if (codeMap[code]) {
            result = codeMap[code]();
        } else if (4 < code && code < 7) {
            result = pushTag(stack, 'blink');
        } else if (29 < code && code < 38) {
            result = pushForegroundColor(stack, options.colors[code - 30]);
        } else if ((39 < code && code < 48)) {
            result = pushBackgroundColor(stack, options.colors[code - 40]);
        } else if ((89 < code && code < 98)) {
            result = pushForegroundColor(stack, options.colors[8 + (code - 90)]);
        } else if ((99 < code && code < 108)) {
            result = pushBackgroundColor(stack, options.colors[8 + (code - 100)]);
        }

        return result;
    }

    /**
     * Clear all the styles
     * @returns {string}
     */
    function resetStyles(stack) {
        const stackClone = stack.slice(0);

        stack.length = 0;

        return stackClone.reverse().map(function (tag) {
            return '</' + tag + '>';
        }).join('');
    }


    /**
     * Returns a new function that is true if value is NOT the same category
     * @param {string} category
     * @returns {function}
     */
    function notCategory(category) {
        return function (e) {
            return (category === null || e.category !== category) && category !== 'all';
        };
    }

    /**
     * Converts a code into an ansi token type
     * @param {number} code
     * @returns {string}
     */
    function categoryForCode(code) {
        code = parseInt(code, 10);
        let result = null;

        if (code === 0) {
            result = 'all';
        } else if (code === 1) {
            result = 'bold';
        } else if ((2 < code && code < 5)) {
            result = 'underline';
        } else if ((4 < code && code < 7)) {
            result = 'blink';
        } else if (code === 8) {
            result = 'hide';
        } else if (code === 9) {
            result = 'strike';
        } else if ((29 < code && code < 38) || code === 39 || (89 < code && code < 98)) {
            result = 'foreground-color';
        } else if ((39 < code && code < 48) || code === 49 || (99 < code && code < 108)) {
            result = 'background-color';
        }

        return result;
    }

    /**
     * @param {string} text
     * @param {object} options
     * @returns {string}
     */
    function pushText(text) {
        return text;
    }

    /**
     * @param {Array} stack
     * @param {string} tag
     * @param {string} [style='']
     * @returns {string}
     */
    function pushTag(stack, tag, style) {
        if (!style) {
            style = '';
        }

        stack.push(tag);

        return `<${tag}${style ? ` style="${style}"` : ''}>`;
    }

    /**
     * @param {Array} stack
     * @param {string} style
     * @returns {string}
     */
    function pushStyle(stack, style) {
        return pushTag(stack, 'span', style);
    }

    function pushForegroundColor(stack, color) {
        return pushTag(stack, 'span', 'color:' + color);
    }

    function pushBackgroundColor(stack, color) {
        return pushTag(stack, 'span', 'background-color:' + color);
    }

    /**
     * @param {Array} stack
     * @param {string} style
     * @returns {string}
     */
    function closeTag(stack, style) {
        let last;

        if (stack.slice(-1)[0] === style) {
            last = stack.pop();
        }

        if (last) {
            return '</' + style + '>';
        }
    }

    /**
     * @param {string} text
     * @param {object} options
     * @param {function} callback
     * @returns {Array}
     */
    function tokenize(text, options, callback) {
        let ansiMatch = false;
        const ansiHandler = 3;

        function remove() {
            return '';
        }

        function removeXterm256Foreground(m, g1) {
            callback('xterm256Foreground', g1);
            return '';
        }

        function removeXterm256Background(m, g1) {
            callback('xterm256Background', g1);
            return '';
        }

        function newline(m) {
            if (options.newline) {
                callback('display', -1);
            } else {
                callback('text', m);
            }

            return '';
        }

        function ansiMess(m, g1) {
            ansiMatch = true;
            if (g1.trim().length === 0) {
                g1 = '0';
            }

            g1 = g1.trimRight(';').split(';');

            for (const g of g1) {
                callback('display', g);
            }

            return '';
        }

        function realText(m) {
            callback('text', m);

            return '';
        }

        function rgb(m) {
            callback('rgb', m);

            return '';
        }

        /* eslint no-control-regex:0 */
        const tokens = [{
            pattern: /^\x08+/,
            sub: remove
        }, {
            pattern: /^\x1b\[[012]?K/,
            sub: remove
        }, {
            pattern: /^\x1b\[\(B/,
            sub: remove
        }, {
            pattern: /^\x1b\[[34]8;2;\d+;\d+;\d+m/,
            sub: rgb
        }, {
            pattern: /^\x1b\[38;5;(\d+)m/,
            sub: removeXterm256Foreground
        }, {
            pattern: /^\x1b\[48;5;(\d+)m/,
            sub: removeXterm256Background
        }, {
            pattern: /^\n/,
            sub: newline
        }, {
            pattern: /^\r+\n/,
            sub: newline
        }, {
            pattern: /^\r/,
            sub: newline
        }, {
            pattern: /^\x1b\[((?:\d{1,3};?)+|)m/,
            sub: ansiMess
        }, {
            // CSI n J
            // ED - Erase in Display Clears part of the screen.
            // If n is 0 (or missing), clear from cursor to end of screen.
            // If n is 1, clear from cursor to beginning of the screen.
            // If n is 2, clear entire screen (and moves cursor to upper left on DOS ANSI.SYS).
            // If n is 3, clear entire screen and delete all lines saved in the scrollback buffer
            //   (this feature was added for xterm and is supported by other terminal applications).
            pattern: /^\x1b\[\d?J/,
            sub: remove
        }, {
            // CSI n ; m f
            // HVP - Horizontal Vertical Position Same as CUP
            pattern: /^\x1b\[\d{0,3};\d{0,3}f/,
            sub: remove
        }, {
            // catch-all for CSI sequences?
            pattern: /^\x1b\[?[\d;]{0,3}/,
            sub: remove
        }, {
            /**
             * extracts real text - not containing:
             * - `\x1b' - ESC - escape (Ascii 27)
             * - '\x08' - BS - backspace (Ascii 8)
             * - `\n` - Newline - linefeed (LF) (ascii 10)
             * - `\r` - Windows Carriage Return (CR)
             */
            pattern: /^(([^\x1b\x08\r\n])+)/,
            sub: realText
        }];

        function process(handler, i) {
            if (i > ansiHandler && ansiMatch) {
                return;
            }

            ansiMatch = false;

            text = text.replace(handler.pattern, handler.sub);
        }

        const results1 = [];
        let {length} = text;

        outer:
        while (length > 0) {
            for (let i = 0, o = 0, len = tokens.length; o < len; i = ++o) {
                const handler = tokens[i];
                process(handler, i);

                if (text.length !== length) {
                    // We matched a token and removed it from the text. We need to
                    // start matching *all* tokens against the new text.
                    length = text.length;
                    continue outer;
                }
            }

            if (text.length === length) {
                break;
            }
            results1.push(0);

            length = text.length;
        }

        return results1;
    }

    /**
     * If streaming, then the stack is "sticky"
     *
     * @param {Array} stickyStack
     * @param {string} token
     * @param {*} data
     * @returns {Array}
     */
    function updateStickyStack(stickyStack, token, data) {
        if (token !== 'text') {
            stickyStack = stickyStack.filter(notCategory(categoryForCode(data)));
            stickyStack.push({token, data, category: categoryForCode(data)});
        }

        return stickyStack;
    }

    function toHtml(input) {
        const options = defaults;
        stack = [];
        stickyStack = [];

        input = typeof input === 'string' ? [input] : input;
        const buf = [];

        this.stickyStack.forEach(element => {
            const output = generateOutput(stack, element.token, element.data, options);

            if (output) {
                buf.push(output);
            }
        });

        tokenize(input.join(''), options, (token, data) => {
            const output = generateOutput(stack, token, data, options);

            if (output) {
                buf.push(output);
            }

            if (options.stream) {
                this.stickyStack = updateStickyStack(this.stickyStack, token, data);
            }
        });

        if (stack.length) {
            buf.push(resetStyles(stack));
        }

        return buf.join('');
    }

    return toHtml(input);
}