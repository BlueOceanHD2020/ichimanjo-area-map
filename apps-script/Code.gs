const SPREADSHEET_ID = "1tZfA5jLAPCSc-gnoO31lYs5wJj3l2W8K3bZvxZ18alo";
const SHEET_NAME = "区域管理";
const PROTOTYPE_AREA_IDS = new Set(["M170", "M175", "M178"]);

function doGet(event) {
  const result = Sheets.Spreadsheets.Values.get(SPREADSHEET_ID, SHEET_NAME + "!A2:K281", {
    valueRenderOption: "FORMATTED_VALUE"
  });
  const values = result.values || [];
  const areas = {};

  values.forEach(function (row) {
    const id = row[0];
    if (!PROTOTYPE_AREA_IDS.has(id)) return;
    areas[id] = {
      storageType: row[2],
      loanStatus: row[3],
      progress: row[4],
      elapsed: row[9],
      displayColor: row[10]
    };
  });

  return response_({
    ok: true,
    updatedAt: new Date().toISOString(),
    areas: areas
  }, event);
}

function response_(payload, event) {
  const callback = event && event.parameter && event.parameter.callback;
  if (callback && /^[A-Za-z_$][0-9A-Za-z_$\.]*$/.test(callback)) {
    return ContentService.createTextOutput(callback + "(" + JSON.stringify(payload) + ");")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
