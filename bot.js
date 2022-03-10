const { VK, Keyboard } = require('vk-io');
const { HearManager } = require('@vk-io/hear');
const { QuestionManager } = require('vk-io-question');
const fs = require("fs");
const vk = new VK({
	token: '8f2abf7fe250528f52490c14beeaacd9cdcedb69acd4201738d7bb1839eb8add84b55336248c9b2dda373'
});
const questionManager = new QuestionManager();
const hearManager = new HearManager();
const { lig2 } = require('talisman/metrics/lig');
var port = process.env.PORT || 8080;
var server=app.listen(port,function() {
console.log("app running on port 8080"); });

const counselors = require("./database/counselors.json");
const users = require("./database/users.json");

setInterval(() => {
	fs.writeFileSync("./database/counselors.json", JSON.stringify(counselors, null, "\t"));
	fs.writeFileSync("./database/users.json", JSON.stringify(users, null, "\t"));
}, 1000);

vk.updates.use(async (message, next) => {
	if (message.is('message') && message.isOutbox) return;
	if (message.senderId < 1 || !message.senderId) return;
	if (message.isChat) return;
	message.user = message.senderId;
	if (!users[message.user]) {
		users[message.user] = {
			answer: false
		}
	}
	if (users[message.user].answer && (!message.text || !message.text.match(/закончить вопрос|тест: кто ты из атмосферы\?|кто ты из атмосферы\?|тест|тест: кто ты из «Атмосферы»/i))) return;
	try {
		await next();
	} catch (err) {
		console.error(err);
	}
});

vk.updates.use(questionManager.middleware);
vk.updates.on('message_new', hearManager.middleware);

