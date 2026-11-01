import fs from 'node:fs/promises';
import path from 'node:path';
import { Workbook, SpreadsheetFile } from '@oai/artifact-tool';

const root = process.argv[2];
const outputDir = process.argv[3];
if (!root || !outputDir) throw Error('Usage: build-workbook.mjs REPO OUTPUT');
const read = async p => JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const config = await read('reports/math-review/config-snapshot.json');
const original = await read('reports/math-review/simulation-original-100k.json');
const aligned = await read('reports/math-review/simulation-stake-100k.json');
const wb = Workbook.create();
const names = ['Обзор','Модель','Правила','Аудит V0','Референсы'];
const sheets = Object.fromEntries(names.map(n=>[n,wb.worksheets.add(n)]));
const put=(s,r,v)=>s.getRange(r).values=v;
const formula=(s,r,f)=>s.getRange(r).formulas=[[f]];
function setup(s,lastRow,widths) {
  s.showGridLines=false;
  s.getRange(`A1:M${lastRow}`).format={font:{name:'Arial',size:10,color:'#202124'},verticalAlignment:'center',rowHeight:24};
  widths.forEach((w,i)=>s.getRange(`${String.fromCharCode(65+i)}1:${String.fromCharCode(65+i)}${lastRow}`).format.columnWidth=w);
  s.getRange('A2').format.font={name:'Arial',size:15,bold:true,color:'#202124'};
  s.getRange(`A3:${String.fromCharCode(64+widths.length)}3`).format.borders={bottom:{style:'thin',color:'#B8BEC6'}};
}
function header(s,range) {s.getRange(range).format={fill:'#E8EAED',font:{bold:true,color:'#202124'},horizontalAlignment:'center',verticalAlignment:'center',wrapText:true,rowHeight:38};}
function note(s,range) {s.getRange(range).format={font:{size:10,color:'#5F6368'},wrapText:true,verticalAlignment:'top'};}
function inputs(s,range) {s.getRange(range).format={fill:'#FFF8DB',font:{color:'#174EA6'}};}
const sourceCode='https://github.com/kirillgoncharik-commits/hexandheat/blob/332ad036c032c82bc33b3eeb7b84ed589e131de8/';

