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
    options.addArguments('--headless');
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

  it('should select text on long press', async function () {
    // This test reproduces a bug where chromedriver does not respect the pause
    // action in a touch gesture, preventing time-based gestures like long
    // presses from working correctly.
    // The expected behavior is that a 1-second press on the text will select it.
    // The bug causes the pointerUp to happen immediately after pointerDown,
    // resulting in no text selection.
    await driver.get('file://' + __dirname + '/long_press_test.html');

    const selectable = await driver.findElement({ id: 'selectable' });
    const actions = driver.actions({ bridge: true });

    const finger = actions.addPointer('finger1', 'touch');

    await finger
      .move({ duration: 0, origin: selectable, x: 0, y: 0 }) // Move to target
      .press() // pointerDown()
      .pause(1000) // pause(1000)
      .release() // pointerUp()
      .perform();

    const selectedText = await driver.executeScript(
      'return window.getSelection().toString()',
    );
    expect(selectedText).toBe('This is some selectable text.');
  });
});
