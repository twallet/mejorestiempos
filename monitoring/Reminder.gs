function sendReminders() {
  try {
    log(['sendReminders()'], 5);
    const firstDaysLimit = new Date();
    firstDaysLimit.setDate(firstDaysLimit.getDate() - FIRST_REMINDER_DAYS);
    const secondDaysLimit = new Date();
    secondDaysLimit.setDate(secondDaysLimit.getDate() - SECOND_REMINDER_DAYS);
    const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
    const data = participantsSheet.getDataRange().getValues();
    const activeParticipants = data.filter(function (line) { return (new Date(line[PARTICIPANTS_SHEET.START_COL - 1]) > new Date(REMINDER_START_LIMIT)) });
    const lostRadarParticipants = activeParticipants.filter(isForRadarReminder);
    lostRadarParticipants.forEach(sendReminderRadar);
    const lostFirstParticipants = activeParticipants.filter(function (line) { return isForFirstReminder(line, firstDaysLimit); });
    lostFirstParticipants.forEach(sendFirstReminder);
    const lostSecondParticipants = activeParticipants.filter(function (line) { return isForSecondReminder(line, secondDaysLimit); });
    lostSecondParticipants.forEach(sendSecondReminder);
  } catch (e) {
    log(['Exception in sendReminders()', e], 7);
    throw e;
  }
}

function isForRadarReminder(line) {
  const dayBefore = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
  const yesterdayStart = new Date(dayBefore.getFullYear(), dayBefore.getMonth(), dayBefore.getDate(), 0, 0, 0, 0);
  const yesterdayEnd = new Date(dayBefore.getFullYear(), dayBefore.getMonth(), dayBefore.getDate(), 23, 59, 59, 999);
  const radarLectureDate = new Date(line[PARTICIPANTS_SHEET.RADAR_LECTURE_COL - 1]);
  return ((radarLectureDate >= yesterdayStart)
    && (radarLectureDate <= yesterdayEnd)
    && (line[PARTICIPANTS_SHEET.RADAR_SENT_COL - 1] == '')
    && (line[PARTICIPANTS_SHEET.RADAR_REMINDER_COL - 1] == ''))
}

function isForFirstReminder(line, daysLimit) {
  const progress = line[PARTICIPANTS_SHEET.PROGRESS_COL - 1];
  const lastProgress = line[PARTICIPANTS_SHEET.LAST_PROGRESS_COL - 1];
  const firstReminder = line[PARTICIPANTS_SHEET.FIRST_REMINDER_COL - 1];
  const startDate = new Date(line[PARTICIPANTS_SHEET.START_COL - 1]);
  if (lastProgress == '') { return (progress == 0) && (startDate < daysLimit) && (firstReminder == ''); };
  return ((progress < REMINDER_PROGRESS_LIMIT) && (firstReminder == '') && (new Date(lastProgress) < daysLimit));
}

function isForSecondReminder(line, daysLimit) {
  const progress = line[PARTICIPANTS_SHEET.PROGRESS_COL - 1];
  const lastProgress = line[PARTICIPANTS_SHEET.LAST_PROGRESS_COL - 1];
  const firstReminder = line[PARTICIPANTS_SHEET.FIRST_REMINDER_COL - 1];
  const secondReminder = line[PARTICIPANTS_SHEET.SECOND_REMINDER_COL - 1];
  const startDate = new Date(line[PARTICIPANTS_SHEET.START_COL - 1]);
  if (lastProgress == '') { return (progress == 0) && (startDate < daysLimit) && (firstReminder !== '') && (secondReminder == '') && (new Date(firstReminder) < daysLimit); };
  return ((progress < REMINDER_PROGRESS_LIMIT) && (firstReminder !== '') && (secondReminder == '') && (new Date(lastProgress) < daysLimit) && (new Date(firstReminder) < daysLimit));
}

function sendReminderRadar(value) {
  log(['sendReminderRadar(value)'], 1);
  const courseID = value[PARTICIPANTS_SHEET.COURSE_ID - 1];
  switch (getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.LENGUAGE)) {
    case 'ES':
      var tittle = '¡Falta tu Radar del Tiempo!'
      var subBody = '<br><br>Ayer completaste la actividad <em>Mi Radar del Tiempo</em>, en el <em>' + value[PARTICIPANTS_SHEET.COURSE_NAME_COL - 1] + '</em>. Sin embargo, no terminaste de completar las preguntas de tu <em>Radar del Tiempo</em> dentro de esta actividad.<br><br>El <em>Radar del Tiempo</em> te va a proveer un diagnóstico de tu gestión del tiempo, identificando en cuáles de los 8 ejes de la gestión del tiempo tienes mayores oportunidades de mejora: flujo, priorización, propósito, visualización, ritmo, presencia, cuidado y/o mejora. Es muy probable que te ayude a enfocarte a lo largo del <em>' + value[PARTICIPANTS_SHEET.COURSE_NAME_COL - 1] + '</em> en pequeñas mejoras que apunten a lo que más te cuesta.<br><br>Estos son los pasos para completar tu <em>Radar del Tiempo</em>:<br>1. <b>Ingresar a la actividad <em>Mi Radar del Tiempo</em></b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.RADAR_URL) + '<br>2. Casi abajo del todo presionar el <b>botón Empezar</b> que te permitirá iniciar con las preguntas del radar.<br>3. <b>Completar las 40 preguntas</b> del radar.<br>4. No te olvides de presionar el <b>botón Enviar</b> al final del formulario.<br>5. Luego vas a <b>recibir tu radar por email</b> en PDF en cuestión de minutos.<br><br>Espero que consideres hacerlo y que te aporte valor.<br>No dudes en consultarme contestando este email por cualquier inconveniente.<br>Saludos,<br><br>  Thomas';
      var body = "¡Hola " + value[PARTICIPANTS_SHEET.NAME_COL - 1] + "!" + subBody;
      break;
    case 'BR':
      var tittle = 'Falta seu Radar do Tempo!'
      var subBody = '<br><br>Ontem você concluiu a atividade: <em>Meu Radar do Tempo</em>, na <em>' + value[PARTICIPANTS_SHEET.COURSE_NAME_COL - 1] + '</em>. No entanto, você não terminou de responder às perguntas do <em>Radar do Tempo</em> nesta atividade.<br><br>O <em>Radar do Tempo</em> irá lhe fornecer um diagnóstico da sua gestão do tempo, identificando em qual dos 8 eixos da gestão do tempo você tem maiores oportunidades de melhoria: fluxo, priorização, propósito, visualização, ritmo, presença, cuidado e/ou melhoria. É muito provável que isso o ajude a se concentrar durante toda a <em>' + value[PARTICIPANTS_SHEET.COURSE_NAME_COL - 1] + '</em> em pequenas melhorias que apontem para o que seja mais difícil para você.<br><br>Para completar seu <em>Radar do Tempo</em>:<br>1. <b>Acessar a atividade <em>Meu Radar do Tempo</em></b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.RADAR_URL) + '<br>2. Abaixo você encontrará um <b>botão Iniciar</b> que lhe permitirá iniciar as perguntas do radar.<br>3. <b>Completar as 40 perguntas do radar</b>.<br>4. Não se esqueça de pressionar o <b>botão Enviar</b> na parte inferior do formulário.<br>5. Você <b>receberá seu <em>Radar do Tempo</em> por e-mail</b> em PDF em questão de minutos.<br><br>Espero que você considere fazer isso e que isso lhe dê valor.<br>Não hesite em entrar em contato comigo respondendo a este e-mail para qualquer inconveniente.<br>Atenciosamente,<br><br>  Thomas';
      var body = "Olá " + value[PARTICIPANTS_SHEET.NAME_COL - 1] + "!" + subBody;
      break;
    default:
  }
  const email = value[PARTICIPANTS_SHEET.EMAIL_COL - 1];
  try {
    MailApp.sendEmail({
      to: email,
      subject: tittle,
      body: "",
      htmlBody: body,
      bcc: CONTROL_EMAIL,
      replyTo: getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.EMAIL),
      name: getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.PLATAFORMA)
    });
    Utilities.sleep(200);
  } catch (e) {
    log(['Exception in sendReminderRadar()', e], 7);
    throw e;
  }
  logReminderSent(courseID, value[PARTICIPANTS_SHEET.USER_ID - 1], PARTICIPANTS_SHEET.RADAR_REMINDER_COL);
}