const m=sheets['Модель']; setup(m,70,[23,14,16,17,16,17,16,3,3,39,18,47]);
put(m,'A2',[['Модель распределения выплат']]);
put(m,'A4',[['Предложение v0.1. Условные веса заданы вручную; event books под них ещё не построены.']]);
put(m,'A6:B12',[
  ['Целевой RTP',.965],['Cap на всю ставку, ×',5000],['Цена режима, ×',1],
  ['Free Spins, шт.',10],['Retrigger, шт.',5],['Scatter trigger, шт.',4],['Retrigger scatters, шт.',3]
]); inputs(m,'B6:B12'); m.getRange('B6').setNumberFormat('0.00%');
put(m,'J5:L5',[['Расчёт','Значение','Смысл']]);header(m,'J5:L5');
const rows=[
  [6,'Средняя выплата без бонуса, ×','=SUMPRODUCT(G18:G29,C18:C29)','Весь оплаченный раунд без Free Spins'],
  [7,'Средняя выплата с бонусом, ×','=SUMPRODUCT(G35:G47,C35:C47)','Весь book: trigger + все FS + retriggers'],
  [8,'Нужная вероятность бонуса','=IF(OR(K7<=K6,$B$6*$B$8<K6,$B$6*$B$8>K7),"n.a.",($B$6*$B$8-K6)/(K7-K6))','Решение RTP = (1-p)×Ebase + p×Ebonus'],
  [9,'Средний интервал бонуса, ставок','=IF(ISNUMBER(K8),IF(K8>0,1/K8,"n.a."),"n.a.")','Среднее, не обещанный интервал'],
  [10,'Вклад обычных раундов в RTP','=(1-K8)*K6/$B$8','Не включает раунды с бонусом'],
  [11,'Вклад раундов с бонусом в RTP','=K8*K7/$B$8','Trigger/base выплаты уже внутри этого класса'],
  [12,'Итоговый RTP модели','=SUM(K10:K11)','Совпадение с целью заложено в формулу p'],
  [13,'House edge','=1-K12','Ожидаемая доля цены режима'],
  [14,'P(выплата > 0)','=SUMIFS(D18:D29,G18:G29,">0")+SUMIFS(D35:D47,G35:G47,">0")','Hit rate; возврат меньше ставки тоже считается'],
  [15,'P(выплата > цены режима)','=SUMIFS(D18:D29,G18:G29,">"&$B$8)+SUMIFS(D35:D47,G35:G47,">"&$B$8)','Частота положительного net, отдельна от hit rate'],
  [16,'Стандартное отклонение, ×','=SQRT(SUM(F18:F29,F35:F47)-(K12*$B$8)^2)/$B$8','Дисперсия полного оплаченного book'],
  [17,'P(выплата ≥ 100×)','=SUMIFS(D18:D29,G18:G29,">=100")+SUMIFS(D35:D47,G35:G47,">=100")','Tail на одну независимую ставку'],
  [18,'P(выплата = cap)','=SUMIFS(D18:D29,G18:G29,$B$7)+SUMIFS(D35:D47,G35:G47,$B$7)','Только этот демонстрационный набор weights'],
  [19,'Средняя выплата при hit, ×','=K12*$B$8/K14','Не средний бонус'],
  [20,'P(20 нулевых выплат подряд)','=(1-K14)^20','Для независимых одинаковых ставок'],
  [21,'Ставок на один cap в среднем','=IF(K18>0,1/K18,"n.a.")','Редкое событие; 100k симуляций его не измерят']
];
for(const [r,label,f,meaning] of rows){put(m,`J${r}` ,[[label]]);formula(m,`K${r}`,f);put(m,`L${r}`,[[meaning]]);}
m.getRange('K6:K21').setNumberFormat('0.0000');for(const r of [8,10,11,12,13,14,15,17,18,20])m.getRange(`K${r}`).setNumberFormat(r===18?'0.00000000%':'0.0000%');m.getRange('K9').setNumberFormat('0.0');m.getRange('K21').setNumberFormat('#,##0');note(m,'L6:L21');
put(m,'A15',[['Раунды без Free Spins. Условное распределение внутри класса.']]);
put(m,'A17:G17',[['До cap, ×','Вес','p в классе','p на ставку','Вклад RTP','p × выплата²','После cap, ×']]);header(m,'A17:G17');
const base=[[0,750000],[.2,50000],[.5,70000],[1,45000],[2,30000],[5,45000],[10,6000],[20,2500],[50,1000],[100,400],[250,90],[500,10]];
put(m,'A18:B29',base); inputs(m,'A18:B29');
put(m,'A32',[['Раунды с Free Spins. Выплата включает trigger и весь бонус.']]);
put(m,'A34:G34',[['До cap, ×','Вес','p в классе','p на ставку','Вклад RTP','p × выплата²','После cap, ×']]);header(m,'A34:G34');
const bonus=[[0,50000],[1,75000],[2,100000],[5,150000],[10,180000],[20,180000],[50,130000],[100,70000],[250,40000],[500,18000],[1000,5500],[2500,1490],[5000,10]];
put(m,'A35:B47',bonus);inputs(m,'A35:B47');
for(const [start,end,isBonus] of [[18,29,false],[35,47,true]]) for(let r=start;r<=end;r++) {
  formula(m,`C${r}`,`=B${r}/SUM($B$${start}:$B$${end})`);
  formula(m,`D${r}`,`=C${r}*${isBonus?'$K$8':'(1-$K$8)'}`);
  formula(m,`G${r}`,`=MIN(A${r},$B$7)`);
  formula(m,`E${r}`,`=G${r}*D${r}/$B$8`);
  formula(m,`F${r}`,`=D${r}*G${r}^2`);
}
m.getRange('B18:B47').setNumberFormat('#,##0');m.getRange('C18:E47').setNumberFormat('0.0000%');m.getRange('F18:F47').setNumberFormat('0.0000');
for(const r of [30,48]) {formula(m,`B${r}`,`=SUM(B${r===30?18:35}:B${r-1})`);for(const c of ['C','D','E','F'])formula(m,`${c}${r}`,`=SUM(${c}${r===30?18:35}:${c}${r-1})`);m.getRange(`A${r}:F${r}`).format.font.bold=true;}
put(m,'A52:B52',[['Диапазон выплаты','p на ставку']]);header(m,'A52:B52');
const bins=[['0×',0,0],['0–1×',0,1],['1–5×',1,5],['5–20×',5,20],['20–100×',20,100],['100–1000×',100,1000],['1000× и выше',1000,null]];
bins.forEach(([label,lo,hi],i)=>{const r=53+i;put(m,`A${r}`,[[label]]);let f=i===0?'=SUMIFS(D18:D29,G18:G29,0)+SUMIFS(D35:D47,G35:G47,0)':`=SUMIFS(D18:D29,G18:G29,"${i===1?'>':'>='}${lo}"${hi!==null?',G18:G29,"<'+hi+'"':''})+SUMIFS(D35:D47,G35:G47,"${i===1?'>':'>='}${lo}"${hi!==null?',G35:G47,"<'+hi+'"':''})`;formula(m,`B${r}`,f);});m.getRange('B53:B59').setNumberFormat('0.00%');
put(m,'J25:L30',[
 ['Контроль модели','Отклонение','Ожидается ноль'],
 ['Сумма p',null,'Оба класса вместе'],['RTP минус цель',null,'Подбор частоты, не независимая проверка'],
 ['Выплаты выше cap',null,'Должно быть 0 строк'],['Отрицательные веса',null,'Должно быть 0 строк'],['Сумма bins минус 1',null,'Категории не пересекаются']
]);header(m,'J25:L25');formula(m,'K26','=SUM(D18:D29,D35:D47)-1');formula(m,'K27','=K12-$B$6');formula(m,'K28','=COUNTIFS(G18:G29,">"&$B$7)+COUNTIFS(G35:G47,">"&$B$7)');formula(m,'K29','=COUNTIFS(B18:B29,"<0")+COUNTIFS(B35:B47,"<0")');formula(m,'K30','=SUM(B53:B59)-1');
put(m,'J33',[['Что менять']]);put(m,'J34:L37',[
 ['Жёлтые ячейки','Параметры и веса','Частота бонуса и KPI пересчитываются'],
 ['Средние выплаты','Веса терминальных book','Не вероятность символа на клетке'],
 ['Бонусная модель','10 FS и +5 пока proposal','FS count не участвует в EV до генерации books'],
 ['Следующий расчёт','Генератор + LUT','Проверить достижимость каждого book и tail']
]);note(m,'L34:L37');m.freezePanes.freezeRows(5);

