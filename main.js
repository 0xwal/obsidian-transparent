const { Plugin, PluginSettingTab, Setting } = require("obsidian");

class WindowTransparencyPlugin extends Plugin {
  async onload() {
    console.log("Window Transparency Plugin loaded");
    const { opacity, disableTrafficLight } = (await this.loadData()) || {
      opacity: 0.8,
      disableTrafficLight: false,
    };
    this.setWindowOpacity(opacity, disableTrafficLight);
    this.addSettingTab(new WindowTransparencySettingTab(this.app, this));
  }

  setWindowOpacity(opacity, disableTrafficLight) {
    const electronWindow = require("electron").remote.getCurrentWindow();
    electronWindow.setOpacity(opacity);
    if (disableTrafficLight) {
      electronWindow.setWindowButtonVisibility(false);
    } else {
      electronWindow.setWindowButtonVisibility(true);
    }
  }

  onunload() {
    console.log("Window Transparency Plugin unloaded");
  }

  async saveOpacitySetting(opacity, disableTrafficLight) {
    await this.saveData({ opacity, disableTrafficLight });
  }
}

class WindowTransparencySettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Window Transparency Settings" });

    this.plugin
      .loadData()
      .then(({ opacity = 0.8, disableTrafficLight = false } = {}) => {
        new Setting(containerEl)
          .setName("Window Opacity")
          .setDesc("Set the opacity (0.001 to 1).")
          .addText((text) => {
            text.setValue(opacity.toString()).onChange(async (value) => {
              const numValue = parseFloat(value);
              if (this.isValidOpacity(numValue)) {
                this.plugin.setWindowOpacity(numValue, disableTrafficLight);
                await this.plugin.saveOpacitySetting(
                  numValue,
                  disableTrafficLight,
                );
              } else {
                console.log("Opacity must be between 0.001 and 1.");
              }
            });
          });

        new Setting(containerEl)
          .setName("Disable Traffic Light Buttons")
          .setDesc("Hide the close, minimize, and maximize buttons.")
          .addToggle((toggle) => {
            toggle.setValue(disableTrafficLight).onChange(async (value) => {
              this.plugin.setWindowOpacity(opacity, value);
              await this.plugin.saveOpacitySetting(opacity, value);
            });
          });
      });
  }

  isValidOpacity(value) {
    return value >= 0.001 && value <= 1;
  }
}

module.exports = WindowTransparencyPlugin;