function sendFirstReminder(line) {
  log(['sendFirstReminder(line)'], 1);
  const courseID = line[PARTICIPANTS_SHEET.COURSE_ID - 1];
  const lenguage = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.LENGUAGE);
  try {
    MailApp.sendEmail({
      to: line[PARTICIPANTS_SHEET.EMAIL_COL - 1],
      subject: getFirstReminderSubject(lenguage, courseID),
      body: "",
      htmlBody: getFirstReminderText(line[PARTICIPANTS_SHEET.WORST_COL - 1], line[PARTICIPANTS_SHEET.PROGRESS_COL - 1], lenguage, courseID),
      bcc: CONTROL_EMAIL,
      replyTo: getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.EMAIL),
      name: getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.PLATAFORMA)
    });

    Utilities.sleep(200);
  } catch (e) {
    log(['Exception in sendFirstReminder()', e], 7);
    throw e;
  }
  logReminderSent(courseID, line[PARTICIPANTS_SHEET.USER_ID - 1], PARTICIPANTS_SHEET.FIRST_REMINDER_COL);
}

function sendSecondReminder(line) {
  log(['sendSecondReminder(line)'], 1);
  const courseID = line[PARTICIPANTS_SHEET.COURSE_ID - 1];
  const lenguage = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.LENGUAGE);
  try {
    MailApp.sendEmail({
      to: line[PARTICIPANTS_SHEET.EMAIL_COL - 1],
      subject: getSecondReminderSubject(lenguage, courseID),
      body: "",
      htmlBody: getSecondReminderText(line[PARTICIPANTS_SHEET.WORST_COL - 1], line[PARTICIPANTS_SHEET.PROGRESS_COL - 1], lenguage, courseID),
      bcc: CONTROL_EMAIL,
      replyTo: getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.EMAIL),
      name: getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.PLATAFORMA)
    });
    Utilities.sleep(200);
  } catch (e) {
    log(['Exception in sendSecondReminder()', e], 7);
    throw e;
  }
  logReminderSent(courseID, line[PARTICIPANTS_SHEET.USER_ID - 1], PARTICIPANTS_SHEET.SECOND_REMINDER_COL);
}

function getFirstReminderSubject(lenguage, courseID) {
  const courseName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME);
  switch (lenguage) {
    case 'ES':
      return 'Tus avances en el ' + courseName;
    case 'BR':
      return 'Seu progresso na ' + courseName;
    default:
      return '';
  }
}

function getSecondReminderSubject(lenguage, courseID) {
  const courseName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME);
  switch (lenguage) {
    case 'ES':
      return '¿Qué vas a hacer con el ' + courseName + '?';
    case 'BR':
      return 'O que você vai fazer com a ' + courseName + '?';
    default:
      return '';
  }
}