const a=sheets['Аудит V0']; setup(a,52,[41,25,25,3,73]);
put(a,'A2',[['Что сейчас считает код']]);put(a,'A4',[['100 000 независимо проверенных раундов на вариант. Seed 20261101. Только base game.']]);
put(a,'A5:C5',[['Метрика','Исходная V0','Округлённая paytable']]);header(a,'A5:C5');
const stats=[['Раундов',original.rounds,aligned.rounds],['Payout units на 1×',100,100],['Выборочный возврат',null,null],['Стандартная ошибка',null,null],['95% интервал, нижняя',null,null],['95% интервал, верхняя',null,null],['P(выплата > 0)',original.hit_rate,aligned.hit_rate],['P(нулевой выплаты)',original.zero_win_rate,aligned.zero_win_rate],['Средняя выплата при hit, ×',original.conditional_average_win/100,aligned.conditional_average_win/100],['Стандартное отклонение, ×',original.standard_deviation/100,aligned.standard_deviation/100],['Максимум в выборке, ×',original.max_observed_win/100,aligned.max_observed_win/100],['Максимальный множитель',original.max_observed_multiplier,aligned.max_observed_multiplier],['P99 выплаты, ×',original.percentiles.p99/100,aligned.percentiles.p99/100]];
put(a,'A6:C18',stats);for(const col of ['B','C']){formula(a,`${col}8`,`=${col}24/${col}6/${col}7`);formula(a,`${col}9`,`=${col}15/SQRT(${col}6)`);formula(a,`${col}10`,`=${col}8-1.96*${col}9`);formula(a,`${col}11`,`=${col}8+1.96*${col}9`);}a.getRange('B8:C13').setNumberFormat('0.00%');a.getRange('B14:C18').setNumberFormat('0.000');
put(a,'A22:C25',[
 ['Сырой отчёт','Исходная V0','Округлённая paytable'],
 ['Config SHA256',original.config_sha256,aligned.config_sha256],
 ['Сумма payout units',Math.round(original.sample_return*original.rounds*100),Math.round(aligned.sample_return*aligned.rounds*100)],
 ['Report SHA256',original.report_sha256,aligned.report_sha256]
]);header(a,'A22:C22');a.getRange('B23:C25').format.wrapText=true;a.getRange('A23:C25').format.rowHeight=54;
put(a,'A28:C28',[['Число выигрышных каскадов','Раундов','Доля']]);header(a,'A28:C28');Object.entries(original.cascade_depth_distribution).forEach(([depth,n],i)=>{let r=29+i;put(a,`A${r}:B${r}`,[[Number(depth),n]]);formula(a,`C${r}`,`=B${r}/$B$6`);});a.getRange('C29:C38').setNumberFormat('0.00%');
put(a,'E6:E14',[
 ['Это оценка естественного генератора до оптимизации весов.'],
 ['Она не равна RTP будущего publish LUT и не описывает hosted mock sample.'],
 ['Free Spins отсутствуют. Применять эти параметры к реальным ставкам нельзя.'],
 ['95% интервал - приближение по этой выборке, без доказательства редкого хвоста.'],
 ['Усилить paytable в 6–7 раз недостаточно: изменятся tail, cap и ощущение каскадов.'],
 ['Путь production: больше валидных books, оптимизированные weights, точные метрики LUT.'],
 [sourceCode+'math/hexandheat_math/simulate.py'],[sourceCode+'math/hexandheat_math/config.py'],
 ['Результаты воспроизводимы: PYTHONPATH=math python3 -m hexandheat_math.simulate --rounds 100000 --seed 20261101']
 ]);note(a,'E6:E14');a.getRange('E6:E14').format.rowHeight=45;
