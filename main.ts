import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFile,
  Editor,
  MarkdownView,
} from 'obsidian';
import { isExcluded } from './exclusions';

const stockIllegalSymbols = /[\\/:|#^[\]]/g;

// Must be Strings unless settings dialog is updated.
const enum HeadingStyle {
  Prefix = 'Prefix',
  Underline = 'Underline',
}

interface LinePointer {
  lineNumber: number;
  text: string;
  style: HeadingStyle;
}

interface FilenameHeadingSyncPluginSettings {
  userIllegalSymbols: string[];
  ignoreRegex: string;
  ignoredFiles: { [key: string]: null };
  useFileOpenHook: boolean;
  useFileSaveHook: boolean;
  newHeadingStyle: HeadingStyle;
  replaceStyle: boolean;
  underlineString: string;
  keepFilenamePrefix: boolean;
  filenamePrefixRegexRules: [string, string, boolean][];
  filenamePrefixSaveHistory: boolean;
}

const DEFAULT_SETTINGS: FilenameHeadingSyncPluginSettings = {
  userIllegalSymbols: [],
  ignoredFiles: {},
  ignoreRegex: '',
  useFileOpenHook: true,
  useFileSaveHook: true,
  newHeadingStyle: HeadingStyle.Prefix,
  replaceStyle: false,
  underlineString: '===',
  keepFilenamePrefix: false,
  filenamePrefixRegexRules: [
    ['timestamp', '^[0-9]{12}\\s*', false], // 202310241202 My Unique Note
    ['zettelkasten', '^[A-Za-z0-9]+\\s+-\\s*', false] // work1a3ba3 - My Work Note 
  ],
  filenamePrefixSaveHistory: false,
};

export default class FilenameHeadingSyncPlugin extends Plugin {
  isRenameInProgress: boolean = false;
  settings: FilenameHeadingSyncPluginSettings;

  async onload() {
    await this.loadSettings();

    this.registerEvent(
      this.app.vault.on('rename', (file, oldPath) => {
        if (this.settings.useFileSaveHook) {
          return this.handleSyncFilenameToHeading(file, oldPath);
        }
      }),
    );
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (this.settings.useFileSaveHook) {
          return this.handleSyncHeadingToFile(file);
        }
      }),
    );

    this.registerEvent(
      this.app.workspace.on('file-open', (file) => {
        if (this.settings.useFileOpenHook && file !== null) {
          return this.handleSyncFilenameToHeading(file, file.path);
        }
      }),
    );

    this.addSettingTab(new FilenameHeadingSyncSettingTab(this.app, this));

    this.addCommand({
      id: 'page-heading-sync-ignore-file',
      name: 'Ignore current file',
      checkCallback: (checking: boolean) => {
        let leaf = this.app.workspace.activeLeaf;
        if (leaf) {
          if (!checking) {
            this.settings.ignoredFiles[
              this.app.workspace.getActiveFile().path
            ] = null;
            this.saveSettings();
          }
          return true;
        }
        return false;
      },
    });

    this.addCommand({
      id: 'sync-filename-to-heading',
      name: 'Sync Filename to Heading',
      editorCallback: (editor: Editor, view: MarkdownView) =>
        this.forceSyncFilenameToHeading(view.file),
    });

    this.addCommand({
      id: 'sync-heading-to-filename',
      name: 'Sync Heading to Filename',
      editorCallback: (editor: Editor, view: MarkdownView) =>
        this.forceSyncHeadingToFilename(view.file),
    });
  }

  fileIsIgnored(activeFile: TFile, path: string): boolean {
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

      const reg = new RegExp(this.settings.ignoreRegex);
      return reg.exec(path) !== null;
    } catch { }

    return false;
  }

  /**
   * Renames the file with the first heading found
   *
   * @param      {TAbstractFile}  file    The file
   */
  handleSyncHeadingToFile(file: TAbstractFile) {
    if (!(file instanceof TFile)) {
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
  }

  forceSyncHeadingToFilename(file: TFile) {
    this.app.vault.read(file).then(async (data) => {
      const lines = data.split('\n');
      const start = this.findNoteStart(lines);
      const heading = this.findHeading(lines, start);

      if (heading === null) return; // no heading found, nothing to do here

      let sanitizedHeading = this.sanitizeHeading(heading.text);

      // If Keep Filename Prefixes is enabled, check if the prefix is already in the heading and add if not
      if (this.settings.keepFilenamePrefix) {
        const prefix = this.getFilenamePrefix(file)
        // check if prefix is already in heading
        if (!sanitizedHeading.startsWith(prefix) && sanitizedHeading.length > 0) {
          sanitizedHeading = `${prefix.trim()} ${sanitizedHeading.trim()}`
        }
      }

      if (
        sanitizedHeading.length > 0 &&
        this.sanitizeHeading(file.basename).length > 0 &&
        this.sanitizeHeading(file.basename) !== sanitizedHeading
      ) {
        const newPath = `${file.parent.path}/${sanitizedHeading}.md`;
        // check if new filename is just going to be empty title with prefix
        if (this.settings.keepFilenamePrefix && sanitizedHeading === this.getFilenamePrefix(file)) {
          // just bail
          return;
        }
        this.isRenameInProgress = true;
        await this.app.fileManager.renameFile(file, newPath);
        this.isRenameInProgress = false;
      }
    });
  }

  /**
   * Syncs the current filename to the first heading
   * Finds the first heading of the file, then replaces it with the filename
   *
   * @param      {TAbstractFile}  file     The file that fired the event
   * @param      {string}         oldPath  The old path
   */
  handleSyncFilenameToHeading(file: TAbstractFile, oldPath: string) {
    if (this.isRenameInProgress) {
      return;
    }

    if (!(file instanceof TFile)) {
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
  }

  forceSyncFilenameToHeading(file: TFile) {
    const prefix = this.getFilenamePrefix(file)
    const sanitizedHeading = this.sanitizeHeading(file.basename, prefix)

    this.app.vault.read(file).then((data) => {
      const lines = data.split('\n');
      const start = this.findNoteStart(lines);
      const heading = this.findHeading(lines, start);

      if (heading !== null && sanitizedHeading.length > 0) {
        if (this.sanitizeHeading(heading.text, prefix) !== sanitizedHeading) {
          this.replaceHeading(
            file,
            lines,
            heading.lineNumber,
            heading.style,
            sanitizedHeading,
          );
        }
      } else if (sanitizedHeading.length > 0) {
        this.insertHeading(file, lines, start, sanitizedHeading);
      }
    });
  }

  /**
   * Finds the start of the note file, excluding frontmatter
   *
   * @param {string[]} fileLines array of the file's contents, line by line
   * @returns {number} zero-based index of the starting line of the note
   */
  findNoteStart(fileLines: string[]) {
    // check for frontmatter by checking if first line is a divider ('---')
    if (fileLines[0] === '---') {
      // find end of frontmatter
      // if no end is found, then it isn't really frontmatter and function will end up returning 0
      for (let i = 1; i < fileLines.length; i++) {
        if (fileLines[i] === '---') {
          // end of frontmatter found, next line is start of note
          return i + 1;
        }
      }
    }
    return 0;
  }

  /**
   * Finds the first heading of the note file
   *
   * @param {string[]} fileLines array of the file's contents, line by line
   * @param {number} startLine zero-based index of the starting line of the note
   * @returns {LinePointer | null} LinePointer to heading or null if no heading found
   */
  findHeading(fileLines: string[], startLine: number): LinePointer | null {
    for (let i = startLine; i < fileLines.length; i++) {
      if (fileLines[i].startsWith('# ')) {
        return {
          lineNumber: i,
          text: fileLines[i].substring(2),
          style: HeadingStyle.Prefix,
        };
      } else {
        if (
          fileLines[i + 1] !== undefined &&
          fileLines[i + 1].match(/^=+$/) !== null
        ) {
          return {
            lineNumber: i,
            text: fileLines[i],
            style: HeadingStyle.Underline,
          };
        }
      }
    }
    return null; // no heading found
  }

  regExpEscape(str: string): string {
    return String(str).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  /**
   * Gets the prefix of a file, if any.
   * 
   * @param {TFile} file the file to get the prefix from
   * @returns {string} prefix of the file, or an empty string if no prefix is found
   */
  getFilenamePrefix(file: TFile): string {
    // const prefixOptions = [
    //   ['timestamp', new RegExp(/^[0-9]+\s/)],
    //   ['zk', new RegExp(/^.*\s-\s/)]
    // ];
    const prefixOptions = this.settings.filenamePrefixRegexRules

    if (!this.settings.keepFilenamePrefix) {
      return '';
    }

    const filename = file.basename;

    for (const option of prefixOptions) {
      const [nameString, regexString] = option;
      const name = nameString.trim();
      const regex = new RegExp(regexString);
      const matches = filename.match(regex)
      if (matches && matches[0]) {
        console.log('prefix matched!', name, regexString, filename, matches);
        return matches[0];
      } else {
        console.log('prefix no match', name, regexString, filename);
      }
    }

    // no prefix found
    return '';
  }

  sanitizeHeading(text: string, prefix?: string) {
    // stockIllegalSymbols is a regExp object, but userIllegalSymbols is a list of strings and therefore they are handled separately.
    text = text.replace(stockIllegalSymbols, '');

    const userIllegalSymbolsEscaped = this.settings.userIllegalSymbols.map(
      (str) => this.regExpEscape(str),
    );
    const userIllegalSymbolsRegExp = new RegExp(
      userIllegalSymbolsEscaped.join('|'),
      'g',
    );
    text = text.replace(userIllegalSymbolsRegExp, '');

    // if prefix protection is turned on, remove prefix from heading
    if (this.settings.keepFilenamePrefix && prefix) {
      text = text.replace(prefix, '');
      console.log('sanitizeHeading', 'text', text)
    }

    return text.trim();
  }

  /**
   * Insert the `heading` at `lineNumber` in `file`.
   *
   * @param {TFile} file the file to modify
   * @param {string[]} fileLines array of the file's contents, line by line
   * @param {number} lineNumber zero-based index of the line to replace
   * @param {string} text the new text
   */
  insertHeading(
    file: TFile,
    fileLines: string[],
    lineNumber: number,
    heading: string,
  ) {
    const newStyle = this.settings.newHeadingStyle;
    switch (newStyle) {
      case HeadingStyle.Underline: {
        this.insertLineInFile(file, fileLines, lineNumber, `${heading}`);

        this.insertLineInFile(
          file,
          fileLines,
          lineNumber + 1,
          this.settings.underlineString,
        );
        break;
      }
      case HeadingStyle.Prefix: {
        this.insertLineInFile(file, fileLines, lineNumber, `# ${heading}`);
        break;
      }
    }
  }

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
  replaceHeading(
    file: TFile,
    fileLines: string[],
    lineNumber: number,
    oldStyle: HeadingStyle,
    newHeading: string,
  ) {
    const newStyle = this.settings.newHeadingStyle;
    const replaceStyle = this.settings.replaceStyle;
    // If replacing the style
    if (replaceStyle) {
      switch (newStyle) {
        // For underline style, replace heading line...
        case HeadingStyle.Underline: {
          this.replaceLineInFile(file, fileLines, lineNumber, `${newHeading}`);
          //..., then add or replace underline.
          switch (oldStyle) {
            case HeadingStyle.Prefix: {
              this.insertLineInFile(
                file,
                fileLines,
                lineNumber + 1,
                this.settings.underlineString,
              );
              break;
            }
            case HeadingStyle.Underline: {
              // Update underline with setting.
              this.replaceLineInFile(
                file,
                fileLines,
                lineNumber + 1,
                this.settings.underlineString,
              );
              break;
            }
          }
          break;
        }
        // For prefix style, replace heading line, and possibly delete underline
        case HeadingStyle.Prefix: {
          this.replaceLineInFile(
            file,
            fileLines,
            lineNumber,
            `# ${newHeading}`,
          );
          switch (oldStyle) {
            case HeadingStyle.Prefix: {
              // nop
              break;
            }
            case HeadingStyle.Underline: {
              this.replaceLineInFile(file, fileLines, lineNumber + 1, '');
              break;
            }
          }
          break;
        }
      }
    } else {
      // If not replacing style, match
      switch (oldStyle) {
        case HeadingStyle.Underline: {
          this.replaceLineInFile(file, fileLines, lineNumber, `${newHeading}`);
          break;
        }
        case HeadingStyle.Prefix: {
          this.replaceLineInFile(
            file,
            fileLines,
            lineNumber,
            `# ${newHeading}`,
          );
          break;
        }
      }
    }
  }

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
  replaceLineInFile(
    file: TFile,
    fileLines: string[],
    lineNumber: number,
    text: string,
  ) {
    if (lineNumber >= fileLines.length) {
      fileLines.push(text + '\n');
    } else {
      fileLines[lineNumber] = text;
    }
    const data = fileLines.join('\n');
    this.app.vault.modify(file, data);
  }

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
  insertLineInFile(
    file: TFile,
    fileLines: string[],
    lineNumber: number,
    text: string,
  ) {
    if (lineNumber >= fileLines.length) {
      fileLines.push(text + '\n');
    } else {
      fileLines.splice(lineNumber, 0, text);
    }
    const data = fileLines.join('\n');
    this.app.vault.modify(file, data);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    // this.settings.filenamePrefixRegexRules = this.settings.filenamePrefixRegexRules.filter((rule) => {
    //   return typeof rule[0] === 'string' && typeof rule[1] === 'string' && rule.length === 3
    // })
    await this.saveData(this.settings);
  }
}

class FilenameHeadingSyncSettingTab extends PluginSettingTab {
  plugin: FilenameHeadingSyncPlugin;
  app: App;

  constructor(app: App, plugin: FilenameHeadingSyncPlugin) {
    super(app, plugin);
    this.plugin = plugin;
    this.app = app;
  }

  display(): void {
    let { containerEl } = this;
    let regexIgnoredFilesDiv: HTMLDivElement;

    const renderRegexIgnoredFiles = (div: HTMLElement) => {
      // empty existing div
      div.innerHTML = '';

      if (this.plugin.settings.ignoreRegex === '') {
        return;
      }
      if (!this.plugin.settings.filenamePrefixRegexRules) {
        this.plugin.settings.filenamePrefixRegexRules = []
      }

      try {
        const files = this.app.vault.getFiles();
        const reg = new RegExp(this.plugin.settings.ignoreRegex);

        files
          .filter((file) => reg.exec(file.path) !== null)
          .forEach((el) => {
            new Setting(div).setDesc(el.path);
          });
      } catch (e) {
        return;
      }
    };

    containerEl.empty();

    containerEl.createEl('h2', { text: 'Filename Heading Sync' });
    containerEl.createEl('p', {
      text:
        'This plugin will overwrite the first heading found in a file with the filename.',
    });
    containerEl.createEl('p', {
      text:
        'If no header is found, will insert a new one at the first line (after frontmatter).',
    });

    new Setting(containerEl)
      .setName('Custom Illegal Characters/Strings')
      .setDesc(
        'Type characters/strings separated by a comma. This input is space sensitive.',
      )
      .addText((text) =>
        text
          .setPlaceholder('[],#,...')
          .setValue(this.plugin.settings.userIllegalSymbols.join())
          .onChange(async (value) => {
            this.plugin.settings.userIllegalSymbols = value.split(',');
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Ignore Regex Rule')
      .setDesc(
        'Ignore rule in RegEx format. All files listed below will get ignored by this plugin.',
      )
      .addText((text) =>
        text
          .setPlaceholder('MyFolder/.*')
          .setValue(this.plugin.settings.ignoreRegex)
          .onChange(async (value) => {
            try {
              new RegExp(value);
              this.plugin.settings.ignoreRegex = value;
            } catch {
              this.plugin.settings.ignoreRegex = '';
            }

            await this.plugin.saveSettings();
            renderRegexIgnoredFiles(regexIgnoredFilesDiv);
          }),
      );

    new Setting(containerEl)
      .setName('Use File Open Hook')
      .setDesc(
        'Whether this plugin should trigger when a file is opened, and not just on save. Disable this when you notice conflicts with other plugins that also act on file open.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useFileOpenHook)
          .onChange(async (value) => {
            this.plugin.settings.useFileOpenHook = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Use File Save Hook')
      .setDesc(
        'Whether this plugin should trigger when a file is saved. Disable this when you want to trigger sync only manually.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.useFileSaveHook)
          .onChange(async (value) => {
            this.plugin.settings.useFileSaveHook = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('New Heading Style')
      .setDesc(
        'Which Markdown heading style to use when creating new headings: Prefix ("# Heading") or Underline ("Heading\\n===").',
      )
      .addDropdown((cb) =>
        cb
          .addOption(HeadingStyle.Prefix, 'Prefix')
          .addOption(HeadingStyle.Underline, 'Underline')
          .setValue(this.plugin.settings.newHeadingStyle)
          .onChange(async (value) => {
            if (value === 'Prefix') {
              this.plugin.settings.newHeadingStyle = HeadingStyle.Prefix;
            }
            if (value === 'Underline') {
              this.plugin.settings.newHeadingStyle = HeadingStyle.Underline;
            }
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Replace Heading Style')
      .setDesc(
        'Whether this plugin should replace existing heading styles when updating headings.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.replaceStyle)
          .onChange(async (value) => {
            this.plugin.settings.replaceStyle = value;
            await this.plugin.saveSettings();
          }),
      );

    new Setting(containerEl)
      .setName('Underline String')
      .setDesc(
        'The string to use when insert Underline-style headings; should be some number of "="s.',
      )
      .addText((text) =>
        text
          .setPlaceholder('===')
          .setValue(this.plugin.settings.underlineString)
          .onChange(async (value) => {
            this.plugin.settings.underlineString = value;
            await this.plugin.saveSettings();
          }),
      );
    new Setting(containerEl)
      .setName('Keep Filename Prefixes')
      .setDesc(
        'Unique Notes, ZettelKasten, and other note organization schemes use prefixes to keep notes in order. If you want to keep these prefixes in your filenames but NOT headings, enable this setting.',
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.keepFilenamePrefix)
          .onChange(async (value) => {
            this.plugin.settings.keepFilenamePrefix = value;
            await this.plugin.saveSettings();
            this.display();
          }),
      );

    if (this.plugin.settings.keepFilenamePrefix) {

      const addNewRule = () => {
        new Setting(containerEl)
          .setName('Regex Rule').addText((text) =>
            text
              .setPlaceholder('Rule Name')
              .onChange(async (value) => {
                // this.plugin.settings.excluded = value;
                // this.plugin.saveSettings();
              })
          )
          .addText((text) => {
            text
              .setPlaceholder('/Regular Expression/')
              .onChange(async (value) => {
                //
              })
          })
      }
      containerEl.createEl('h2', { text: 'Filename Prefix Regex Rules' });
      const desc = document.createDocumentFragment();
      desc.append(
        'Filename prefix regex rules to match your note naming convention(s).',
      );

      new Setting(containerEl).setDesc(desc);
      this.plugin.settings.filenamePrefixRegexRules = this.plugin.settings.filenamePrefixRegexRules || []
      console.log('this.plugin.settings.filenamePrefixRegexRules', this.plugin.settings.filenamePrefixRegexRules)
      if (this.plugin.settings.filenamePrefixRegexRules.length > 0) {
        this.plugin.settings.filenamePrefixRegexRules.forEach((rule, index) => {
          const [name, regex, enabled] = rule;
          new Setting(containerEl)
            .setName('Regex Rule')
            .addText((text) => {
              text.onChange(async (value) => {
                this.plugin.settings.filenamePrefixRegexRules[index][0] = value
                this.plugin.saveSettings();
              })

              if (name && name.length > 0) {
                text.setValue(name)
              } else {
                text.setPlaceholder('Rule Name')
              }
            })
            .addText((text) => {
              text
                .onChange(async (value) => {
                  //
                })
              if (regex && regex.length > 0) {
                text.setValue(regex)
              } else {
                text.setPlaceholder('/Regular Expression/')
              }
            })
            .addToggle((toggle) =>
              toggle
                .setValue(enabled)
                .onChange(async (value) => {
                  this.plugin.settings.filenamePrefixRegexRules[index] = [
                    this.plugin.settings.filenamePrefixRegexRules[index][0],
                    this.plugin.settings.filenamePrefixRegexRules[index][1],
                    value
                  ]
                  await this.plugin.saveSettings();
                }),
            )
            .addExtraButton((button) => {
              button.setIcon('cross')
              button.onClick(async () => {
                this.plugin.settings.filenamePrefixRegexRules.splice(index, 1)
                await this.plugin.saveSettings();
                this.display();
              })
            })
        })
      }

      new Setting(containerEl).addButton((button) => {
        button.setButtonText('Add New Rule').onClick(async () => {
          this.plugin.settings.filenamePrefixRegexRules.push(['', '', true])
          await this.plugin.saveSettings();
          this.display();
        })
      })
      new Setting(containerEl).addButton((button) => {
        button.setButtonText('Reset Defaults').onClick(async () => {
          this.plugin.settings.filenamePrefixRegexRules = DEFAULT_SETTINGS.filenamePrefixRegexRules
          await this.plugin.saveSettings();
          this.display();
        })
      })

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
      text:
        'You can ignore files from this plugin by using the "ignore this file" command',
    });

    // go over all ignored files and add them
    for (let key in this.plugin.settings.ignoredFiles) {
      const ignoredFilesSettingsObj = new Setting(containerEl).setDesc(key);

      ignoredFilesSettingsObj.addButton((button) => {
        button.setButtonText('Delete').onClick(async () => {
          delete this.plugin.settings.ignoredFiles[key];
          await this.plugin.saveSettings();
          this.display();
        });
      });
    }
  }
}