hearManager.hear(/тест: кто ты из атмосферы\?|кто ты из атмосферы\?|тест|тест: кто ты из «Атмосферы»/i, async message => {
	users[message.user].answer = false;
	let answer = await message.question(`Приветствую тебя в навыке «Тест: Кто ты из «Атмосферы»! ✨\n\n☀ «Атмосфера» — это педагогический отряд, состоящий не только из прекрасных вожатых, но и из ведущих, фотографов, DJ и других не менее важных людей, которые каждый год дарят радость сотням детей. Этот тест поможет тебе узнать, на кого из «Атмосферы» ты больше всего похож.\n\n💡 Используй кнопки, если ты готов.`, {attachment: 'photo-210023008_457239018', keyboard: Keyboard.builder().textButton({label: '❌ Отмена', color: Keyboard.NEGATIVE_COLOR}).textButton({label: '🥳 Поехали!', color: Keyboard.POSITIVE_COLOR}).inline()});
	if (!answer.text || !answer.text.match(/поехали|продолжить|нача|погнали|го/i)) return message.send(`Ты вышел из навыка «Тест: Кто ты из атмосферы»! ❌`);
	let participants = {};
	for (i in counselors) participants[i] = {id: i, rating: 0};
	message.send(`Итак, давай начнём! ☺\n\n💫 Зодиакальный пояс в астрологии разделён на 12 частей по 30° каждый. Эти части образают @atmosfera (знаки зодиака), название которых произошло от названий соответствующих созвездий.\n\n🔥 Расскажи, кто ты по знаку зодиака? (Используй кнопки)`, {attachment: 'photo-210023008_457239020'});
	message.send(`🔘 Кнопки (часть 1)`, {keyboard: Keyboard.builder().textButton({label: '♈ Овен'}).textButton({label: '♉ Телец'}).textButton({label: '♊ Близнецы'}).row().textButton({label: '♋ Рак'}).textButton({label: '♌ Лев'}).textButton({label: '♍ Дева'}).inline()});
	let horoscope = await message.question(`🔘 Кнопки (часть 2)`, {keyboard: Keyboard.builder().textButton({label: '♎ Весы'}).textButton({label: '♏ Скорпион'}).textButton({label: '♐ Стрелец'}).row().textButton({label: '♑ Козерог'}).textButton({label: '♒ Водолей'}).textButton({label: '♓ Рыбы'}).inline()});
	if (!horoscope.text || lig2('нет', horoscope.text.toLowerCase()) > 0.55) horoscope.text = false;
	let camp = await message.question(`Отлично! Идём дальше. 😎\n\n💝 Атмосфера работала во @atmosfera (многих лагерях России). Это «Старая Руза», «Кратово», «Мир» — Московская область, «Омега» — Севастополь, «Синезёрки» — Брянская область, «Спутник» — Геленджик, а так же в других лагерях.\n\nКакой лагерь тебе нравится больше всего? Он может быть не связан с Атмосферой. ⛺`, {attachment: ['photo-401713_457273397', 'photo-401713_457274586', 'photo-401713_457274145']});
	if (!camp.text || lig2('нет', camp.text.toLowerCase()) > 0.55) camp.text = false;
	let colour = await message.question(`Хороший выбор! 😉\n\n🤓 Кстати, интересный факт: цвет солнца – белый. @atmosfera (Атмосфера) земли, преломляя солнечные лучи, делает его желтоватым.\nСчитается, что цветов всего 3: красный, зелёный и синий, а оттенков десятки тысяч.\n\n💜 А какой твой любимый цвет или оттенок?`, {attachment: 'photo-210023008_457239060'});
	if (!colour.text || lig2('нет', colour.text.toLowerCase()) > 0.55) colour.text = false;
	let animal = await message.question(`Прекрасный цвет! 🌈\n\n🐸 Переходим к животным! Ты знал(-а), что на Земле 7 миллионов видов животных? Но, к сожалению, большинство из них до сих пор не описано...\n\n🐱 Кстати, какое твоё любимое животное?`, {attachment: 'photo-210023008_457239070'});
	if (!animal.text || lig2('нет', animal.text.toLowerCase()) > 0.55) animal.text = false;
	let meal = await message.question(`Мило) 🥰\n\n🍕 Идём дальше. Самым популярным блюдом в мире является пицца! А именно «Маргарита», ведь её ели почти все.\n\n🌶 Пицца — это круто! А какая твоя любимая еда или напиток?`, {attachment: 'photo-210023008_457239083'});
	if (!meal.text || lig2('нет', meal.text.toLowerCase()) > 0.55) meal.text = false;
	let musician = await message.question(`Необычно! 🤩\n\n🕺 А теперь музыканты! Есть музыканты, которым хочется подпевать, под песни которых хочется танцевать, но лучшие — это те, которые возвращают тебя к моменту, когда ты впервые услышал их. В Атмосфере есть свои музыканты: @sofahhhhh (Софа), @vesnushkamusic (ВЕСНУШКА), @melon_inc (Дыня inc.) и другие!\n\n🎤 Какой музыкант твой фаворит? (Он может быть не связан с Атмосферой)`, {attachment: ['photo-210023008_457239089', 'photo-210023008_457239088', 'photo-210023008_457239087']});
	if (!musician.text || lig2('нет', musician.text.toLowerCase()) > 0.55) musician.text = false;
	let film = await message.question(`Супер! 🎉\n\n🤑 Погнали к фильмам! Самыми кассовыми фильмами в мире являются «Аватар» и «Титаник». Они покорили сердца миллионов людей. Ну, а самыми кассовыми русскими фильмами стали «Холоп» и «Движение вверх».\n\n🎬 Какой твой любимый фильм, сериал или мультик?`, {attachment: 'photo-210023008_457239093'});
	if (!film.text || lig2('нет', film.text.toLowerCase()) > 0.55) film.text = false;
	let book = await message.question(`Огонь! 🔥\n\n🎓 	Последний вопрос! Эрнест Хемингуэй говорил: «Все хорошие книги сходны в одном: когда вы дочитаете до конца, вам кажется, что все это случилось с вами, и так оно навсегда при вас и останется».\n\n📚 Какую книгу, которую ты читал, ты полюбил больше всего?`, {attachment: 'photo-210023008_457239097'});
	if (!book.text || lig2('нет', book.text.toLowerCase()) > 0.55) book.text = false;
	for (i in counselors) {
		let horoscope_ = new RegExp(counselors[i].horoscope, 'i');
		if (horoscope.text != false && horoscope.text.match(horoscope_)) participants[i].rating++;
		tst1: for (j in counselors[i].camp) {
			if (camp.text != false && lig2(counselors[i].camp[j], camp.text.toLowerCase()) > 0.55) {
				participants[i].rating++;
				break tst1;
			}
		}
		tst2: for (j in counselors[i].colour) {
			if (colour.text != false && lig2(counselors[i].colour[j], colour.text.toLowerCase()) > 0.55) {
				participants[i].rating++;
				break tst2;
			}
		}
		tst3: for (j in counselors[i].animal) {
			if (animal.text != false && lig2(counselors[i].animal[j], animal.text.toLowerCase()) > 0.55) {
				participants[i].rating++;
				break tst3;
			}
		}
		tst4: for (j in counselors[i].meal) {
			if (meal.text != false && lig2(counselors[i].meal[j], meal.text.toLowerCase()) > 0.55) {
				participants[i].rating++;
				break tst4;
			}
		}
		tst5: for (j in counselors[i].musician) {
			if (musician.text != false && lig2(counselors[i].musician[j], musician.text.toLowerCase()) > 0.55) {
				participants[i].rating++;
				break tst5;
			}
		}
		tst6: for (j in counselors[i].book) {
			if (book.text != false && lig2(counselors[i].book[j], book.text.toLowerCase()) > 0.55) {
				participants[i].rating++;
				break tst6;
			}
		}
		tst7: for (j in counselors[i].film)  {
			if (film.text != false && lig2(counselors[i].film[j], film.text.toLowerCase()) > 0.55) {
				participants[i].rating++;
				break tst7;
			}
		}
	}
	let partic = [];
	for (i in participants) partic.push(participants[i]);
	partic.sort((a, b) => {return b.rating - a.rating});
	if (partic[0].rating < 3) return message.send(`Пора подводить итоги! ☺\n\n😌 К сожалению, ты ни на кого не похож(-а). Но ничего страшного, ведь это значит, что ты уникальный человек!\n😎 Если тебе есть 18, то показать свою уникальность можно на ШВА. ШВА — это Школа вожатых «Атмосферы», в которой мы учим вожатству и другим полезным качествам. Подать заявку на ШВА'22 можно до 27 марта тут — https://vk.cc/cawi7o!\n\n☀ @atmosfera (Атмосфера) — с нами ярко!`, {attachment: 'photo-210023008_457239114'});
	return message.send(`Пора подводить итоги! ☺\n\n👑 Вы с @${counselors[partic[0].id].link} (${counselors[partic[0].id].name}) похожи на ${Math.round(100/8*partic[0].rating)}%!\nДелитесь результатом в истории с хэштэгом #ктояизатмо.\n\n☀ @atmosfera (Атмосфера) — с нами схожи!`, {attachment: counselors[partic[0].id].photo});
});