function getFirstReminderText(worst, progress, lenguage, courseID) {
  const courseName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME);
  const platformName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.PLATAFORMA);
  switch (lenguage) {
    case 'ES':
      var startText = '¡Hola!<br><br>Estás participando del <em>' + courseName + '</em>. Sin embargo hace ' + FIRST_REMINDER_DAYS + ' días que no accedes a la plataforma <em>'
        + platformName + '</em>. Por eso queríamos asegurarnos que no haya algún inconveniente para que puedas seguir y ofrecerte ayuda si fuera necesario.<br><br>'
      var endText = 'No dudes en consultarnos contestando este email por cualquier duda.<br>Saludos,<br><br>  Thomas';
      if (progress <= NO_RADAR_PROGRESS) {
        var middleText = 'Seguro tienes múltiples compromisos, prioridades y justificaciones muy válidas… Sin embargo, te propongo reflexionar sobre la siguiente frase: <b><em>Mejorar la gestión de mi tiempo solo depende de mi. </b></em>Si no inviertes tiempo en la mejora, seguirás gestionando tu tiempo como lo vienes haciendo. <b>Es tu decisión…</b><br><br><b>⇨ Retomar el ' + courseName + '</b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
        return startText + middleText + endText;
      }
      switch (worst) {
        case '':
          var middleText = 'Según nuestros registros, todavía no completaste tu <em> Radar del Tiempo</em>, que te da un diagnóstico de tus prácticas de gestión del tiempo, identificando en cuáles de los 8 ejes de la gestión del tiempo tienes mayores oportunidades de mejora: <em>flujo, priorización, propósito, visualización, ritmo, presencia, cuidado y/o mejora </em>. En el resto del <em>' + courseName + '</em> podrás encontrar técnicas y herramientas simples con sus ejercicios de aplicación para aprovechar estas oportunidades de mejora, permitiendo transformar la gestión de tu tiempo. <b><em>No dejes pasar esta oportunidad de cambiar tu gestión del tiempo...</b></em><br><br>Estos son los pasos para completar tu <em>Radar del Tiempo</em>:<br>1. <b>Ingresar a la actividad <em>Mi Radar del Tiempo</em></b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.RADAR_URL) + '<br>2. Casi abajo del todo presionar el <b>botón Empezar</b> que te permitirá iniciar con las preguntas del radar.<br>3. <b>Completar las 40 preguntas</b> del radar.<br>4. No te olvides de presionar el <b>botón Enviar</b> al final del formulario.<br>5. Luego vas a <b>recibir tu radar por email</b> en PDF cuestión de minutos.<br><br>';
          break;
        case 'Flujo':
          var middleText = 'Según tu <em>Radar del Tiempo</em>, tienes buenas oportunidades de mejora en el eje <b>Flujo</b> de la gestión del tiempo. Si trabajas en la mejora de este eje, podrás asegurar avances con un <b>ritmo adecuado y sostenible,</b> y también podrás identificar mejor <b>pequeñas tareas,</b> encontrar la <b>fluidez</b> en su ejecución y limitar el impacto de las <b>interrupciones.</b><br><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Pomodoro, Baby Steps, Getting Things Done</b> o <b>Zen To Done.</b><br><br> ¡Llegó el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Priorización':
          var middleText = 'Según tu <em>Radar del Tiempo</em>, tienes buenas oportunidades de mejora en el eje <b>Priorización</b> de la gestión del tiempo. Si trabajas en la mejora de este eje, podrás tomar conciencia y elegir claramente <b>en qué quieres invertir tu tiempo.</b> Podrás establecer un mecanismo consciente y disciplinado para priorizar distintas iniciativas de acuerdo a tus <b>objetivos y criterios de valor.</b><br><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Matriz de Eisenhower, Personal Kanban</b> o <b>Zen To Done.</b><br><br> ¡Llegó el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Visualización':
          var middleText = 'Según tu <em>Radar del Tiempo</em>, tienes buenas oportunidades de mejora en el eje <b>Visualización</b> de la gestión del tiempo. Si trabajas en la mejora de este eje, obtendrás <b>visibilidad sobre tu flujo de actividades,</b> que te permitirá tomar <b>mejores decisiones, seguir avances, recordar tus temas en curso,</b> entre otros.<br><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Tablero de Tareas, Personal Kanban</b> o <b>Bullet Journal.</b><br><br> ¡Llegó el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Ritmo':
          var middleText = 'Según tu <em>Radar del Tiempo</em>, tienes buenas oportunidades de mejora en el eje <b>Ritmo</b> de la gestión del tiempo. Si trabajas en la mejora de este eje, podrás tomar conciencia de tus ritmos y <b>elegirlos conscientemente</b> a lo largo del día, para habilitar el <b>disfrute responsable</b>, las <b>conexiones genuinas</b> y los <b>beneficios sostenibles</b> en todo lo que haces.<br><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Zen To Done, Ritmo Circadiano</b> o <b>Slow.</b><br><br> ¡Llegó el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Presencia':
          var middleText = 'Según tu <em>Radar del Tiempo</em>, tienes buenas oportunidades de mejora en el eje <b>Presencia</b> de la gestión del tiempo. Si trabajas en la mejora de este eje, podrás <b>habitar plenamente</b> las iniciativas que realizas y lograr <b>sacarles lo mejor</b>, sin otras <b>preocupaciones</b> ni <b>distracciones</b>.<br><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Vaciar la Cabeza, Pomodoro</b> o <b>Días Temáticos.</b><br><br> ¡Llegó el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Cuidado':
          var middleText = 'Según tu <em>Radar del Tiempo</em>, tienes buenas oportunidades de mejora en el eje <b>Cuidado</b> de la gestión del tiempo. Si trabajas en la mejora de este eje, podrás lograr las <b>condiciones adecuadas</b> que te permitan <b>optimizar</b> la gestión de tu tiempo, cuidando continuamente tu <b>cuerpo</b>, tu <b>puesto de trabajo</b> y la <b>calidad</b> de tus tareas.<br><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Cuidar la Tarea, Slow</b> o <b>Retrospectivas.</b><br><br> ¡Llegó el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Mejora':
          var middleText = 'Según tu <em>Radar del Tiempo</em>, tienes buenas oportunidades de crecimiento en el eje <b>Mejora</b> de la gestión del tiempo. Si trabajas en este eje, podrás implementar <b>mecanismos de mejora continua</b> que te permitan <b>reflexionar</b> para <b>aprender de tus errores</b> y aciertos, para seguir <b>experimentando</b> en un continuo crecimiento.<br><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Retrospectiva, Zen to Done</b> o <b>Katas.</b><br><br> ¡Llegó el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        default:
          var middleText = '';
      }
      return startText + middleText + endText;
    case 'BR':
      var startText = 'Olá!<br><br>Você está participando da <em>' + courseName + '</em>. No entanto, já se passaram ' + FIRST_REMINDER_DAYS +
        ' dias desde a última vez que você acessou a plataforma do <em>' + platformName + '</em>. Por isso, queremos ter certeza de que não há problemas para que você possa continuar e oferecer ajuda, se necessário.<br><br>'
      var endText = 'Não hesite em entrar em contato conosco para qualquer dúvida.<br>Atenciosamente,<br><br>  Thomas';
      if (progress <= NO_RADAR_PROGRESS) {
        var middleText = 'Certamente você tem vários compromissos, prioridades e justificativas muito válidas... Porém, sugiro que você reflita sobre a seguinte frase: <b><em>Melhorar a gestão do meu tempo só depende de mim. </b></em>Se você não investir tempo em melhorias, continuará gerenciando seu tempo como vem fazendo. <b>É sua decisão…</b><br><br><b>⇨ Retomar a ' + courseName + '</b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
        return startText + middleText + endText;
      }
      switch (worst) {
        case '':
          var middleText = 'De acordo com nossos registros, você ainda não concluiu seu <em> Radar do Tempo</em>, que oferece um diagnóstico da sua gestão do tempo,  identificando quais dos principais eixos da gestão do tempo apresentam maiores oportunidades de melhoria: <em>fluxo, priorização, propósito, visualização, ritmo, presença, cuidado e melhoria.</em> No resto da <em>' + courseName + '</em> você encontrará técnicas e ferramentas simples com seus exercícios de aplicação para aproveitar essas oportunidades de melhoria, permitindo transformar a gestão do seu tempo. <b><em>Não perca essa oportunidade de mudar seu gestão do tempo...</b></em><br><br>Para completar seu <em>Radar do Tempo</em>:<br>1. <b>Acessar a atividade <em>Meu Radar do Tempo</em></b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.RADAR_URL) + '<br>2. Abaixo você encontrará um <b>botão Iniciar</b> que lhe permitirá iniciar as perguntas do radar.<br>3. <b>Completar as 40 perguntas do radar</b>.<br>4. Não se esqueça de pressionar o <b>botão Enviar</b> na parte inferior do formulário.<br>5. Você <b>receberá seu <em>Radar do Tempo</em> por e-mail</b> em PDF em questão de minutos.<br><br>';
          break;
        case 'Flujo':
          var middleText = 'De acordo com seu <em>Radar do Tempo</em>, você tem boas oportunidades de melhoria no eixo <b>Fluxo</b> de gestão do tempo. Se trabalhar na melhoria deste eixo, conseguirá garantir um progresso a um <b>ritmo adequado e sustentável</b>, e também poderá identificar melhor as <b>pequenas tarefas</b>, encontrar a <b>fluidez</b> na sua execução e limitar o impacto das <b>interrupções</b>.<br><br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo <b>Pomodoro, Baby Steps, Getting Things Done</b> ou <b>Zen To Done.</b><br><br> Chegou a hora de transformar a sua gestão do tempo, <b>não perca!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Priorización':
          var middleText = 'De acordo com seu <em>Radar do Tempo</em>, você tem boas oportunidades de melhoria no eixo <b>Priorização</b> de gestão do tempo. Se trabalhar na melhoria deste eixo, poderá tomar consciência e escolher com clareza <b>em que deseja investir seu tempo.</b> Você poderá estabelecer um mecanismo consciente e disciplinado para priorizar diferentes iniciativas de acordo com seus <b>objetivos e critérios de valor.</b><br><br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo <b>Matriz de Eisenhower, Personal Kanban</b> ou <b>Zen To Done.</b><br><br> Chegou a hora de transformar a sua gestão do tempo, <b>não perca!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Visualización':
          var middleText = 'De acordo com seu <em>Radar do Tempo</em>, você tem boas oportunidades de melhoria no eixo <b>Visualização</b> de gestão do tempo. Se trabalhar na melhoria deste eixo, obterá uma <b>visibilidade do seu fluxo de atividades,</b> que lhe permitirá tomar <b>melhores decisões, acompanhar o progresso,</b> ter clareza sobre suas atividades, <b>lembrar temas</b> em curso, entre outros.<br><br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo <b>Quadro de Tarefas, Personal Kanban</b> ou <b>Bullet Journal.</b><br><br> Chegou a hora de transformar a sua gestão do tempo, <b>não perca!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Ritmo':
          var middleText = 'De acordo com seu <em>Radar do Tempo</em>, você tem boas oportunidades de melhoria no eixo <b>Ritmo</b> de gestão do tempo. Se trabalhar na melhoria deste eixo, poderá tomar consciência dos seus ritmos e poder <b>escolhê-los conscientemente</b> ao longo do dia, para habilitar o <b>desfrute responsável,</b> as <b>conexões genuínas</b> e os <b>benefícios sustentáveis.</b><br><br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo <b>Zen To Done, Ritmo Circadiano</b> ou <b>Slow.</b><br><br> Chegou a hora de transformar a sua gestão do tempo, <b>não perca!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Presencia':
          var middleText = 'De acordo com seu <em>Radar do Tempo</em>, você tem boas oportunidades de melhoria no eixo <b>Presença</b> de gestão do tempo. Se trabalhar na melhoria deste eixo, poderá <b>habitar plenamente</b> as iniciativas que realiza e <b>tirar o melhor proveito delas,</b> sem outras <b>preocupações</b> ou <b>distrações.</b><br><br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo <b>Esvaziar a Cabeça, Pomodoro</b> ou <b>Dias Temáticos.</b><br><br> Chegou a hora de transformar a sua gestão do tempo, <b>não perca!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Cuidado':
          var middleText = 'De acordo com seu <em>Radar do Tempo</em>, você tem boas oportunidades de melhoria no eixo <b>Cuidado</b> de gestão do tempo. Se trabalhar na melhoria deste eixo,  conseguirá alcançar as <b>condições adequadas</b> que lhe permitem otimizar a gestão do seu tempo, cuidando continuamente do seu <b>corpo,</b> do seu <b>posto de trabalho</b> e da <b>qualidade</b> das suas tarefas.<br><br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo <b>Cuidar da Tarefa, Slow</b> ou <b>Retrospectivas.</b><br><br> Chegou a hora de transformar a sua gestão do tempo, <b>não perca!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Mejora':
          var middleText = 'De acordo com seu <em>Radar do Tempo</em>, você tem boas oportunidades de melhoria no eixo <b>Melhoria</b> de gestão do tempo. Se trabalhar na melhoria deste eixo, poderá implementar <b>mecanismos de melhoria contínua</b> que lhe permitam refletir para <b>aprender com seus erros</b> e acertos, para continuar <b>experimentando</b> em crescimento contínuo.<br><br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo <b>Retrospectiva, Zen to Done</b> ou <b>Katas.</b><br><br> Chegou a hora de transformar a sua gestão do tempo, <b>não perca!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        default:
          var middleText = '';
      }
      return startText + middleText + endText;
    default:
      return '';
  }
}

