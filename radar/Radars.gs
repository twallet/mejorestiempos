function onNewAnswers() {
  try {
    const answersSheet = getSheet(ANSWERS.ID, ANSWERS.NAME);
    var i = answersSheet.getLastRow();
    const maxTimestamp = getMaxTimestamp();
    while (answersSheet.getRange(i, ANSWERS.TIME_COL).getValue() > maxTimestamp) {
      const userID = answersSheet.getRange(i, ANSWERS.USER_COL).getValue();
      const userData = getUserData(userID);
      const email = userData[0];
      const name = userData[1];
      if (inBlackList(userID)) {
        MailApp.sendEmail(CONTROL_EMAIL, CONTROL_EMAIL_PREFIX + ' | Uso prohibido del Radar del Tiempo MT - ' + name, name + ' (' + userID + ') está intentando usar el Radar del Tiempo, pero está en la lista negra. No se le enviará su Radar del Tiempo. Revisar: https://docs.google.com/spreadsheets/d/' + ANSWERS.ID + '/edit#gid=0');
        logRadar(answersSheet.getRange(i, ANSWERS.TIME_COL).getValue(), i, userID, email, name, '', 'BLOCKED');
      } else {
        if (suspiciousRadarUse(userID)) {
          MailApp.sendEmail(CONTROL_EMAIL, CONTROL_EMAIL_PREFIX + ' | Uso dudoso del Radar del Tiempo MT - ' + name, name + ' (' + userID + ') tiene 3 radares o más. Se le enviará igual su Radar del Tiempo ya que no está en la lista negra. Revisar: https://docs.google.com/spreadsheets/d/' + ANSWERS.ID + '/edit#gid=0');
        };
        updateRadar(i, email, name);
        sendRadar(email);
        var worst = getWorst(i);
        logRadar(answersSheet.getRange(i, ANSWERS.TIME_COL).getValue(), i, userID, email, name, worst, 'OK');
      }
      i--;
    }
  } catch (e) {
    Logger.log(e);
  }
}

function getMaxTimestamp() {
  try {
    const sentSheet = getSheet(ANSWERS.ID, SENT.NAME);
    return sentSheet.getRange(sentSheet.getLastRow(), SENT.SENT_COL).getValue();
  } catch (e) {
    Logger.log(e);
  }
}

function inBlackList(userID) {
  const blackListSheet = getSheet(BLACK_LIST.ID, BLACK_LIST.NAME);
  const blackList = blackListSheet.getDataRange().getValues();
  const filteblackList = blackList.filter(line => line[BLACK_LIST.USERID_COL - 1] == userID);
  if (filteblackList.length == 0) {
    return false;
  }
  return true;
}

function suspiciousRadarUse(userID) {
  try {
    const sentSheet = getSheet(ANSWERS.ID, SENT.NAME);
    const userIDs = sentSheet.getRange(SENT.ALL_USER_IDS_RG).getValues();
    var datosFiltrados = userIDs.filter(function (line) {
      return line[0] == userID;
    });
    return datosFiltrados.length > 1;
  } catch (e) {
    Logger.log(e);
  }
}

function updateRadar(line, email, name) {
  try {
    const dataSheet = getSheet(DATA.ID, DATA.NAME);
    dataSheet.getRange(DATA.LINE_RG).setValue(line);
    dataSheet.getRange(DATA.EMAIL_RG).setValue(email);
    dataSheet.getRange(DATA.NAME_RG).setValue(name);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log(e);
  }
}

