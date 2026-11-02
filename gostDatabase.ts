// Comprehensive GOST Steel Profiles and Pipes Database
// State standards: GOST 3262-75 (VGP), GOST 10704-91 / 8732-78 (Round), GOST 8639-82 / 8645-68 / 30245-2003 (Profile),
// GOST 5781-82 / 34028-2016 (Rebar), GOST 8509-93 (Angle), GOST 8240-97 (Channel), GOST 8239-89 (I-Beam)

export interface StandardProfile {
  label: string;
  weightPerMeter: number;
  details?: string;
}

export interface ProfileCategory {
  name: string;
  gost: string;
  items: StandardProfile[];
}

export interface Manufacturer {
  id: string;
  name: string;
  factor: number;
  desc: string;
}

export const MANUFACTURERS: Manufacturer[] = [
  { id: 'theory', name: 'ГОСТ (Табличный вес)', factor: 1.0, desc: 'Идеальные табличные параметры ГОСТ.' },
  { id: 'severstal', name: 'Северсталь', factor: 1.001, desc: 'Среднее фабричное отклонение +0.1%.' },
  { id: 'evraz', name: 'Евраз (НТМК/ЗСМК)', factor: 0.998, desc: 'Облегчен на -0.2% за счет калибра.' },
  { id: 'nlmk', name: 'НЛМК', factor: 1.002, desc: 'Среднее фабричное отклонение +0.2%.' },
  { id: 'mmk', name: 'ММК', factor: 1.003, desc: 'Среднее фабричное отклонение +0.3%.' },
  { id: 'mechel', name: 'Мечел', factor: 0.996, desc: 'Облегченный на -0.4% по нижнему допуску.' },
  { id: 'abin', name: 'Абинский ЭМЗ', factor: 0.998, desc: 'Нижний технологический предел -0.2%.' }
];

