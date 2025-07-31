const iframe = Addon.iframe();

/**
 * Форматирует строковую дату в локальное представление.
 * @param {string} dateString - Дата в формате ISO.
 * @returns {string} Отформатированная дата.
 */
function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString();
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString || '-';
  }
}

/**
 * Рендерит сохраненные результаты проверки в теле карточки.
 * @param {object} data - Объект с данными проверки (companyData, checks, checkDate).
 */
function renderCheckResult(data) {
  const container = document.getElementById('checkResultContainer');
  const loading = document.getElementById('loadingMessage');
  
  if (!data) {
    loading.textContent = 'Данные проверки не найдены.';
    loading.style.display = 'block';
    iframe.fitSize(container);
    return;
  }

  const { companyData, checks, checkDate } = data;

  // Если companyData отсутствует или не является объектом, отображаем сообщение об ошибке
  if (!companyData || typeof companyData !== 'object') {
    loading.textContent = 'Некорректные данные компании.';
    loading.style.display = 'block';
    iframe.fitSize(container);
    return;
  }

  // Заполняем элементы данными
  document.getElementById('checkDateValue').textContent = formatDate(checkDate);
  document.getElementById('companyTitleResult').textContent = companyData.title || 'Неизвестная организация';
  document.getElementById('innResultValue').textContent = companyData.inn || '-';
  document.getElementById('kppResultValue').textContent = companyData.kpp || '-';
  document.getElementById('ogrnResultValue').textContent = companyData.ogrn || '-';
  document.getElementById('statusResultValue').textContent = companyData.status || '-';
  document.getElementById('okpoResultValue').textContent = companyData.okpo || '-';
  document.getElementById('okvedResultValue').textContent = companyData.okved || '-';
  document.getElementById('addressResultValue').textContent = companyData.address || '-';
  document.getElementById('managementFIOResultValue').textContent = companyData.managementFIO || '-';
  document.getElementById('managementPostResultValue').textContent = companyData.managementPost || '-';

  // Рендерим блок с проверками реестров, если есть данные
  const registrySummaryDiv = document.getElementById('registryCheckSummary');
  if (checks.classified || checks.tourOperator || checks.agentLink) {
    registrySummaryDiv.innerHTML = `
      <div class="header">Проверка в реестрах:</div>
      ${checks.classified ? `<div>✓ Проверено в Реестре классифицированных объектов</div>` : ''}
      ${checks.tourOperator ? `<div>✓ Проверено в Федеральном реестре Туроператоров</div>` : ''}
      ${checks.agentLink ? `<div>🔗 <a href="${checks.agentLink}" target="_blank" rel="noopener noreferrer">Ссылка на реестр Турагентов</a></div>` : ''}
    `;
    registrySummaryDiv.style.display = 'block';
  } else {
    registrySummaryDiv.style.display = 'none';
  }

  loading.style.display = 'none'; // Скрываем сообщение о загрузке
  container.style.display = 'block'; // Показываем основной контент
  iframe.fitSize(container); // Подстраиваем размер iframe
}

// Запуск рендеринга при инициализации iframe
iframe.render(() => {
  iframe.getData('card', 'private', 'innCheckData')
    .then(data => {
      renderCheckResult(data);
    })
    .catch(error => {
      console.error('Ошибка при получении данных проверки из Kaiten:', error);
      document.getElementById('loadingMessage').textContent = 'Не удалось загрузить данные проверки.';
      document.getElementById('loadingMessage').style.display = 'block';
      iframe.fitSize(document.getElementById('checkResultContainer'));
    });
});
