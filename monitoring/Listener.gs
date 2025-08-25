function doPost(e) {
  log(['doPost(e)'], 1);
  const dataContents = JSON.parse(e.postData.contents);
  switch (dataContents.type) {
    case "Enrollment.created":
      logNewEnrollment(dataContents);
      break;
    case "LectureProgress.created":
      logNewLectureProgress(dataContents);
      break;
    case "Comment.created":
      logNewComment(dataContents);
      break;
    default:
      log(['doPost(e)', 'Unrecognized type:', dataContents.type, dataContents], 7);
  }
  return HtmlService.createHtmlOutput();
};

function logNewEnrollment(dataContents) {
  try {
    log(['logNewEnrollment(dataContents)', dataContents], 5);
    const courseID = dataContents.object.course.id;
    const courseName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME);
    if (courseName !== null) {
      const userID = dataContents.object.user_id;
      const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
      if (getLineOf(userID, courseID, participantsSheet) == -1) {
        const name = dataContents.object.user.name;
        const coupon = dataContents.object.coupon;
        const email = dataContents.object.user.email;
        const startDate = new Date(dataContents.object.enrolled_at);
        const clientGroup = getClientGroup(coupon, email, courseID, userID, name);
        const lastRowRange = participantsSheet.getRange(participantsSheet.getLastRow(), 1, 1, participantsSheet.getLastColumn());
        participantsSheet.appendRow([new Date(startDate), name, userID, email, courseName, courseID, coupon, clientGroup]);
        lastRowRange.copyFormatToRange(participantsSheet, 1, participantsSheet.getLastColumn(), participantsSheet.getLastRow(), participantsSheet.getLastRow());
        if (clientGroup !== '') {
          enrollPollinate(coupon, clientGroup, email, name, userID, startDate);
        }
      }
    }
  } catch (e) {
    log(['Exception in logNewEnrollment(dataContents)', dataContents, e], 7);
    throw e;
  }
};

function logNewComment(dataContents) {
  try {
    log(['logNewComment(dataContents)', dataContents], 5);
    const fullURL = dataContents.object.commentable.full_url;
    const courseID = fullURL.slice(fullURL.indexOf("courses/") + 8, fullURL.indexOf("/lectures"));
    const courseName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME);
    if (courseName !== null) {
      const commentsSheet = getSheet(COMMENTS_SHEET.ID, COMMENTS_SHEET.NAME);
      const lectureID = fullURL.slice(fullURL.indexOf("/lectures/") + 10, fullURL.length);
      const lectureName = getLectureName(courseID, lectureID);
      const userID = dataContents.object.user_id;
      commentsSheet.appendRow([
        dataContents.object.body,
        dataContents.object.user.email,
        lectureName,
        new Date(),
        dataContents.object.user.name,
        courseID,
        userID,
        fullURL]);
      const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
      const line = getLineOf(dataContents.object.user.id, courseID, participantsSheet);
      if (line !== -1) {
        const commentsNumber = participantsSheet.getRange(line, PARTICIPANTS_SHEET.COMMENTS_COL).getValue();
        participantsSheet.getRange(line, PARTICIPANTS_SHEET.COMMENTS_COL).setValue(commentsNumber + 1);
        const lineData = participantsSheet.getRange(line, 1, 1, participantsSheet.getLastColumn()).getValues();
        lineData[0].push(line);
        participantPollinate(lineData[0]);
      }
    }
  } catch (e) {
    log(['Exception in logNewComment(dataContents)', dataContents, e], 7);
    throw e;
  }
}

