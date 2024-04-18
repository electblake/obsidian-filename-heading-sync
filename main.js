'use strict';

var obsidian = require('obsidian');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

function isExcalidraw(app, f) {
    if (f.extension === 'excalidraw' || /.*\.excalidraw\.md$/g.test(f.path)) {
        return true;
    }
    var fileCache = app.metadataCache.getFileCache(f);
    return (!!(fileCache === null || fileCache === void 0 ? void 0 : fileCache.frontmatter) && !!fileCache.frontmatter['excalidraw-plugin']);
}
function isKanban(app, f) {
    var fileCache = app.metadataCache.getFileCache(f);
    return (!!(fileCache === null || fileCache === void 0 ? void 0 : fileCache.frontmatter) && !!fileCache.frontmatter['kanban-plugin']);
}
function isExcluded(app, f) {
    if (isExcalidraw(app, f)) {
        return true;
    }
    if (isKanban(app, f)) {
        return true;
    }
    return false;
}

var stockIllegalSymbols = /[\\/:|#^[\]]/g;
var DEFAULT_SETTINGS = {
    userIllegalSymbols: [],
    ignoredFiles: {},
    ignoreRegex: '',
    useFileOpenHook: true,
    useFileSaveHook: true,
    newHeadingStyle: "Prefix" /* Prefix */,
    replaceStyle: false,
    underlineString: '===',
    keepFilenamePrefix: false,
    filenamePrefixRegexRules: [
        ['timestamp', '^[0-9]{12}\\s*', false],
        ['zettelkasten', '^[A-Za-z0-9]+\\s+-\\s*', false] // work1a3ba3 - My Work Note 
    ],
    filenamePrefixSaveHistory: false,
};
var FilenameHeadingSyncPlugin = /** @class */ (function (_super) {
    __extends(FilenameHeadingSyncPlugin, _super);
    function FilenameHeadingSyncPlugin() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.isRenameInProgress = false;
        return _this;
    }
    FilenameHeadingSyncPlugin.prototype.onload = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.loadSettings()];
                    case 1:
                        _a.sent();
                        this.registerEvent(this.app.vault.on('rename', function (file, oldPath) {
                            if (_this.settings.useFileSaveHook) {
                                return _this.handleSyncFilenameToHeading(file, oldPath);
                            }
                        }));
                        this.registerEvent(this.app.vault.on('modify', function (file) {
                            if (_this.settings.useFileSaveHook) {
                                return _this.handleSyncHeadingToFile(file);
                            }
                        }));
                        this.registerEvent(this.app.workspace.on('file-open', function (file) {
                            if (_this.settings.useFileOpenHook && file !== null) {
                                return _this.handleSyncFilenameToHeading(file, file.path);
                            }
                        }));
                        this.addSettingTab(new FilenameHeadingSyncSettingTab(this.app, this));
                        this.addCommand({
                            id: 'page-heading-sync-ignore-file',
                            name: 'Ignore current file',
                            checkCallback: function (checking) {
                                var leaf = _this.app.workspace.activeLeaf;
                                if (leaf) {
                                    if (!checking) {
                                        _this.settings.ignoredFiles[_this.app.workspace.getActiveFile().path] = null;
                                        _this.saveSettings();
                                    }
                                    return true;
                                }
                                return false;
                            },
                        });
                        this.addCommand({
                            id: 'sync-filename-to-heading',
                            name: 'Sync Filename to Heading',
                            editorCallback: function (editor, view) {
                                return _this.forceSyncFilenameToHeading(view.file);
                            },
                        });
                        this.addCommand({
                            id: 'sync-heading-to-filename',
                            name: 'Sync Heading to Filename',
                            editorCallback: function (editor, view) {
                                return _this.forceSyncHeadingToFilename(view.file);
                            },
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    FilenameHeadingSyncPlugin.prototype.fileIsIgnored = function (activeFile, path) {
        // check exclusions
        if (isExcluded(this.app, activeFile)) {
            return true;
        }
        // check manual ignore
        if (this.settings.ignoredFiles[path] !== undefined) {
            return true;
        }
        // check regex
        try {
            if (this.settings.ignoreRegex === '') {
                return;
            }
            var reg = new RegExp(this.settings.ignoreRegex);
            return reg.exec(path) !== null;
        }
        catch (_a) { }
        return false;
    };
    /**
     * Renames the file with the first heading found
     *
     * @param      {TAbstractFile}  file    The file
     */
    FilenameHeadingSyncPlugin.prototype.handleSyncHeadingToFile = function (file) {
        if (!(file instanceof obsidian.TFile)) {
            return;
        }
        if (file.extension !== 'md') {
            // just bail
            return;
        }
        // if currently opened file is not the same as the one that fired the event, skip
        // this is to make sure other events don't trigger this plugin
        if (this.app.workspace.getActiveFile() !== file) {
            return;
        }
        // if ignored, just bail
        if (this.fileIsIgnored(file, file.path)) {
            return;
        }
        this.forceSyncHeadingToFilename(file);
    };
    FilenameHeadingSyncPlugin.prototype.forceSyncHeadingToFilename = function (file) {
        var _this = this;
        this.app.vault.read(file).then(function (data) { return __awaiter(_this, void 0, void 0, function () {
            var lines, start, heading, sanitizedHeading, prefix, newPath;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        lines = data.split('\n');
                        start = this.findNoteStart(lines);
                        heading = this.findHeading(lines, start);
                        if (heading === null)
                            return [2 /*return*/]; // no heading found, nothing to do here
                        sanitizedHeading = this.sanitizeHeading(heading.text);
                        // If Keep Filename Prefixes is enabled, check if the prefix is already in the heading and add if not
                        if (this.settings.keepFilenamePrefix) {
                            prefix = this.getFilenamePrefix(file);
                            // check if prefix is already in heading
                            if (!sanitizedHeading.startsWith(prefix) && sanitizedHeading.length > 0) {
                                sanitizedHeading = prefix.trim() + " " + sanitizedHeading.trim();
                            }
                        }
                        if (!(sanitizedHeading.length > 0 &&
                            this.sanitizeHeading(file.basename).length > 0 &&
                            this.sanitizeHeading(file.basename) !== sanitizedHeading)) return [3 /*break*/, 2];
                        newPath = file.parent.path + "/" + sanitizedHeading + ".md";
                        // check if new filename is just going to be empty title with prefix
                        if (this.settings.keepFilenamePrefix && sanitizedHeading === this.getFilenamePrefix(file)) {
                            // just bail
                            return [2 /*return*/];
                        }
                        this.isRenameInProgress = true;
                        return [4 /*yield*/, this.app.fileManager.renameFile(file, newPath)];
                    case 1:
                        _a.sent();
                        this.isRenameInProgress = false;
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Syncs the current filename to the first heading
     * Finds the first heading of the file, then replaces it with the filename
     *
     * @param      {TAbstractFile}  file     The file that fired the event
     * @param      {string}         oldPath  The old path
     */
    FilenameHeadingSyncPlugin.prototype.handleSyncFilenameToHeading = function (file, oldPath) {
        if (this.isRenameInProgress) {
            return;
        }
        if (!(file instanceof obsidian.TFile)) {
            return;
        }
        if (file.extension !== 'md') {
            // just bail
            return;
        }
        // if oldpath is ignored, hook in and update the new filepath to be ignored instead
        if (this.fileIsIgnored(file, oldPath.trim())) {
            // if filename didn't change, just bail, nothing to do here
            if (file.path === oldPath) {
                return;
            }
            // If filepath changed and the file was in the ignore list before,
            // remove it from the list and add the new one instead
            if (this.settings.ignoredFiles[oldPath]) {
                delete this.settings.ignoredFiles[oldPath];
                this.settings.ignoredFiles[file.path] = null;
                this.saveSettings();
            }
            return;
        }
        this.forceSyncFilenameToHeading(file);
    };
    FilenameHeadingSyncPlugin.prototype.forceSyncFilenameToHeading = function (file) {
        var _this = this;
        var prefix = this.getFilenamePrefix(file);
        var sanitizedHeading = this.sanitizeHeading(file.basename, prefix);
        this.app.vault.read(file).then(function (data) {
            var lines = data.split('\n');
            var start = _this.findNoteStart(lines);
            var heading = _this.findHeading(lines, start);
            if (heading !== null && sanitizedHeading.length > 0) {
                if (_this.sanitizeHeading(heading.text, prefix) !== sanitizedHeading) {
                    _this.replaceHeading(file, lines, heading.lineNumber, heading.style, sanitizedHeading);
                }
            }
            else if (sanitizedHeading.length > 0) {
                _this.insertHeading(file, lines, start, sanitizedHeading);
            }
        });
    };
    /**
     * Finds the start of the note file, excluding frontmatter
     *
     * @param {string[]} fileLines array of the file's contents, line by line
     * @returns {number} zero-based index of the starting line of the note
     */
    FilenameHeadingSyncPlugin.prototype.findNoteStart = function (fileLines) {
        // check for frontmatter by checking if first line is a divider ('---')
        if (fileLines[0] === '---') {
            // find end of frontmatter
            // if no end is found, then it isn't really frontmatter and function will end up returning 0
            for (var i = 1; i < fileLines.length; i++) {
                if (fileLines[i] === '---') {
                    // end of frontmatter found, next line is start of note
                    return i + 1;
                }
            }
        }
        return 0;
    };
    /**
     * Finds the first heading of the note file
     *
     * @param {string[]} fileLines array of the file's contents, line by line
     * @param {number} startLine zero-based index of the starting line of the note
     * @returns {LinePointer | null} LinePointer to heading or null if no heading found
     */
    FilenameHeadingSyncPlugin.prototype.findHeading = function (fileLines, startLine) {
        for (var i = startLine; i < fileLines.length; i++) {
            if (fileLines[i].startsWith('# ')) {
                return {
                    lineNumber: i,
                    text: fileLines[i].substring(2),
                    style: "Prefix" /* Prefix */,
                };
            }
            else {
                if (fileLines[i + 1] !== undefined &&
                    fileLines[i + 1].match(/^=+$/) !== null) {
                    return {
                        lineNumber: i,
                        text: fileLines[i],
                        style: "Underline" /* Underline */,
                    };
                }
            }
        }
        return null; // no heading found
    };
    FilenameHeadingSyncPlugin.prototype.regExpEscape = function (str) {
        return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    };
    /**
     * Gets the prefix of a file, if any.
     *
     * @param {TFile} file the file to get the prefix from
     * @returns {string} prefix of the file, or an empty string if no prefix is found
     */
    FilenameHeadingSyncPlugin.prototype.getFilenamePrefix = function (file) {
        // const prefixOptions = [
        //   ['timestamp', new RegExp(/^[0-9]+\s/)],
        //   ['zk', new RegExp(/^.*\s-\s/)]
        // ];
        var prefixOptions = this.settings.filenamePrefixRegexRules;
        if (!this.settings.keepFilenamePrefix) {
            return '';
        }
        var filename = file.basename;
        for (var _i = 0, prefixOptions_1 = prefixOptions; _i < prefixOptions_1.length; _i++) {
            var option = prefixOptions_1[_i];
            var nameString = option[0], regexString = option[1];
            var name_1 = nameString.trim();
            var regex = new RegExp(regexString);
            var matches = filename.match(regex);
            if (matches && matches[0]) {
                console.log('prefix matched!', name_1, regexString, filename, matches);
                return matches[0];
            }
            else {
                console.log('prefix no match', name_1, regexString, filename);
            }
        }
        // no prefix found
        return '';
    };
    FilenameHeadingSyncPlugin.prototype.sanitizeHeading = function (text, prefix) {
        var _this = this;
        // stockIllegalSymbols is a regExp object, but userIllegalSymbols is a list of strings and therefore they are handled separately.
        text = text.replace(stockIllegalSymbols, '');
        var userIllegalSymbolsEscaped = this.settings.userIllegalSymbols.map(function (str) { return _this.regExpEscape(str); });
        var userIllegalSymbolsRegExp = new RegExp(userIllegalSymbolsEscaped.join('|'), 'g');
        text = text.replace(userIllegalSymbolsRegExp, '');
        // if prefix protection is turned on, remove prefix from heading
        if (this.settings.keepFilenamePrefix && prefix) {
            text = text.replace(prefix, '');
            console.log('sanitizeHeading', 'text', text);
        }
        return text.trim();
    };
    /**
     * Insert the `heading` at `lineNumber` in `file`.
     *
     * @param {TFile} file the file to modify
     * @param {string[]} fileLines array of the file's contents, line by line
     * @param {number} lineNumber zero-based index of the line to replace
     * @param {string} text the new text
     */
    FilenameHeadingSyncPlugin.prototype.insertHeading = function (file, fileLines, lineNumber, heading) {
        var newStyle = this.settings.newHeadingStyle;
        switch (newStyle) {
            case "Underline" /* Underline */: {
                this.insertLineInFile(file, fileLines, lineNumber, "" + heading);
                this.insertLineInFile(file, fileLines, lineNumber + 1, this.settings.underlineString);
                break;
            }
            case "Prefix" /* Prefix */: {
                this.insertLineInFile(file, fileLines, lineNumber, "# " + heading);
                break;
            }
        }
    };
    /**
     * Modified `file` by replacing the heading at `lineNumber` with `newHeading`,
     * updating the heading style according the user settings.
     *
     * @param {TFile} file the file to modify
     * @param {string[]} fileLines array of the file's contents, line by line
     * @param {number} lineNumber zero-based index of the line to replace
     * @param {HeadingStyle} oldStyle the style of the original heading
     * @param {string} text the new text
     */
    FilenameHeadingSyncPlugin.prototype.replaceHeading = function (file, fileLines, lineNumber, oldStyle, newHeading) {
        var newStyle = this.settings.newHeadingStyle;
        var replaceStyle = this.settings.replaceStyle;
        // If replacing the style
        if (replaceStyle) {
            switch (newStyle) {
                // For underline style, replace heading line...
                case "Underline" /* Underline */: {
                    this.replaceLineInFile(file, fileLines, lineNumber, "" + newHeading);
                    //..., then add or replace underline.
                    switch (oldStyle) {
                        case "Prefix" /* Prefix */: {
                            this.insertLineInFile(file, fileLines, lineNumber + 1, this.settings.underlineString);
                            break;
                        }
                        case "Underline" /* Underline */: {
                            // Update underline with setting.
                            this.replaceLineInFile(file, fileLines, lineNumber + 1, this.settings.underlineString);
                            break;
                        }
                    }
                    break;
                }
                // For prefix style, replace heading line, and possibly delete underline
                case "Prefix" /* Prefix */: {
                    this.replaceLineInFile(file, fileLines, lineNumber, "# " + newHeading);
                    switch (oldStyle) {
                        case "Prefix" /* Prefix */: {
                            // nop
                            break;
                        }
                        case "Underline" /* Underline */: {
                            this.replaceLineInFile(file, fileLines, lineNumber + 1, '');
                            break;
                        }
                    }
                    break;
                }
            }
        }
        else {
            // If not replacing style, match
            switch (oldStyle) {
                case "Underline" /* Underline */: {
                    this.replaceLineInFile(file, fileLines, lineNumber, "" + newHeading);
                    break;
                }
                case "Prefix" /* Prefix */: {
                    this.replaceLineInFile(file, fileLines, lineNumber, "# " + newHeading);
                    break;
                }
            }
        }
    };
    /**
     * Modifies the file by replacing a particular line with new text.
     *
     * The function will add a newline character at the end of the replaced line.
     *
     * If the `lineNumber` parameter is higher than the index of the last line of the file
     * the function will add a newline character to the current last line and append a new
     * line at the end of the file with the new text (essentially a new last line).
     *
     * @param {TFile} file the file to modify
     * @param {string[]} fileLines array of the file's contents, line by line
     * @param {number} lineNumber zero-based index of the line to replace
     * @param {string} text the new text
     */
    FilenameHeadingSyncPlugin.prototype.replaceLineInFile = function (file, fileLines, lineNumber, text) {
        if (lineNumber >= fileLines.length) {
            fileLines.push(text + '\n');
        }
        else {
            fileLines[lineNumber] = text;
        }
        var data = fileLines.join('\n');
        this.app.vault.modify(file, data);
    };
    /**
     * Modifies the file by inserting a line with specified text.
     *
     * The function will add a newline character at the end of the inserted line.
     *
     * @param {TFile} file the file to modify
     * @param {string[]} fileLines array of the file's contents, line by line
     * @param {number} lineNumber zero-based index of where the line should be inserted
     * @param {string} text the text that the line shall contain
     */
    FilenameHeadingSyncPlugin.prototype.insertLineInFile = function (file, fileLines, lineNumber, text) {
        if (lineNumber >= fileLines.length) {
            fileLines.push(text + '\n');
        }
        else {
            fileLines.splice(lineNumber, 0, text);
        }
        var data = fileLines.join('\n');
        this.app.vault.modify(file, data);
    };
    FilenameHeadingSyncPlugin.prototype.loadSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = this;
                        _c = (_b = Object).assign;
                        _d = [{}, DEFAULT_SETTINGS];
                        return [4 /*yield*/, this.loadData()];
                    case 1:
                        _a.settings = _c.apply(_b, _d.concat([_e.sent()]));
                        return [2 /*return*/];
                }
            });
        });
    };
    FilenameHeadingSyncPlugin.prototype.saveSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // this.settings.filenamePrefixRegexRules = this.settings.filenamePrefixRegexRules.filter((rule) => {
                    //   return typeof rule[0] === 'string' && typeof rule[1] === 'string' && rule.length === 3
                    // })
                    return [4 /*yield*/, this.saveData(this.settings)];
                    case 1:
                        // this.settings.filenamePrefixRegexRules = this.settings.filenamePrefixRegexRules.filter((rule) => {
                        //   return typeof rule[0] === 'string' && typeof rule[1] === 'string' && rule.length === 3
                        // })
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FilenameHeadingSyncPlugin;
}(obsidian.Plugin));
var FilenameHeadingSyncSettingTab = /** @class */ (function (_super) {
    __extends(FilenameHeadingSyncSettingTab, _super);
    function FilenameHeadingSyncSettingTab(app, plugin) {
        var _this = _super.call(this, app, plugin) || this;
        _this.plugin = plugin;
        _this.app = app;
        return _this;
    }
    FilenameHeadingSyncSettingTab.prototype.display = function () {
        var _this = this;
        var containerEl = this.containerEl;
        var regexIgnoredFilesDiv;
        var renderRegexIgnoredFiles = function (div) {
            // empty existing div
            div.innerHTML = '';
            if (_this.plugin.settings.ignoreRegex === '') {
                return;
            }
            if (!_this.plugin.settings.filenamePrefixRegexRules) {
                _this.plugin.settings.filenamePrefixRegexRules = [];
            }
            try {
                var files = _this.app.vault.getFiles();
                var reg_1 = new RegExp(_this.plugin.settings.ignoreRegex);
                files
                    .filter(function (file) { return reg_1.exec(file.path) !== null; })
                    .forEach(function (el) {
                    new obsidian.Setting(div).setDesc(el.path);
                });
            }
            catch (e) {
                return;
            }
        };
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Filename Heading Sync' });
        containerEl.createEl('p', {
            text: 'This plugin will overwrite the first heading found in a file with the filename.',
        });
        containerEl.createEl('p', {
            text: 'If no header is found, will insert a new one at the first line (after frontmatter).',
        });
        new obsidian.Setting(containerEl)
            .setName('Custom Illegal Characters/Strings')
            .setDesc('Type characters/strings separated by a comma. This input is space sensitive.')
            .addText(function (text) {
            return text
                .setPlaceholder('[],#,...')
                .setValue(_this.plugin.settings.userIllegalSymbols.join())
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.plugin.settings.userIllegalSymbols = value.split(',');
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        new obsidian.Setting(containerEl)
            .setName('Ignore Regex Rule')
            .setDesc('Ignore rule in RegEx format. All files listed below will get ignored by this plugin.')
            .addText(function (text) {
            return text
                .setPlaceholder('MyFolder/.*')
                .setValue(_this.plugin.settings.ignoreRegex)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            try {
                                new RegExp(value);
                                this.plugin.settings.ignoreRegex = value;
                            }
                            catch (_b) {
                                this.plugin.settings.ignoreRegex = '';
                            }
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            renderRegexIgnoredFiles(regexIgnoredFilesDiv);
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        new obsidian.Setting(containerEl)
            .setName('Use File Open Hook')
            .setDesc('Whether this plugin should trigger when a file is opened, and not just on save. Disable this when you notice conflicts with other plugins that also act on file open.')
            .addToggle(function (toggle) {
            return toggle
                .setValue(_this.plugin.settings.useFileOpenHook)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.plugin.settings.useFileOpenHook = value;
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        new obsidian.Setting(containerEl)
            .setName('Use File Save Hook')
            .setDesc('Whether this plugin should trigger when a file is saved. Disable this when you want to trigger sync only manually.')
            .addToggle(function (toggle) {
            return toggle
                .setValue(_this.plugin.settings.useFileSaveHook)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.plugin.settings.useFileSaveHook = value;
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        new obsidian.Setting(containerEl)
            .setName('New Heading Style')
            .setDesc('Which Markdown heading style to use when creating new headings: Prefix ("# Heading") or Underline ("Heading\\n===").')
            .addDropdown(function (cb) {
            return cb
                .addOption("Prefix" /* Prefix */, 'Prefix')
                .addOption("Underline" /* Underline */, 'Underline')
                .setValue(_this.plugin.settings.newHeadingStyle)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (value === 'Prefix') {
                                this.plugin.settings.newHeadingStyle = "Prefix" /* Prefix */;
                            }
                            if (value === 'Underline') {
                                this.plugin.settings.newHeadingStyle = "Underline" /* Underline */;
                            }
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        new obsidian.Setting(containerEl)
            .setName('Replace Heading Style')
            .setDesc('Whether this plugin should replace existing heading styles when updating headings.')
            .addToggle(function (toggle) {
            return toggle
                .setValue(_this.plugin.settings.replaceStyle)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.plugin.settings.replaceStyle = value;
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        new obsidian.Setting(containerEl)
            .setName('Underline String')
            .setDesc('The string to use when insert Underline-style headings; should be some number of "="s.')
            .addText(function (text) {
            return text
                .setPlaceholder('===')
                .setValue(_this.plugin.settings.underlineString)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.plugin.settings.underlineString = value;
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        new obsidian.Setting(containerEl)
            .setName('Keep Filename Prefixes')
            .setDesc('Unique Notes, ZettelKasten, and other note organization schemes use prefixes to keep notes in order. If you want to keep these prefixes in your filenames but NOT headings, enable this setting.')
            .addToggle(function (toggle) {
            return toggle
                .setValue(_this.plugin.settings.keepFilenamePrefix)
                .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.plugin.settings.keepFilenamePrefix = value;
                            return [4 /*yield*/, this.plugin.saveSettings()];
                        case 1:
                            _a.sent();
                            this.display();
                            return [2 /*return*/];
                    }
                });
            }); });
        });
        if (this.plugin.settings.keepFilenamePrefix) {
            containerEl.createEl('h2', { text: 'Filename Prefix Regex Rules' });
            var desc = document.createDocumentFragment();
            desc.append('Filename prefix regex rules to match your note naming convention(s).');
            new obsidian.Setting(containerEl).setDesc(desc);
            this.plugin.settings.filenamePrefixRegexRules = this.plugin.settings.filenamePrefixRegexRules || [];
            console.log('this.plugin.settings.filenamePrefixRegexRules', this.plugin.settings.filenamePrefixRegexRules);
            if (this.plugin.settings.filenamePrefixRegexRules.length > 0) {
                this.plugin.settings.filenamePrefixRegexRules.forEach(function (rule, index) {
                    var name = rule[0], regex = rule[1], enabled = rule[2];
                    new obsidian.Setting(containerEl)
                        .setName('Regex Rule')
                        .addText(function (text) {
                        text.onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                this.plugin.settings.filenamePrefixRegexRules[index][0] = value;
                                this.plugin.saveSettings();
                                return [2 /*return*/];
                            });
                        }); });
                        if (name && name.length > 0) {
                            text.setValue(name);
                        }
                        else {
                            text.setPlaceholder('Rule Name');
                        }
                    })
                        .addText(function (text) {
                        text
                            .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/];
                            });
                        }); });
                        if (regex && regex.length > 0) {
                            text.setValue(regex);
                        }
                        else {
                            text.setPlaceholder('/Regular Expression/');
                        }
                    })
                        .addToggle(function (toggle) {
                        return toggle
                            .setValue(enabled)
                            .onChange(function (value) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.plugin.settings.filenamePrefixRegexRules[index] = [
                                            this.plugin.settings.filenamePrefixRegexRules[index][0],
                                            this.plugin.settings.filenamePrefixRegexRules[index][1],
                                            value
                                        ];
                                        return [4 /*yield*/, this.plugin.saveSettings()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    })
                        .addExtraButton(function (button) {
                        button.setIcon('cross');
                        button.onClick(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.plugin.settings.filenamePrefixRegexRules.splice(index, 1);
                                        return [4 /*yield*/, this.plugin.saveSettings()];
                                    case 1:
                                        _a.sent();
                                        this.display();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                    });
                });
            }
            new obsidian.Setting(containerEl).addButton(function (button) {
                button.setButtonText('Add New Rule').onClick(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.plugin.settings.filenamePrefixRegexRules.push(['', '', true]);
                                return [4 /*yield*/, this.plugin.saveSettings()];
                            case 1:
                                _a.sent();
                                this.display();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            new obsidian.Setting(containerEl).addButton(function (button) {
                button.setButtonText('Reset Defaults').onClick(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.plugin.settings.filenamePrefixRegexRules = DEFAULT_SETTINGS.filenamePrefixRegexRules;
                                return [4 /*yield*/, this.plugin.saveSettings()];
                            case 1:
                                _a.sent();
                                this.display();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
            // new Setting(containerEl)
            //   .setName('Filename Prefix Regex Rules')
            //   .setDesc(
            //     'Ignore rule in RegEx format. All files listed below will get ignored by this plugin.',
            //   )
            //   .addText((text) =>
            //     text
            //       .setPlaceholder('MyFolder/.*')
            //       .setValue(this.plugin.settings.filenamePrefixRegexRules)
            //       .onChange(async (value) => {
            //         try {
            //           new RegExp(value);
            //           this.plugin.settings.filenamePrefixRegexRules = value;
            //         } catch {
            //           this.plugin.settings.filenamePrefixRegexRules = '';
            //         }
            //         await this.plugin.saveSettings();
            //         renderRegexIgnoredFiles(regexIgnoredFilesDiv);
            //         this.display();
            //       }),
            //   );
        }
        containerEl.createEl('h2', { text: 'Ignored Files By Regex' });
        containerEl.createEl('p', {
            text: 'All files matching the above RegEx will get listed here',
        });
        regexIgnoredFilesDiv = containerEl.createDiv('test');
        renderRegexIgnoredFiles(regexIgnoredFilesDiv);
        containerEl.createEl('h2', { text: 'Manually Ignored Files' });
        containerEl.createEl('p', {
            text: 'You can ignore files from this plugin by using the "ignore this file" command',
        });
        var _loop_1 = function (key) {
            var ignoredFilesSettingsObj = new obsidian.Setting(containerEl).setDesc(key);
            ignoredFilesSettingsObj.addButton(function (button) {
                button.setButtonText('Delete').onClick(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                delete this.plugin.settings.ignoredFiles[key];
                                return [4 /*yield*/, this.plugin.saveSettings()];
                            case 1:
                                _a.sent();
                                this.display();
                                return [2 /*return*/];
                        }
                    });
                }); });
            });
        };
        // go over all ignored files and add them
        for (var key in this.plugin.settings.ignoredFiles) {
            _loop_1(key);
        }
    };
    return FilenameHeadingSyncSettingTab;
}(obsidian.PluginSettingTab));

