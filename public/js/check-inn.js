const iframe = Addon.iframe();

// Получаем ссылки на DOM-элементы
const innInput = document.getElementById('innInput');
const checkButton = document.getElementById('checkButton');
const cancelButton = document.getElementById('cancelButton');
const loader = document.getElementById('loader');
const resultsSection = document.getElementById('resultsSection');
const registryLinksSection = document.getElementById('registryLinksSection');
const completeCheckButton = document.getElementById('completeCheckButton');
const copyResultButton = document.getElementById('copyResultButton');
const copyResultSection = document.getElementById('copyResultSection');

const classifiedLink = document.getElementById('classifiedLink');
const tourOperatorLink = document.getElementById('tourOperatorLink');
const agentLinkInputContainer = document.getElementById('agentLinkInputContainer');
const agentLinkInput = document.getElementById('agentLinkInput');

const classifiedCheckIcon = document.getElementById('classifiedCheckIcon');
const tourOperatorCheckIcon = document.getElementById('tourOperatorCheckIcon');

let companyData = null; // Здесь будут храниться данные о компании после успешной проверки
let checks = {        // Здесь будут храниться статусы проверок по реестрам
  classified: false,
  tourOperator: false,
  agentLink: ''
};

// Функция для подстройки размера iframe после загрузки контента
iframe.fitSize('#checkInnContent');

// Инициализация: подгрузка ИНН из карточки при открытии попапа
iframe.render(async () => {
  try {
    const cardProps = await iframe.getCardProperties('customProperties');
    
    // Ищем поле с ИНН по ID (ЗАМЕНИТЕ 398033 НА АКТУАЛЬНЫЙ ID ВАШЕГО ПОЛЯ ИНН В KAITEN)
    const innField = cardProps.find(prop => prop.property.id === 398033);
    
    if (innField?.value) {
      innInput.value = innField.value;
      console.log('ИНН загружен из карточки:', innField.value);
    }
    
    iframe.fitSize('#checkInnContent');
  } catch (error) {
    console.error('Ошибка при загрузке ИНН из карточки:', error);
    iframe.showSnackbar('Не удалось загрузить ИНН из карточки. Возможно, поле не найдено.', 'warning');
  }
});

/**
 * Управляет отображением лоадера и блокировкой элементов формы.
 * @param {boolean} isLoading - true, если загрузка активна, false иначе.
 */
function setLoading(isLoading) {
  loader.style.display = isLoading ? 'block' : 'none';
  checkButton.disabled = isLoading;
  innInput.disabled = isLoading;
  cancelButton.disabled = isLoading; // Блокируем кнопку отмены во время загрузки
  iframe.fitSize('#checkInnContent');
}

/**
 * Рендерит результаты проверки компании в DOM.
 * @param {object} data - Объект с данными компании из API.
 */
function renderResults(data) {
  companyData = data;
  resultsSection.style.display = 'block';

  // Динамически заполняем HTML для отображения данных компании
  document.getElementById('companyTitle').textContent = data.title || 'Информация не найдена';
  document.getElementById('innValue').textContent = data.inn || '-';
  document.getElementById('kppValue').textContent = data.kpp || '-';
  document.getElementById('ogrnValue').textContent = data.ogrn || '-';
  document.getElementById('statusValue').textContent = data.status || '-';
  document.getElementById('okpoValue').textContent = data.okpo || '-';
  document.getElementById('okvedValue').textContent = data.okved || '-';
  document.getElementById('addressValue').textContent = data.address || '-';
  document.getElementById('managementFIOValue').textContent = data.managementFIO || '-';
  document.getElementById('managementPostValue').textContent = data.managementPost || '-';

  // Показываем секции с реестрами и кнопками действий
  registryLinksSection.style.display = 'block';
  completeCheckButton.style.display = 'block';
  copyResultSection.style.display = 'block';

  // Обновляем ссылки на реестры с учетом ИНН
  classifiedLink.href = `https://fsa.gov.ru/use-of-technology/elektronnye-reestryy/reestr-klassifitsirovannykh-obektov-gostinitsy-i-inye-sredstva-razmeshcheniya/?inn=${data.inn}`;
  // Для реестра туроператоров нет прямого поиска по ИНН в URL, поэтому ссылка общая.
  tourOperatorLink.href = 'https://economy.gov.ru/material/directions/turizm/reestry_turizm/edinyy_federalnyy_reestr_turoperatorov/poisk_po_efrt/';

  iframe.fitSize('#checkInnContent');
}

// --- Обработчики событий ---

// Закрытие попапа
cancelButton.addEventListener('click', () => {
  iframe.closePopup();
});