function sendRadar(email) {
  try {
    const url_ext = '/export?exportFormat=pdf&format=pdf&gid=' + getSheet(DATA.ID, RADAR.NAME).getSheetId()
      + '&size=A4&portrait=false&fitw=true&top_margin=0.25&bottom_margin=0.25&left_margin=0.25'
      + '&right_margin=0.25&sheetnames=false&printtitle=false&pagenumbers=false&gridlines=false&fzr=false';
    const response = UrlFetchApp.fetch('https://docs.google.com/spreadsheets/d/' + DATA.ID + url_ext, { headers: { 'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() } });
    const dataSheet = getSheet(DATA.ID, DATA.NAME);
    const radarName = dataSheet.getRange(DATA.NAME_RG).getValue();
    const emailSubject = "Next Steps Lab - Radar del Tiempo - " + radarName;
    const blob = response.getBlob().setName(emailSubject + '.pdf');
    const body = "¡Hola! <br><br>Encontrarás adjunto tu Radar del Tiempo. <br><br> <em>El Radar del tiempo está incluido en el programa Mejores Tiempos de Next Steps Lab solo para tu uso personal, y no puede ser usado para otras personas.</em><br><br>¡Saludos!";
    if (dataSheet.getRange(DATA.SAMPLE_RG).getValue()) {
      MailApp.sendEmail({ to: email, subject: emailSubject, bcc: CONTROL_EMAIL, body: "", htmlBody: body, replyTo: PLATFORM_EMAIL, name: PLATFORM_NAME, attachments: [blob] });
    } else {
      MailApp.sendEmail({ to: email, subject: emailSubject, body: "", htmlBody: body, replyTo: PLATFORM_EMAIL, name: PLATFORM_NAME, attachments: [blob] });
    }
    Utilities.sleep(200);
  } catch (e) {
    Logger.log(e);
  }
}

function getWorst(line) {
  const answersSheet = getSheet(ANSWERS.ID, ANSWERS.NAME);
  var answers = answersSheet.getRange(line, ANSWERS.START_COL, 1, ANSWERS.ANSWERS_NUM).getValues();
  // 7-, 17, 20, 22-, 25-
  var valFlujo = (valAnswer(answers[0][6], true) + valAnswer(answers[0][16], false) + valAnswer(answers[0][19], false) + valAnswer(answers[0][21], true) + valAnswer(answers[0][24], true)) / 5;
  // 8, 16, 29, 32-, 39
  var valPriorizacion = (valAnswer(answers[0][7], false) + valAnswer(answers[0][15], false) + valAnswer(answers[0][28], false) + valAnswer(answers[0][31], true) + valAnswer(answers[0][38], false)) / 5;
  // 2, 11, 24, 28, 30
  //var valProposito = (valAnswer(answers[0][1],false) + valAnswer(answers[0][10],false) + valAnswer(answers[0][23],false) + valAnswer(answers[0][27],false) + valAnswer(answers[0][29],false)) / 5;
  // 5, 15, 18, 35, 40
  var valVisualizacion = (valAnswer(answers[0][4], false) + valAnswer(answers[0][14], false) + valAnswer(answers[0][17], false) + valAnswer(answers[0][34], false) + valAnswer(answers[0][39], false)) / 5;
  // 6, 12, 26, 33, 37
  var valRitmo = (valAnswer(answers[0][5], false) + valAnswer(answers[0][11], false) + valAnswer(answers[0][25], false) + valAnswer(answers[0][32], false) + valAnswer(answers[0][36], false)) / 5;
  // 3, 23, 31, 34, 38
  var valPresencia = (valAnswer(answers[0][2], false) + valAnswer(answers[0][22], false) + valAnswer(answers[0][30], false) + valAnswer(answers[0][33], false) + valAnswer(answers[0][37], false)) / 5;
  // 1, 4, 9, 13, 36-
  var valCuidado = (valAnswer(answers[0][0], false) + valAnswer(answers[0][3], false) + valAnswer(answers[0][8], false) + valAnswer(answers[0][12], false) + valAnswer(answers[0][35], true)) / 5;
  // 10, 14, 19, 21, 27
  var valMejora = (valAnswer(answers[0][9], false) + valAnswer(answers[0][13], false) + valAnswer(answers[0][18], false) + valAnswer(answers[0][20], false) + valAnswer(answers[0][26], false)) / 5;
  var valores = [[valFlujo, "Flujo"], [valPriorizacion, "Priorización"], [valVisualizacion, "Visualización"], [valRitmo, "Ritmo"], [valPresencia, "Presencia"], [valCuidado, "Cuidado"], [valMejora, "Mejora"]];
  var sorteadas = valores.sort();
  return sorteadas[0][1];
}

function valAnswer(answer, invert) {
  return invert ? INVERSE_SCALE_ES[answer] : SCALE_ES[answer];
}

function logRadar(time, line, userID, email, name, worst, status) {
  try {
    getSheet(ANSWERS.ID, SENT.NAME).appendRow([new Date(), time, line, userID, email, name, worst, status]);
  } catch (e) {
    Logger.log(e);
  }
}

function getUserData(userID) {
  const params = { headers: { Accept: 'application/json', apiKey: TEACHABLE_API_KEY }, muteHttpExceptions: true }
  const data = JSON.parse(UrlFetchApp.fetch(TEACHABLE_USER_ENDPOINT + userID, params));
  return [data.email, data.name];
}

function getSheet(id, name) {
  try {
    return SpreadsheetApp.openById(id).getSheetByName(name);
  } catch (e) {
    Logger.log('Error getSheet(id, name) / id: ' + id + ' / name: ' + name + e + ' / Reintento');
    Utilities.sleep(20000);
    return SpreadsheetApp.openById(id).getSheetByName(name);
  }
}
