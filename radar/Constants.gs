const TEACHABLE_API_KEY = 'XXX';
const TEACHABLE_USER_ENDPOINT = "https://developers.teachable.com/v1/users/";
const CONTROL_EMAIL = "xxx@gmail.com";
const PLATFORM_EMAIL = "xxx@nextstepslab.com";
const PLATFORM_NAME = 'Next Steps Lab';
const CONTROL_EMAIL_PREFIX = 'NSL_NEWS';

const ANSWERS = {
  ID: 'XXX',
  NAME: 'Respuestas de formulario 1',
  TIME_COL: 1,
  USER_COL: 2, 
  START_COL: 3,
  ANSWERS_NUM: 40,
};

const SENT = {
  NAME: 'Envíos',
  SENT_COL: 1,
  ANSWER_TIME_COL: 2,
  RADAR_LINE_COL: 3,
  USER_COL: 4,
  EMAIL_COL: 5,
  NAME_COL: 6,   
  ALL_USER_IDS_RG: 'D2:D',
};

const DATA = {
  ID: 'XXX',
  NAME: 'Datos',
  LINE_RG: 'B1',
  EMAIL_RG: 'A7',
  NAME_RG: 'B7',
  SAMPLE_RG: 'C7',
};

const RADAR = {
  NAME: 'Radar'
};

const BLACK_LIST = {
  ID: 'XXX',
  NAME: 'Lista Negra', 
  USERID_COL: 1
};

const SCALE_ES = {
  ['Totalmente de acuerdo']: 5,
  ['De acuerdo']: 3.75,
  ['Ni de acuerdo ni en desacuerdo']: 2.5,
  ['En desacuerdo']: 1.25,
  ['Totalmente en desacuerdo']: 0
};

const INVERSE_SCALE_ES = {
  ['Totalmente de acuerdo']: 0,
  ['De acuerdo']: 1.25,
  ['Ni de acuerdo ni en desacuerdo']: 2.5,
  ['En desacuerdo']: 3.75,
  ['Totalmente en desacuerdo']: 5
};
