function updateFormulas() {
  try {
    log(['updateFormulas()'], 5);
    const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
    if (participantsSheet.getFilter() !== null) {
      participantsSheet.getFilter().remove();
    }
    const formulaRange = participantsSheet.getRange(PARTICIPANTS_SHEET.FOMULAS_RANGE);
    const toUpdateRange = participantsSheet.getRange(PARTICIPANTS_SHEET.FIRST_LINE + 1, PARTICIPANTS_SHEET.RADAR_SENT_COL, participantsSheet.getLastRow() - PARTICIPANTS_SHEET.FIRST_LINE, 4);
    formulaRange.copyTo(toUpdateRange, SpreadsheetApp.CopyPasteType.PASTE_FORMULA);
    const values = toUpdateRange.getValues();
    SpreadsheetApp.flush();
    toUpdateRange.setValues(values);
  } catch (e) {
    log(['Exception in updateFormulas()', e], 7);
    throw e;
  }
}

function oldParticipantsUpdate() {
  try {
    log(['oldParticipantsUpdate()'], 5);
    updateParticipants('OLD');
  } catch (e) {
    Utilities.sleep(1500);
    log(['Exception in oldParticipantsUpdate()', e], 7);
  }
}

function activeParticipantsUpdate() {
  try {
    log(['activeParticipantsUpdate()'], 5);
    updateParticipants('ACTIVE');
  } catch (e) {
    Utilities.sleep(1500);
    log(['Exception in activeParticipantsUpdate()', e], 7);
  }
}

function updateParticipants(updatesType) {
  log(['updateParticipants(updatesType)', updatesType], 1);
  const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
  const statsSheet = getSheet(STATS.ID, STATS.NAME);
  const participantsWithLine = participantsSheet.getDataRange().getValues().map(function (line, index) {
    return line.concat([index + 1]);
  });

  if (updatesType == 'OLD') {
    var updateLine = statsSheet.getRange(STATS.OLDS_UPDATE_LINE).getValue();
    var maxLines = MAX_OLDS_PASS;
    var filteredParticipants = participantsWithLine.filter(function (line) {
      var participantLine = line[line.length - 1];
      var endDate = line[PARTICIPANTS_SHEET.END_COL - 1];
      var startDate = line[PARTICIPANTS_SHEET.START_COL - 1];
      return ((participantLine >= updateLine) && ((endDate !== '') || (new Date(startDate) <= new Date(OLD_DATE))));
    });
  } else {
    var updateLine = statsSheet.getRange(STATS.UPDATE_LINE).getValue();
    var maxLines = MAX_LINES_PASS;
    var filteredParticipants = participantsWithLine.filter(function (line) {
      var participantLine = line[line.length - 1];
      var endDate = line[PARTICIPANTS_SHEET.END_COL - 1];
      var startDate = line[PARTICIPANTS_SHEET.START_COL - 1];
      return ((participantLine >= updateLine) && (endDate == '') && (new Date(startDate) > new Date(OLD_DATE)));
    });
  }
  var indice = 0;
  while (indice < maxLines && indice < filteredParticipants.length) {
    try {
      var currentLine = filteredParticipants[indice][filteredParticipants[indice].length - 1];
      updateParticipant(filteredParticipants[indice][PARTICIPANTS_SHEET.USER_ID - 1],
        filteredParticipants[indice][PARTICIPANTS_SHEET.COURSE_ID - 1], currentLine, participantsSheet);
      participantPollinate(filteredParticipants[indice]);
      indice++;
      Utilities.sleep(100);
    } catch (e) {
      logTimes(currentLine, updatesType, (indice == filteredParticipants.length));
      Utilities.sleep(1500);
      log(['Exception in updateParticipants(updatesType)', updatesType, e], 7);
      throw e;
    }
  }
  logTimes(currentLine, updatesType, (indice == filteredParticipants.length));
}

function updateParticipant(userID, courseID, line, participantsSheet) {
  log(['updateParticipant(userID, courseID, line, participantsSheet)', userID, courseID, line, participantsSheet], 1);
  const userData = getUserData(userID, courseID);
  if (userData[0].length < 1) {
    log(['Error in updateParticipant(userID, courseID, line, participantsSheet)', 'Null User Data for getUserData(userID, courseID)', 'userID:', userID, 'courseID:', courseID], 7);
    throw new Error('Null User Data');
  } else {
    const [userName, email, progress, startDate, endDate] = userData;
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.START_COL).setValue(new Date(startDate));
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.NAME_COL).setValue(userName);
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.EMAIL_COL).setValue(email);
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.PROGRESS_COL).setValue(progress / 100);
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.END_COL).setValue(endDate ? new Date(endDate) : '');
  }
}

function logTimes(line, updatesType, full) {
  log(['logTimes(line, updatesType, full)', line, updatesType, full], 1);
  const statsSheet = getSheet(STATS.ID, STATS.NAME);
  const lineRG = (updatesType == 'OLD') ? STATS.OLDS_UPDATE_LINE : STATS.UPDATE_LINE;
  const fullRG = (updatesType == 'OLD') ? STATS.OLDS_FULL_UPDATE : STATS.FULL_UPDATE;
  const lastRG = (updatesType == 'OLD') ? STATS.OLDS_LAST_RUN : STATS.LAST_RUN;
  if (full) {
    statsSheet.getRange(lineRG).setValue(PARTICIPANTS_SHEET.FIRST_LINE);
    statsSheet.getRange(fullRG).setValue(new Date());
  } else {
    statsSheet.getRange(lineRG).setValue(line);
  }
  statsSheet.getRange(lastRG).setValue(new Date());
}