function getSecondReminderText(worst, progress, lenguage, courseID) {
  const courseName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_NAME);
  const platformName = getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.PLATAFORMA);
  switch (lenguage) {
    case 'ES':
      var startText = '¡Hola!<br><br>Vemos que hace tiempo que no ingresaste a la plataforma <em>' + platformName + '</em> para avanzar en el <em>' + courseName + '</em>. Queremos resolver cualquier inconveniente que tengas al respecto, para que puedas sacarle el mayor provecho posible.<br><br>'
      var endText = 'No dudes en escribirnos contestando este email por cualquier duda.<br>Saludos,<br><br>  Thomas';
      if (progress <= NO_RADAR_PROGRESS) {
        var middleText = 'Si todavía tienes ganas de mejorar la gestión de tu tiempo, te aseguro que <b>ahora mismo es el momento</b> de hacerlo. Si no es el caso, me imagino que tu gestión del tiempo se adecua a tus necesidades y no tiene mucho sentido avanzar con el <em>' + courseName + '</em>. <b>Es tu decisión</b>, y eres la única persona que sabe realmente si lo necesitas o no…<br><br>De toda forma, te comparto algunos testimonios de participantes anteriores:<br>⇨<em>\"Quiero agradecerles por enseñarme y darme las herramientas para que mi vida no sea un caos!\" (Vanesa)</em><br>⇨<em>\"Me doy cuenta que la administración del tiempo es un arte, no solo requiere de nuestras habilidades personales sino de nuestra capacidad de estar abiertos siempre aprender nuevos estilos, metodologías y herramientas\" (Erika)</em><br><br><b>⇨ Retomar el ' + courseName + '</b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
        return startText + middleText + endText;
      }
      switch (worst) {
        case '':
          var middleText = 'Tienes pendiente completar tu <em> Radar del Tiempo</em>, para tener un <b>diagnóstico de tus prácticas de gestión del tiempo</b>, identificando en cuáles de los 8 ejes de la gestión del tiempo tienes mayores oportunidades de mejora: <em>flujo, priorización, propósito, visualización, ritmo, presencia, cuidado y/o mejora </em>. En el resto del <em>' + courseName + '</em> podrás encontrar <b>técnicas y herramientas simples con sus ejercicios de aplicación para trabajar en tus oportunidades de mejora</b>.<br><br>Te dejamos un par de comentarios de participantes anteriores sobre el<em> Radar del Tiempo</em>:<br>⇨<em>\"Un buen ejercicio para empezar a aterrizar de forma práctica los puntos que debemos  tener presentes para mejorar el uso que damos a nuestro tiempo” (Edison)</em><br>⇨<em>\"Excelente ejercicio, ayuda para ver tus fortalezas y debilidades, a reforzarlas para mejorar nuestra gestión del tiempo” (Cristian)</em><br><br>Estos son los pasos para completar tu <em>Radar del Tiempo</em>:<br>1. <b>Ingresar a la actividad <em>Mi Radar del Tiempo</em></b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.RADAR_URL) + '<br>2. Casi abajo del todo presionar el <b>botón Empezar</b> que te permitirá iniciar con las preguntas del radar.<br>3. <b>Completar las 40 preguntas</b> del radar.<br>4. No te olvides de presionar el <b>botón Enviar</b> al final del formulario.<br>5. Luego vas a <b>recibir tu radar por email</b> en PDF cuestión de minutos.<br><br>';
          break;
        case 'Flujo':
          var middleText = 'En tu <em>Radar del Tiempo</em>, hay un eje de gestión del tiempo donde tienes buenas oportunidades de mejora: el de <b>Flujo</b>.<br><b>⇨¿Qué es?</b> El flujo se refiere a la forma en la cual se mueven nuestras tareas; por ejemplo si tardan mucho en iniciarse, si se quedan trabadas o si avanzan por sacudida.<br><b>⇨¿Qué se busca?</b> Definir <b>pequeñas tareas</b>, en las cuales avanzamos con <b>fluidez</b>, limitando el impacto de las <b>interrupciones</b> y los <b>bloqueos</b>.<br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Pomodoro, Baby Steps, Getting Things Done</b> o <b>Zen To Done.</b><br><br>Te dejo un par de comentarios de participantes anteriores sobre eso:<br>⇨<em>\"Muchas técnicas muy interesantes y con una estructura que lleva a revisar de manera detallada cada tema. Por ejemplo, la de <em>Baby Steps</em> me parece muy interesante para salir de un estado \"empantanado\" cuando no podemos arrancar con algo\” (Mariela)</em><br>⇨<em>\"Las herramientas propuestas en esta sección nos ayudaran a alivianar un poco el gran flujo de tareas que se nos presentan y enfocarnos más en lo esencial, urgente e importante\” (Hector)</em><br><br> Ahora es el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Priorización':
          var middleText = 'En tu <em>Radar del Tiempo</em>, hay un eje de gestión del tiempo donde tienes buenas oportunidades de mejora: el de <b>Priorización</b>.<br><b>⇨¿Qué es?</b> La priorización es el mecanismo que usamos para ordenar actividades, proyectos, tareas o iniciativas por orden de importancia en relación con otras.<br><b>⇨¿Qué se busca?</b> Dejar de correr atrás del tiempo intentando hacer siempre más cosas, <b>tomando conciencia</b> y <b>eligiendo con disciplina</b> en qué queremos invertir nuestro tiempo, de acuerdo a <b>objetivos y criterios claros</b>.<br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Matriz de Eisenhower, Personal Kanban</b> o <b>Zen To Done.</b><br><br>Te dejo un par de comentarios de participantes anteriores sobre eso:<br>⇨<em>\"Definitivamente el NO y yo a veces no nos entendemos. Es una buena oportunidad para plantear acciones de mejora y dar un mejor uso al tiempo\” (Daniel)</em><br>⇨<em>\"Me gustó mucho la reflexión.  Nuevamente elegir y priorizar es la clave, saber cuál es lo verdaderamente importante nos ayudará a invertir mejor nuestro tiempo\” (Keane)</em><br><br> Ahora es el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Visualización':
          var middleText = 'En tu <em>Radar del Tiempo</em>, hay un eje de gestión del tiempo donde tienes buenas oportunidades de mejora: el de <b>Visualización</b>.<br><b>⇨¿Qué es?</b> La visualización integra toda la información visual a la cual podemos acceder sobre la gestión de nuestro tiempo.<br><b>⇨¿Qué se busca?</b> Explicitar visualmente la información clave de nuestro flujo de tareas para tomar <b>mejores decisiones, seguir avances</b> o <b>recordar</b> los temas en curso.<br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Tablero de Tareas, Personal Kanban</b> o <b>Bullet Journal.</b><br><br>Te dejo un par de comentarios de participantes anteriores sobre eso:<br>⇨<em>\"Mi comienzo ha sido llevando las actividades en el cuaderno del día a día y me ha sido muy útil  al final de la jornada, ya que puedo visualizar qué tareas termine en el transcurso del día y las que me quedan pendientes las ubico en el cuadro del día siguiente según su importancia\” (Claudia)</em><br>⇨<em>\"El Kanban me ha ayudado a no permitir que en el <em>Haciendo</em> haya más actividades de las que tengo capacidad de hacer para la semana. Al inicio colocaba todo en la columna y me frustraba por no cerrar lo que me comprometía para la semana o el día. Ahora he logrado entender mi capacidad y poco a poco empiezo a aumentarla para hacerme cargo de más tareas\” (Fabian)</em><br><br> Ahora es el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Ritmo':
          var middleText = 'En tu <em>Radar del Tiempo</em>, hay un eje de gestión del tiempo donde tienes buenas oportunidades de mejora: el de <b>Ritmo</b>.<br><b>⇨¿Qué es?</b> El ritmo es el pulso que sigue nuestro flujo de actividades, como un latido que puede acelerar o frenar en distintas situaciones del día.<br><b>⇨¿Qué se busca?</b> Tomar conciencia de nuestros ritmos y poder <b>elegirlos conscientemente </b> a lo largo del día, para habilitar el <b>disfrute responsable</b>, las <b>conexiones genuinas</b> y los <b>beneficios sostenibles</b>.<br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Zen To Done, Ritmo Circadiano</b> o <b>Slow.</b><br><br>Te dejo un par de comentarios de participantes anteriores sobre eso:<br>⇨<em>\"Estoy convencida que debo implementar esto en mi vida, vivo a mil por horas, esto perjudica mis relaciones xq nunca estoy presente 100%., mi mente siempre esta a mil , afecta mi desempeño porque no retengo todo lo que me dicen  si no lo escribo y se traduce en errores. Creo que tomarme un tiempo para meditar y estar off de pantallas ayudaría mucho\” (Thaisa)</em><br>⇨<em>\"Me gustó esta información, logré entender porque en mi día a día tengo momentos más productivos que otros\” (Juliet)</em><br><br> Ahora es el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Presencia':
          var middleText = 'En tu <em>Radar del Tiempo</em>, hay un eje de gestión del tiempo donde tienes buenas oportunidades de mejora: el de <b>Presencia</b>.<br><b>⇨¿Qué es?</b> La presencia es la capacidad de enfocarse en el aquí y ahora.<br><b>⇨¿Qué se busca? Habitar plenamente</b> los espacios que consideramos importantes para lograr <b>relaciones y resultados de calidad </b><br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Vaciar la Cabeza, Pomodoro</b> o <b>Días Temáticos.</b><br><br>Te dejo un par de comentarios de participantes anteriores sobre eso:<br>⇨<em>\"Excelente. Vaciar la cabeza es importante para descansar bien. Es necesario tomar notas de las cosas y quitarlas de la cabeza. Me encanta este tema\” (Martin)</em><br>⇨<em>\"Yo arranque a usar la aplicación de pomodoro para este curso..., me encantó\” (Rosa)</em><br><br> Ahora es el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Cuidado':
          var middleText = 'En tu <em>Radar del Tiempo</em>, hay un eje de gestión del tiempo donde tienes buenas oportunidades de mejora: el de <b>Cuidado</b>.<br><b>⇨¿Qué es?</b> El cuidado es la búsqueda de las mejores condiciones para poder realizar exitosamente nuestras actividades en un tiempo adecuado.<br><b>⇨¿Qué se busca?</b> Tener conciencia de y optimizar las condiciones en las cuales desarrollamos nuestras tareas, cuidando en particular nuestro <b>cuerpo</b>, nuestro <b>puesto de trabajo</b>, y todo lo necesario para lograr <b>calidad</b>.<br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Cuidar la Tarea, Slow</b> o <b>Retrospectivas.</b><br><br>Te dejo un par de comentarios de participantes anteriores sobre eso:<br>⇨<em>\"Cuidar la tarea me permite hacer las cosas con calidad, sin descuidar los aspectos personales como el descanso, el equilibrio vida trabajo\” (Carmen)</em><br>⇨<em>\"Super clave equilibrar las tareas, pues mejora la productividad dando foco\” (Rosa)</em><br><br> Ahora es el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Mejora':
          var middleText = 'En tu <em>Radar del Tiempo</em>, hay un eje de gestión del tiempo donde tienes buenas oportunidades de mejora: el de <b>Mejora</b>.<br><b>⇨¿Qué es?</b> La mejora es la observación en retrospectiva de nuestra gestión del tiempo para descubrir cómo adecuarla mejor a nuestras necesidades.<br><b>⇨¿Qué se busca? Reflexionar</b> para aprender de nuestros <b>errores</b> y aciertos, diseñar y ejecutar <b>experimentos</b> de mejora en nuestra gestión del tiempo, para seguir en continuo crecimiento.<br>En el <em>' + courseName + '</em> vas a encontrar <b>técnicas y herramientas simples</b> con sus <b>ejercicios de aplicación</b> para eso, como por ejemplo <b>Retrospectiva, Zen to Done</b> o <b>Katas.</b><br><br>Te dejo un par de comentarios de participantes anteriores sobre eso:<br>⇨<em>\"Super importante tomarse momentos para retrospectivas personales, sobre lo hecho, la gestión y el manejo del tiempo. Me pareció muy interesante el limitarse y ser concretos a la hora de decidir donde y como queremos mejorar\” (Maria Sol)</em><br>⇨<em>\"La Kata me permite llevar conscientemente mi proceso de mejora continua, con objetivos cercanos y medibles\” (Angelica)</em><br><br> Ahora es el momento de transformar tu gestión del tiempo, <b>no te lo pierdas!</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        default:
          var middleText = '';
      }
      return startText + middleText + endText;
    case 'BR':
      var startText = 'Olá!<br><br>Vimos que já faz algum tempo que você não faz login na plataforma <em>' + platformName + '</em> para progredir na <em>' + courseName + '</em>. Queremos resolver quaisquer problemas que você possa ter com isso para que você possa aproveitar ao máximo.<br><br>'
      var endText = 'Não hesite em nos escrever respondendo a este e-mail se tiver alguma dúvida.<br>Atenciosamente,<br><br>  Thomas'
      if (progress <= NO_RADAR_PROGRESS) {
        var middleText = 'Se você ainda deseja melhorar a gestão do seu tempo, garanto que <b>agora é a hora</b> de fazê-lo. Se não for esse o caso, imagino que a sua gestão do tempo atende às suas necessidades e não faz muito sentido avançar com a <em>' + courseName + '</em>.<b> É sua decisão</b>, e você é a única pessoa que realmente sabe se precisa ou não...<br><br>De qualquer forma, compartilho alguns testemunhos de participantes anteriores: <br>⇨<em>\"Quero agradecer por me ensinar e me dar as ferramentas para que minha vida não seja um caos!\" (Vanesa)</em><br>⇨<em>\"Percebo que administrar o tempo é uma arte, não requer apenas nossas habilidades pessoais, mas nossa capacidade de estar sempre abertos para aprender novos estilos, metodologias e ferramentas\" (Erika)</em><br><br><b>⇨ Retomar a ' + courseName + '</b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
        return startText + middleText + endText;
      }
      switch (worst) {
        case '':
          var middleText = 'Você ainda não completou seu <em>Radar do Tempo</em>, para ter um <b>diagnóstico de suas práticas de gestão do tempo</b>, identificando em quais dos 8 eixos de gestão do tempo você tem as maiores oportunidades de melhoria: <em>fluxo, priorização, propósito, visualização, ritmo, presença, cuidado e/ou melhoria</em>. Você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para aproveitar essas oportunidades de melhoria no resto do <em>' + courseName + '</em>.<br><br>Aqui tem alguns comentários de participantes anteriores sobre o <em> Radar del Tiempo</em>:<br>⇨<em>\"Um bom exercício para começar a abordar de forma prática os pontos que devemos ter em mente para melhorar o uso que fazemos do nosso tempo” (Edison)</em><br>⇨<em>\"Excelente exercício, ajuda a ver os seus pontos fortes e fracos, a reforçá-los para melhorar a nossa gestão do tempo” (Cristian)</em><br><br>Para completar seu <em>Radar do Tempo</em>:<br>1. <b>Acessar a atividade <em>Meu Radar do Tempo</em></b>: ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.RADAR_URL) + '<br>2. Abaixo você encontrará um <b>botão Iniciar</b> que lhe permitirá iniciar as perguntas do radar.<br>3. <b>Completar as 40 perguntas do radar</b>.<br>4. Não se esqueça de pressionar o <b>botão Enviar</b> na parte inferior do formulário.<br>5. Você <b>receberá seu <em>Radar do Tempo</em> por e-mail</b> em PDF em questão de minutos.<br><br>';
          break;
        case 'Flujo':
          var middleText = 'No seu <em>Radar del Tiempo</em>, existe um eixo de gestão do tempo onde você tem boas oportunidades de melhoria: o de <b>Fluxo</b>.<br><b>⇨O que é?</b> O fluxo se refere à forma como nossas tarefas se movem; por exemplo, se demoram muito para iniciar, se ficam atrapalhadas ou se avançam com solavancos.<br><b>⇨O que é procurado?</b> Definir <b>pequenas tarefas</b>, nas quais avançamos com <b>fluência</b>, limitando o impacto das <b>interrupções</b> e dos <b>bloqueios</b>.<br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo, <b>Pomodoro, Baby Steps, Getting Things Done</b> ou <b>Zen To Done</b>.<br><br>Aqui tem alguns comentários de participantes anteriores sobre isso:<br>⇨<em>\"Muitas técnicas muito interessantes e com uma estrutura que leva a uma revisão detalhada de cada tema. Por exemplo, a de Baby steps eu acho muito interessante para sair de um estado de atolamento quando não podemos começar com alguma coisa\” (Mariela)</em><br>⇨<em>\"As ferramentas propostas nesta seção nos ajudarão a aliviar um pouco o grande fluxo de tarefas que nos são apresentadas e a focar mais no que é essencial, urgente e importante\” (Heitor)</em><br><br> Agora é a hora de transformar a sua gestão do tempo, <b>não perca...</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Priorización':
          var middleText = 'No seu <em>Radar del Tiempo</em>, existe um eixo de gestão do tempo onde você tem boas oportunidades de melhoria: o de <b>Priorização</b>.<br><b>⇨O que é?</b> A priorização é o mecanismo que usamos para ordenar atividades, projetos, tarefas ou iniciativas em ordem de importância em relação a outras.<br><b>⇨O que é procurado?</b> Parar de correr atrás do tempo tentando fazer sempre mais coisas, <b>tomando consciência</b> e <b>escolhendo com disciplina</b> aquilo em que queremos investir o nosso tempo, de acordo com <b>objetivos e critérios claros</b>.<br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo, <b>Matriz de Eisenhower, Limites de WIP ou OKRs</b>.<br><br>Aqui tem alguns comentários de participantes anteriores sobre isso:<br>⇨<em>\"Definitivamente o NÃO e eu, às vezes não nos entendemos. É uma boa oportunidade para propor ações de melhoria e aproveitar melhor o tempo\” (Daniel)</em><br>⇨<em>\"Gostei muito da reflexão.  Mais uma vez, escolher e priorizar é a chave, saber o que é realmente importante nos ajudará a investir melhor o nosso tempo\” (Keane)</em><br><br> Agora é a hora de transformar a sua gestão do tempo, <b>não perca...</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Visualización':
          var middleText = 'No seu <em>Radar del Tiempo</em>, existe um eixo de gestão do tempo onde você tem boas oportunidades de melhoria: o de <b>Visualização</b>.<br><b>⇨O que é?</b> A visualização integra todas as informações visuais que podemos acessar sobre a gestão do nosso tempo.<br><b>⇨O que é procurado?</b> Explicar visualmente as principais informações do nosso fluxo de tarefas para tomar <b>melhores decisões, acompanhar o progresso</b> ou <b>lembrar</b> os temas em andamento.<br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo, <b>Quadro de Tarefas, Personal Kanban ou Bullet Journal</b>.<br><br>Aqui tem alguns comentários de participantes anteriores sobre isso:<br>⇨<em>\"Meu início foi acompanhando as atividades do caderno do dia a dia e tem sido muito útil no final da jornada, pois consigo visualizar quais tarefas terminei durante o dia e as que ficam pendentes eu coloco no quadro do dia seguinte de acordo com sua importância\” (Cláudia)</em><br>⇨<em>\"O Kanban me ajudou a não permitir mais atividades no <em>Fazendo</em> das que tenho capacidade para fazer durante a semana. No início coloquei tudo na coluna e fme frustrava por não fechar o que me comprometia para a semana ou dia. Agora consegui entender minha capacidade e aos poucos começo a aumentá-la para assumir mais tarefas\” (Fabian)</em><br><br> Agora é a hora de transformar a sua gestão do tempo, <b>não perca...</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Ritmo':
          var middleText = 'No seu <em>Radar del Tiempo</em>, existe um eixo de gestão do tempo onde você tem boas oportunidades de melhoria: o de <b>Ritmo</b>.<br><b>⇨O que é?</b> O ritmo é o pulso que acompanha nosso fluxo de atividades, como um batimento que pode acelerar ou desacelerar em diferentes situações do dia.<br><b>⇨O que é procurado?</b> Tomar consciência dos nossos ritmos e poder <b>escolhê-los conscientemente</b> ao longo do dia, para habilitar o <b>desfrute responsável</b>, as <b>conexões genuínas</b> e os <b>benefícios sustentáveis</b>.<br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo, <b>Zen To Done, Ritmo Circadiano ou Slow</b>.<br><br>Aqui tem alguns comentários de participantes anteriores sobre isso:<br>⇨<em>\"Tenho convicção que devo implementar isso na minha vida, vivo com muita aceleração, isso prejudica meus relacionamentos porque nunca estou 100% presente, minha mente está sempre acelerada, afeta meu desempenho porque não retenho tudo o que me falam se eu não escrever e isso resulta em erros. Acho que reservar um tempo para meditar e ficar longe das telas ajudaria muito\” (Thaisa)</em><br>⇨<em>\"Gostei dessa informação, consegui entender por que no meu dia a dia tenho momentos mais produtivos que outros\” (Juliete)</em><br><br> Agora é a hora de transformar a sua gestão do tempo, <b>não perca...</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Presencia':
          var middleText = 'No seu <em>Radar del Tiempo</em>, existe um eixo de gestão do tempo onde você tem boas oportunidades de melhoria: o de <b>Presença</b>.<br><b>⇨O que é?</b> A presença é a capacidade de focar no aqui e agora.<br><b>⇨O que é procurado? Habitar plenamente</b> os espaços que consideramos importantes para alcançar <b>relacionamentos e resultados de qualidade</b>.<br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo, <b>Esvaziar a Cabeça, Pomodoro ou Dias Temáticos.</b> ou <b>Zen To Done</b>.<br><br>Aqui tem alguns comentários de participantes anteriores sobre isso:<br>⇨<em>\"Excelente. Esvaziar a cabeça é importante para descansar bem. É necessário anotar as coisas e tirá-las da cabeça. Adoro esse tema\” (Martin)</em><br>⇨<em>\"Comecei a usar a aplicação pomodoro para esse curso..., adorei\” (Rosa)</em><br><br> Agora é a hora de transformar a sua gestão do tempo, <b>não perca...</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Cuidado':
          var middleText = 'No seu <em>Radar del Tiempo</em>, existe um eixo de gestão do tempo onde você tem boas oportunidades de melhoria: o de <b>Cuidado</b>.<br><b>⇨O que é?</b> O cuidado é a busca pelas melhores condições para podermos realizar nossas atividades com sucesso e em tempo adequado.<br><b>⇨O que é procurado?</b> Ter consciência e otimizar as condições em que desempenhamos as nossas tarefas, tendo um cuidado especial com o nosso <b>corpo</b>, com o nosso <b>local de trabalho</b> e com tudo o necessário para alcançar a <b>qualidade</b>.<br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo, <b>Ergonometria, Personal DoD, Slow, ou Retrospectivas.</b>.<br><br>Aqui tem alguns comentários de participantes anteriores sobre isso:<br>⇨<em>\"Cuidar da tarefa me permite fazer as coisas com qualidade, sem descuidar de aspectos pessoais como descanso, equilíbrio entre trabalho e vida pessoal\” (Carmen)</em><br>⇨<em>\"É fundamental equilibrar as tarefas, pois melhora a produtividade dando foco\” (Rosa)</em><br><br> Agora é a hora de transformar a sua gestão do tempo, <b>não perca...</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        case 'Mejora':
          var middleText = 'No seu <em>Radar del Tiempo</em>, existe um eixo de gestão do tempo onde você tem boas oportunidades de melhoria: o de <b>Melhoria</b>.<br><b>⇨O que é?</b> A melhoria é a observação retrospectiva da nossa gestão do tempo para descobrir como melhor adaptá-la às nossas necessidades.<br><b>⇨O que é procurado? Refletir</b> para aprender com nossos <b>erros</b> e acertos, projetar e executar <b>experimentos de melhoria</b> na nossa gestão do tempo, para seguir em crescimento contínuo.<br>Na <em>' + courseName + '</em> você encontrará <b>técnicas e ferramentas simples</b> com seus <b>exercícios de aplicação</b> para isso, como por exemplo, <b>Retrospectiva, Zen to Done, Experimentos ou Katas.</b><br><br>Aqui tem alguns comentários de participantes anteriores sobre isso:<br>⇨<em>\"Ë superimportante reservar momentos para retrospectivas pessoais, sobre o que foi feito, a gestão e manejo do tempo. Achei muito interessante nos limitarmos e sermos específicos na hora de decidir onde e como queremos melhorar\” (Maria Sol)</em><br>⇨<em>\"A Kata permite-me realizar de forma consciente o meu processo de melhoria contínua, com objetivos próximos e mensuráveis\” (Angélica)</em><br><br> Agora é a hora de transformar a sua gestão do tempo, <b>não perca...</b> ⇨ ' + getValueAtColumn(courseID, ALL_LOGGED_COURSES_FIELDS.COURSE_ACCESS_LINK) + '<br><br>';
          break;
        default:
          var middleText = '';
      }
      return startText + middleText + endText;
    default:
      return '';
  }
}

function logReminderSent(courseID, userID, column) {
  log(['logReminderSent(courseID, userID, column)', courseID, userID, column], 1);
  const participantsSheet = getSheet(PARTICIPANTS_SHEET.ID, PARTICIPANTS_SHEET.NAME);
  const line = getLineOf(userID, courseID, participantsSheet);
  if (line !== -1) {
    participantsSheet.getRange(line, column).setValue(new Date());
    const lineData = participantsSheet.getRange(line, 1, 1, participantsSheet.getLastColumn()).getValues();
    lineData[0].push(line);
    participantPollinate(lineData[0]);
  }
}
