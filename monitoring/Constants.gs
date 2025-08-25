const CLIENTS_MAPS_FIELDS = {
  CLIENT_GROUP: 0,
  COUPON: 1,
  SHEET_ID: 2,
  SHEET_NAME: 3,
  USER_ID_COL: 4,
  START_COL: 5,
  FIRST_LINE: 6,
  COMMENTS_COL: 7,
  USER_NAME_COL: 8,
  EMAIL_COL: 9,
  COURSE_NAME_COL: 10,
  PROGRESS_COL: 11,
  END_COL: 12,
  LAST_PROGRESS_COL: 13,
  LAST_LECTURE_COL: 14,
  RADAR_LECTURE_COL: 15,
  RADAR_REMINDER_COL: 16,
  WORST_COL: 17, 
  RADAR_SENT_COL: 18, 
  SURVEY_COL: 19, 
  FIRST_REMINDER_COL: 20,
  SECOND_REMINDER_COL: 21, 
  COUPON_TYPE: 22,
  ACTIVE: 23
};

const CLIENTS_MAPS = [
  ['XXX Ola 1', '20MT-OLA1-XXX', 'XXX', 'Participants', 4, 9, 2, 16, 2, 1, '', 10, 11, 12, 13, '', 18, 15, 14, 17, 19, 20, 'GROUP', false],
  ['XXX BR Ola 1', '', 'XXX', 'Participantes', 6, 7, 2, '', 5, 4, '', 8, 9, '', '', '', '', 11, '', '', '', '', 'PERSONAL', false],
  ['XXX Ola 2', 'MT_O2_XXX', 'XXX', 'Participants', 3, 8, 2, 15, 2, 1, '', 9, 10, 11, 12, '', 17, 14, 13, 16, 18, 19, 'GROUP', false],
  ['XXX 1124', 'MT_XXX_1124', 'XXX', 'Participants', 3, 7, 2, 14, 2, 1, '', 8, 9, 10, 11, '', 16, 13, 12, 15, 17, 18, 'GROUP', true]
];

const ALL_LOGGED_COURSES_FIELDS = {
  COURSE_ID: 0,
  COURSE_NAME: 1,
  TEACHABLE_API_KEY: 2,
  RADAR_LECTURE_ID: 3,
  RADAR_SHEET_ID: 4, //
  LENGUAGE: 5,
  SENT_SHEET: 6,
  RADAR_URL: 7,
  PLATAFORMA: 8,
  EMAIL: 9,
  COURSE_ABV: 10, 
  STUDENT_LINK: 11, 
  SURVEY_SHEET:12, 
  SURVEY_SHEET_NAME:13,
  COURSE_ACCESS_LINK: 14
};

const ALL_LOGGED_COURSES = [
  [2399254, 'Programa Mejores Tiempos', 'xxx', 50400016, 'xxx', 'ES', 'Radar MT', 'https://xxx/courses/mejores-tiempos/lectures/50400016', 'XXX', 'xxxt@XXX', 'MT', 'https://xxx/admin/users/', 'xxx', 'Survey MT', 'https://xxx/courses/enrolled/2399254'],
  [2123861, 'Oficina do Tempo', 'xxx', 48566284, 'xxx', 'BR', 'Radar OdT', 'https://xxx/courses/oficina-do-tempo/lectures/48566284', 'XXX', 'xxx@XXX', 'ODT', 'https://xxx/admin/users/', 'xxx', 'Survey OdT', 'https://xxx/courses/enrolled/2123861'],
  [920235, 'Taller del Tiempo', 'xxx', 43974014, 'xxx', 'ES', 'Radar TTa', 'https://xxx/courses/920235/lectures/43974014', 'Academia XXX', 'xxx@XXX', 'TTA', 'https://xxx/admin/users/', 'xxx', 'Survey TTa', 'https://xxx/courses/enrolled/920235']
];

const CONTROL_EMAIL = 'xxx@gmail.com';
const CONTROL_EMAIL_PREFIX = 'NSL_NEWS';
const MAX_LINES_PASS = 50;
const MAX_OLDS_PASS = 50;
const OLD_DATE = '12/31/2023';
const REMINDER_START_LIMIT = '01/01/2024';
const REMINDER_PROGRESS_LIMIT = 0.92;
const FIRST_REMINDER_DAYS = 15;
const SECOND_REMINDER_DAYS = 21;
const NO_RADAR_PROGRESS = 0.07;

const LOG_SHEET = {
  ID: 'XXX',
  NAME: '_Log',
  LOGGING: 7 //10-None, 9-Debug, 7-Critical, 5-Main Calls, 3-External Call, 1-Details
};

const COMMENTS_SHEET = {
  ID: 'XXXX',
  NAME: 'Comments' 
};

const SURVEY_SHEET = {
  TIMESTAMP: 1,
  USER_ID_COL: 2,
};

const PARTICIPANTS_SHEET = {
  ID: 'XXX',
  NAME: 'Participants',
  FIRST_LINE: 2,
  START_COL: 1,
  NAME_COL: 2,
  USER_ID: 3,
  ALL_USER_IDS_RG: 'C2:C',
  EMAIL_COL: 4,
  COURSE_NAME_COL: 5,
  ALL_COURSE_IDS_RG: 'F2:F',
  COURSE_ID: 6,
  COUPON: 7,
  CLIENT_GROUP_COL: 8,
  PROGRESS_COL: 10,
  END_COL: 11,
  LAST_PROGRESS_COL: 12,
  LAST_LECTURE_COL: 13,
  RADAR_LECTURE_COL: 14,
  RADAR_SENT_COL: 15,
  WORST_COL: 16,
  COMMENTS_COL: 17,
  SURVEY_COL: 18,
  RADAR_REMINDER_COL: 19,
  FIRST_REMINDER_COL: 20,
  FIRST_RECUP_COL: 21,
  SECOND_REMINDER_COL: 22, 
  SECOND_RECUP_COL: 23,
  FOMULAS_RANGE: 'O2:R2'
};

const RADAR_ANSWERS = {
  SHEET_NAME: 'Respuestas de formulario 1',
  ALL_USERS_ID_RG: 'B2:B',
  FIRST_LINE: 2,
  START_COL: 3,
  ANSWERS_NUM: 40
};

const RADAR_SENT = {
  SENT_COL: 1, 
  USER_ID_COL: 4, 
  WORST_COL: 7
};

const STATS = {  
  ID: 'XXX',
  NAME: 'Dashboard',
  LAST_RUN: 'I8',
  FULL_UPDATE: 'I9',
  UPDATE_LINE:  'I10',
  OLDS_LAST_RUN: 'I11',
  OLDS_FULL_UPDATE: 'I12',
  OLDS_UPDATE_LINE: 'I13', 
  LAST_RADAR_LOG: 'I14',
  STATUS: 'B2', 
  HTML_COL: 20,
  MT_CHECK: 'B27',
  ODT_CHECK: 'E27',
  TTA_CHECK: 'I27' 
};

const CLIENT_GROUPS= {
  ID: 'XXX',
  NAME: 'Client Groups',
  CLIENT_GROUP: 1,
  COUPON: 2,
  EXPIRES:3, 
  EMAIL:4
};

var sheetCache = {};
