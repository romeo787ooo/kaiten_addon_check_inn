Addon.initialize({
  // Определяет кнопки, которые появятся в правой панели карточки
  'card_buttons': async (cardButtonsContext) => {
    const buttons = [];

    buttons.push({
      text: '🔍 Проверить ИНН',
      callback: async (buttonContext) => {
        // Открывает попап с формой проверки ИНН
        return buttonContext.openPopup({
          type: 'iframe',
          title: 'Проверка ИНН компании',
          // Путь к HTML файлу внутри аддона, относительный от корня GitHub Pages
          url: '/public/views/check-inn.html',
          height: 500, // Увеличена высота для нового дизайна
          width: 700
        });
      }
    });

    return buttons;
  },

  // Определяет бейджи, которые отображаются на фасаде карточки
  'card_facade_badges': async (context) => {
    // Получаем статус проверки ИНН из приватных данных карточки
    const isChecked = await context.getData('card', 'private', 'innChecked');
    
    if (isChecked) {
      return {
        text: '✅ ИНН проверен',
        color: 'green' // Цвет бейджа
      };
    }
    return null; // Если ИНН не проверен, бейдж не отображается
  },

  // Определяет секции, которые будут добавлены в тело карточки
  'card_body_section': async (bodySectionContext) => {
    // Получаем сохраненные данные проверки ИНН
    const checkData = await bodySectionContext.getData('card', 'private', 'innCheckData');
    
    if (!checkData) {
      return []; // Если данных нет, секция не отображается
    }

    return [{
      title: '🏢 Данные о проверке организации', // Заголовок секции
      content: {
        type: 'iframe',
        // Путь к HTML файлу, который отобразит результаты проверки
        // bodySectionContext.signUrl() необходим для обеспечения безопасности доступа к iframe
        url: bodySectionContext.signUrl('/public/views/check-result.html'),
        height: 400, // Высота iframe внутри секции
      }
    }];
  }
});