export const GOST_DATABASE: Record<string, ProfileCategory> = {
  rebar: {
    name: 'Арматура рифленая А500С / А3',
    gost: 'ГОСТ 5781-82 / ГОСТ 34028-2016',
    items: [
      { label: '6 мм', weightPerMeter: 0.222, details: 'Класс А240 / А500С (бухты, прутки)' },
      { label: '8 мм', weightPerMeter: 0.395, details: 'Класс А500С / А3' },
      { label: '10 мм', weightPerMeter: 0.617, details: 'Ходовой диаметр для фундаментной сетки' },
      { label: '12 мм', weightPerMeter: 0.888, details: 'Основная строительная арматура' },
      { label: '14 мм', weightPerMeter: 1.210, details: 'Для несущих фундаментов и поясов' },
      { label: '16 мм', weightPerMeter: 1.580, details: 'Высоконагруженные конструкции' },
      { label: '18 мм', weightPerMeter: 2.000, details: 'Промышленное армирование' },
      { label: '20 мм', weightPerMeter: 2.470, details: 'Мостовые конструкции, тяжелые фундаменты' },
      { label: '22 мм', weightPerMeter: 2.980, details: 'Колонны, эстакады' },
      { label: '25 мм', weightPerMeter: 3.850, details: 'Сверхнагруженные элементы' },
      { label: '28 мм', weightPerMeter: 4.830, details: 'Промстроительство' },
      { label: '32 мм', weightPerMeter: 6.310, details: 'Спецсооружения' },
      { label: '36 мм', weightPerMeter: 7.990, details: 'Спецсооружения' },
      { label: '40 мм', weightPerMeter: 9.870, details: 'Гидроэлектростанции, спецобъекты' },
    ]
  },
  roundPipe: {
    name: 'Труба круглая ВГП / Электросварная',
    gost: 'ГОСТ 3262-75 / ГОСТ 10704-91 / ГОСТ 8732-78',
    items: [
      // --- ВГП (ГОСТ 3262-75) Тонкостенные, легкие, обыкновенные, усиленные ---
      { label: 'Ду 15 (21.3х2.0 мм)', weightPerMeter: 0.952, details: 'ВГП тонкостенная (Dн=21.3 мм)' },
      { label: 'Ду 15 (21.3х2.5 мм)', weightPerMeter: 1.160, details: 'ВГП ГОСТ 3262-75 лёгкая' },
      { label: 'Ду 15 (21.3х2.8 мм)', weightPerMeter: 1.280, details: 'ВГП ГОСТ 3262-75 обыкновенная (1/2")' },
      { label: 'Ду 15 (21.3х3.2 мм)', weightPerMeter: 1.430, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 20 (26.8х2.0 мм)', weightPerMeter: 1.223, details: 'ВГП тонкостенная (Dн=26.8 мм)' },
      { label: 'Ду 20 (26.8х2.5 мм)', weightPerMeter: 1.500, details: 'ВГП ГОСТ 3262-75 лёгкая' },
      { label: 'Ду 20 (26.8х2.8 мм)', weightPerMeter: 1.660, details: 'ВГП ГОСТ 3262-75 обыкновенная (3/4")' },
      { label: 'Ду 20 (26.8х3.2 мм)', weightPerMeter: 1.860, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 25 (33.5х2.0 мм)', weightPerMeter: 1.554, details: 'ВГП тонкостенная (Dн=33.5 мм)' },
      { label: 'Ду 25 (33.5х2.5 мм)', weightPerMeter: 1.911, details: 'ВГП облегченная (1")' },
      { label: 'Ду 25 (33.5х2.8 мм)', weightPerMeter: 2.120, details: 'ВГП ГОСТ 3262-75 лёгкая' },
      { label: 'Ду 25 (33.5х3.2 мм)', weightPerMeter: 2.390, details: 'ВГП ГОСТ 3262-75 обыкновенная (1")' },
      { label: 'Ду 25 (33.5х3.5 мм)', weightPerMeter: 2.589, details: 'ВГП утолщенная стенка' },
      { label: 'Ду 25 (33.5х4.0 мм)', weightPerMeter: 2.910, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 32 (42.3х2.0 мм)', weightPerMeter: 1.988, details: 'ВГП тонкостенная (Dн=42.3 мм)' },
      { label: 'Ду 32 (42.3х2.5 мм)', weightPerMeter: 2.454, details: 'ВГП облегченная (1 1/4")' },
      { label: 'Ду 32 (42.3х2.8 мм)', weightPerMeter: 2.730, details: 'ВГП ГОСТ 3262-75 лёгкая' },
      { label: 'Ду 32 (42.3х3.2 мм)', weightPerMeter: 3.090, details: 'ВГП ГОСТ 3262-75 обыкновенная (1 1/4")' },
      { label: 'Ду 32 (42.3х4.0 мм)', weightPerMeter: 3.780, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 40 (48.0х2.0 мм)', weightPerMeter: 2.269, details: 'ВГП тонкостенная (Dн=48.0 мм)' },
      { label: 'Ду 40 (48.0х2.5 мм)', weightPerMeter: 2.805, details: 'ВГП облегченная (1 1/2")' },
      { label: 'Ду 40 (48.0х3.0 мм)', weightPerMeter: 3.330, details: 'ВГП ГОСТ 3262-75 лёгкая' },
      { label: 'Ду 40 (48.0х3.5 мм)', weightPerMeter: 3.840, details: 'ВГП ГОСТ 3262-75 обыкновенная (1 1/2")' },
      { label: 'Ду 40 (48.0х4.0 мм)', weightPerMeter: 4.340, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 50 (60.0х2.0 мм)', weightPerMeter: 2.861, details: 'ВГП тонкостенная (Dн=60.0 мм)' },
      { label: 'Ду 50 (60.0х2.5 мм)', weightPerMeter: 3.545, details: 'ВГП облегченная (2")' },
      { label: 'Ду 50 (60.0х3.0 мм)', weightPerMeter: 4.220, details: 'ВГП ГОСТ 3262-75 лёгкая' },
      { label: 'Ду 50 (60.0х3.5 мм)', weightPerMeter: 4.880, details: 'ВГП ГОСТ 3262-75 обыкновенная (2")' },
      { label: 'Ду 50 (60.0х4.0 мм)', weightPerMeter: 5.524, details: 'ВГП утолщенная' },
      { label: 'Ду 50 (60.0х4.5 мм)', weightPerMeter: 6.160, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 65 (75.5х2.5 мм)', weightPerMeter: 4.501, details: 'ВГП облегченная (2 1/2")' },
      { label: 'Ду 65 (75.5х3.0 мм)', weightPerMeter: 5.364, details: 'ВГП тонкостенная (Dн=75.5 мм)' },
      { label: 'Ду 65 (75.5х3.2 мм)', weightPerMeter: 5.710, details: 'ВГП ГОСТ 3262-75 лёгкая' },
      { label: 'Ду 65 (75.5х4.0 мм)', weightPerMeter: 7.050, details: 'ВГП ГОСТ 3262-75 обыкновенная (2 1/2")' },
      { label: 'Ду 65 (75.5х4.5 мм)', weightPerMeter: 7.880, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 80 (88.5х2.5 мм)', weightPerMeter: 5.302, details: 'ВГП облегченная (3")' },
      { label: 'Ду 80 (88.5х3.0 мм)', weightPerMeter: 6.326, details: 'ВГП тонкостенная (Dн=88.5 мм)' },
      { label: 'Ду 80 (88.5х3.5 мм)', weightPerMeter: 7.337, details: 'ВГП облегченная (Dн=88.5 мм)' },
      { label: 'Ду 80 (88.5х4.0 мм)', weightPerMeter: 8.340, details: 'ВГП ГОСТ 3262-75 обыкновенная (3")' },
      { label: 'Ду 80 (88.5х4.5 мм)', weightPerMeter: 9.320, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 90 (101.3х3.5 мм)', weightPerMeter: 8.442, details: 'ВГП (Dн=101.3 мм)' },
      { label: 'Ду 90 (101.3х4.0 мм)', weightPerMeter: 9.600, details: 'ВГП обыкновенная' },

      { label: 'Ду 100 (114.0х3.0 мм)', weightPerMeter: 8.212, details: 'ВГП тонкостенная (4")' },
      { label: 'Ду 100 (114.0х3.5 мм)', weightPerMeter: 9.538, details: 'ВГП облегченная (4")' },
      { label: 'Ду 100 (114.0х4.0 мм)', weightPerMeter: 10.850, details: 'ВГП ГОСТ 3262-75 обыкновенная (4")' },
      { label: 'Ду 100 (114.0х4.5 мм)', weightPerMeter: 12.150, details: 'ВГП ГОСТ 3262-75 усиленная' },
      { label: 'Ду 100 (114.0х5.0 мм)', weightPerMeter: 13.441, details: 'ВГП сверхпрочная' },

      { label: 'Ду 125 (140.0х3.5 мм)', weightPerMeter: 11.782, details: 'ВГП облегченная (5")' },
      { label: 'Ду 125 (140.0х4.0 мм)', weightPerMeter: 13.420, details: 'ВГП ГОСТ 3262-75 обыкновенная (5")' },
      { label: 'Ду 125 (140.0х4.5 мм)', weightPerMeter: 15.040, details: 'ВГП ГОСТ 3262-75 усиленная' },

      { label: 'Ду 150 (165.0х4.0 мм)', weightPerMeter: 15.880, details: 'ВГП ГОСТ 3262-75 обыкновенная (6")' },
      { label: 'Ду 150 (165.0х4.5 мм)', weightPerMeter: 17.810, details: 'ВГП ГОСТ 3262-75 усиленная' },
      { label: 'Ду 150 (165.0х5.0 мм)', weightPerMeter: 19.729, details: 'ВГП сверхпрочная' },

      // --- КРУГЛЫЕ ЭЛЕКТРОСВАРНЫЕ И БЕСШОВНЫЕ (ГОСТ 10704-91 / ГОСТ 8732-78) ---
      { label: 'Ф 16х1.5 мм', weightPerMeter: 0.536, details: 'Электросварная круглая тонкостенная' },
      { label: 'Ф 16х2.0 мм', weightPerMeter: 0.691, details: 'Электросварная круглая' },

      { label: 'Ф 20х1.5 мм', weightPerMeter: 0.684, details: 'Электросварная круглая' },
      { label: 'Ф 20х1.8 мм', weightPerMeter: 0.808, details: 'Облегченная тонкостенная' },
      { label: 'Ф 20х2.0 мм', weightPerMeter: 0.888, details: 'Электросварная круглая' },
      { label: 'Ф 20х2.5 мм', weightPerMeter: 1.079, details: 'Бесшовная / электросварная' },

      { label: 'Ф 25х1.5 мм', weightPerMeter: 0.869, details: 'Электросварная тонкостенная' },
      { label: 'Ф 25х1.8 мм', weightPerMeter: 1.030, details: 'Облегченная круглая' },
      { label: 'Ф 25х2.0 мм', weightPerMeter: 1.134, details: 'Электросварная круглая' },
      { label: 'Ф 25х2.5 мм', weightPerMeter: 1.387, details: 'Электросварная круглая' },
      { label: 'Ф 25х3.0 мм', weightPerMeter: 1.628, details: 'Бесшовная / усиленная' },

      { label: 'Ф 32х1.5 мм', weightPerMeter: 1.128, details: 'Электросварная круглая' },
      { label: 'Ф 32х1.8 мм', weightPerMeter: 1.341, details: 'Облегченная круглая' },
      { label: 'Ф 32х2.0 мм', weightPerMeter: 1.480, details: 'Электросварная круглая' },
      { label: 'Ф 32х2.5 мм', weightPerMeter: 1.819, details: 'Электросварная круглая' },
      { label: 'Ф 32х3.0 мм', weightPerMeter: 2.146, details: 'Бесшовная / толстостенная' },

      { label: 'Ф 38х1.5 мм', weightPerMeter: 1.350, details: 'Электросварная круглая' },
      { label: 'Ф 38х1.8 мм', weightPerMeter: 1.607, details: 'Облегченная круглая' },
      { label: 'Ф 38х2.0 мм', weightPerMeter: 1.776, details: 'Электросварная круглая' },
      { label: 'Ф 38х2.5 мм', weightPerMeter: 2.189, details: 'Электросварная круглая' },
      { label: 'Ф 38х3.0 мм', weightPerMeter: 2.589, details: 'Бесшовная круглая' },
      { label: 'Ф 38х3.5 мм', weightPerMeter: 2.978, details: 'Бесшовная толстостенная' },

      { label: 'Ф 42х1.8 мм', weightPerMeter: 1.785, details: 'Облегченная круглая' },
      { label: 'Ф 42х2.0 мм', weightPerMeter: 1.973, details: 'Электросварная круглая' },
      { label: 'Ф 42х2.5 мм', weightPerMeter: 2.435, details: 'Электросварная круглая' },
      { label: 'Ф 42х3.0 мм', weightPerMeter: 2.885, details: 'Бесшовная круглая' },
      { label: 'Ф 42х3.5 мм', weightPerMeter: 3.323, details: 'Бесшовная толстостенная' },

      { label: 'Ф 45х2.0 мм', weightPerMeter: 2.121, details: 'Электросварная круглая' },
      { label: 'Ф 45х2.5 мм', weightPerMeter: 2.620, details: 'Электросварная круглая' },
      { label: 'Ф 45х3.0 мм', weightPerMeter: 3.107, details: 'Бесшовная круглая' },

      { label: 'Ф 48х1.8 мм', weightPerMeter: 2.051, details: 'Облегченные стойки лесов' },
      { label: 'Ф 48х2.0 мм', weightPerMeter: 2.269, details: 'Строительные леса, опоры' },
      { label: 'Ф 48х2.5 мм', weightPerMeter: 2.805, details: 'Стойки строительных лесов' },
      { label: 'Ф 48х3.0 мм', weightPerMeter: 3.329, details: 'Усиленные трубные леса' },
      { label: 'Ф 48х3.5 мм', weightPerMeter: 3.841, details: 'Бесшовная круглая' },

      { label: 'Ф 57х1.8 мм', weightPerMeter: 2.451, details: 'Облегченная тонкостенная' },
      { label: 'Ф 57х2.0 мм', weightPerMeter: 2.713, details: 'Электросварная тонкостенная' },
      { label: 'Ф 57х2.5 мм', weightPerMeter: 3.360, details: 'Электросварная облегченная' },
      { label: 'Ф 57х3.0 мм', weightPerMeter: 3.995, details: 'Электросварная ГОСТ 10704-91 (ходовая)' },
      { label: 'Ф 57х3.5 мм', weightPerMeter: 4.618, details: 'Электросварная усиленная' },
      { label: 'Ф 57х4.0 мм', weightPerMeter: 5.228, details: 'Бесшовная ГОСТ 8732-78' },

      { label: 'Ф 76х1.8 мм', weightPerMeter: 3.294, details: 'Облегченные заборные столбы' },
      { label: 'Ф 76х2.0 мм', weightPerMeter: 3.650, details: 'Круглые столбы облегченные' },
      { label: 'Ф 76х2.5 мм', weightPerMeter: 4.532, details: 'Столбы заборные ходовые' },
      { label: 'Ф 76х3.0 мм', weightPerMeter: 5.401, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 76х3.5 мм', weightPerMeter: 6.258, details: 'Электросварная усиленная' },
      { label: 'Ф 76х4.0 мм', weightPerMeter: 7.103, details: 'Бесшовная / винтовые сваи' },
      { label: 'Ф 76х4.5 мм', weightPerMeter: 7.935, details: 'Бесшовная толстостенная' },

      { label: 'Ф 89х2.5 мм', weightPerMeter: 5.333, details: 'Электросварная облегченная' },
      { label: 'Ф 89х3.0 мм', weightPerMeter: 6.363, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 89х3.5 мм', weightPerMeter: 7.380, details: 'Электросварная усиленная' },
      { label: 'Ф 89х4.0 мм', weightPerMeter: 8.385, details: 'Винтовые сваи, опоры' },
      { label: 'Ф 89х4.5 мм', weightPerMeter: 9.378, details: 'Бесшовная круглая' },
      { label: 'Ф 89х5.0 мм', weightPerMeter: 10.358, details: 'Бесшовная толстостенная' },

      { label: 'Ф 102х2.5 мм', weightPerMeter: 6.135, details: 'Опоры, вентиляция' },
      { label: 'Ф 102х3.0 мм', weightPerMeter: 7.324, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 102х3.5 мм', weightPerMeter: 8.502, details: 'Электросварная' },
      { label: 'Ф 102х4.0 мм', weightPerMeter: 9.667, details: 'Сваи, технологические трубопроводы' },
      { label: 'Ф 102х4.5 мм', weightPerMeter: 10.820, details: 'Бесшовная круглая' },
      { label: 'Ф 102х5.0 мм', weightPerMeter: 11.961, details: 'Бесшовная толстостенная' },

      { label: 'Ф 108х2.5 мм', weightPerMeter: 6.504, details: 'Электросварная облегченная' },
      { label: 'Ф 108х3.0 мм', weightPerMeter: 7.768, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 108х3.5 мм', weightPerMeter: 9.020, details: 'Свайные конструкции ходовые' },
      { label: 'Ф 108х4.0 мм', weightPerMeter: 10.259, details: 'Винтовые сваи СВС-108, магистрали' },
      { label: 'Ф 108х4.5 мм', weightPerMeter: 11.486, details: 'Усиленная свайная' },
      { label: 'Ф 108х5.0 мм', weightPerMeter: 12.701, details: 'Бесшовная ГОСТ 8732-78' },
      { label: 'Ф 108х6.0 мм', weightPerMeter: 15.093, details: 'Бесшовная толстостенная' },

      { label: 'Ф 114х3.0 мм', weightPerMeter: 8.212, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 114х3.5 мм', weightPerMeter: 9.538, details: 'Электросварная' },
      { label: 'Ф 114х4.0 мм', weightPerMeter: 10.851, details: 'Промышленные коллекторы' },
      { label: 'Ф 114х4.5 мм', weightPerMeter: 12.152, details: 'Коллекторы, опоры' },
      { label: 'Ф 114х5.0 мм', weightPerMeter: 13.441, details: 'Бесшовная ГОСТ 8732-78' },
      { label: 'Ф 114х6.0 мм', weightPerMeter: 15.981, details: 'Бесшовная толстостенная' },

      { label: 'Ф 133х3.5 мм', weightPerMeter: 11.178, details: 'Винтовые сваи СВС-133' },
      { label: 'Ф 133х4.0 мм', weightPerMeter: 12.725, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 133х4.5 мм', weightPerMeter: 14.261, details: 'Усиленные сваи и опоры' },
      { label: 'Ф 133х5.0 мм', weightPerMeter: 15.783, details: 'Бесшовная круглая' },
      { label: 'Ф 133х6.0 мм', weightPerMeter: 18.792, details: 'Бесшовная толстостенная' },

      { label: 'Ф 159х3.5 мм', weightPerMeter: 13.421, details: 'Электросварная облегченная' },
      { label: 'Ф 159х4.0 мм', weightPerMeter: 15.290, details: 'Теплотрассы, промышленные магистрали' },
      { label: 'Ф 159х4.5 мм', weightPerMeter: 17.146, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 159х5.0 мм', weightPerMeter: 18.989, details: 'Магистральные трубопроводы' },
      { label: 'Ф 159х6.0 мм', weightPerMeter: 22.639, details: 'Бесшовная ГОСТ 8732-78' },
      { label: 'Ф 159х8.0 мм', weightPerMeter: 29.791, details: 'Бесшовная толстостенная' },

      { label: 'Ф 168х4.0 мм', weightPerMeter: 16.178, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 168х4.5 мм', weightPerMeter: 18.145, details: 'Электросварная' },
      { label: 'Ф 168х5.0 мм', weightPerMeter: 20.099, details: 'Бесшовная круглая' },
      { label: 'Ф 168х6.0 мм', weightPerMeter: 23.971, details: 'Бесшовная толстостенная' },
      { label: 'Ф 168х8.0 мм', weightPerMeter: 31.567, details: 'Бесшовная толстостенная' },

      { label: 'Ф 219х4.5 мм', weightPerMeter: 23.805, details: 'Электросварная прямошовная' },
      { label: 'Ф 219х5.0 мм', weightPerMeter: 26.388, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 219х6.0 мм', weightPerMeter: 31.517, details: 'Несущие трубы, теплотрассы' },
      { label: 'Ф 219х7.0 мм', weightPerMeter: 36.598, details: 'Бесшовная ГОСТ 8732-78' },
      { label: 'Ф 219х8.0 мм', weightPerMeter: 41.629, details: 'Бесшовная толстостенная' },
      { label: 'Ф 219х10.0 мм', weightPerMeter: 51.543, details: 'Бесшовная сверхпрочная' },

      { label: 'Ф 273х4.5 мм', weightPerMeter: 29.799, details: 'Электросварная' },
      { label: 'Ф 273х5.0 мм', weightPerMeter: 33.047, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 273х6.0 мм', weightPerMeter: 39.508, details: 'Электросварная магистральная' },
      { label: 'Ф 273х7.0 мм', weightPerMeter: 45.917, details: 'Бесшовная ГОСТ 8732-78' },
      { label: 'Ф 273х8.0 мм', weightPerMeter: 52.282, details: 'Бесшовная толстостенная' },
      { label: 'Ф 273х10.0 мм', weightPerMeter: 64.860, details: 'Бесшовная сверхпрочная' },

      { label: 'Ф 325х5.0 мм', weightPerMeter: 39.459, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 325х6.0 мм', weightPerMeter: 47.202, details: 'Магистральные тепловые сети' },
      { label: 'Ф 325х7.0 мм', weightPerMeter: 54.896, details: 'Бесшовная / магистральная' },
      { label: 'Ф 325х8.0 мм', weightPerMeter: 62.542, details: 'Бесшовная толстостенная' },
      { label: 'Ф 325х10.0 мм', weightPerMeter: 77.684, details: 'Бесшовная сверхпрочная' },

      { label: 'Ф 377х6.0 мм', weightPerMeter: 54.896, details: 'Электросварная магистральная' },
      { label: 'Ф 377х8.0 мм', weightPerMeter: 72.801, details: 'Магистральный водовод' },
      { label: 'Ф 377х9.0 мм', weightPerMeter: 81.679, details: 'Бесшовная / сварная' },
      { label: 'Ф 377х10.0 мм', weightPerMeter: 90.508, details: 'Бесшовная толстостенная' },

      { label: 'Ф 426х6.0 мм', weightPerMeter: 62.147, details: 'Электросварная ГОСТ 10704-91' },
      { label: 'Ф 426х7.0 мм', weightPerMeter: 72.327, details: 'Магистральная прямошовная' },
      { label: 'Ф 426х8.0 мм', weightPerMeter: 82.468, details: 'Магистральные теплотрассы' },
      { label: 'Ф 426х9.0 мм', weightPerMeter: 92.553, details: 'Бесшовная / магистральная' },
      { label: 'Ф 426х10.0 мм', weightPerMeter: 102.592, details: 'Бесшовная толстостенная' },

      { label: 'Ф 530х7.0 мм', weightPerMeter: 90.281, details: 'Электросварная прямошовная' },
      { label: 'Ф 530х8.0 мм', weightPerMeter: 102.986, details: 'Магистральный газонефтепровод' },
      { label: 'Ф 530х9.0 мм', weightPerMeter: 115.638, details: 'Магистральный водопровод' },
      { label: 'Ф 530х10.0 мм', weightPerMeter: 128.240, details: 'Усиленная магистральная' },
      { label: 'Ф 530х12.0 мм', weightPerMeter: 153.296, details: 'Толстостенная магистраль' },
    ]
  },
  squarePipe: {
    name: 'Труба профильная (квадратная / прямоугольная)',
    gost: 'ГОСТ 8639-82 / ГОСТ 8645-68 / ГОСТ 30245-2003',
    items: [
      // 15х15
      { label: '15х15х1.0', weightPerMeter: 0.430, details: 'Мебельная фурнитура, тонкостенная' },
      { label: '15х15х1.2', weightPerMeter: 0.510, details: 'Тонкостенные каркасы' },
      { label: '15х15х1.5', weightPerMeter: 0.620, details: 'Легкие каркасы, декоративные решетки' },

      // 20х20
      { label: '20х20х1.0', weightPerMeter: 0.590, details: 'Мебельная тонкостенная' },
      { label: '20х20х1.2', weightPerMeter: 0.700, details: 'Легкие рамки' },
      { label: '20х20х1.5', weightPerMeter: 0.860, details: 'Ограждения, калитки, ковка' },
      { label: '20х20х1.8', weightPerMeter: 1.010, details: 'Популярная облегченная стенка' },
      { label: '20х20х2.0', weightPerMeter: 1.120, details: 'Бытовой металлопрокат общего назначения' },

      // 25х25
      { label: '25х25х1.2', weightPerMeter: 0.890, details: 'Тонкостенная профильная' },
      { label: '25х25х1.5', weightPerMeter: 1.090, details: 'Теплицы, решетки' },
      { label: '25х25х1.8', weightPerMeter: 1.290, details: 'Популярная облегченная (теплицы, рамы)' },
      { label: '25х25х2.0', weightPerMeter: 1.430, details: 'Теневые навесы, мебель' },
      { label: '25х25х2.5', weightPerMeter: 1.750, details: 'Усиленная квадратная' },

      // 30х30
      { label: '30х30х1.5', weightPerMeter: 1.330, details: 'Легкие конструкции' },
      { label: '30х30х1.8', weightPerMeter: 1.580, details: 'Популярная облегченная стенка' },
      { label: '30х30х2.0', weightPerMeter: 1.750, details: 'Мебельные основы, ограды' },
      { label: '30х30х2.5', weightPerMeter: 2.140, details: 'Усиленные рамы' },
      { label: '30х30х3.0', weightPerMeter: 2.530, details: 'Силовые каркасы' },

      // 40х20
      { label: '40х20х1.2', weightPerMeter: 1.080, details: 'Облегченная лага' },
      { label: '40х20х1.5', weightPerMeter: 1.330, details: 'Заборная перемычка под профнастил' },
      { label: '40х20х1.8', weightPerMeter: 1.570, details: 'Очень популярная заборная лага (ходовая)' },
      { label: '40х20х2.0', weightPerMeter: 1.750, details: 'Лаги забора, обрешетка (ходовая)' },
      { label: '40х20х2.5', weightPerMeter: 2.140, details: 'Усиленные лаги для высоких заборов' },

      // 40х25
      { label: '40х25х1.5', weightPerMeter: 1.450, details: 'Прямоугольная перемычка' },
      { label: '40х25х1.8', weightPerMeter: 1.720, details: 'Дверные каркасы, перемычки' },
      { label: '40х25х2.0', weightPerMeter: 1.910, details: 'Каркасы дверей и калиток' },

      // 40х40
      { label: '40х40х1.5', weightPerMeter: 1.800, details: 'Облегченные стойки' },
      { label: '40х40х1.8', weightPerMeter: 2.140, details: 'Популярные стойки заборов, теплицы' },
      { label: '40х40х2.0', weightPerMeter: 2.380, details: 'Столбы для заборов, стропила (ходовая)' },
      { label: '40х40х2.5', weightPerMeter: 2.920, details: 'Усиленные заборы' },
      { label: '40х40х3.0', weightPerMeter: 3.440, details: 'Усиленные навесы, опоры малые' },
      { label: '40х40х3.5', weightPerMeter: 3.940, details: 'Опоры нагруженных козырьков' },
      { label: '40х40х4.0', weightPerMeter: 4.420, details: 'Толстостенная силовая стойка' },

      // 50х25
      { label: '50х25х1.5', weightPerMeter: 1.680, details: 'Прямоугольная лага' },
      { label: '50х25х1.8', weightPerMeter: 2.000, details: 'Популярные прожилины, калитки' },
      { label: '50х25х2.0', weightPerMeter: 2.220, details: 'Ворота, калитки, прожилины' },
      { label: '50х25х2.5', weightPerMeter: 2.730, details: 'Усиленные перемычки' },
      { label: '50х25х3.0', weightPerMeter: 3.210, details: 'Рамные конструкции' },

      // 50х50
      { label: '50х50х1.5', weightPerMeter: 2.270, details: 'Облегченная стойка' },
      { label: '50х50х1.8', weightPerMeter: 2.710, details: 'Популярные столбы и навесы' },
      { label: '50х50х2.0', weightPerMeter: 3.010, details: 'Рамы теплиц, каркасы навесов' },
      { label: '50х50х2.5', weightPerMeter: 3.710, details: 'Каркасы распашных ворот' },
      { label: '50х50х3.0', weightPerMeter: 4.380, details: 'Конструкции входных групп' },
      { label: '50х50х4.0', weightPerMeter: 5.630, details: 'Усиленные стойки навесов' },
      { label: '50х50х5.0', weightPerMeter: 6.770, details: 'Толстостенная несущая' },

      // 60х30
      { label: '60х30х1.5', weightPerMeter: 2.040, details: 'Прямоугольная перемычка' },
      { label: '60х30х1.8', weightPerMeter: 2.420, details: 'Поперечины, рамы ворот' },
      { label: '60х30х2.0', weightPerMeter: 2.690, details: 'Рамы легких ворот' },
      { label: '60х30х2.5', weightPerMeter: 3.320, details: 'Усиленные поперечины' },
      { label: '60х30х3.0', weightPerMeter: 3.910, details: 'Силовые лестницы' },

      // 60х40
      { label: '60х40х1.5', weightPerMeter: 2.270, details: 'Облегченная заборная лага' },
      { label: '60х40х1.8', weightPerMeter: 2.710, details: 'Очень популярная заборная лага и стойка' },
      { label: '60х40х2.0', weightPerMeter: 3.010, details: 'Прямоугольное сечение для заборов (ходовая)' },
      { label: '60х40х2.5', weightPerMeter: 3.710, details: 'Усиленные перемычки' },
      { label: '60х40х3.0', weightPerMeter: 4.380, details: 'Усиленные перемычки ворот и ферм' },
      { label: '60х40х3.5', weightPerMeter: 5.020, details: 'Силовые фермы' },
      { label: '60х40х4.0', weightPerMeter: 5.630, details: 'Толстостенные фермы' },

      // 60х60
      { label: '60х60х1.8', weightPerMeter: 3.300, details: 'Популярные облегченные заборные столбы' },
      { label: '60х60х2.0', weightPerMeter: 3.640, details: 'Опорные столбы малых навесов' },
      { label: '60х60х2.5', weightPerMeter: 4.490, details: 'Столбы для заборов из профнастила' },
      { label: '60х60х3.0', weightPerMeter: 5.320, details: 'Силовые лестничные марши, рамы (ходовая)' },
      { label: '60х60х4.0', weightPerMeter: 6.890, details: 'Нагруженное домостроение' },
      { label: '60х60х5.0', weightPerMeter: 8.340, details: 'Толстостенная несущая' },

      // 80х40
      { label: '80х40х1.8', weightPerMeter: 3.300, details: 'Облегченные рамы ворот и перемычки' },
      { label: '80х40х2.0', weightPerMeter: 3.640, details: 'Основа откатных ворот' },
      { label: '80х40х2.5', weightPerMeter: 4.490, details: 'Перемычки и фермы' },
      { label: '80х40х3.0', weightPerMeter: 5.320, details: 'Каркасы откатных ворот' },
      { label: '80х40х3.5', weightPerMeter: 6.110, details: 'Усиленные ворота' },
      { label: '80х40х4.0', weightPerMeter: 6.890, details: 'Силовые направляющие' },

      // 80х60
      { label: '80х60х2.5', weightPerMeter: 5.280, details: 'Опоры и перекрытия' },
      { label: '80х60х3.0', weightPerMeter: 6.270, details: 'Фермы навесов' },
      { label: '80х60х3.5', weightPerMeter: 7.220, details: 'Стропильные балки' },
      { label: '80х60х4.0', weightPerMeter: 8.150, details: 'Несущие балки' },
      { label: '80х60х5.0', weightPerMeter: 9.910, details: 'Толстостенная строительная' },

      // 80х80
      { label: '80х80х1.8', weightPerMeter: 4.430, details: 'Облегченные заборные столбы' },
      { label: '80х80х2.0', weightPerMeter: 4.890, details: 'Облегченные заборные столбы' },
      { label: '80х80х2.5', weightPerMeter: 6.060, details: 'Столбы для распашных ворот' },
      { label: '80х80х3.0', weightPerMeter: 7.210, details: 'Опоры распашных / откатных ворот (ходовая)' },
      { label: '80х80х3.5', weightPerMeter: 8.320, details: 'Опоры навесов под авто' },
      { label: '80х80х4.0', weightPerMeter: 9.400, details: 'Силовые колонны каркасных зданий' },
      { label: '80х80х5.0', weightPerMeter: 11.480, details: 'Толстостенные колонны' },
      { label: '80х80х6.0', weightPerMeter: 13.380, details: 'Спецколонны высокой нагрузки' },

      // 100х50
      { label: '100х50х2.5', weightPerMeter: 5.670, details: 'Фермы пролетов' },
      { label: '100х50х3.0', weightPerMeter: 6.740, details: 'Балки перекрытий' },
      { label: '100х50х3.5', weightPerMeter: 7.770, details: 'Усиленные стропила' },
      { label: '100х50х4.0', weightPerMeter: 8.770, details: 'Силовые кровельные фермы' },
      { label: '100х50х5.0', weightPerMeter: 10.700, details: 'Толстостенная несущая' },

      // 100х60
      { label: '100х60х3.0', weightPerMeter: 7.210, details: 'Строительные ригели' },
      { label: '100х60х3.5', weightPerMeter: 8.320, details: 'Несущие перекрытия' },
      { label: '100х60х4.0', weightPerMeter: 9.400, details: 'Силовые фермы ангаров' },
      { label: '100х60х5.0', weightPerMeter: 11.480, details: 'Толстостенная балка' },

      // 100х100
      { label: '100х100х3.0', weightPerMeter: 9.090, details: 'Несущие опоры ангаров' },
      { label: '100х100х3.5', weightPerMeter: 10.520, details: 'Опоры автонавесов' },
      { label: '100х100х4.0', weightPerMeter: 11.910, details: 'Фермы перекрытий промзданий (ходовая)' },
      { label: '100х100х5.0', weightPerMeter: 14.650, details: 'Тяжелые строительные колонны' },
      { label: '100х100х6.0', weightPerMeter: 17.200, details: 'Колонны каркасного домостроения' },
      { label: '100х100х7.0', weightPerMeter: 19.600, details: 'Спецколонны ГОСТ 30245-2003' },
      { label: '100х100х8.0', weightPerMeter: 21.630, details: 'Высоконагруженный прокат' },

      // 120х60
      { label: '120х60х3.0', weightPerMeter: 8.150, details: 'Балки кровельных ферм' },
      { label: '120х60х4.0', weightPerMeter: 10.700, details: 'Несущие перекрытия' },
      { label: '120х60х5.0', weightPerMeter: 13.100, details: 'Строительные фермы пролетов' },
      { label: '120х60х6.0', weightPerMeter: 15.300, details: 'Толстостенные балки' },

      // 120х80
      { label: '120х80х3.0', weightPerMeter: 9.090, details: 'Строительные ригели' },
      { label: '120х80х4.0', weightPerMeter: 11.910, details: 'Несущие перекрытия' },
      { label: '120х80х5.0', weightPerMeter: 14.650, details: 'Силовые фермы складов' },
      { label: '120х80х6.0', weightPerMeter: 17.200, details: 'Тяжелые перекрытия' },
      { label: '120х80х7.0', weightPerMeter: 19.600, details: 'Спецпрокат высокой прочности' },

      // 120х120
      { label: '120х120х3.0', weightPerMeter: 10.980, details: 'Опорные колонны ангаров' },
      { label: '120х120х4.0', weightPerMeter: 14.420, details: 'Спецзаказы каркасных конструкций' },
      { label: '120х120х5.0', weightPerMeter: 17.800, details: 'Высоконагруженный прокат' },
      { label: '120х120х6.0', weightPerMeter: 21.000, details: 'Силовые колонны зданий' },
      { label: '120х120х7.0', weightPerMeter: 24.000, details: 'Спецколонны промзон' },
      { label: '120х120х8.0', weightPerMeter: 26.700, details: 'Толстостенный прокат' },

      // 140х100
      { label: '140х100х4.0', weightPerMeter: 14.420, details: 'Строительные балки' },
      { label: '140х100х5.0', weightPerMeter: 17.800, details: 'Фермы больших пролетов' },
      { label: '140х100х6.0', weightPerMeter: 21.000, details: 'Несущие ригели' },

      // 140х140
      { label: '140х140х4.0', weightPerMeter: 16.930, details: 'Колонны каркасных зданий' },
      { label: '140х140х5.0', weightPerMeter: 20.930, details: 'Опоры большепролетных навесов' },
      { label: '140х140х6.0', weightPerMeter: 24.740, details: 'Строительные колонны' },
      { label: '140х140х7.0', weightPerMeter: 28.400, details: 'Высоконагруженные стойки' },
      { label: '140х140х8.0', weightPerMeter: 31.730, details: 'Толстостенные колонны' },

      // 150х100
      { label: '150х100х4.0', weightPerMeter: 15.050, details: 'Прямоугольные балки' },
      { label: '150х100х5.0', weightPerMeter: 18.570, details: 'Несущие перекрытия цехов' },
      { label: '150х100х6.0', weightPerMeter: 21.910, details: 'Силовые ригели' },
      { label: '150х100х7.0', weightPerMeter: 25.100, details: 'Спецбалки высокой нагрузки' },
      { label: '150х100х8.0', weightPerMeter: 28.000, details: 'Тяжелые перекрытия' },

      // 150х150
      { label: '150х150х4.0', weightPerMeter: 18.190, details: 'Колонны средней этажности' },
      { label: '150х150х5.0', weightPerMeter: 22.500, details: 'Силовые колонны' },
      { label: '150х150х6.0', weightPerMeter: 26.620, details: 'Каркасные промышленные здания' },
      { label: '150х150х7.0', weightPerMeter: 30.600, details: 'Спецколонны ГОСТ 30245-2003' },
      { label: '150х150х8.0', weightPerMeter: 34.250, details: 'Тяжелые колонны' },
      { label: '150х150х10.0', weightPerMeter: 41.400, details: 'Сверхнагруженные стойки' },

      // 160х120
      { label: '160х120х4.0', weightPerMeter: 16.930, details: 'Строительные ригели' },
      { label: '160х120х5.0', weightPerMeter: 20.930, details: 'Балки цехов' },
      { label: '160х120х6.0', weightPerMeter: 24.740, details: 'Силовые перекрытия' },
      { label: '160х120х7.0', weightPerMeter: 28.400, details: 'Тяжелые ригели' },

      // 160х160
      { label: '160х160х5.0', weightPerMeter: 24.070, details: 'Колонны производственных цехов' },
      { label: '160х160х6.0', weightPerMeter: 28.500, details: 'Силовые колонны' },
      { label: '160х160х7.0', weightPerMeter: 32.800, details: 'Высоконагруженные колонны' },
      { label: '160х160х8.0', weightPerMeter: 36.760, details: 'Тяжелый прокат' },
      { label: '160х160х10.0', weightPerMeter: 44.540, details: 'Сверхнагруженные колонны' },

      // 180х180
      { label: '180х180х5.0', weightPerMeter: 27.210, details: 'Колонны многоэтажных каркасов' },
      { label: '180х180х6.0', weightPerMeter: 32.270, details: 'Силовые опоры' },
      { label: '180х180х7.0', weightPerMeter: 37.200, details: 'Колонны торговых центров' },
      { label: '180х180х8.0', weightPerMeter: 41.780, details: 'Тяжелые строительные колонны' },
      { label: '180х180х10.0', weightPerMeter: 50.820, details: 'Сверхтяжелые колонны' },
      { label: '180х180х12.0', weightPerMeter: 59.200, details: 'Спецпрокат промышленного назначения' },

      // 200х100
      { label: '200х100х4.0', weightPerMeter: 18.190, details: 'Балки широкого пролета' },
      { label: '200х100х5.0', weightPerMeter: 22.500, details: 'Несущие ригели перекрытий' },
      { label: '200х100х6.0', weightPerMeter: 26.620, details: 'Силовые балки промзданий' },
      { label: '200х100х7.0', weightPerMeter: 30.600, details: 'Тяжелые перекрытия' },
      { label: '200х100х8.0', weightPerMeter: 34.250, details: 'Спецбалки ГОСТ 30245-2003' },

      // 200х160
      { label: '200х160х5.0', weightPerMeter: 27.210, details: 'Несущие балки складов' },
      { label: '200х160х6.0', weightPerMeter: 32.270, details: 'Силовые перекрытия' },
      { label: '200х160х7.0', weightPerMeter: 37.200, details: 'Тяжелые ригели' },
      { label: '200х160х8.0', weightPerMeter: 41.780, details: 'Спецпрокат' },

      // 200х200
      { label: '200х200х5.0', weightPerMeter: 30.350, details: 'Колонны высотных каркасов' },
      { label: '200х200х6.0', weightPerMeter: 36.040, details: 'Силовые строительные колонны' },
      { label: '200х200х7.0', weightPerMeter: 41.600, details: 'Высоконагруженные колонны' },
      { label: '200х200х8.0', weightPerMeter: 46.810, details: 'Тяжелый строительный прокат' },
      { label: '200х200х10.0', weightPerMeter: 57.100, details: 'Сверхтяжелые колонны ангаров' },
      { label: '200х200х12.0', weightPerMeter: 66.740, details: 'Спецсооружения, мостостроение' },
    ]
  },
  angle: {
    name: 'Уголок равнополочный',
    gost: 'ГОСТ 8509-93',
    items: [
      { label: '25х25х3 мм', weightPerMeter: 1.120, details: 'Окантовка рам, сетки' },
      { label: '25х25х4 мм', weightPerMeter: 1.460, details: 'Усиленные каркасы ворот' },
      { label: '32х32х3 мм', weightPerMeter: 1.460, details: 'Дверные коробки' },
      { label: '32х32х4 мм', weightPerMeter: 1.910, details: 'Хозяйственные постройки' },
      { label: '40х40х3 мм', weightPerMeter: 1.850, details: 'Связевые элементы навесов' },
      { label: '40х40х4 мм', weightPerMeter: 2.420, details: 'Опоры полок склада, стеллажи' },
      { label: '40х40х5 мм', weightPerMeter: 2.980, details: 'Усиленный равнополочный' },
      { label: '50х50х4 мм', weightPerMeter: 3.050, details: 'Широкое применение в строительстве' },
      { label: '50х50х5 мм', weightPerMeter: 3.770, details: 'Несущая связь металлоконструкций' },
      { label: '63х63х5 мм', weightPerMeter: 4.810, details: 'Фермы ЛЭП, рамные косяки' },
      { label: '63х63х6 мм', weightPerMeter: 5.720, details: 'Строительные фермы тяжелые' },
      { label: '75х75х5 мм', weightPerMeter: 5.800, details: 'Колонны средней нагрузки' },
      { label: '75х75х6 мм', weightPerMeter: 6.890, details: 'Тяжелые опорные фермы' },
      { label: '75х75х8 мм', weightPerMeter: 9.030, details: 'Усиленный сортовой уголок' },
      { label: '90х90х7 мм', weightPerMeter: 9.640, details: 'Эстакады, рамные балки' },
      { label: '100х100х7 мм', weightPerMeter: 10.790, details: 'Высоконагруженный строительный пролет' },
      { label: '100х100х8 мм', weightPerMeter: 12.250, details: 'Промышленный каркас повышенной прочности' },
      { label: '100х100х10 мм', weightPerMeter: 15.100, details: 'Тяжелые мостовые связи' },
      { label: '125х125х8 мм', weightPerMeter: 15.470, details: 'Крупногабаритные фермы' },
      { label: '125х125х10 мм', weightPerMeter: 19.100, details: 'Промышленные сооружения' },
    ]
  },
  channel: {
    name: 'Швеллер горячекатаный',
    gost: 'ГОСТ 8240-97',
    items: [
      { label: '5П / 5У', weightPerMeter: 4.840, details: 'Легкие рамные перекрытия' },
      { label: '6.5П / 6.5У', weightPerMeter: 5.900, details: 'Станки, станины, бытовое строительство' },
      { label: '8П / 8У', weightPerMeter: 7.050, details: 'Косоуры металлических лестниц' },
      { label: '10П / 10У', weightPerMeter: 8.590, details: 'Бытовые перекрытия, балки гаражей' },
      { label: '12П / 12У', weightPerMeter: 10.400, details: 'Строительные стяжки тяжелых стен' },
      { label: '14П / 14У', weightPerMeter: 12.300, details: 'Несущие балки над проемами окон' },
      { label: '16П / 16У', weightPerMeter: 14.200, details: 'Колонны средней высотности' },
      { label: '18П / 18У', weightPerMeter: 16.300, details: 'Межэтажные армированные перекрытия' },
      { label: '20П / 20У', weightPerMeter: 18.400, details: 'Фундаменты откатных ворот большого пролета' },
      { label: '22П / 22У', weightPerMeter: 21.000, details: 'Мостовые опоры' },
      { label: '24П / 24У', weightPerMeter: 24.000, details: 'Сверхнагруженные перекрытия складов' },
      { label: '27П / 27У', weightPerMeter: 27.700, details: 'Промышленные эстакады' },
      { label: '30П / 30У', weightPerMeter: 31.800, details: 'Тяжелые крановые эстакады' },
    ]
  },
  ibeam: {
    name: 'Двутавр / Балка горячекатаная',
    gost: 'ГОСТ 8239-89 / СТО АСЧМ 20-93',
    items: [
      { label: '10', weightPerMeter: 9.460, details: 'Балки межэтажных перекрытий' },
      { label: '12', weightPerMeter: 11.520, details: 'Бытовое перекрытие, рамная жесткость' },
      { label: '14', weightPerMeter: 13.680, details: 'Подкрановые пути малые' },
      { label: '16', weightPerMeter: 15.890, details: 'Несущее основание ангара' },
      { label: '18', weightPerMeter: 18.350, details: 'Пролеты межэтажных плит повышенной ширины' },
      { label: '20', weightPerMeter: 21.000, details: 'Тяжелый пролет кровли промзон' },
      { label: '24M (специальная)', weightPerMeter: 38.300, details: 'Для монорельсов подвесного транспорта' },
      { label: '30M (специальная)', weightPerMeter: 50.200, details: 'Тяжелые крановые пути заводов' },
      { label: '20Б1 (СТО АСЧМ)', weightPerMeter: 21.300, details: 'Нормальный двутавр для перекрытий' },
      { label: '25Б1 (СТО АСЧМ)', weightPerMeter: 25.700, details: 'Несущие балки промышленных зданий' },
      { label: '30Б1 (СТО АСЧМ)', weightPerMeter: 32.900, details: 'Большепролетные перекрытия' },
      { label: '20К1 (колонный)', weightPerMeter: 41.400, details: 'Колонный двутавр высокой устойчивости' },
      { label: '25К1 (колонный)', weightPerMeter: 62.400, details: 'Тяжелые несущие колонны' },
      { label: '20Ш1 (широкополочный)', weightPerMeter: 30.600, details: 'Широкополочная балка' },
      { label: '25Ш1 (широкополочный)', weightPerMeter: 44.100, details: 'Широкополочные перекрытия' },
    ]
  }
};
