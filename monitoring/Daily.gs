function sendDaily() {
  try {
    log(['sendDaily()'], 5);
    forceFullStats();
    const weekday = Utilities.formatDate(new Date(), 'GMT', 'EEEE');
    if (!(weekday == 'Saturday') && !(weekday == 'Sunday')) {
      const statsSheet = getSheet(STATS.ID, STATS.NAME);
      const status = statsSheet.getRange(STATS.STATUS).getValue();
      const dailyText = getDashboardText(statsSheet);
      MailApp.sendEmail(CONTROL_EMAIL, status +' ' + CONTROL_EMAIL_PREFIX + ' Monitoreo', '', { htmlBody: dailyText });
      Utilities.sleep(200);
    }
  } catch (e) {
    log(['Exception in sendDaily()', e], 7);
    throw e;
  }
}

function getDashboardText(aSheet) {
  log(['getDashboardText(aSheet)'], 1);
  var text = '';
  const values = aSheet.getRange(1, STATS.HTML_COL, aSheet.getLastRow(), 1).getValues();
  values.forEach(function (row) {
    if (row[0] !== null && row[0] !== undefined) {
      text += row[0];
    }
  });
  return text;
}

function forceFullStats(){
  const statsSheet = getSheet(STATS.ID, STATS.NAME);
  statsSheet.getRange(STATS.MT_CHECK).setValue(true);
  statsSheet.getRange(STATS.ODT_CHECK).setValue(true);
  statsSheet.getRange(STATS.TTA_CHECK).setValue(true);
  SpreadsheetApp.flush();
}