put(a,'A41:E41',[['QA book id','Вес','Payout units','Выплата, ×','Вклад при равных весах']]);header(a,'A41:E41');
const fixture=[0,30,50,120,150,500000];fixture.forEach((v,i)=>{const r=42+i;put(a,`A${r}:C${r}`,[[i,1,v]]);formula(a,`D${r}`,`=C${r}/100`);formula(a,`E${r}`,`=B${r}/SUM($B$42:$B$47)*D${r}`);});formula(a,'E48','=SUM(E42:E47)');a.getRange('E42:E48').setNumberFormat('0.00%');put(a,'A50',[['Шесть curated QA cases: их равные weights не являются вероятностями реальной игры.']]);a.freezePanes.freezeRows(5);

const rules=sheets['Правила'];setup(rules,65,[15,24,15,15,15,15,15,15,3,58]);
put(rules,'A2',[['Правила и входы текущего генератора']]);put(rules,'A4',[['Paytable ниже - действующая V0, без утверждённой экономики. Выплаты в долях ставки.']]);
const labels={L1:'Amber vial',L2:'Violet vial',L3:'Jade vial',L4:'Rose vial',L5:'Blue vial',H1:'Moon goblet',H2:'Raven mask',H3:'Thorn rose',H4:'Crystal eye'};
rules.getRange('I1:I65').format.columnWidth=15;
put(rules,'A7:I7',[['ID','Символ','Вес клетки','p клетки','8–9, ×','10–11, ×','12–14, ×','15–19, ×','20+, ×']]);header(rules,'A7:I7');
for(let i=0;i<9;i++){const sw=config.original.symbolWeights[i],p=config.original.paytable.filter(x=>x.symbol===sw.symbol).map(x=>x.amount/100);const r=8+i;put(rules,`A${r}:I${r}`,[[sw.symbol,labels[sw.symbol],sw.weight,null,...p]]);formula(rules,`D${r}`,`=C${r}/1000`);}
rules.getRange('D8:D16').setNumberFormat('0.00%');rules.getRange('E8:I16').setNumberFormat('0.00');
put(rules,'A19',[['Округлённый вариант для интеграции. Те же веса клетки.']]);put(rules,'A21:G21',[['ID','8–9, ×','10–11, ×','12–14, ×','15–19, ×','20+, ×','Статус']]);header(rules,'A21:G21');
for(let i=0;i<9;i++){const id=config.stake.symbolWeights[i].symbol,p=config.stake.paytable.filter(x=>x.symbol===id).map(x=>x.amount/100);put(rules,`A${22+i}:G${22+i}`,[[id,...p,'Не сбалансирован']]);}rules.getRange('B22:F30').setNumberFormat('0.00');
put(rules,'A34:D34',[['Potion','Вес клетки','p клетки','Добавка к m']]);header(rules,'A34:D34');config.original.symbolWeights.slice(9).forEach((sw,i)=>{const r=35+i;put(rules,`A${r}:D${r}`,[[sw.symbol,sw.weight,sw.weight/1000,i+1]]);});rules.getRange('C35:C37').setNumberFormat('0.00%');
put(rules,'J7:J17',[
 ['6×5, 30 клеток, девять обычных символов.'],
 ['Одна выплата за группу символов по старшему достигнутому порогу.'],
 ['Все обычные выигрыши считаются одновременно.'],
 ['На каскаде сначала платим по текущему m, затем складываем Potion.'],
 ['Potion на последнем выигрышном каскаде может не дать дополнительной выплаты.'],
 ['Potion на неплатящем поле не активируется.'],
 ['Выплаченные символы и активированные Potion удаляются; refill сверху.'],
 ['m начинает с 1 каждую новую оплачиваемую ставку.'],
 ['Cap 5000× относится к полному book. 64 каскада - технический guard, не правило выплаты.'],
 ['Бонус: предлагаем 10 FS, +5 за retrigger и carry m внутри бонуса. Это ещё не код.'],
 ['При таком carry необходимо пересчитать bonus distribution; между paid rounds carry нет.']
]);note(rules,'J7:J17');rules.getRange('J7:J17').format.rowHeight=48;
put(rules,'A40',[['Пример расчёта каскадов. Иллюстрация правила, не реальный book.']]);
put(rules,'A42:G42',[['Каскад','Base win, ×','m в начале','Potion +m','Выплата, ×','m дальше','Итого, ×']]);header(rules,'A42:G42');
put(rules,'A43:D43',[[1,.5,1,2]]);put(rules,'A44:B45',[[2,1],[3,.2]]);put(rules,'D44:D45',[[0],[0]]);formula(rules,'C44','=F43');formula(rules,'C45','=F44');
for(let r=43;r<=45;r++){formula(rules,`E${r}`,`=MIN(B${r}*C${r},'Модель'!$B$7-${r===43?'0':'G'+(r-1)})`);formula(rules,`F${r}`,`=C${r}+D${r}`);formula(rules,`G${r}`,`=SUM(E$43:E${r})`);}rules.getRange('B43:G45').setNumberFormat('0.00');inputs(rules,'B43:B45');inputs(rules,'D43:D45');
put(rules,'A48',[['Как превратить проект распределения в математическую игру']]);
put(rules,'A50:H55',[
 ['1','Принять правила бонуса и Potion',null,null,null,null,null,'PO + math review'],
 ['2','Генерировать валидные полные books',null,null,null,null,null,'Base, bonus, retrigger, cap'],
 ['3','Подобрать целочисленные LUT weights',null,null,null,null,null,'Не менять выплаты задним числом'],
 ['4','Вычислить точные RTP/hit/tail по LUT',null,null,null,null,null,'Сверить с целями модели'],
 ['5','Независимо пересчитать payout всех books',null,null,null,null,null,'Бонусный cap и reset m'],
 ['6','Экспорт rules + Studio critical tests',null,null,null,null,null,'Отдельный production gate']
]);put(rules,'A58',[[sourceCode+'math/hexandheat_math/config.py']]);put(rules,'A59',[[sourceCode+'math/hexandheat_math/engine.py']]);rules.freezePanes.freezeRows(7);

