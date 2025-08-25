function fishParticipants() {
  try {
    log(['fishParticipants()'], 5);
    const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
    for (var j = 0; j <= ALL_LOGGED_COURSES.length - 1; j++) {
      var courseID = ALL_LOGGED_COURSES[j][ALL_LOGGED_COURSES_FIELDS.COURSE_ID];
      const data = getUsersBatch(courseID, 1);
      const totalPages = data.meta.number_of_pages;
      for (let i = 1; i < totalPages + 1; i++) {
        const data = getUsersBatch(courseID, i);
        const enrollments = data.enrollments;
        enrollments.forEach(user => {
          if (getLineOf(user.user_id, courseID, participantsSheet) == -1) {
            missingUserWarning(courseID, user.user_id)
          };
        })
      }
    }
  } catch (e) {
    log(['Exception in fishParticipants()', e], 7);
    throw e;
  }
}

function getUsersBatch(courseID, pageNum) {
  try {
    log(['getUsersBatch(courseID, pageNum)', courseID, pageNum], 3);
    const today = new Date();
    const priorDate = new Date(new Date().setDate(today.getDate() - 15));
    const afterDate = '&enrolled_in_after=' + priorDate.toISOString();
    const url = 'https://developers.teachable.com/v1/courses/' + courseID + '/enrollments?page=' + pageNum + afterDate;
    const teachableAPIKEY = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.TEACHABLE_API_KEY);
    const params = { headers: { Accept: 'application/json', apiKey: teachableAPIKEY }, muteHttpExceptions: true };
    return JSON.parse(UrlFetchApp.fetch(url, params));
  } catch (e) {
    log(['Exception in getUsersBatch(courseID, pageNum)', courseID, pageNum, e], 7);
    throw e;
  }
}

function missingUserWarning(courseID, userID) {
  try {
    log(['missingUserWarning(courseID, userID)', courseID, userID], 7);
    MailApp.sendEmail({
      to: CONTROL_EMAIL,
      subject: CONTROL_EMAIL_PREFIX + ' | Persona de la plataforma no encontrada en planilla de monitoreo',
      body: 'La persona con el ID: ' + userID + ' (' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.STUDENT_LINK) + userID + '/information) está enrolada en ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME) + ' en ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.PLATAFORMA) + ', pero no está en la planilla de seguimiento (https://docs.google.com/spreadsheets/d/' + LOG_SHEET.ID + '/edit#gid=0).'
    });
    Utilities.sleep(200);
  } catch (e) {
    log(['Exception in missingUserWarning(courseID, userID)', courseID, userID, e], 7);
    throw e;
  }
}
