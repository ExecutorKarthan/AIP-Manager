function buildAndUpdate() {
  class AIPSheets{
    constructor(startDate, endDate, url){
      this.startDate = startDate;
      this.endDate = endDate;
      this.url = url;
    }
  }
  
//Open the source sheets and get their information
  var sourceSheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1OE_bEE2AGaTTnkACDo52vZmw8uwcZDSffpMjMq8_Xv8/edit#gid=0");
  var studentIndex = sourceSheet.getSheetByName("Student Index");
  var sheetIndex = sourceSheet.getSheetByName("Sheet Index");
  var teacherIndex = sourceSheet.getSheetByName("Teacher Index");
  var sheetEditors = sourceSheet.getSheetByName("Sheet Editors");

  //Determine who can edit
  var listOfEditors = [];
  var row = 2
  var rowValues = sheetEditors.getRange(row, 1, 1, 1).getValues()
  while(rowValues[0][0] != ""){
    if(rowValues[0][0] == "Email"){
      row = row + 1;
      rowValues = sheetEditors.getRange(row, 1, 1, 3).getValues()
      continue
    }
    else{
      listOfEditors.push(rowValues[0][0]);
      row = row + 1;
      rowValues = sheetEditors.getRange(row, 1, 1, 3).getValues()
    }
  } 

  //Build sheets
  sheetBuilder("1uanU28_LS1cqn4MHhX0oImM4TB7xgUK6", "https://docs.google.com/spreadsheets/d/1rHWldvO69MQsn4kGTWRD20QQnJkZYmTt6c8eAWL0NpI/edit?gid=0#gid=0", listOfEditors);

  //Create sheet objects to copy to the source index
  var sheetObjects = [];
  var row = 1
  var rowValues = sheetIndex.getRange(row, 1, 1, 3).getValues()
  while(rowValues[0][0] != ""){
    if(rowValues[0][0] == "Start Date"){
      row = row + 1;
      rowValues = sheetIndex.getRange(row, 1, 1, 3).getValues()
      continue
    }
    else{
      sheetObjects.push(new AIPSheets(rowValues[0][0], rowValues[0][1], rowValues[0][2]));
      row = row + 1;
      rowValues = sheetIndex.getRange(row, 1, 1, 3).getValues()
    }
  } 
}