const ref=sheets['Референсы'];setup(ref,36,[35,28,28,28,37,3,55]);put(ref,'A2',[['Сопоставимые игры на Stake']]);put(ref,'A4',[['Публичные карточки на 01.11.2026. Это сравнение механик, не рейтинг коммерческой успешности.']]);
put(ref,'A6:E6',[['Параметр','Deadspin Bonanza','Gates of Olympus','Sweet Bonanza 1000','Hex & Heat']]);header(ref,'A6:E6');
put(ref,'A7:E20',[
 ['Опубликованный RTP',.9602,.965,.9653,'Цель 96.5%'],
 ['Максимальная выплата, ×',5000,5000,25000,5000],
 ['Поле','6×5','6×5','6×5','6×5'],['Порог выплаты',8,8,8,8],
 ['Paytable bands','8–9 /10–11 /12+','8–9 /10–11 /12+','8–9 /10–11 /12+','8 /10 /12 /15 /20'],
 ['Начальные Free Spins','8 /10 /15',15,10,'Предложение: 10'],
 ['Множители','2–100×; отдельный red 2–4×','2–500×','2–1000×','Сейчас +1 /+2 /+3 к m'],
 ['База/бонус RTP split','Не опубликован','Не опубликован','Не опубликован','Рассчитывается в модели'],
 ['Hit rate','Не опубликован','Не опубликован','Не опубликован','25.53% проект, не замер'],
 ['Std dev и P(cap)','Не опубликованы','Не опубликованы','Не опубликованы','Вычисляются по weights'],
 ['Bonus Buy','Есть','Есть','Есть','Не включаем в этот скоуп'],
 ['Что совпадает','Scatter pays + cascades','Поле + персонаж + каскады','Цепочка + бонусные множители','Базовая механика совпадает'],
 ['Что ещё не совпадает','Готовая feature economy','Готовая математика и rules','Расширенный tail','Нет FS и production LUT'],
 ['Ограничение сравнения','Маркетинговая volatility','Маркетинговая volatility','Маркетинговая volatility','Сравнивать численные распределения']
]);ref.getRange('B7:D7').setNumberFormat('0.00%');ref.getRange('A7:E20').format.wrapText=true;ref.getRange('A7:E20').format.rowHeight=46;
formula(ref,'E8',"='Модель'!B7");formula(ref,'E15',"='Модель'!K14");ref.getRange('E15').setNumberFormat('0.00%');
put(ref,'G7:G12',[
 ['RTP - только среднее. Одинаковые 96.5% могут иметь разные hit rate и хвост.'],
 ['Текущая V0 платит мало на частых группах: это видно по низкой средней выплате при hit.'],
 ['Бонус carry m усиливает отличие от базы, но требует отдельного бюджета и cap.'],
 ['5 000× достаточно для первого кандидата; 25 000× не означает лучшее качество.'],
 ['Частоты, weights и точная дисперсия конкурентов не опубликованы: их не угадываем.'],
 ['Наша модель задаёт желаемое полное распределение. Соответствие механике доказывают books.']
]);note(ref,'G7:G12');ref.getRange('G7:G12').format.rowHeight=64;
put(ref,'A23:E23',[['Источник','URL',null,null,'Проверено']]);header(ref,'A23:E23');
const sources=[
 ['Stake / Deadspin','https://stake.com/casino/games/paperclip-deadspin-bonanza'],
 ['Stake / Gates','https://stake.com/casino/games/pragmatic-play-gates-of-olympus'],
 ['Stake / Sweet 1000','https://stake.com/casino/games/pragmatic-play-sweet-bonanza-1000'],
 ['Stake Engine / Math','https://stake-engine.com/docs/math'],
 ['Stake Engine / optimization','https://stake-engine.com/docs/math/optimization-algorithm'],
 ['Stake Engine / quick start','https://stake-engine.com/docs/math/quick-start']
];sources.forEach(([label,url],i)=>{put(ref,`A${24+i}:B${24+i}`,[[label,url]]);put(ref,`E${24+i}`,[[Math.floor(Date.UTC(2026,10,1)/86400000)+25569]]);});ref.getRange('E24:E29').setNumberFormat('yyyy-mm-dd');ref.getRange('B24:D29').format.font.size=10;
put(ref,'A32',[['Карточки могут описывать другую конфигурацию игры. Перед финальным benchmark сверить paytable конкретного demo build.']]);ref.freezePanes.freezeRows(6);

