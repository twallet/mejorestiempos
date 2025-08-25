function log(array, level) {
  if (level >= LOG_SHEET.LOGGING) {
    var logArray = [new Date(), level, ...array];
    SpreadsheetApp.openById(LOG_SHEET.ID).getSheetByName(LOG_SHEET.NAME).appendRow(logArray);
  }
}

function getValueAtColumn(courseID, column) {
  return ALL_LOGGED_COURSES.find(course => course[ALL_LOGGED_COURSES_FIELDS.COURSE_ID] == courseID)?.[column] || null;
}

function getSheet(id, name) {
  log(['getSheet(id, name)', id, name], 1);
  if (sheetCache[id + ':' + name]) {
    return sheetCache[id + ':' + name];
  }
  try {
    var sheet = SpreadsheetApp.openById(id).getSheetByName(name);
    sheetCache[id + ':' + name] = sheet;
    return sheet;
  } catch (e) {
    log(['Exception in getSheet(id, name) / Reintento', id, name, e], 7);
    Utilities.sleep(20000);
    sheet = SpreadsheetApp.openById(id).getSheetByName(name);
    sheetCache[id + ':' + name] = sheet;
    return sheet;
  }
}
