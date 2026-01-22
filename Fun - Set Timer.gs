function setTimeTrigger() {
  var oldTriggers = ScriptApp.getProjectTriggers();
  oldTriggers.forEach((trigger) => {
    ScriptApp.deleteTrigger(trigger);
    }
  )
  ScriptApp.newTrigger("dailyUpdater").timeBased().atHour(2).nearMinute(30).everyDays(1).create();
  ScriptApp.newTrigger("requestHighlighter").timeBased().atHour(9).nearMinute(50).everyDays(1).create();
  ScriptApp.newTrigger("massSheetUpdate").timeBased().atHour(2).nearMinute(30).everyDays(2).create();
  }