const o=sheets['Обзор'];setup(o,48,[41,24,24,3,73,16]);put(o,'A2',[['Hex & Heat: математическая модель v0.1']]);put(o,'A4',[['Готовность: правила базы реализованы; экономика и Free Spins ещё не подготовлены к запуску.']]);
put(o,'A6:C6',[['Метрика','Проект распределения','Генератор V0 (100k)']]);header(o,'A6:C6');
const summary=[['Возврат / RTP',"='Модель'!K12","='Аудит V0'!C8"],['P(выплата > 0)',"='Модель'!K14","='Аудит V0'!C12"],['Средняя выплата при hit, ×',"='Модель'!K19","='Аудит V0'!C14"],['Std dev выплаты, ×',"='Модель'!K16","='Аудит V0'!C15"],['Вклад обычных раундов в RTP',"='Модель'!K10",null],['Вклад раундов с бонусом в RTP',"='Модель'!K11",null],['Ставок на один бонус в среднем',"='Модель'!K9",null],['P(выплата ≥ 100×)',"='Модель'!K17",null],['Ставок на один cap в среднем',"='Модель'!K21",null],['P(выплата > цены режима)',"='Модель'!K15",null]];
summary.forEach(([label,b,c],i)=>{const r=7+i;put(o,`A${r}`,[[label]]);formula(o,`B${r}`,b);if(c)formula(o,`C${r}`,c);else put(o,`C${r}`,[[i===4?'Только base':i===5?'Бонус отсутствует':'Не измерено']]);});o.getRange('B7:C16').setNumberFormat('0.000');for(const r of [7,8,11,12,14,16])o.getRange(`B${r}:C${r}`).setNumberFormat('0.00%');o.getRange('B15').setNumberFormat('#,##0');o.getRange('B13').setNumberFormat('0.0');
put(o,'E6:E11',[
 ['96.5% - цель проекта. Частота бонуса решена из целевого RTP, поэтому совпадение не является независимым подтверждением.'],
 ['Веса - концептуальные. Ни один новый production LUT этой таблицей не заменён.'],
 ['Правый столбец - выборочный возврат округлённой V0 до оптимизации, без Free Spins.'],
 ['Оригинальная V0 дала 13.43%, округлённая 14.65%. Обе не готовы к реальным ставкам.'],
 ['Публичные референсы показывают 96.02–96.53%. По механике близко; по полноте математики пока отстаём.'],
 ['Приоритет: принять бонус/Potion, сгенерировать полный набор books, оптимизировать веса и независимо проверить.']
]);note(o,'E6:E11');o.getRange('E6:E11').format.rowHeight=58;
put(o,'A19:B19',[['Диапазон выплаты','Вероятность']]);header(o,'A19:B19');for(let i=0;i<7;i++){formula(o,`A${20+i}`,`='Модель'!A${53+i}`);formula(o,`B${20+i}`,`='Модель'!B${53+i}`);}o.getRange('B20:B26').setNumberFormat('0.00%');
const chart=o.charts.add('column',o.getRange('A19:B26'));chart.title='Распределение полного раунда';chart.hasLegend=false;chart.yAxis={numberFormatCode:'0%',numberFormatSourceLinked:false};chart.xAxis={axisType:'textAxis'};chart.setPosition('E15','G29');
put(o,'A30:C30',[['Решение','Предложение','Что нужно проверить']]);header(o,'A30:C30');
put(o,'A31:C37',[
 ['RTP','96.5%','Утверждение math reviewer'],['Cap','5 000× на полный book','Достижимость, частота и cap бонуса'],
 ['Free Spins','10 +5 retrigger','Одно списание, carry m внутри бонуса'],['Potion','После оплаты каскада','Неясность последней Potion для игрока'],
 ['Distribution','Условные weights','Books должны воспроизводить эту форму'],['Не включаем','Buy / ante / jackpot','Не расширять скоуп без решения'],
 ['Следующий milestone','Math lock + RGS lifecycle','RTP/LUT, resume, replay, bonus UI']
]);o.getRange('A31:C37').format.wrapText=true;o.getRange('A31:C37').format.rowHeight=44;
put(o,'E32:E36',[
 ['Жёлтые ячейки в Модели - редактируемые входы. Меняйте веса/выплаты и цель; KPI и график обновляются.'],
 ['Модель оперирует полными book payouts. Вероятности символов не подставляются вместо вероятностей раундов.'],
 ['10 FS и retrigger - предлагаемые правила. Их внутренний EV ещё не рассчитан генератором.'],
 ['Аудит V0 сохраняет исходные измерения. Они не пересчитываются от изменения проектных весов.'],
 ['Дата: 01.11.2026. Production sign-off и Stake submission остаются открыты.']
]);note(o,'E32:E36');o.getRange('E32:E36').format.rowHeight=55;