hearManager.hear(/шва/i, async message => {
	users[message.user].answer = true;
	message.send(`В скором времени мы ответим на ваш вопрос. ⏳`, {keyboard: Keyboard.builder().textButton({label: 'Закончить вопрос', color: Keyboard.NEGATIVE_COLOR}).oneTime()});
	vk.api.call('messages.markAsAnsweredConversation', {
		peer_id: message.user,
		answered: 0
	}).then(res => {
		return;
	});
});

hearManager.hear(/^задать вопрос$/i, async message => {
	users[message.user].answer = true;
	return message.send(`Отлично! Задайте свой вопрос и в скором времени мы ответим на него. ⏳`, {keyboard: Keyboard.builder().textButton({label: 'Закончить вопрос', color: Keyboard.NEGATIVE_COLOR}).oneTime()});
});

hearManager.hear(/^закончить вопрос$/i, async message => {
	users[message.user].answer = false;
	message.send(`Рады, что смогли помочь! 🧐`);
	return message.send(`⚡ Вот, что я могу:\n\n• Навык «Тест: Кто ты из «Атмосферы» 🧑🏻\n• Задать вопрос ❓\n\n💡 Бот создан ИЦkids «Атмосферы».`, {attachment: 'photo-210023008_457239486', keyboard: Keyboard.builder().textButton({label: 'Тест: Кто ты из «Атмосферы»'}).row().textButton({label: 'Задать вопрос', color: Keyboard.PRIMARY_COLOR}).inline()});
});

vk.updates.on('message_new', message => {
	return message.send(`⚡ Привет! Вот, что я могу:\n\n• Навык «Тест: Кто ты из «Атмосферы» 🧑🏻\n• Задать вопрос ❓\n\n💡 Бот создан ИЦkids «Атмосферы».`, {attachment: 'photo-210023008_457239486', keyboard: Keyboard.builder().textButton({label: 'Тест: Кто ты из «Атмосферы»'}).row().textButton({label: 'Задать вопрос', color: Keyboard.PRIMARY_COLOR}).inline()});
});

async function run() {
	await vk.updates.start().catch(console.error);
	console.log('«Атмосфера бот» успешно запущен и готов к использованию.');
}
run().catch(console.error);