function logNewLectureProgress(dataContents) {
  try {
    log(['logNewLectureProgress(dataContents)', dataContents], 5);
    const courseID = dataContents.object.course_id;
    const courseName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME);
    if (courseName !== null) {
      const userID = dataContents.object.user.id;
      const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
      const line = getLineOf(userID, courseID, participantsSheet);
      if (line !== -1) {
        const lastProgress = new Date();
        const lastLecture = dataContents.object.lecture.name;
        const lectureID = dataContents.object.lecture.id;
        const radarLecture = new Date();
        participantsSheet.getRange(line, PARTICIPANTS_SHEET.COURSE_NAME_COL).setValue(courseName);
        participantsSheet.getRange(line, PARTICIPANTS_SHEET.LAST_PROGRESS_COL).setValue(lastProgress);
        participantsSheet.getRange(line, PARTICIPANTS_SHEET.LAST_LECTURE_COL).setValue(lastLecture);
        const radarLectureID = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.RADAR_LECTURE_ID);
        if (lectureID == radarLectureID) {
          participantsSheet.getRange(line, PARTICIPANTS_SHEET.RADAR_LECTURE_COL).setValue(radarLecture);
        }
        const userData = getUserData(userID, courseID);
        if (userData[0].length < 1) {
          log(['Error in logNewLectureProgress(dataContents)', 'Null User Data for getUserData(userID, courseID)', 'userID:', userID, 'courseID:', courseID], 7);
          throw new Error('Null User Data for getUserData(userID, courseID)');
        } else {
          const userName = userData[0];
          const email = userData[1];
          const progress = userData[2] / 100;
          const startDate = new Date(userData[3]);
          var endDate = '';
          if (userData[4] == null) {
            endDate = '';
          } else {
            endDate = new Date(userData[4]);
          }
          participantsSheet.getRange(line, PARTICIPANTS_SHEET.NAME_COL).setValue(userName);
          participantsSheet.getRange(line, PARTICIPANTS_SHEET.EMAIL_COL).setValue(email);
          participantsSheet.getRange(line, PARTICIPANTS_SHEET.PROGRESS_COL).setValue(progress);
          participantsSheet.getRange(line, PARTICIPANTS_SHEET.START_COL).setValue(startDate);
          participantsSheet.getRange(line, PARTICIPANTS_SHEET.END_COL).setValue(endDate);
          logReminders(line);
        }
        const lineData = participantsSheet.getRange(line, 1, 1, participantsSheet.getLastColumn()).getValues();
        lineData[0].push(line);
        participantPollinate(lineData[0]);
      }
    }
  } catch (e) {
    log(['Exception in logNewLectureProgress(dataContents)', dataContents, e], 7);
    throw e;
  }
}

function logReminders(line) {
  log(['logReminders(line)', line], 5);
  const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
  const lastProgress = participantsSheet.getRange(line, PARTICIPANTS_SHEET.LAST_PROGRESS_COL).getValue();
  const firstReminder = participantsSheet.getRange(line, PARTICIPANTS_SHEET.FIRST_REMINDER_COL).getValue();
  const secondReminder = participantsSheet.getRange(line, PARTICIPANTS_SHEET.SECOND_REMINDER_COL).getValue();
  const firstRecuperation = participantsSheet.getRange(line, PARTICIPANTS_SHEET.FIRST_RECUP_COL).getValue();
  const secondRecuperation = participantsSheet.getRange(line, PARTICIPANTS_SHEET.SECOND_RECUP_COL).getValue();
  if (lastProgress !== '') {
    if ((firstReminder !== '')
      && (firstRecuperation == '')
      && (secondReminder == '')
      && (new Date(lastProgress) > new Date(firstReminder))) {
      participantsSheet.getRange(line, PARTICIPANTS_SHEET.FIRST_RECUP_COL).setValue(new Date(lastProgress));
    }
    if ((secondReminder !== '')
      && (secondRecuperation == '')
      && (new Date(lastProgress) > new Date(secondReminder))) {
      participantsSheet.getRange(line, PARTICIPANTS_SHEET.SECOND_RECUP_COL).setValue(new Date(lastProgress));
    }
  }
}

