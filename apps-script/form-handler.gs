function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const p = e.parameter;

  sheet.appendRow([
    p.dataHora    || '',
    p.nome        || '',
    p.whatsapp    || '',
    p.idade       || '',
    p.email       || '',
    p.escolaridade || '',
    p.pretendenciaEnsinoSuperior       || '',
    p.modalidade  || '',
    p.evento      || '',
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
