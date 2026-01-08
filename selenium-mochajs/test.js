/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { Builder } = require('selenium-webdriver');
const { expect } = require('expect');
const chrome = require('selenium-webdriver/chrome');

describe('Selenium ChromeDriver', function () {
  let driver;
  // The chrome and chromedriver installation can take some time.
  // Give 5 minutes to install everything.
  this.timeout(5 * 60 * 1000);

  beforeEach(async function () {
    const options = new chrome.Options();
    // options.addArguments('--headless');
    options.addArguments('--no-sandbox');

    // By default, the test uses the latest stable Chrome version.
    // Replace the "stable" with the specific browser version if needed,
    // e.g. 'canary', '115' or '144.0.7534.0' for example.
    options.setBrowserVersion('stable');

    const service = new chrome.ServiceBuilder()
      .loggingTo('chromedriver.log')
      .enableVerboseLogging();

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(service)
      .build();
  });

  afterEach(async function () {
    await driver.quit();
  });

  /**
   * This test is intended to verify the setup is correct.
   */
  it('should be able to navigate to google.com', async function () {
    await driver.get('https://www.google.com');
    const title = await driver.getTitle();
    expect(title).toBe('Google');
  });

  it('should drag and drop text', async function () {
    const path = require('path');
    const url = `file://${path.join(__dirname, 'example.html')}`;
    await driver.get(url);

    const dragInput = await driver.findElement({ id: 'copy-drag' });
    const dropDiv = await driver.findElement({ id: 'copy-drop' });

    // Select the text before drag
    await driver.executeScript(function () {
      const dragInput = document.getElementById('copy-drag');
      dragInput.select();
      dragInput.focus();
    });

    const actions = driver.actions({ async: true });
    await actions
      .move({ origin: dragInput })
      .press()
      .move({ origin: dropDiv })
      .release()
      .perform();

    const result = await driver.executeScript(function () {
      return window.dropEffectOnDrop;
    });

    expect(result).toBe('copy');
  });

  before(function () {
    global.dropEffectOnDrop = null;
  });
});
