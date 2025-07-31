Addon.initialize({
  'card_buttons': async (context) => {
    return [{
      text: 'Тест кнопки',
      callback: async () => {
        context.showSnackbar('Привет из тестового аддона!', 'info');
      }
    }];
  }
});