o.getRange('C11:C16').format.horizontalAlignment='center';
o.getRange('A6:G16').format.rowHeightPx=38;
a.getRange('A6:E14').format.rowHeightPx=42;
put(a,'E16',[['Frontend пока сводит 9 ordinary math IDs к 5 видам символов. До релиза нужна отдельная картинка и paytable-связь для каждого ID.']]);
note(a,'E16');a.getRange('A16:E16').format.rowHeightPx=42;
rules.getRange('A8:J17').format.rowHeightPx=43;
ref.getRange('A7:G20').format.rowHeightPx=44;
m.getRange('K26:K30').setNumberFormat('0.000000');
for(const sh of Object.values(sheets)) sh.getUsedRange().format.font.name='Arial';
// Recalculation check: changing a terminal weight must update the model and its output.
wb.recalculate();
const before=m.getRange('K9').values[0][0]; const old=m.getRange('B40').values[0][0];
put(m,'B40',[[old+10000]]);wb.recalculate();const changed=m.getRange('K9').values[0][0];
if (before===changed) throw Error('Input propagation failed');put(m,'B40',[[old]]);wb.recalculate();
put(m,'B7',[[1000]]);wb.recalculate();
if(m.getRange('G47').values[0][0]!==1000)throw Error('Cap propagation failed');
put(m,'B7',[[5000]]);wb.recalculate();
const metrics=m.getRange('K6:K21').values;
const expectedBase=base.reduce((s,[x,w])=>s+x*w,0)/1e6;
const expectedBonus=bonus.reduce((s,[x,w])=>s+x*w,0)/1e6;
const p=(.965-expectedBase)/(expectedBonus-expectedBase);
if(Math.abs(Number(metrics[0][0])-expectedBase)>1e-10||Math.abs(Number(metrics[2][0])-p)>1e-10)throw Error('Independent moment check failed');
await fs.mkdir(outputDir,{recursive:true});
await fs.writeFile(path.join(outputDir,'verification.json'),JSON.stringify({metrics,expectedBase,expectedBonus,p,bonusInterval:1/p,inputChange:{before,changed,restored:m.getRange('K9').values[0][0]}},null,2));
const scan=await wb.inspect({kind:'match',searchTerm:'#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',options:{useRegex:true,maxResults:50},summary:'formula scan'});
await fs.writeFile(path.join(outputDir,'formula-scan.ndjson'),scan.ndjson);
for(const [name,range,slug] of [['Обзор','A1:G38','overview'],['Модель','A1:G30','model'],['Модель','J1:L37','model-metrics'],['Правила','A1:J46','rules'],['Аудит V0','A1:E38','audit'],['Референсы','A1:G20','references']]) {
 const image=await wb.render({sheetName:name,range,scale:1,format:'png'});
 await fs.writeFile(path.join(outputDir,slug+'.png'),new Uint8Array(await image.arrayBuffer()));
}
const xlsx=await SpreadsheetFile.exportXlsx(wb);await xlsx.save(path.join(outputDir,'HexHeat_Math_Model_v01.xlsx'));
console.log(JSON.stringify({output:path.join(outputDir,'HexHeat_Math_Model_v01.xlsx'),expectedBase,expectedBonus,p,bonusInterval:1/p,formulaScan:scan.ndjson}));
