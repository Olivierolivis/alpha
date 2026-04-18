const SHEET_ID = '1NeNZwif6P638sTjtV-KVWgGqpKsqIASMjq4NHgk7Q8M';
const SHEET_NAME = 'Sheet1';

function doPost(e) {
  try {
    console.log('doPost triggered with event:', e);
    const payload = parsePayload_(e);
    console.log('Parsed payload:', payload);
    const sheet = getOrCreateSheet_();
    console.log('Sheet obtained:', sheet.getName());

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'submittedAt',
        'source',
        'page',
        'firstName',
        'lastName',
        'email',
        'subject',
        'message',
        'startDate',
        'endDate',
        'travelers',
        'budget',
        'interests',
        'recommendedParks',
        'activities',
        'estimatedDays',
        'estimatedCost',
        'wishlist',
        
      ]);
    }

    sheet.appendRow([
      payload.submittedAt || new Date().toISOString(),
      payload.source || '',
      payload.page || '',
      payload.firstName || '',
      payload.lastName || '',
      payload.email || '',
      payload.subject || '',
      payload.message || '',
      payload.startDate || '',
      payload.endDate || '',
      payload.travelers || '',
      payload.budget || '',
      stringifyValue_(payload.interests),
      stringifyValue_(payload.recommendedParks),
      stringifyValue_(payload.activities),
      payload.estimatedDays || '',
      payload.estimatedCost || '',
      stringifyValue_(payload.wishlist),
      JSON.stringify(payload)
    ]);

    console.log('Data appended successfully');
    return jsonResponse_({ success: true });
  } catch (error) {
    console.error('Error in doPost:', error);
    return jsonResponse_({
      success: false,
      message: error.message
    });
  }
}

function parsePayload_(e) {
  const rawContents = e && e.postData ? e.postData.contents : '';
  console.log('Raw postData:', rawContents);
  console.log('e.parameter:', e && e.parameter);

  if (rawContents) {
    try {
      console.log('Parsing as JSON:', rawContents);
      return JSON.parse(rawContents);
    } catch (error) {
      console.log('JSON parse failed, falling back to parameters');
      // Fall through to form field parsing when the request is not JSON.
    }
  }

  const params = (e && e.parameter) || {};
  console.log('Using params from e.parameter:', params);
  return {
    submittedAt: params.submittedAt || new Date().toISOString(),
    source: params.source || '',
    page: params.page || '',
    firstName: params.firstName || '',
    lastName: params.lastName || '',
    email: params.email || '',
    subject: params.subject || '',
    message: params.message || '',
    startDate: params.startDate || '',
    endDate: params.endDate || '',
    travelers: params.travelers || '',
    budget: params.budget || '',
    interests: parseMaybeJson_(params.interests),
    recommendedParks: parseMaybeJson_(params.recommendedParks),
    activities: parseMaybeJson_(params.activities),
    estimatedDays: params.estimatedDays || '',
    estimatedCost: params.estimatedCost || '',
    wishlist: parseMaybeJson_(params.wishlist)
  };
}

function getOrCreateSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  return spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);
}

function parseMaybeJson_(value) {
  if (!value) return '';

  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

function stringifyValue_(value) {
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function jsonResponse_(payload) {
  const text = payload.success ? 'SUCCESS' : 'ERROR: ' + payload.message;
  return ContentService
    .createTextOutput(text)
    .setMimeType(ContentService.MimeType.TEXT);
}
