const fs = require("fs");
const puppeteer = require("puppeteer");

async function sendEmail(
  username,
  password,
  fromName,
  recipient,
  subject,
  message
) {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    timeout: 60000,
    args: ["--start-maximized"],
    slowMo: 50,
    ignoreHTTPSErrors: true,
    defaultViewport: null,
    waitUntil: "networkidle0",
    protocolTimeout: 0,
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/72.0.3626.109 Safari/537.36"
  );

  await page.goto(
    "https://webmel.ac-creteil.fr/iwc_static/layout/login.html?lang=en-US&3.0.1.3.0_16070513&svcs=calendar,abs,mail,c11n"
  );

  await page.type("#username", username);
  await page.type("#password", password);

  let buttonSubmit = await Promise.all([
    page.waitForNavigation({ timeout: 90000 }),
    page.click("#boutonConnexion"),
  ]);
  if (buttonSubmit) {
    console.log("Click on compose email...");
    let data = await page.click("#qa_NewMail");
    console.log("Enter recipient, subject, and message");
    if (data) {
      await page.type(
        "#iwc_widget_addressBook_EmailComboTextarea_0Input",
        recipient
      );
      await page.type("#iwc_widget_form_TextBox_0", subject);
      await page.evaluate(() => {
        const messageBody = message;
        const bodyElement = document.querySelector("body");
        bodyElement.innerHTML = messageBody;
      });

      console.log("Click on the email send button");

      await page.click("#dijit_form_Button_14_label"),
        console.log("Email sent successfully");
    }
  }
  await browser.close();
}

// Read email leads from leads.txt
const leads = fs.readFileSync("leads.txt", "utf8").split("\n").filter(Boolean);

// Read configuration from config.json
const config = JSON.parse(fs.readFileSync("config.json", "utf8"));

// Read email body from letter.txt
const message = fs.readFileSync("letter.txt", "utf8");

// Send emails to each lead
async function sendEmails() {
  for (const lead of leads) {
    const { username, password, fromName, subject, delay } = config;

    try {
      await sendEmail(username, password, fromName, lead, subject, message);
      console.log(`Email sent successfully to ${lead}`);
    } catch (error) {
      console.error(`Failed to send email to ${lead}:`, error);
    }

    // Delay before sending the next email
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}

sendEmails();