// Проверка ИНН по клику на кнопку
checkButton.addEventListener('click', async () => {
  const inn = innInput.value.trim();
  
  if (!inn || (inn.length !== 10 && inn.length !== 12)) { // ИНН может быть 10 или 12 цифр
    iframe.showSnackbar('Введите корректный ИНН (10 или 12 цифр)', 'warning');
    return;
  }

  try {
    // Скрываем предыдущие результаты и показываем лоадер
    resultsSection.style.display = 'none';
    registryLinksSection.style.display = 'none';
    completeCheckButton.style.display = 'none';
    copyResultSection.style.display = 'none';
    setLoading(true);
    
    // Выполняем запрос к внешнему API
    const response = await fetch(`https://mt.mosgortur.ru/MGTAPI/api/PartnerRequisites/${inn}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    if (data.error) {
      setLoading(false);
      iframe.showSnackbar(`Ошибка API: ${data.error}`, 'error');
      return;
    }

    setLoading(false);
    renderResults(data); // Рендерим полученные данные
    
    // Сбрасываем статусы проверок и скрываем иконки при новой проверке
    checks = { classified: false, tourOperator: false, agentLink: '' };
    classifiedCheckIcon.style.display = 'none';
    tourOperatorCheckIcon.style.display = 'none';
    agentLinkInputContainer.style.display = 'none';
    agentLinkInput.value = '';

  } catch (error) {
    console.error('Ошибка при проверке ИНН:', error);
    iframe.showSnackbar('Ошибка при проверке ИНН. Проверьте консоль для деталей.', 'error');
    setLoading(false);
  }
});

// Отправка формы по нажатию Enter в поле ИНН
innInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !innInput.disabled) {
    checkButton.click();
  }
});

// Обработчики кликов по ссылкам реестров
classifiedLink.addEventListener('click', () => {
  checks.classified = true;
  classifiedCheckIcon.style.display = 'inline-block'; // Показываем иконку
  iframe.fitSize('#checkInnContent');
});

tourOperatorLink.addEventListener('click', () => {
  checks.tourOperator = true;
  tourOperatorCheckIcon.style.display = 'inline-block'; // Показываем иконку
  iframe.fitSize('#checkInnContent');
});

// Отображение поля ввода ссылки для Турагентов
document.getElementById('agentRegistryLink').addEventListener('click', () => {
  agentLinkInputContainer.style.display = 'block';
  iframe.fitSize('#checkInnContent');
});

// Сохранение введенной ссылки на реестр Турагентов
agentLinkInput.addEventListener('change', (e) => {
  checks.agentLink = e.target.value.trim();
});

// Обработчик для кнопки "Проверка завершена"
completeCheckButton.addEventListener('click', async () => {
  if (!companyData) {
    iframe.showSnackbar('Сначала выполните проверку ИНН.', 'warning');
    return;
  }

  // Формируем данные для сохранения в Kaiten
  const checkData = {
    companyData,
    checks,
    checkDate: new Date().toISOString() // Сохраняем дату и время проверки
  };

  try {
    // Сохраняем данные проверки и статус в приватные данные карточки
    await iframe.setData('card', 'private', {
      innChecked: true, // Флаг, что ИНН проверен
      innCheckData: checkData // Все собранные данные
    });
    
    iframe.showSnackbar('Результаты проверки сохранены в карточке!', 'success');
    iframe.closePopup(); // Закрываем попап
  } catch (error) {
    console.error('Ошибка при сохранении данных в Kaiten:', error);
    iframe.showSnackbar('Не удалось сохранить результаты проверки. Пожалуйста, попробуйте снова.', 'error');
  }
});

// Обработчик для кнопки "Скопировать результат проверки"
copyResultButton.addEventListener('click', async () => {
  if (!companyData) {
    iframe.showSnackbar('Сначала выполните проверку ИНН.', 'warning');
    return;
  }

  // Формируем текст для копирования
  let textToCopy = `
Информация о компании (ИНН: ${companyData.inn || '-'})
-------------------------------------------------------
Наименование: ${companyData.title || '-'}
Полное наименование: ${companyData.fullName || '-'}
ИНН: ${companyData.inn || '-'}
КПП: ${companyData.kpp || '-'}
ОГРН: ${companyData.ogrn || '-'}
Статус: ${companyData.status || '-'}
Адрес: ${companyData.address || '-'}
Руководитель: ${companyData.managementFIO || '-'} (${companyData.managementPost || '-'})
ОКПО: ${companyData.okpo || '-'}
ОКВЭД: ${companyData.okved || '-'}
ОКАТО: ${companyData.okato || '-'}
ОКТМО: ${companyData.oktmo || '-'}
ОКОГУ: ${companyData.okogu || '-'}
ОКФС: ${companyData.okfs || '-'}

Проверка в реестрах:
${checks.classified ? '✓ Проверено в Реестре классифицированных объектов' : '✗ Не проверено в Реестре классифицированных объектов'}
${checks.tourOperator ? '✓ Проверено в Федеральном реестре Туроператоров' : '✗ Не проверено в Федеральном реестре Туроператоров'}
${checks.agentLink ? `🔗 Ссылка на реестр Турагентов: ${checks.agentLink}` : '✗ Ссылка на реестр Турагентов не указана'}

Дата проверки: ${new Date().toLocaleString()}
`.trim(); // .trim() удалит лишние пробелы в начале и конце

  try {
    await navigator.clipboard.writeText(textToCopy);
    iframe.showSnackbar('Результаты скопированы в буфер обмена!', 'success');
  } catch (err) {
    console.error('Не удалось скопировать текст:', err);
    iframe.showSnackbar('Не удалось скопировать текст. Пожалуйста, скопируйте вручную.', 'error');
  }
});