function logNewRadarsAndSurveys() {
  try {
    log(['logNewRadarsAndSurveys()'], 5);
    const now = new Date();
    const lastLog = getSheet(STATS.ID, STATS.NAME).getRange(STATS.LAST_RADAR_LOG).getValue();
    const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
    for (let i = 0; i < ALL_LOGGED_COURSES.length; i++) {
      var radarSentSheet = getSheet(PARTICIPANTS_SHEET.ID, ALL_LOGGED_COURSES[i][ALL_LOGGED_COURSES_FIELDS.SENT_SHEET]);
      var allRadars = radarSentSheet.getDataRange().getValues();
      var newRadars = allRadars.filter(function (line) {
        var lineDate = new Date(line[RADAR_SENT.SENT_COL - 1]);
        return ((lineDate > lastLog) && (lineDate < now));
      });
      newRadars.forEach(function (newRadar) {
        logNewRadar(i, newRadar, participantsSheet);
      });
      var surveyAnswersSheet = getSheet(PARTICIPANTS_SHEET.ID, ALL_LOGGED_COURSES[i][ALL_LOGGED_COURSES_FIELDS.SURVEY_SHEET_NAME]);
      var allSurveys = surveyAnswersSheet.getDataRange().getValues();
      var newSurveys = allSurveys.filter(function (line) {
        var lineDate = new Date(line[SURVEY_SHEET.TIMESTAMP - 1]);
        return ((lineDate > lastLog) && (lineDate < now));
      });
      newSurveys.forEach(function (newSurvey) {
        logNewSurvey(i, newSurvey, participantsSheet);
      });
    }
    getSheet(STATS.ID, STATS.NAME).getRange(STATS.LAST_RADAR_LOG).setValue(now);
  } catch (e) {
    Utilities.sleep(1500);
    log(['Exception in logNewRadarsAndSurveys()', e], 7);
    throw e;
  }
}

function logNewRadar(index, newRadar, participantsSheet) {
  log(['logNewRadar(index, newRadar)', index, newRadar], 1);
  const courseID = ALL_LOGGED_COURSES[index][ALL_LOGGED_COURSES_FIELDS.COURSE_ID];
  const line = getLineOf(newRadar[RADAR_SENT.USER_ID_COL - 1], courseID, participantsSheet);
  if (line !== -1) {
    const radarSent = newRadar[RADAR_SENT.SENT_COL - 1];
    const worst = newRadar[RADAR_SENT.WORST_COL - 1];
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.WORST_COL).setValue(worst);
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.RADAR_SENT_COL).setValue(radarSent);
    const lineData = participantsSheet.getRange(line, 1, 1, participantsSheet.getLastColumn()).getValues();
    lineData[0].push(line);
    participantPollinate(lineData[0]);
  }
}

function logNewSurvey(index, newSurvey, participantsSheet) {
  log(['logNewSurvey(index, newSurvey)', index, newSurvey], 1);
  const courseID = ALL_LOGGED_COURSES[index][ALL_LOGGED_COURSES_FIELDS.COURSE_ID];
  const line = getLineOf(newSurvey[SURVEY_SHEET.USER_ID_COL - 1], courseID, participantsSheet);
  if (line !== -1) {
    const surveySent = newSurvey[SURVEY_SHEET.TIMESTAMP - 1];
    participantsSheet.getRange(line, PARTICIPANTS_SHEET.SURVEY_COL).setValue(surveySent);
    const lineData = participantsSheet.getRange(line, 1, 1, participantsSheet.getLastColumn()).getValues();
    lineData[0].push(line);
    participantPollinate(lineData[0]);
  }
}

function getClientGroup(coupon, email, courseID, userID, name) {
  log(['getClientGroup(coupon, email, courseID, userID, name)', coupon, email, courseID, userID, name], 1);
  if (coupon == null) {
    return '';
  }
  const clientGroupsSheet = getSheet(CLIENT_GROUPS.ID, CLIENT_GROUPS.NAME);
  const clientGroupsData = clientGroupsSheet.getDataRange().getValues();
  const filteredCouponData = clientGroupsData.filter(line => line[CLIENT_GROUPS.COUPON - 1] == coupon);
  if (filteredCouponData.length == 0) {
    return '';
  }
  if (filteredCouponData.length == 1) {
    return filteredCouponData[0][CLIENT_GROUPS.CLIENT_GROUP - 1];
  }
  const filteredData = filteredCouponData.filter(function (line) {
    return line[CLIENT_GROUPS.EMAIL - 1] == email && new Date(line[CLIENT_GROUPS.EXPIRES - 1]) > new Date();
  });
  if (filteredData.length == 0) {
    wrongClientGroupUse(coupon, email, courseID, userID, name);
    return '';
  }
  return filteredData[0][CLIENT_GROUPS.CLIENT_GROUP - 1];
};

