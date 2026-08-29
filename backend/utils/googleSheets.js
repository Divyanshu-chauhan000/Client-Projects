const { google } = require('googleapis');

const appendToGoogleSheet = async (enquiryData) => {
  try {
    const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID } = process.env;

    // Check if credentials exist
    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_SHEET_ID) {
      console.warn("Google Sheets credentials are not set in .env. Skipping Google Docs integration.");
      return;
    }

    // Authenticate
    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Assuming the sheet has columns: Date, Name, Email, Phone, Address, Product, Quantity, Message
    const request = {
      spreadsheetId: GOOGLE_SHEET_ID,
      range: 'Sheet1!A:H', // Adjusted range for Address column
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      resource: {
        values: [
          [
            new Date().toLocaleString(),
            enquiryData.name,
            enquiryData.email,
            enquiryData.contactNumber,
            enquiryData.address,
            enquiryData.productName || 'General',
            enquiryData.quantity,
            enquiryData.message
          ]
        ],
      },
    };

    const response = await sheets.spreadsheets.values.append(request);
    console.log('Successfully appended row to Google Sheet:', response.data);
  } catch (error) {
    console.error('Failed to append to Google Sheet:', error);
  }
};

module.exports = { appendToGoogleSheet };
