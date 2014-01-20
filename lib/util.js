/*jslint plusplus: true, devel: true, nomen: true, node: true, indent: 4, maxerr: 50 */

"use strict";

exports.createStore = function (name, opts) {
    switch (name) {
    case "memory":
    case "redis":
        name = "./stores/" + name;
        break;
    }
    return new (require(name))(opts);
};


/// <summary>
///   Generates a regular expression from the given wildcard string.
/// </summary>
/// <param name="pat" type="String">
///   A string that may contain wildcard characters, which will later be
///   used to test another string:
///       To match zero or more characters either "*" or "%" may be used.
///       To match a single digit "#" may be used.
///       To match a character with special meaning, you must precede it
///         with "~".  The "~" also serves as the escape character.
///       To match one of a specific list of characters, you may surround
///         the character with square brackets.
///       To match any character but what is in the list, you must place a
///         "!" after the opening square bracket ("[").
///       Use the ""
///         symbol to indicate the end of one.
/// </param>
/// <param name="opts" type="String" optional="true">
///   Optional.  The string of characters, each representing a single option:
///       "a" specifies that the pattern must match the entire string.
///       "b" specifies that the pattern must match the beginning of the string.
///       "e" specifies that the pattern must match the end of the string.
///       "g" specifies that the expression will be used to match every part of the string that matches the pattern.
///       "i" specifies that letter casing will be ignored.
///       "l" causes the expression to match the longest strings possible.
///       "m" changes the meaning of using the "a", "b", and "e" options so that the endpoints will pertain to lines  instead of the entire string.
///       "o" causes the curly braces to represent how many times the preceeding character or group may appear.
///       "p" causes parentheses to serve a grouping indicators.
/// </param>
/// <returns type="RegExp">
///   A regular expression, equivalent to the specified wildcard string.
/// </returns>
exports.regExpFromWildExp = function (pat, opts) {
    var oOpt = opts && opts.indexOf("o") > -1,
        i,
        m,
        p = "",
        sAdd = (opts && opts.indexOf("l") > -1 ? "" : "?"),
        re = new RegExp("~.|\\[!|" + (oOpt ? "{\\d+,?\\d*\\}|[" : "[") + (opts && opts.indexOf("p") > -1 ? "" : "\\(\\)") + "\\{\\}\\\\\\.\\*\\+\\?\\:\\|\\^\\$%_#<>]");

    while ((i = pat.search(re)) > -1 && i < pat.length) {
        p += pat.substring(0, i);
        if ((m = pat.match(re)[0]) === "[!") {
            p += "[^";
        } else if (m.charAt(0) === "~") {
            p += "\\" + m.charAt(1);
        } else if (m === "*" || m === "%") {
            p += ".*" + sAdd;
        } else if (m === "?" || m === "_") {
            p += ".";
        } else if (m === "#") {
            p += "\\d";
        } else if (oOpt && m.charAt(0) === "{") {
            p += m + sAdd;
        } else if (m === "<") {
            p += "\\b(?=\\w)";
        } else if (m === ">") {
            p += "(?:\\b$|(?=\\W)\\b)";
        } else {
            p += "\\" + m;
        }
        pat = pat.substring(i + m.length);
    }

    p += pat;
    if (opts) {
        if (/[ab]/.test(opts)) {
            p = "^" + p;
        }
        if (/[ae]/.test(opts)) {
            p += "$";
        }
    }
    return new RegExp(p, opts ? opts.replace(/[^gim]/g, "") : "");
};