module.exports = FilenameHeadingSyncPlugin;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsImV4Y2x1c2lvbnMudHMiLCJtYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuIiwiaW1wb3J0IHsgQXBwLCBURmlsZSB9IGZyb20gJ29ic2lkaWFuJztcblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXhjYWxpZHJhdyhhcHA6IEFwcCwgZjogVEZpbGUpIHtcbiAgaWYgKGYuZXh0ZW5zaW9uID09PSAnZXhjYWxpZHJhdycgfHwgLy4qXFwuZXhjYWxpZHJhd1xcLm1kJC9nLnRlc3QoZi5wYXRoKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGNvbnN0IGZpbGVDYWNoZSA9IGFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShmKTtcbiAgcmV0dXJuIChcbiAgICAhIWZpbGVDYWNoZT8uZnJvbnRtYXR0ZXIgJiYgISFmaWxlQ2FjaGUuZnJvbnRtYXR0ZXJbJ2V4Y2FsaWRyYXctcGx1Z2luJ11cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzS2FuYmFuKGFwcDogQXBwLCBmOiBURmlsZSkge1xuICBjb25zdCBmaWxlQ2FjaGUgPSBhcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoZik7XG4gIHJldHVybiAoXG4gICAgISFmaWxlQ2FjaGU/LmZyb250bWF0dGVyICYmICEhZmlsZUNhY2hlLmZyb250bWF0dGVyWydrYW5iYW4tcGx1Z2luJ11cbiAgKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzRXhjbHVkZWQoYXBwOiBBcHAsIGY6IFRGaWxlKSB7XG4gIGlmIChpc0V4Y2FsaWRyYXcoYXBwLCBmKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmIChpc0thbmJhbihhcHAsIGYpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgXG4gIHJldHVybiBmYWxzZTtcbn1cbiIsImltcG9ydCB7XG4gIEFwcCxcbiAgUGx1Z2luLFxuICBQbHVnaW5TZXR0aW5nVGFiLFxuICBTZXR0aW5nLFxuICBUQWJzdHJhY3RGaWxlLFxuICBURmlsZSxcbiAgRWRpdG9yLFxuICBNYXJrZG93blZpZXcsXG59IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IGlzRXhjbHVkZWQgfSBmcm9tICcuL2V4Y2x1c2lvbnMnO1xuXG5jb25zdCBzdG9ja0lsbGVnYWxTeW1ib2xzID0gL1tcXFxcLzp8I15bXFxdXS9nO1xuXG4vLyBNdXN0IGJlIFN0cmluZ3MgdW5sZXNzIHNldHRpbmdzIGRpYWxvZyBpcyB1cGRhdGVkLlxuY29uc3QgZW51bSBIZWFkaW5nU3R5bGUge1xuICBQcmVmaXggPSAnUHJlZml4JyxcbiAgVW5kZXJsaW5lID0gJ1VuZGVybGluZScsXG59XG5cbmludGVyZmFjZSBMaW5lUG9pbnRlciB7XG4gIGxpbmVOdW1iZXI6IG51bWJlcjtcbiAgdGV4dDogc3RyaW5nO1xuICBzdHlsZTogSGVhZGluZ1N0eWxlO1xufVxuXG5pbnRlcmZhY2UgRmlsZW5hbWVIZWFkaW5nU3luY1BsdWdpblNldHRpbmdzIHtcbiAgdXNlcklsbGVnYWxTeW1ib2xzOiBzdHJpbmdbXTtcbiAgaWdub3JlUmVnZXg6IHN0cmluZztcbiAgaWdub3JlZEZpbGVzOiB7IFtrZXk6IHN0cmluZ106IG51bGwgfTtcbiAgdXNlRmlsZU9wZW5Ib29rOiBib29sZWFuO1xuICB1c2VGaWxlU2F2ZUhvb2s6IGJvb2xlYW47XG4gIG5ld0hlYWRpbmdTdHlsZTogSGVhZGluZ1N0eWxlO1xuICByZXBsYWNlU3R5bGU6IGJvb2xlYW47XG4gIHVuZGVybGluZVN0cmluZzogc3RyaW5nO1xuICBrZWVwRmlsZW5hbWVQcmVmaXg6IGJvb2xlYW47XG4gIGZpbGVuYW1lUHJlZml4UmVnZXhSdWxlczogW3N0cmluZywgc3RyaW5nLCBib29sZWFuXVtdO1xuICBmaWxlbmFtZVByZWZpeFNhdmVIaXN0b3J5OiBib29sZWFuO1xufVxuXG5jb25zdCBERUZBVUxUX1NFVFRJTkdTOiBGaWxlbmFtZUhlYWRpbmdTeW5jUGx1Z2luU2V0dGluZ3MgPSB7XG4gIHVzZXJJbGxlZ2FsU3ltYm9sczogW10sXG4gIGlnbm9yZWRGaWxlczoge30sXG4gIGlnbm9yZVJlZ2V4OiAnJyxcbiAgdXNlRmlsZU9wZW5Ib29rOiB0cnVlLFxuICB1c2VGaWxlU2F2ZUhvb2s6IHRydWUsXG4gIG5ld0hlYWRpbmdTdHlsZTogSGVhZGluZ1N0eWxlLlByZWZpeCxcbiAgcmVwbGFjZVN0eWxlOiBmYWxzZSxcbiAgdW5kZXJsaW5lU3RyaW5nOiAnPT09JyxcbiAga2VlcEZpbGVuYW1lUHJlZml4OiBmYWxzZSxcbiAgZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzOiBbXG4gICAgWyd0aW1lc3RhbXAnLCAnXlswLTldezEyfVxcXFxzKicsIGZhbHNlXSwgLy8gMjAyMzEwMjQxMjAyIE15IFVuaXF1ZSBOb3RlXG4gICAgWyd6ZXR0ZWxrYXN0ZW4nLCAnXltBLVphLXowLTldK1xcXFxzKy1cXFxccyonLCBmYWxzZV0gLy8gd29yazFhM2JhMyAtIE15IFdvcmsgTm90ZSBcbiAgXSxcbiAgZmlsZW5hbWVQcmVmaXhTYXZlSGlzdG9yeTogZmFsc2UsXG59O1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWxlbmFtZUhlYWRpbmdTeW5jUGx1Z2luIGV4dGVuZHMgUGx1Z2luIHtcbiAgaXNSZW5hbWVJblByb2dyZXNzOiBib29sZWFuID0gZmFsc2U7XG4gIHNldHRpbmdzOiBGaWxlbmFtZUhlYWRpbmdTeW5jUGx1Z2luU2V0dGluZ3M7XG5cbiAgYXN5bmMgb25sb2FkKCkge1xuICAgIGF3YWl0IHRoaXMubG9hZFNldHRpbmdzKCk7XG5cbiAgICB0aGlzLnJlZ2lzdGVyRXZlbnQoXG4gICAgICB0aGlzLmFwcC52YXVsdC5vbigncmVuYW1lJywgKGZpbGUsIG9sZFBhdGgpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudXNlRmlsZVNhdmVIb29rKSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlU3luY0ZpbGVuYW1lVG9IZWFkaW5nKGZpbGUsIG9sZFBhdGgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLnZhdWx0Lm9uKCdtb2RpZnknLCAoZmlsZSkgPT4ge1xuICAgICAgICBpZiAodGhpcy5zZXR0aW5ncy51c2VGaWxlU2F2ZUhvb2spIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTeW5jSGVhZGluZ1RvRmlsZShmaWxlKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcblxuICAgIHRoaXMucmVnaXN0ZXJFdmVudChcbiAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbignZmlsZS1vcGVuJywgKGZpbGUpID0+IHtcbiAgICAgICAgaWYgKHRoaXMuc2V0dGluZ3MudXNlRmlsZU9wZW5Ib29rICYmIGZpbGUgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVTeW5jRmlsZW5hbWVUb0hlYWRpbmcoZmlsZSwgZmlsZS5wYXRoKTtcbiAgICAgICAgfVxuICAgICAgfSksXG4gICAgKTtcblxuICAgIHRoaXMuYWRkU2V0dGluZ1RhYihuZXcgRmlsZW5hbWVIZWFkaW5nU3luY1NldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3BhZ2UtaGVhZGluZy1zeW5jLWlnbm9yZS1maWxlJyxcbiAgICAgIG5hbWU6ICdJZ25vcmUgY3VycmVudCBmaWxlJyxcbiAgICAgIGNoZWNrQ2FsbGJhY2s6IChjaGVja2luZzogYm9vbGVhbikgPT4ge1xuICAgICAgICBsZXQgbGVhZiA9IHRoaXMuYXBwLndvcmtzcGFjZS5hY3RpdmVMZWFmO1xuICAgICAgICBpZiAobGVhZikge1xuICAgICAgICAgIGlmICghY2hlY2tpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0dGluZ3MuaWdub3JlZEZpbGVzW1xuICAgICAgICAgICAgICB0aGlzLmFwcC53b3Jrc3BhY2UuZ2V0QWN0aXZlRmlsZSgpLnBhdGhcbiAgICAgICAgICAgIF0gPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3N5bmMtZmlsZW5hbWUtdG8taGVhZGluZycsXG4gICAgICBuYW1lOiAnU3luYyBGaWxlbmFtZSB0byBIZWFkaW5nJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yOiBFZGl0b3IsIHZpZXc6IE1hcmtkb3duVmlldykgPT5cbiAgICAgICAgdGhpcy5mb3JjZVN5bmNGaWxlbmFtZVRvSGVhZGluZyh2aWV3LmZpbGUpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc3luYy1oZWFkaW5nLXRvLWZpbGVuYW1lJyxcbiAgICAgIG5hbWU6ICdTeW5jIEhlYWRpbmcgdG8gRmlsZW5hbWUnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3I6IEVkaXRvciwgdmlldzogTWFya2Rvd25WaWV3KSA9PlxuICAgICAgICB0aGlzLmZvcmNlU3luY0hlYWRpbmdUb0ZpbGVuYW1lKHZpZXcuZmlsZSksXG4gICAgfSk7XG4gIH1cblxuICBmaWxlSXNJZ25vcmVkKGFjdGl2ZUZpbGU6IFRGaWxlLCBwYXRoOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBjaGVjayBleGNsdXNpb25zXG4gICAgaWYgKGlzRXhjbHVkZWQodGhpcy5hcHAsIGFjdGl2ZUZpbGUpKSB7XG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBtYW51YWwgaWdub3JlXG4gICAgaWYgKHRoaXMuc2V0dGluZ3MuaWdub3JlZEZpbGVzW3BhdGhdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIGNoZWNrIHJlZ2V4XG4gICAgdHJ5IHtcbiAgICAgIGlmICh0aGlzLnNldHRpbmdzLmlnbm9yZVJlZ2V4ID09PSAnJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlZyA9IG5ldyBSZWdFeHAodGhpcy5zZXR0aW5ncy5pZ25vcmVSZWdleCk7XG4gICAgICByZXR1cm4gcmVnLmV4ZWMocGF0aCkgIT09IG51bGw7XG4gICAgfSBjYXRjaCB7IH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZW5hbWVzIHRoZSBmaWxlIHdpdGggdGhlIGZpcnN0IGhlYWRpbmcgZm91bmRcbiAgICpcbiAgICogQHBhcmFtICAgICAge1RBYnN0cmFjdEZpbGV9ICBmaWxlICAgIFRoZSBmaWxlXG4gICAqL1xuICBoYW5kbGVTeW5jSGVhZGluZ1RvRmlsZShmaWxlOiBUQWJzdHJhY3RGaWxlKSB7XG4gICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykge1xuICAgICAgLy8ganVzdCBiYWlsXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaWYgY3VycmVudGx5IG9wZW5lZCBmaWxlIGlzIG5vdCB0aGUgc2FtZSBhcyB0aGUgb25lIHRoYXQgZmlyZWQgdGhlIGV2ZW50LCBza2lwXG4gICAgLy8gdGhpcyBpcyB0byBtYWtlIHN1cmUgb3RoZXIgZXZlbnRzIGRvbid0IHRyaWdnZXIgdGhpcyBwbHVnaW5cbiAgICBpZiAodGhpcy5hcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKSAhPT0gZmlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGlmIGlnbm9yZWQsIGp1c3QgYmFpbFxuICAgIGlmICh0aGlzLmZpbGVJc0lnbm9yZWQoZmlsZSwgZmlsZS5wYXRoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuZm9yY2VTeW5jSGVhZGluZ1RvRmlsZW5hbWUoZmlsZSk7XG4gIH1cblxuICBmb3JjZVN5bmNIZWFkaW5nVG9GaWxlbmFtZShmaWxlOiBURmlsZSkge1xuICAgIHRoaXMuYXBwLnZhdWx0LnJlYWQoZmlsZSkudGhlbihhc3luYyAoZGF0YSkgPT4ge1xuICAgICAgY29uc3QgbGluZXMgPSBkYXRhLnNwbGl0KCdcXG4nKTtcbiAgICAgIGNvbnN0IHN0YXJ0ID0gdGhpcy5maW5kTm90ZVN0YXJ0KGxpbmVzKTtcbiAgICAgIGNvbnN0IGhlYWRpbmcgPSB0aGlzLmZpbmRIZWFkaW5nKGxpbmVzLCBzdGFydCk7XG5cbiAgICAgIGlmIChoZWFkaW5nID09PSBudWxsKSByZXR1cm47IC8vIG5vIGhlYWRpbmcgZm91bmQsIG5vdGhpbmcgdG8gZG8gaGVyZVxuXG4gICAgICBsZXQgc2FuaXRpemVkSGVhZGluZyA9IHRoaXMuc2FuaXRpemVIZWFkaW5nKGhlYWRpbmcudGV4dCk7XG5cbiAgICAgIC8vIElmIEtlZXAgRmlsZW5hbWUgUHJlZml4ZXMgaXMgZW5hYmxlZCwgY2hlY2sgaWYgdGhlIHByZWZpeCBpcyBhbHJlYWR5IGluIHRoZSBoZWFkaW5nIGFuZCBhZGQgaWYgbm90XG4gICAgICBpZiAodGhpcy5zZXR0aW5ncy5rZWVwRmlsZW5hbWVQcmVmaXgpIHtcbiAgICAgICAgY29uc3QgcHJlZml4ID0gdGhpcy5nZXRGaWxlbmFtZVByZWZpeChmaWxlKVxuICAgICAgICAvLyBjaGVjayBpZiBwcmVmaXggaXMgYWxyZWFkeSBpbiBoZWFkaW5nXG4gICAgICAgIGlmICghc2FuaXRpemVkSGVhZGluZy5zdGFydHNXaXRoKHByZWZpeCkgJiYgc2FuaXRpemVkSGVhZGluZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgc2FuaXRpemVkSGVhZGluZyA9IGAke3ByZWZpeC50cmltKCl9ICR7c2FuaXRpemVkSGVhZGluZy50cmltKCl9YFxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChcbiAgICAgICAgc2FuaXRpemVkSGVhZGluZy5sZW5ndGggPiAwICYmXG4gICAgICAgIHRoaXMuc2FuaXRpemVIZWFkaW5nKGZpbGUuYmFzZW5hbWUpLmxlbmd0aCA+IDAgJiZcbiAgICAgICAgdGhpcy5zYW5pdGl6ZUhlYWRpbmcoZmlsZS5iYXNlbmFtZSkgIT09IHNhbml0aXplZEhlYWRpbmdcbiAgICAgICkge1xuICAgICAgICBjb25zdCBuZXdQYXRoID0gYCR7ZmlsZS5wYXJlbnQucGF0aH0vJHtzYW5pdGl6ZWRIZWFkaW5nfS5tZGA7XG4gICAgICAgIC8vIGNoZWNrIGlmIG5ldyBmaWxlbmFtZSBpcyBqdXN0IGdvaW5nIHRvIGJlIGVtcHR5IHRpdGxlIHdpdGggcHJlZml4XG4gICAgICAgIGlmICh0aGlzLnNldHRpbmdzLmtlZXBGaWxlbmFtZVByZWZpeCAmJiBzYW5pdGl6ZWRIZWFkaW5nID09PSB0aGlzLmdldEZpbGVuYW1lUHJlZml4KGZpbGUpKSB7XG4gICAgICAgICAgLy8ganVzdCBiYWlsXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNSZW5hbWVJblByb2dyZXNzID0gdHJ1ZTtcbiAgICAgICAgYXdhaXQgdGhpcy5hcHAuZmlsZU1hbmFnZXIucmVuYW1lRmlsZShmaWxlLCBuZXdQYXRoKTtcbiAgICAgICAgdGhpcy5pc1JlbmFtZUluUHJvZ3Jlc3MgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTeW5jcyB0aGUgY3VycmVudCBmaWxlbmFtZSB0byB0aGUgZmlyc3QgaGVhZGluZ1xuICAgKiBGaW5kcyB0aGUgZmlyc3QgaGVhZGluZyBvZiB0aGUgZmlsZSwgdGhlbiByZXBsYWNlcyBpdCB3aXRoIHRoZSBmaWxlbmFtZVxuICAgKlxuICAgKiBAcGFyYW0gICAgICB7VEFic3RyYWN0RmlsZX0gIGZpbGUgICAgIFRoZSBmaWxlIHRoYXQgZmlyZWQgdGhlIGV2ZW50XG4gICAqIEBwYXJhbSAgICAgIHtzdHJpbmd9ICAgICAgICAgb2xkUGF0aCAgVGhlIG9sZCBwYXRoXG4gICAqL1xuICBoYW5kbGVTeW5jRmlsZW5hbWVUb0hlYWRpbmcoZmlsZTogVEFic3RyYWN0RmlsZSwgb2xkUGF0aDogc3RyaW5nKSB7XG4gICAgaWYgKHRoaXMuaXNSZW5hbWVJblByb2dyZXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCEoZmlsZSBpbnN0YW5jZW9mIFRGaWxlKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChmaWxlLmV4dGVuc2lvbiAhPT0gJ21kJykge1xuICAgICAgLy8ganVzdCBiYWlsXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gaWYgb2xkcGF0aCBpcyBpZ25vcmVkLCBob29rIGluIGFuZCB1cGRhdGUgdGhlIG5ldyBmaWxlcGF0aCB0byBiZSBpZ25vcmVkIGluc3RlYWRcbiAgICBpZiAodGhpcy5maWxlSXNJZ25vcmVkKGZpbGUsIG9sZFBhdGgudHJpbSgpKSkge1xuICAgICAgLy8gaWYgZmlsZW5hbWUgZGlkbid0IGNoYW5nZSwganVzdCBiYWlsLCBub3RoaW5nIHRvIGRvIGhlcmVcbiAgICAgIGlmIChmaWxlLnBhdGggPT09IG9sZFBhdGgpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBmaWxlcGF0aCBjaGFuZ2VkIGFuZCB0aGUgZmlsZSB3YXMgaW4gdGhlIGlnbm9yZSBsaXN0IGJlZm9yZSxcbiAgICAgIC8vIHJlbW92ZSBpdCBmcm9tIHRoZSBsaXN0IGFuZCBhZGQgdGhlIG5ldyBvbmUgaW5zdGVhZFxuICAgICAgaWYgKHRoaXMuc2V0dGluZ3MuaWdub3JlZEZpbGVzW29sZFBhdGhdKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLnNldHRpbmdzLmlnbm9yZWRGaWxlc1tvbGRQYXRoXTtcbiAgICAgICAgdGhpcy5zZXR0aW5ncy5pZ25vcmVkRmlsZXNbZmlsZS5wYXRoXSA9IG51bGw7XG4gICAgICAgIHRoaXMuc2F2ZVNldHRpbmdzKCk7XG4gICAgICB9XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5mb3JjZVN5bmNGaWxlbmFtZVRvSGVhZGluZyhmaWxlKTtcbiAgfVxuXG4gIGZvcmNlU3luY0ZpbGVuYW1lVG9IZWFkaW5nKGZpbGU6IFRGaWxlKSB7XG4gICAgY29uc3QgcHJlZml4ID0gdGhpcy5nZXRGaWxlbmFtZVByZWZpeChmaWxlKVxuICAgIGNvbnN0IHNhbml0aXplZEhlYWRpbmcgPSB0aGlzLnNhbml0aXplSGVhZGluZyhmaWxlLmJhc2VuYW1lLCBwcmVmaXgpXG5cbiAgICB0aGlzLmFwcC52YXVsdC5yZWFkKGZpbGUpLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgIGNvbnN0IGxpbmVzID0gZGF0YS5zcGxpdCgnXFxuJyk7XG4gICAgICBjb25zdCBzdGFydCA9IHRoaXMuZmluZE5vdGVTdGFydChsaW5lcyk7XG4gICAgICBjb25zdCBoZWFkaW5nID0gdGhpcy5maW5kSGVhZGluZyhsaW5lcywgc3RhcnQpO1xuXG4gICAgICBpZiAoaGVhZGluZyAhPT0gbnVsbCAmJiBzYW5pdGl6ZWRIZWFkaW5nLmxlbmd0aCA+IDApIHtcbiAgICAgICAgaWYgKHRoaXMuc2FuaXRpemVIZWFkaW5nKGhlYWRpbmcudGV4dCwgcHJlZml4KSAhPT0gc2FuaXRpemVkSGVhZGluZykge1xuICAgICAgICAgIHRoaXMucmVwbGFjZUhlYWRpbmcoXG4gICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgbGluZXMsXG4gICAgICAgICAgICBoZWFkaW5nLmxpbmVOdW1iZXIsXG4gICAgICAgICAgICBoZWFkaW5nLnN0eWxlLFxuICAgICAgICAgICAgc2FuaXRpemVkSGVhZGluZyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNhbml0aXplZEhlYWRpbmcubGVuZ3RoID4gMCkge1xuICAgICAgICB0aGlzLmluc2VydEhlYWRpbmcoZmlsZSwgbGluZXMsIHN0YXJ0LCBzYW5pdGl6ZWRIZWFkaW5nKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGaW5kcyB0aGUgc3RhcnQgb2YgdGhlIG5vdGUgZmlsZSwgZXhjbHVkaW5nIGZyb250bWF0dGVyXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGZpbGVMaW5lcyBhcnJheSBvZiB0aGUgZmlsZSdzIGNvbnRlbnRzLCBsaW5lIGJ5IGxpbmVcbiAgICogQHJldHVybnMge251bWJlcn0gemVyby1iYXNlZCBpbmRleCBvZiB0aGUgc3RhcnRpbmcgbGluZSBvZiB0aGUgbm90ZVxuICAgKi9cbiAgZmluZE5vdGVTdGFydChmaWxlTGluZXM6IHN0cmluZ1tdKSB7XG4gICAgLy8gY2hlY2sgZm9yIGZyb250bWF0dGVyIGJ5IGNoZWNraW5nIGlmIGZpcnN0IGxpbmUgaXMgYSBkaXZpZGVyICgnLS0tJylcbiAgICBpZiAoZmlsZUxpbmVzWzBdID09PSAnLS0tJykge1xuICAgICAgLy8gZmluZCBlbmQgb2YgZnJvbnRtYXR0ZXJcbiAgICAgIC8vIGlmIG5vIGVuZCBpcyBmb3VuZCwgdGhlbiBpdCBpc24ndCByZWFsbHkgZnJvbnRtYXR0ZXIgYW5kIGZ1bmN0aW9uIHdpbGwgZW5kIHVwIHJldHVybmluZyAwXG4gICAgICBmb3IgKGxldCBpID0gMTsgaSA8IGZpbGVMaW5lcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoZmlsZUxpbmVzW2ldID09PSAnLS0tJykge1xuICAgICAgICAgIC8vIGVuZCBvZiBmcm9udG1hdHRlciBmb3VuZCwgbmV4dCBsaW5lIGlzIHN0YXJ0IG9mIG5vdGVcbiAgICAgICAgICByZXR1cm4gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICAvKipcbiAgICogRmluZHMgdGhlIGZpcnN0IGhlYWRpbmcgb2YgdGhlIG5vdGUgZmlsZVxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBmaWxlTGluZXMgYXJyYXkgb2YgdGhlIGZpbGUncyBjb250ZW50cywgbGluZSBieSBsaW5lXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBzdGFydExpbmUgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgc3RhcnRpbmcgbGluZSBvZiB0aGUgbm90ZVxuICAgKiBAcmV0dXJucyB7TGluZVBvaW50ZXIgfCBudWxsfSBMaW5lUG9pbnRlciB0byBoZWFkaW5nIG9yIG51bGwgaWYgbm8gaGVhZGluZyBmb3VuZFxuICAgKi9cbiAgZmluZEhlYWRpbmcoZmlsZUxpbmVzOiBzdHJpbmdbXSwgc3RhcnRMaW5lOiBudW1iZXIpOiBMaW5lUG9pbnRlciB8IG51bGwge1xuICAgIGZvciAobGV0IGkgPSBzdGFydExpbmU7IGkgPCBmaWxlTGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChmaWxlTGluZXNbaV0uc3RhcnRzV2l0aCgnIyAnKSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGxpbmVOdW1iZXI6IGksXG4gICAgICAgICAgdGV4dDogZmlsZUxpbmVzW2ldLnN1YnN0cmluZygyKSxcbiAgICAgICAgICBzdHlsZTogSGVhZGluZ1N0eWxlLlByZWZpeCxcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBmaWxlTGluZXNbaSArIDFdICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICBmaWxlTGluZXNbaSArIDFdLm1hdGNoKC9ePSskLykgIT09IG51bGxcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxpbmVOdW1iZXI6IGksXG4gICAgICAgICAgICB0ZXh0OiBmaWxlTGluZXNbaV0sXG4gICAgICAgICAgICBzdHlsZTogSGVhZGluZ1N0eWxlLlVuZGVybGluZSxcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsOyAvLyBubyBoZWFkaW5nIGZvdW5kXG4gIH1cblxuICByZWdFeHBFc2NhcGUoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBTdHJpbmcoc3RyKS5yZXBsYWNlKC9bXFxcXF4kKis/LigpfFtcXF17fV0vZywgJ1xcXFwkJicpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIHByZWZpeCBvZiBhIGZpbGUsIGlmIGFueS5cbiAgICogXG4gICAqIEBwYXJhbSB7VEZpbGV9IGZpbGUgdGhlIGZpbGUgdG8gZ2V0IHRoZSBwcmVmaXggZnJvbVxuICAgKiBAcmV0dXJucyB7c3RyaW5nfSBwcmVmaXggb2YgdGhlIGZpbGUsIG9yIGFuIGVtcHR5IHN0cmluZyBpZiBubyBwcmVmaXggaXMgZm91bmRcbiAgICovXG4gIGdldEZpbGVuYW1lUHJlZml4KGZpbGU6IFRGaWxlKTogc3RyaW5nIHtcbiAgICAvLyBjb25zdCBwcmVmaXhPcHRpb25zID0gW1xuICAgIC8vICAgWyd0aW1lc3RhbXAnLCBuZXcgUmVnRXhwKC9eWzAtOV0rXFxzLyldLFxuICAgIC8vICAgWyd6aycsIG5ldyBSZWdFeHAoL14uKlxccy1cXHMvKV1cbiAgICAvLyBdO1xuICAgIGNvbnN0IHByZWZpeE9wdGlvbnMgPSB0aGlzLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlc1xuXG4gICAgaWYgKCF0aGlzLnNldHRpbmdzLmtlZXBGaWxlbmFtZVByZWZpeCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVuYW1lID0gZmlsZS5iYXNlbmFtZTtcblxuICAgIGZvciAoY29uc3Qgb3B0aW9uIG9mIHByZWZpeE9wdGlvbnMpIHtcbiAgICAgIGNvbnN0IFtuYW1lU3RyaW5nLCByZWdleFN0cmluZ10gPSBvcHRpb247XG4gICAgICBjb25zdCBuYW1lID0gbmFtZVN0cmluZy50cmltKCk7XG4gICAgICBjb25zdCByZWdleCA9IG5ldyBSZWdFeHAocmVnZXhTdHJpbmcpO1xuICAgICAgY29uc3QgbWF0Y2hlcyA9IGZpbGVuYW1lLm1hdGNoKHJlZ2V4KVxuICAgICAgaWYgKG1hdGNoZXMgJiYgbWF0Y2hlc1swXSkge1xuICAgICAgICBjb25zb2xlLmxvZygncHJlZml4IG1hdGNoZWQhJywgbmFtZSwgcmVnZXhTdHJpbmcsIGZpbGVuYW1lLCBtYXRjaGVzKTtcbiAgICAgICAgcmV0dXJuIG1hdGNoZXNbMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmxvZygncHJlZml4IG5vIG1hdGNoJywgbmFtZSwgcmVnZXhTdHJpbmcsIGZpbGVuYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBubyBwcmVmaXggZm91bmRcbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBzYW5pdGl6ZUhlYWRpbmcodGV4dDogc3RyaW5nLCBwcmVmaXg/OiBzdHJpbmcpIHtcbiAgICAvLyBzdG9ja0lsbGVnYWxTeW1ib2xzIGlzIGEgcmVnRXhwIG9iamVjdCwgYnV0IHVzZXJJbGxlZ2FsU3ltYm9scyBpcyBhIGxpc3Qgb2Ygc3RyaW5ncyBhbmQgdGhlcmVmb3JlIHRoZXkgYXJlIGhhbmRsZWQgc2VwYXJhdGVseS5cbiAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHN0b2NrSWxsZWdhbFN5bWJvbHMsICcnKTtcblxuICAgIGNvbnN0IHVzZXJJbGxlZ2FsU3ltYm9sc0VzY2FwZWQgPSB0aGlzLnNldHRpbmdzLnVzZXJJbGxlZ2FsU3ltYm9scy5tYXAoXG4gICAgICAoc3RyKSA9PiB0aGlzLnJlZ0V4cEVzY2FwZShzdHIpLFxuICAgICk7XG4gICAgY29uc3QgdXNlcklsbGVnYWxTeW1ib2xzUmVnRXhwID0gbmV3IFJlZ0V4cChcbiAgICAgIHVzZXJJbGxlZ2FsU3ltYm9sc0VzY2FwZWQuam9pbignfCcpLFxuICAgICAgJ2cnLFxuICAgICk7XG4gICAgdGV4dCA9IHRleHQucmVwbGFjZSh1c2VySWxsZWdhbFN5bWJvbHNSZWdFeHAsICcnKTtcblxuICAgIC8vIGlmIHByZWZpeCBwcm90ZWN0aW9uIGlzIHR1cm5lZCBvbiwgcmVtb3ZlIHByZWZpeCBmcm9tIGhlYWRpbmdcbiAgICBpZiAodGhpcy5zZXR0aW5ncy5rZWVwRmlsZW5hbWVQcmVmaXggJiYgcHJlZml4KSB7XG4gICAgICB0ZXh0ID0gdGV4dC5yZXBsYWNlKHByZWZpeCwgJycpO1xuICAgICAgY29uc29sZS5sb2coJ3Nhbml0aXplSGVhZGluZycsICd0ZXh0JywgdGV4dClcbiAgICB9XG5cbiAgICByZXR1cm4gdGV4dC50cmltKCk7XG4gIH1cblxuICAvKipcbiAgICogSW5zZXJ0IHRoZSBgaGVhZGluZ2AgYXQgYGxpbmVOdW1iZXJgIGluIGBmaWxlYC5cbiAgICpcbiAgICogQHBhcmFtIHtURmlsZX0gZmlsZSB0aGUgZmlsZSB0byBtb2RpZnlcbiAgICogQHBhcmFtIHtzdHJpbmdbXX0gZmlsZUxpbmVzIGFycmF5IG9mIHRoZSBmaWxlJ3MgY29udGVudHMsIGxpbmUgYnkgbGluZVxuICAgKiBAcGFyYW0ge251bWJlcn0gbGluZU51bWJlciB6ZXJvLWJhc2VkIGluZGV4IG9mIHRoZSBsaW5lIHRvIHJlcGxhY2VcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgdGhlIG5ldyB0ZXh0XG4gICAqL1xuICBpbnNlcnRIZWFkaW5nKFxuICAgIGZpbGU6IFRGaWxlLFxuICAgIGZpbGVMaW5lczogc3RyaW5nW10sXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIGhlYWRpbmc6IHN0cmluZyxcbiAgKSB7XG4gICAgY29uc3QgbmV3U3R5bGUgPSB0aGlzLnNldHRpbmdzLm5ld0hlYWRpbmdTdHlsZTtcbiAgICBzd2l0Y2ggKG5ld1N0eWxlKSB7XG4gICAgICBjYXNlIEhlYWRpbmdTdHlsZS5VbmRlcmxpbmU6IHtcbiAgICAgICAgdGhpcy5pbnNlcnRMaW5lSW5GaWxlKGZpbGUsIGZpbGVMaW5lcywgbGluZU51bWJlciwgYCR7aGVhZGluZ31gKTtcblxuICAgICAgICB0aGlzLmluc2VydExpbmVJbkZpbGUoXG4gICAgICAgICAgZmlsZSxcbiAgICAgICAgICBmaWxlTGluZXMsXG4gICAgICAgICAgbGluZU51bWJlciArIDEsXG4gICAgICAgICAgdGhpcy5zZXR0aW5ncy51bmRlcmxpbmVTdHJpbmcsXG4gICAgICAgICk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2FzZSBIZWFkaW5nU3R5bGUuUHJlZml4OiB7XG4gICAgICAgIHRoaXMuaW5zZXJ0TGluZUluRmlsZShmaWxlLCBmaWxlTGluZXMsIGxpbmVOdW1iZXIsIGAjICR7aGVhZGluZ31gKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1vZGlmaWVkIGBmaWxlYCBieSByZXBsYWNpbmcgdGhlIGhlYWRpbmcgYXQgYGxpbmVOdW1iZXJgIHdpdGggYG5ld0hlYWRpbmdgLFxuICAgKiB1cGRhdGluZyB0aGUgaGVhZGluZyBzdHlsZSBhY2NvcmRpbmcgdGhlIHVzZXIgc2V0dGluZ3MuXG4gICAqXG4gICAqIEBwYXJhbSB7VEZpbGV9IGZpbGUgdGhlIGZpbGUgdG8gbW9kaWZ5XG4gICAqIEBwYXJhbSB7c3RyaW5nW119IGZpbGVMaW5lcyBhcnJheSBvZiB0aGUgZmlsZSdzIGNvbnRlbnRzLCBsaW5lIGJ5IGxpbmVcbiAgICogQHBhcmFtIHtudW1iZXJ9IGxpbmVOdW1iZXIgemVyby1iYXNlZCBpbmRleCBvZiB0aGUgbGluZSB0byByZXBsYWNlXG4gICAqIEBwYXJhbSB7SGVhZGluZ1N0eWxlfSBvbGRTdHlsZSB0aGUgc3R5bGUgb2YgdGhlIG9yaWdpbmFsIGhlYWRpbmdcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRleHQgdGhlIG5ldyB0ZXh0XG4gICAqL1xuICByZXBsYWNlSGVhZGluZyhcbiAgICBmaWxlOiBURmlsZSxcbiAgICBmaWxlTGluZXM6IHN0cmluZ1tdLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICBvbGRTdHlsZTogSGVhZGluZ1N0eWxlLFxuICAgIG5ld0hlYWRpbmc6IHN0cmluZyxcbiAgKSB7XG4gICAgY29uc3QgbmV3U3R5bGUgPSB0aGlzLnNldHRpbmdzLm5ld0hlYWRpbmdTdHlsZTtcbiAgICBjb25zdCByZXBsYWNlU3R5bGUgPSB0aGlzLnNldHRpbmdzLnJlcGxhY2VTdHlsZTtcbiAgICAvLyBJZiByZXBsYWNpbmcgdGhlIHN0eWxlXG4gICAgaWYgKHJlcGxhY2VTdHlsZSkge1xuICAgICAgc3dpdGNoIChuZXdTdHlsZSkge1xuICAgICAgICAvLyBGb3IgdW5kZXJsaW5lIHN0eWxlLCByZXBsYWNlIGhlYWRpbmcgbGluZS4uLlxuICAgICAgICBjYXNlIEhlYWRpbmdTdHlsZS5VbmRlcmxpbmU6IHtcbiAgICAgICAgICB0aGlzLnJlcGxhY2VMaW5lSW5GaWxlKGZpbGUsIGZpbGVMaW5lcywgbGluZU51bWJlciwgYCR7bmV3SGVhZGluZ31gKTtcbiAgICAgICAgICAvLy4uLiwgdGhlbiBhZGQgb3IgcmVwbGFjZSB1bmRlcmxpbmUuXG4gICAgICAgICAgc3dpdGNoIChvbGRTdHlsZSkge1xuICAgICAgICAgICAgY2FzZSBIZWFkaW5nU3R5bGUuUHJlZml4OiB7XG4gICAgICAgICAgICAgIHRoaXMuaW5zZXJ0TGluZUluRmlsZShcbiAgICAgICAgICAgICAgICBmaWxlLFxuICAgICAgICAgICAgICAgIGZpbGVMaW5lcyxcbiAgICAgICAgICAgICAgICBsaW5lTnVtYmVyICsgMSxcbiAgICAgICAgICAgICAgICB0aGlzLnNldHRpbmdzLnVuZGVybGluZVN0cmluZyxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIEhlYWRpbmdTdHlsZS5VbmRlcmxpbmU6IHtcbiAgICAgICAgICAgICAgLy8gVXBkYXRlIHVuZGVybGluZSB3aXRoIHNldHRpbmcuXG4gICAgICAgICAgICAgIHRoaXMucmVwbGFjZUxpbmVJbkZpbGUoXG4gICAgICAgICAgICAgICAgZmlsZSxcbiAgICAgICAgICAgICAgICBmaWxlTGluZXMsXG4gICAgICAgICAgICAgICAgbGluZU51bWJlciArIDEsXG4gICAgICAgICAgICAgICAgdGhpcy5zZXR0aW5ncy51bmRlcmxpbmVTdHJpbmcsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICAvLyBGb3IgcHJlZml4IHN0eWxlLCByZXBsYWNlIGhlYWRpbmcgbGluZSwgYW5kIHBvc3NpYmx5IGRlbGV0ZSB1bmRlcmxpbmVcbiAgICAgICAgY2FzZSBIZWFkaW5nU3R5bGUuUHJlZml4OiB7XG4gICAgICAgICAgdGhpcy5yZXBsYWNlTGluZUluRmlsZShcbiAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICBmaWxlTGluZXMsXG4gICAgICAgICAgICBsaW5lTnVtYmVyLFxuICAgICAgICAgICAgYCMgJHtuZXdIZWFkaW5nfWAsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBzd2l0Y2ggKG9sZFN0eWxlKSB7XG4gICAgICAgICAgICBjYXNlIEhlYWRpbmdTdHlsZS5QcmVmaXg6IHtcbiAgICAgICAgICAgICAgLy8gbm9wXG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBIZWFkaW5nU3R5bGUuVW5kZXJsaW5lOiB7XG4gICAgICAgICAgICAgIHRoaXMucmVwbGFjZUxpbmVJbkZpbGUoZmlsZSwgZmlsZUxpbmVzLCBsaW5lTnVtYmVyICsgMSwgJycpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgbm90IHJlcGxhY2luZyBzdHlsZSwgbWF0Y2hcbiAgICAgIHN3aXRjaCAob2xkU3R5bGUpIHtcbiAgICAgICAgY2FzZSBIZWFkaW5nU3R5bGUuVW5kZXJsaW5lOiB7XG4gICAgICAgICAgdGhpcy5yZXBsYWNlTGluZUluRmlsZShmaWxlLCBmaWxlTGluZXMsIGxpbmVOdW1iZXIsIGAke25ld0hlYWRpbmd9YCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBIZWFkaW5nU3R5bGUuUHJlZml4OiB7XG4gICAgICAgICAgdGhpcy5yZXBsYWNlTGluZUluRmlsZShcbiAgICAgICAgICAgIGZpbGUsXG4gICAgICAgICAgICBmaWxlTGluZXMsXG4gICAgICAgICAgICBsaW5lTnVtYmVyLFxuICAgICAgICAgICAgYCMgJHtuZXdIZWFkaW5nfWAsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNb2RpZmllcyB0aGUgZmlsZSBieSByZXBsYWNpbmcgYSBwYXJ0aWN1bGFyIGxpbmUgd2l0aCBuZXcgdGV4dC5cbiAgICpcbiAgICogVGhlIGZ1bmN0aW9uIHdpbGwgYWRkIGEgbmV3bGluZSBjaGFyYWN0ZXIgYXQgdGhlIGVuZCBvZiB0aGUgcmVwbGFjZWQgbGluZS5cbiAgICpcbiAgICogSWYgdGhlIGBsaW5lTnVtYmVyYCBwYXJhbWV0ZXIgaXMgaGlnaGVyIHRoYW4gdGhlIGluZGV4IG9mIHRoZSBsYXN0IGxpbmUgb2YgdGhlIGZpbGVcbiAgICogdGhlIGZ1bmN0aW9uIHdpbGwgYWRkIGEgbmV3bGluZSBjaGFyYWN0ZXIgdG8gdGhlIGN1cnJlbnQgbGFzdCBsaW5lIGFuZCBhcHBlbmQgYSBuZXdcbiAgICogbGluZSBhdCB0aGUgZW5kIG9mIHRoZSBmaWxlIHdpdGggdGhlIG5ldyB0ZXh0IChlc3NlbnRpYWxseSBhIG5ldyBsYXN0IGxpbmUpLlxuICAgKlxuICAgKiBAcGFyYW0ge1RGaWxlfSBmaWxlIHRoZSBmaWxlIHRvIG1vZGlmeVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBmaWxlTGluZXMgYXJyYXkgb2YgdGhlIGZpbGUncyBjb250ZW50cywgbGluZSBieSBsaW5lXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lTnVtYmVyIHplcm8tYmFzZWQgaW5kZXggb2YgdGhlIGxpbmUgdG8gcmVwbGFjZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGV4dCB0aGUgbmV3IHRleHRcbiAgICovXG4gIHJlcGxhY2VMaW5lSW5GaWxlKFxuICAgIGZpbGU6IFRGaWxlLFxuICAgIGZpbGVMaW5lczogc3RyaW5nW10sXG4gICAgbGluZU51bWJlcjogbnVtYmVyLFxuICAgIHRleHQ6IHN0cmluZyxcbiAgKSB7XG4gICAgaWYgKGxpbmVOdW1iZXIgPj0gZmlsZUxpbmVzLmxlbmd0aCkge1xuICAgICAgZmlsZUxpbmVzLnB1c2godGV4dCArICdcXG4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZmlsZUxpbmVzW2xpbmVOdW1iZXJdID0gdGV4dDtcbiAgICB9XG4gICAgY29uc3QgZGF0YSA9IGZpbGVMaW5lcy5qb2luKCdcXG4nKTtcbiAgICB0aGlzLmFwcC52YXVsdC5tb2RpZnkoZmlsZSwgZGF0YSk7XG4gIH1cblxuICAvKipcbiAgICogTW9kaWZpZXMgdGhlIGZpbGUgYnkgaW5zZXJ0aW5nIGEgbGluZSB3aXRoIHNwZWNpZmllZCB0ZXh0LlxuICAgKlxuICAgKiBUaGUgZnVuY3Rpb24gd2lsbCBhZGQgYSBuZXdsaW5lIGNoYXJhY3RlciBhdCB0aGUgZW5kIG9mIHRoZSBpbnNlcnRlZCBsaW5lLlxuICAgKlxuICAgKiBAcGFyYW0ge1RGaWxlfSBmaWxlIHRoZSBmaWxlIHRvIG1vZGlmeVxuICAgKiBAcGFyYW0ge3N0cmluZ1tdfSBmaWxlTGluZXMgYXJyYXkgb2YgdGhlIGZpbGUncyBjb250ZW50cywgbGluZSBieSBsaW5lXG4gICAqIEBwYXJhbSB7bnVtYmVyfSBsaW5lTnVtYmVyIHplcm8tYmFzZWQgaW5kZXggb2Ygd2hlcmUgdGhlIGxpbmUgc2hvdWxkIGJlIGluc2VydGVkXG4gICAqIEBwYXJhbSB7c3RyaW5nfSB0ZXh0IHRoZSB0ZXh0IHRoYXQgdGhlIGxpbmUgc2hhbGwgY29udGFpblxuICAgKi9cbiAgaW5zZXJ0TGluZUluRmlsZShcbiAgICBmaWxlOiBURmlsZSxcbiAgICBmaWxlTGluZXM6IHN0cmluZ1tdLFxuICAgIGxpbmVOdW1iZXI6IG51bWJlcixcbiAgICB0ZXh0OiBzdHJpbmcsXG4gICkge1xuICAgIGlmIChsaW5lTnVtYmVyID49IGZpbGVMaW5lcy5sZW5ndGgpIHtcbiAgICAgIGZpbGVMaW5lcy5wdXNoKHRleHQgKyAnXFxuJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZpbGVMaW5lcy5zcGxpY2UobGluZU51bWJlciwgMCwgdGV4dCk7XG4gICAgfVxuICAgIGNvbnN0IGRhdGEgPSBmaWxlTGluZXMuam9pbignXFxuJyk7XG4gICAgdGhpcy5hcHAudmF1bHQubW9kaWZ5KGZpbGUsIGRhdGEpO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xuICAgIHRoaXMuc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCBERUZBVUxUX1NFVFRJTkdTLCBhd2FpdCB0aGlzLmxvYWREYXRhKCkpO1xuICB9XG5cbiAgYXN5bmMgc2F2ZVNldHRpbmdzKCkge1xuICAgIC8vIHRoaXMuc2V0dGluZ3MuZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzID0gdGhpcy5zZXR0aW5ncy5maWxlbmFtZVByZWZpeFJlZ2V4UnVsZXMuZmlsdGVyKChydWxlKSA9PiB7XG4gICAgLy8gICByZXR1cm4gdHlwZW9mIHJ1bGVbMF0gPT09ICdzdHJpbmcnICYmIHR5cGVvZiBydWxlWzFdID09PSAnc3RyaW5nJyAmJiBydWxlLmxlbmd0aCA9PT0gM1xuICAgIC8vIH0pXG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgfVxufVxuXG5jbGFzcyBGaWxlbmFtZUhlYWRpbmdTeW5jU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICBwbHVnaW46IEZpbGVuYW1lSGVhZGluZ1N5bmNQbHVnaW47XG4gIGFwcDogQXBwO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IEZpbGVuYW1lSGVhZGluZ1N5bmNQbHVnaW4pIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gICAgdGhpcy5hcHAgPSBhcHA7XG4gIH1cblxuICBkaXNwbGF5KCk6IHZvaWQge1xuICAgIGxldCB7IGNvbnRhaW5lckVsIH0gPSB0aGlzO1xuICAgIGxldCByZWdleElnbm9yZWRGaWxlc0RpdjogSFRNTERpdkVsZW1lbnQ7XG5cbiAgICBjb25zdCByZW5kZXJSZWdleElnbm9yZWRGaWxlcyA9IChkaXY6IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAvLyBlbXB0eSBleGlzdGluZyBkaXZcbiAgICAgIGRpdi5pbm5lckhUTUwgPSAnJztcblxuICAgICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZVJlZ2V4ID09PSAnJykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAoIXRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlcykge1xuICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5maWxlbmFtZVByZWZpeFJlZ2V4UnVsZXMgPSBbXVxuICAgICAgfVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBmaWxlcyA9IHRoaXMuYXBwLnZhdWx0LmdldEZpbGVzKCk7XG4gICAgICAgIGNvbnN0IHJlZyA9IG5ldyBSZWdFeHAodGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlUmVnZXgpO1xuXG4gICAgICAgIGZpbGVzXG4gICAgICAgICAgLmZpbHRlcigoZmlsZSkgPT4gcmVnLmV4ZWMoZmlsZS5wYXRoKSAhPT0gbnVsbClcbiAgICAgICAgICAuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgICAgIG5ldyBTZXR0aW5nKGRpdikuc2V0RGVzYyhlbC5wYXRoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH07XG5cbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnRmlsZW5hbWUgSGVhZGluZyBTeW5jJyB9KTtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6XG4gICAgICAgICdUaGlzIHBsdWdpbiB3aWxsIG92ZXJ3cml0ZSB0aGUgZmlyc3QgaGVhZGluZyBmb3VuZCBpbiBhIGZpbGUgd2l0aCB0aGUgZmlsZW5hbWUuJyxcbiAgICB9KTtcbiAgICBjb250YWluZXJFbC5jcmVhdGVFbCgncCcsIHtcbiAgICAgIHRleHQ6XG4gICAgICAgICdJZiBubyBoZWFkZXIgaXMgZm91bmQsIHdpbGwgaW5zZXJ0IGEgbmV3IG9uZSBhdCB0aGUgZmlyc3QgbGluZSAoYWZ0ZXIgZnJvbnRtYXR0ZXIpLicsXG4gICAgfSk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdDdXN0b20gSWxsZWdhbCBDaGFyYWN0ZXJzL1N0cmluZ3MnKVxuICAgICAgLnNldERlc2MoXG4gICAgICAgICdUeXBlIGNoYXJhY3RlcnMvc3RyaW5ncyBzZXBhcmF0ZWQgYnkgYSBjb21tYS4gVGhpcyBpbnB1dCBpcyBzcGFjZSBzZW5zaXRpdmUuJyxcbiAgICAgIClcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdbXSwjLC4uLicpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZXJJbGxlZ2FsU3ltYm9scy5qb2luKCkpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlcklsbGVnYWxTeW1ib2xzID0gdmFsdWUuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ0lnbm9yZSBSZWdleCBSdWxlJylcbiAgICAgIC5zZXREZXNjKFxuICAgICAgICAnSWdub3JlIHJ1bGUgaW4gUmVnRXggZm9ybWF0LiBBbGwgZmlsZXMgbGlzdGVkIGJlbG93IHdpbGwgZ2V0IGlnbm9yZWQgYnkgdGhpcyBwbHVnaW4uJyxcbiAgICAgIClcbiAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICB0ZXh0XG4gICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdNeUZvbGRlci8uKicpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZVJlZ2V4KVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgIG5ldyBSZWdFeHAodmFsdWUpO1xuICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5pZ25vcmVSZWdleCA9IHZhbHVlO1xuICAgICAgICAgICAgfSBjYXRjaCB7XG4gICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmlnbm9yZVJlZ2V4ID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgcmVuZGVyUmVnZXhJZ25vcmVkRmlsZXMocmVnZXhJZ25vcmVkRmlsZXNEaXYpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1VzZSBGaWxlIE9wZW4gSG9vaycpXG4gICAgICAuc2V0RGVzYyhcbiAgICAgICAgJ1doZXRoZXIgdGhpcyBwbHVnaW4gc2hvdWxkIHRyaWdnZXIgd2hlbiBhIGZpbGUgaXMgb3BlbmVkLCBhbmQgbm90IGp1c3Qgb24gc2F2ZS4gRGlzYWJsZSB0aGlzIHdoZW4geW91IG5vdGljZSBjb25mbGljdHMgd2l0aCBvdGhlciBwbHVnaW5zIHRoYXQgYWxzbyBhY3Qgb24gZmlsZSBvcGVuLicsXG4gICAgICApXG4gICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgIHRvZ2dsZVxuICAgICAgICAgIC5zZXRWYWx1ZSh0aGlzLnBsdWdpbi5zZXR0aW5ncy51c2VGaWxlT3Blbkhvb2spXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlRmlsZU9wZW5Ib29rID0gdmFsdWU7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB9KSxcbiAgICAgICk7XG5cbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdVc2UgRmlsZSBTYXZlIEhvb2snKVxuICAgICAgLnNldERlc2MoXG4gICAgICAgICdXaGV0aGVyIHRoaXMgcGx1Z2luIHNob3VsZCB0cmlnZ2VyIHdoZW4gYSBmaWxlIGlzIHNhdmVkLiBEaXNhYmxlIHRoaXMgd2hlbiB5b3Ugd2FudCB0byB0cmlnZ2VyIHN5bmMgb25seSBtYW51YWxseS4nLFxuICAgICAgKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MudXNlRmlsZVNhdmVIb29rKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnVzZUZpbGVTYXZlSG9vayA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnTmV3IEhlYWRpbmcgU3R5bGUnKVxuICAgICAgLnNldERlc2MoXG4gICAgICAgICdXaGljaCBNYXJrZG93biBoZWFkaW5nIHN0eWxlIHRvIHVzZSB3aGVuIGNyZWF0aW5nIG5ldyBoZWFkaW5nczogUHJlZml4IChcIiMgSGVhZGluZ1wiKSBvciBVbmRlcmxpbmUgKFwiSGVhZGluZ1xcXFxuPT09XCIpLicsXG4gICAgICApXG4gICAgICAuYWRkRHJvcGRvd24oKGNiKSA9PlxuICAgICAgICBjYlxuICAgICAgICAgIC5hZGRPcHRpb24oSGVhZGluZ1N0eWxlLlByZWZpeCwgJ1ByZWZpeCcpXG4gICAgICAgICAgLmFkZE9wdGlvbihIZWFkaW5nU3R5bGUuVW5kZXJsaW5lLCAnVW5kZXJsaW5lJylcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubmV3SGVhZGluZ1N0eWxlKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1ByZWZpeCcpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubmV3SGVhZGluZ1N0eWxlID0gSGVhZGluZ1N0eWxlLlByZWZpeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gJ1VuZGVybGluZScpIHtcbiAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubmV3SGVhZGluZ1N0eWxlID0gSGVhZGluZ1N0eWxlLlVuZGVybGluZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLnNldE5hbWUoJ1JlcGxhY2UgSGVhZGluZyBTdHlsZScpXG4gICAgICAuc2V0RGVzYyhcbiAgICAgICAgJ1doZXRoZXIgdGhpcyBwbHVnaW4gc2hvdWxkIHJlcGxhY2UgZXhpc3RpbmcgaGVhZGluZyBzdHlsZXMgd2hlbiB1cGRhdGluZyBoZWFkaW5ncy4nLFxuICAgICAgKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MucmVwbGFjZVN0eWxlKVxuICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLnJlcGxhY2VTdHlsZSA9IHZhbHVlO1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnVW5kZXJsaW5lIFN0cmluZycpXG4gICAgICAuc2V0RGVzYyhcbiAgICAgICAgJ1RoZSBzdHJpbmcgdG8gdXNlIHdoZW4gaW5zZXJ0IFVuZGVybGluZS1zdHlsZSBoZWFkaW5nczsgc2hvdWxkIGJlIHNvbWUgbnVtYmVyIG9mIFwiPVwicy4nLFxuICAgICAgKVxuICAgICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgIHRleHRcbiAgICAgICAgICAuc2V0UGxhY2Vob2xkZXIoJz09PScpXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLnVuZGVybGluZVN0cmluZylcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy51bmRlcmxpbmVTdHJpbmcgPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcbiAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgIC5zZXROYW1lKCdLZWVwIEZpbGVuYW1lIFByZWZpeGVzJylcbiAgICAgIC5zZXREZXNjKFxuICAgICAgICAnVW5pcXVlIE5vdGVzLCBaZXR0ZWxLYXN0ZW4sIGFuZCBvdGhlciBub3RlIG9yZ2FuaXphdGlvbiBzY2hlbWVzIHVzZSBwcmVmaXhlcyB0byBrZWVwIG5vdGVzIGluIG9yZGVyLiBJZiB5b3Ugd2FudCB0byBrZWVwIHRoZXNlIHByZWZpeGVzIGluIHlvdXIgZmlsZW5hbWVzIGJ1dCBOT1QgaGVhZGluZ3MsIGVuYWJsZSB0aGlzIHNldHRpbmcuJyxcbiAgICAgIClcbiAgICAgIC5hZGRUb2dnbGUoKHRvZ2dsZSkgPT5cbiAgICAgICAgdG9nZ2xlXG4gICAgICAgICAgLnNldFZhbHVlKHRoaXMucGx1Z2luLnNldHRpbmdzLmtlZXBGaWxlbmFtZVByZWZpeClcbiAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5rZWVwRmlsZW5hbWVQcmVmaXggPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgICAgfSksXG4gICAgICApO1xuXG4gICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmtlZXBGaWxlbmFtZVByZWZpeCkge1xuXG4gICAgICBjb25zdCBhZGROZXdSdWxlID0gKCkgPT4ge1xuICAgICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbClcbiAgICAgICAgICAuc2V0TmFtZSgnUmVnZXggUnVsZScpLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignUnVsZSBOYW1lJylcbiAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIHRoaXMucGx1Z2luLnNldHRpbmdzLmV4Y2x1ZGVkID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgLy8gdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgKVxuICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XG4gICAgICAgICAgICB0ZXh0XG4gICAgICAgICAgICAgIC5zZXRQbGFjZWhvbGRlcignL1JlZ3VsYXIgRXhwcmVzc2lvbi8nKVxuICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnRmlsZW5hbWUgUHJlZml4IFJlZ2V4IFJ1bGVzJyB9KTtcbiAgICAgIGNvbnN0IGRlc2MgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gICAgICBkZXNjLmFwcGVuZChcbiAgICAgICAgJ0ZpbGVuYW1lIHByZWZpeCByZWdleCBydWxlcyB0byBtYXRjaCB5b3VyIG5vdGUgbmFtaW5nIGNvbnZlbnRpb24ocykuJyxcbiAgICAgICk7XG5cbiAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXREZXNjKGRlc2MpO1xuICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzID0gdGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzIHx8IFtdXG4gICAgICBjb25zb2xlLmxvZygndGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzJywgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzKVxuICAgICAgaWYgKHRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlcy5mb3JFYWNoKChydWxlLCBpbmRleCkgPT4ge1xuICAgICAgICAgIGNvbnN0IFtuYW1lLCByZWdleCwgZW5hYmxlZF0gPSBydWxlO1xuICAgICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ1JlZ2V4IFJ1bGUnKVxuICAgICAgICAgICAgLmFkZFRleHQoKHRleHQpID0+IHtcbiAgICAgICAgICAgICAgdGV4dC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5maWxlbmFtZVByZWZpeFJlZ2V4UnVsZXNbaW5kZXhdWzBdID0gdmFsdWVcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICBpZiAobmFtZSAmJiBuYW1lLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICB0ZXh0LnNldFZhbHVlKG5hbWUpXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGV4dC5zZXRQbGFjZWhvbGRlcignUnVsZSBOYW1lJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PiB7XG4gICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgICAub25DaGFuZ2UoYXN5bmMgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIGlmIChyZWdleCAmJiByZWdleC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgdGV4dC5zZXRWYWx1ZShyZWdleClcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXh0LnNldFBsYWNlaG9sZGVyKCcvUmVndWxhciBFeHByZXNzaW9uLycpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuYWRkVG9nZ2xlKCh0b2dnbGUpID0+XG4gICAgICAgICAgICAgIHRvZ2dsZVxuICAgICAgICAgICAgICAgIC5zZXRWYWx1ZShlbmFibGVkKVxuICAgICAgICAgICAgICAgIC5vbkNoYW5nZShhc3luYyAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlc1tpbmRleF0gPSBbXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlc1tpbmRleF1bMF0sXG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlc1tpbmRleF1bMV0sXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIC5hZGRFeHRyYUJ1dHRvbigoYnV0dG9uKSA9PiB7XG4gICAgICAgICAgICAgIGJ1dHRvbi5zZXRJY29uKCdjcm9zcycpXG4gICAgICAgICAgICAgIGJ1dHRvbi5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5maWxlbmFtZVByZWZpeFJlZ2V4UnVsZXMuc3BsaWNlKGluZGV4LCAxKVxuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpLmFkZEJ1dHRvbigoYnV0dG9uKSA9PiB7XG4gICAgICAgIGJ1dHRvbi5zZXRCdXR0b25UZXh0KCdBZGQgTmV3IFJ1bGUnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5maWxlbmFtZVByZWZpeFJlZ2V4UnVsZXMucHVzaChbJycsICcnLCB0cnVlXSlcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICBuZXcgU2V0dGluZyhjb250YWluZXJFbCkuYWRkQnV0dG9uKChidXR0b24pID0+IHtcbiAgICAgICAgYnV0dG9uLnNldEJ1dHRvblRleHQoJ1Jlc2V0IERlZmF1bHRzJykub25DbGljayhhc3luYyAoKSA9PiB7XG4gICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzID0gREVGQVVMVF9TRVRUSU5HUy5maWxlbmFtZVByZWZpeFJlZ2V4UnVsZXNcbiAgICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgICAgICB0aGlzLmRpc3BsYXkoKTtcbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICAgIC8vIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgLy8gICAuc2V0TmFtZSgnRmlsZW5hbWUgUHJlZml4IFJlZ2V4IFJ1bGVzJylcbiAgICAgIC8vICAgLnNldERlc2MoXG4gICAgICAvLyAgICAgJ0lnbm9yZSBydWxlIGluIFJlZ0V4IGZvcm1hdC4gQWxsIGZpbGVzIGxpc3RlZCBiZWxvdyB3aWxsIGdldCBpZ25vcmVkIGJ5IHRoaXMgcGx1Z2luLicsXG4gICAgICAvLyAgIClcbiAgICAgIC8vICAgLmFkZFRleHQoKHRleHQpID0+XG4gICAgICAvLyAgICAgdGV4dFxuICAgICAgLy8gICAgICAgLnNldFBsYWNlaG9sZGVyKCdNeUZvbGRlci8uKicpXG4gICAgICAvLyAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuZmlsZW5hbWVQcmVmaXhSZWdleFJ1bGVzKVxuICAgICAgLy8gICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgLy8gICAgICAgICB0cnkge1xuICAgICAgLy8gICAgICAgICAgIG5ldyBSZWdFeHAodmFsdWUpO1xuICAgICAgLy8gICAgICAgICAgIHRoaXMucGx1Z2luLnNldHRpbmdzLmZpbGVuYW1lUHJlZml4UmVnZXhSdWxlcyA9IHZhbHVlO1xuICAgICAgLy8gICAgICAgICB9IGNhdGNoIHtcbiAgICAgIC8vICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5maWxlbmFtZVByZWZpeFJlZ2V4UnVsZXMgPSAnJztcbiAgICAgIC8vICAgICAgICAgfVxuXG4gICAgICAvLyAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgLy8gICAgICAgICByZW5kZXJSZWdleElnbm9yZWRGaWxlcyhyZWdleElnbm9yZWRGaWxlc0Rpdik7XG4gICAgICAvLyAgICAgICAgIHRoaXMuZGlzcGxheSgpO1xuICAgICAgLy8gICAgICAgfSksXG4gICAgICAvLyAgICk7XG4gICAgfVxuXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnSWdub3JlZCBGaWxlcyBCeSBSZWdleCcgfSk7XG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ3AnLCB7XG4gICAgICB0ZXh0OiAnQWxsIGZpbGVzIG1hdGNoaW5nIHRoZSBhYm92ZSBSZWdFeCB3aWxsIGdldCBsaXN0ZWQgaGVyZScsXG4gICAgfSk7XG5cbiAgICByZWdleElnbm9yZWRGaWxlc0RpdiA9IGNvbnRhaW5lckVsLmNyZWF0ZURpdigndGVzdCcpO1xuICAgIHJlbmRlclJlZ2V4SWdub3JlZEZpbGVzKHJlZ2V4SWdub3JlZEZpbGVzRGl2KTtcblxuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHsgdGV4dDogJ01hbnVhbGx5IElnbm9yZWQgRmlsZXMnIH0pO1xuICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdwJywge1xuICAgICAgdGV4dDpcbiAgICAgICAgJ1lvdSBjYW4gaWdub3JlIGZpbGVzIGZyb20gdGhpcyBwbHVnaW4gYnkgdXNpbmcgdGhlIFwiaWdub3JlIHRoaXMgZmlsZVwiIGNvbW1hbmQnLFxuICAgIH0pO1xuXG4gICAgLy8gZ28gb3ZlciBhbGwgaWdub3JlZCBmaWxlcyBhbmQgYWRkIHRoZW1cbiAgICBmb3IgKGxldCBrZXkgaW4gdGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlZEZpbGVzKSB7XG4gICAgICBjb25zdCBpZ25vcmVkRmlsZXNTZXR0aW5nc09iaiA9IG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXREZXNjKGtleSk7XG5cbiAgICAgIGlnbm9yZWRGaWxlc1NldHRpbmdzT2JqLmFkZEJ1dHRvbigoYnV0dG9uKSA9PiB7XG4gICAgICAgIGJ1dHRvbi5zZXRCdXR0b25UZXh0KCdEZWxldGUnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBkZWxldGUgdGhpcy5wbHVnaW4uc2V0dGluZ3MuaWdub3JlZEZpbGVzW2tleV07XG4gICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZVNldHRpbmdzKCk7XG4gICAgICAgICAgdGhpcy5kaXNwbGF5KCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOlsiVEZpbGUiLCJQbHVnaW4iLCJTZXR0aW5nIiwiUGx1Z2luU2V0dGluZ1RhYiJdLCJtYXBwaW5ncyI6Ijs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQ25DLElBQUksYUFBYSxHQUFHLE1BQU0sQ0FBQyxjQUFjO0FBQ3pDLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFFLFlBQVksS0FBSyxJQUFJLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUNwRixRQUFRLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUMxRyxJQUFJLE9BQU8sYUFBYSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUM7QUFDRjtBQUNPLFNBQVMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDaEMsSUFBSSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFVBQVUsSUFBSSxDQUFDLEtBQUssSUFBSTtBQUM3QyxRQUFRLE1BQU0sSUFBSSxTQUFTLENBQUMsc0JBQXNCLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLCtCQUErQixDQUFDLENBQUM7QUFDbEcsSUFBSSxhQUFhLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3hCLElBQUksU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQyxFQUFFO0FBQzNDLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxDQUFDLEtBQUssSUFBSSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFNBQVMsR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN6RixDQUFDO0FBdUNEO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQy9ELFFBQVEsU0FBUyxTQUFTLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUNuRyxRQUFRLFNBQVMsUUFBUSxDQUFDLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtBQUN0RyxRQUFRLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRSxFQUFFLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUMsRUFBRTtBQUN0SCxRQUFRLElBQUksQ0FBQyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxVQUFVLElBQUksRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUM5RSxLQUFLLENBQUMsQ0FBQztBQUNQLENBQUM7QUFDRDtBQUNPLFNBQVMsV0FBVyxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7QUFDM0MsSUFBSSxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3JILElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLE9BQU8sTUFBTSxLQUFLLFVBQVUsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLFdBQVcsRUFBRSxPQUFPLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0osSUFBSSxTQUFTLElBQUksQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLFVBQVUsQ0FBQyxFQUFFLEVBQUUsT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN0RSxJQUFJLFNBQVMsSUFBSSxDQUFDLEVBQUUsRUFBRTtBQUN0QixRQUFRLElBQUksQ0FBQyxFQUFFLE1BQU0sSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQztBQUN0RSxRQUFRLE9BQU8sQ0FBQyxFQUFFLElBQUk7QUFDdEIsWUFBWSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFH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
