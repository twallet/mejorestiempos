function participantPollinate(lineData) {  
  log(['participantPollinate(lineData)'], 1);
  const clientGroup = lineData[PARTICIPANTS_SHEET.CLIENT_GROUP_COL - 1];
  if ((clientGroup !== '') && (getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.ACTIVE))) {
    const clientSheet = getClientGroupSheet(clientGroup);
    const line = getClientGroupParticipantLine(clientSheet, lineData[PARTICIPANTS_SHEET.USER_ID - 1], getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.USER_ID_COL));
    if (line !== -1) {
      const startCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.START_COL);
      const nameCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.USER_NAME_COL);
      const emailCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.EMAIL_COL);
      const progressCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.PROGRESS_COL);
      const endCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.END_COL);
      const lastProgressCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.LAST_PROGRESS_COL);
      const lastLectureCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.LAST_LECTURE_COL);
      const radarLectureCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.RADAR_LECTURE_COL);
      const radarSentCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.RADAR_SENT_COL);
      const worstCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.WORST_COL);
      const commentsCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.COMMENTS_COL);
      const surveyCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.SURVEY_COL);
      const radarReminderCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.RADAR_REMINDER_COL);
      const firstReminderCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.FIRST_REMINDER_COL);
      const secondReminderCol = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.SECOND_REMINDER_COL);
      if (startCol !== '') { clientSheet.getRange(line, startCol).setValue(lineData[PARTICIPANTS_SHEET.START_COL - 1]) };
      if (nameCol !== '') { clientSheet.getRange(line, nameCol).setValue(lineData[PARTICIPANTS_SHEET.NAME_COL - 1]) };
      if (emailCol !== '') { clientSheet.getRange(line, emailCol).setValue(lineData[PARTICIPANTS_SHEET.EMAIL_COL - 1]) };
      if (progressCol !== '') { clientSheet.getRange(line, progressCol).setValue(lineData[PARTICIPANTS_SHEET.PROGRESS_COL - 1]) };
      if (endCol !== '') { clientSheet.getRange(line, endCol).setValue(lineData[PARTICIPANTS_SHEET.END_COL - 1]) };
      if (lastProgressCol !== '') { clientSheet.getRange(line, lastProgressCol).setValue(lineData[PARTICIPANTS_SHEET.LAST_PROGRESS_COL - 1]) };
      if (lastLectureCol !== '') { clientSheet.getRange(line, lastLectureCol).setValue(lineData[PARTICIPANTS_SHEET.LAST_LECTURE_COL - 1]) };
      if (radarLectureCol !== '') { clientSheet.getRange(line, radarLectureCol).setValue(lineData[PARTICIPANTS_SHEET.RADAR_LECTURE_COL - 1]) };
      if (radarSentCol !== '') { clientSheet.getRange(line, radarSentCol).setValue(lineData[PARTICIPANTS_SHEET.RADAR_SENT_COL - 1]) };
      if (worstCol !== '') { clientSheet.getRange(line, worstCol).setValue(lineData[PARTICIPANTS_SHEET.WORST_COL - 1]) };
      if (commentsCol !== '') { clientSheet.getRange(line, commentsCol).setValue(lineData[PARTICIPANTS_SHEET.COMMENTS_COL - 1]) };
      if (surveyCol !== '') { clientSheet.getRange(line, surveyCol).setValue(lineData[PARTICIPANTS_SHEET.SURVEY_COL - 1]) };
      if (radarReminderCol !== '') { clientSheet.getRange(line, radarReminderCol).setValue(lineData[PARTICIPANTS_SHEET.RADAR_REMINDER_COL - 1]) };
      if (firstReminderCol !== '') { clientSheet.getRange(line, firstReminderCol).setValue(lineData[PARTICIPANTS_SHEET.FIRST_REMINDER_COL - 1]) };
      if (secondReminderCol !== '') { clientSheet.getRange(line, secondReminderCol).setValue(lineData[PARTICIPANTS_SHEET.SECOND_REMINDER_COL - 1]) };
    }
  }
}

function enrollPollinate(coupon, clientGroup, email, name, userID, start) {
  log(['enrollPollinate(coupon, clientGroup, email, name, userID, start)', coupon, clientGroup, email, name, userID, start], 1);
  const clientSheet = getClientGroupSheet(clientGroup);
  if (clientSheet !== null) {
    const couponType = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.COUPON_TYPE);
    const value = (couponType == 'GROUP') ? email : coupon;
    const column = (couponType == 'GROUP') ? getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.EMAIL_COL) : getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.COUPON);
    const line = getClientGroupParticipantLine(clientSheet, value, column);
    if (line !== -1) {
      clientSheet.getRange(line, getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.USER_ID_COL)).setValue(userID);
      clientSheet.getRange(line, getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.START_COL)).setValue(new Date(start));
      clientSheet.getRange(line, getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.USER_NAME_COL)).setValue(name);
      clientSheet.getRange(line, getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.EMAIL_COL)).setValue(email);
    }
  }
}

function getClientGroupSheet(clientGroup) {
  log(['getClientGroupSheet(clientGroup)', clientGroup], 1);
  const sheetID = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.SHEET_ID);
  if (sheetID !== null) {
    const sheetName = getValueAtColumnForClientGroup(clientGroup, CLIENTS_MAPS_FIELDS.SHEET_NAME);
    try {
      return SpreadsheetApp.openById(sheetID).getSheetByName(sheetName);
    } catch (e) {
      log(['Exception in getClientGroupSheet(clientGroup)', clientGroup, e, 'Reintento'], 7);
      Utilities.sleep(20000);
      return SpreadsheetApp.openById(sheetID).getSheetByName(sheetName);
    }
  }
}

function getClientGroupParticipantLine(clientSheet, value, column) {
  return clientSheet.getDataRange().getValues().findIndex(function (line) {
    return line[column - 1] == value;
  }) + 1;
}

function getValueAtColumnForClientGroup(clientGroup, column) {
  const client = CLIENTS_MAPS.find(client => client[CLIENTS_MAPS_FIELDS.CLIENT_GROUP] == clientGroup);
  return client ? client[column] : null;
}