function wrongClientGroupUse(coupon, email, courseID, userID, name) {
  try {
    log(['wrongClientGroupUse(coupon, email, courseID, userID, name)', coupon, email, courseID, userID, name], 7);
    MailApp.sendEmail({
      to: CONTROL_EMAIL,
      subject: CONTROL_EMAIL_PREFIX + ' | Uso de cúpon con email no habilitado',
      body: "El userID: " + userID + ' se enroló en: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME) + ' con el cúpon: ' + coupon + ', con el email: ' + email + ' y el nombre: ' + name + ', pero no está habilitado en la lista de Client Groups (https://docs.google.com/spreadsheets/d/1Hd9pf7ZJ9lmN4Y3heyYbqfN2VEdAkbFmSzlV2Aswntw/edit#gid=1140316892).'
    });
    Utilities.sleep(200);
  } catch (e) {
    log(['Exception in wrongClientGroupUse(coupon, email, courseID, userID, name)', coupon, email, courseID, userID, name, e], 7);
    throw e;
  }
};

function getLineOf(userID, courseID, participantsSheet) {
  log(['getLineOf(userID)', 'userID:', userID, 'courseID:', courseID], 1);
  const allValues = participantsSheet.getDataRange().getValues();
  const filteredValue = allValues.map(function (fila, indice) {
    return (fila[PARTICIPANTS_SHEET.USER_ID - 1] == userID && fila[PARTICIPANTS_SHEET.COURSE_ID - 1] == courseID) ? indice + 1 : null;
  }).filter(function (numeroLinea) {
    return numeroLinea !== null;
  });
  return (filteredValue.length > 0) ? filteredValue[0] : -1;
}

function getLectureName(courseID, lectureID) {
  try {
    log(['getLectureName(courseID, lectureID)', courseID, lectureID], 3);
    const url = "https://developers.teachable.com/v1/courses/" + courseID + "/lectures/" + lectureID;
    const teachableAPIKEY = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.TEACHABLE_API_KEY);
    const params = { headers: { Accept: 'application/json', apiKey: teachableAPIKEY }, muteHttpExceptions: true }
    return JSON.parse(UrlFetchApp.fetch(url, params)).lecture.name;
  } catch (e) {
    log(['Exception in getLectureName(courseID, lectureID)', courseID, lectureID, e], 7);
    throw e;
  }
}

function getUserData(userID, courseID) {
  try {
    log(['getUserData(userID, courseID)', userID, courseID], 3);
    const url = 'https://developers.teachable.com/v1/users/' + userID;
    const teachableAPIKEY = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.TEACHABLE_API_KEY);
    const params = { headers: { Accept: 'application/json', apiKey: teachableAPIKEY }, muteHttpExceptions: true };
    const response = UrlFetchApp.fetch(url, params);
    if (response.getResponseCode() !== 200) {
      log(['Exception in getUserData(' + userID + ', ' + courseID + ')', 'Response Code <> 200', response.getResponseCode()], 7);
      throw new Error('Unexpected response code in getUserData(' + userID + ', ' + courseID + '): ' + response.getResponseCode());
    }

    let data;
    try {
      data = JSON.parse(response.getContentText());
    } catch (jsonError) {
      log(['Exception in getUserData(' + userID + ', ' + courseID + ')', 'Error parsing JSON: ${jsonError.message}'], 7);
      throw new Error('Error parsing JSON: ${jsonError.message}');
    }

    const name = data.name;
    const email = data.email;
    var progress = '';
    var end = '';
    var start = '';
    data.courses.forEach(course => {
      if (course.course_id == courseID) {
        progress = course.percent_complete;
        end = course.completed_at;
        start = course.enrolled_at;
      }
    });
    return [name, email, progress, start, end];
  } catch (e) {
    log(['Exception in getUserData(userID, courseID)', userID, courseID, e], 7);
    throw e;
  }
}
