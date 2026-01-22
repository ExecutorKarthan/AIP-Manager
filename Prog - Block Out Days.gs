function blockOutDays() {
  class AIPSheets{
    constructor(startDate, endDate, url){
      this.startDate = new Date (Date.parse(startDate));
      this.endDate = new Date (Date.parse(endDate));
      this.url = url;
    }
  }
 
//Open the source sheets and get their information
  var sourceSheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1OE_bEE2AGaTTnkACDo52vZmw8uwcZDSffpMjMq8_Xv8/edit#gid=0");
  var sheetIndex = sourceSheet.getSheetByName("Sheet Index");
  var blockDates = sourceSheet.getSheetByName("AIP Block Out Days Index");
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

  //Extract dates that should be blocked out and store them in a list
  var blockedDateRow = blockDates.getLastRow()-1;
  var blockedDateData = blockDates.getRange(2, 1, blockedDateRow, 2).getValues();
  var processedBlockedDates = []
  blockedDateData.forEach(value =>{
    var date =  new Date(Date.parse(value [0]))
    processedBlockedDates.push([date, value[1]])
  })
  
  //Create a map to reference the date Object's day to the sheet we are looking for
  var dayMap = new Map([[1, "Mon"], [2, "Tues"], [3, "Wed"], [4, "Thurs"], [5, "Fri"]]);

  //Create sheet objects to manage each week
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

  var index = 0
  while (processedBlockedDates.length > 0){
    var test = sheetObjects
    var currentBlockedArr = processedBlockedDates.shift();
    var currentBlockedDate = currentBlockedArr[0];
    var currentBlockedReason = currentBlockedArr[1];
    for(index; index < sheetObjects.length; index++){
      if(currentBlockedDate < sheetObjects[index].startDate){
        break;
      }
      if(currentBlockedDate >= sheetObjects[index].startDate && currentBlockedDate <= sheetObjects[index].endDate){
        var dayToBlock = dayMap.get(currentBlockedDate.getDay());
        var sheetInRange = SpreadsheetApp.openByUrl(sheetObjects[index].url);
        try{
          var sheetToBlock = sheetInRange.getSheetByName(dayToBlock)
          var currentProtections = sheetToBlock.getProtections(SpreadsheetApp.ProtectionType.RANGE)
          var recentProtection = currentProtections[0]
          if(recentProtection != undefined){
            recentProtection.remove()
          }
          var rangeToLockLastRow = sheetToBlock.getLastRow()-1
          var rangeToLock = sheetToBlock.getRange(4, 4, rangeToLockLastRow, 4);
          var protection = rangeToLock.protect().setDescription("Range is locked due to no travel being allowed")
          var me = Session.getEffectiveUser();
          protection.addEditor(me);
          protection.removeEditors(protection.getEditors());
          if (protection.canDomainEdit()) {
              protection.setDomainEdit(false);
            }
          sheetToBlock.getRange(4, 4, 20, 4).merge();
          sheetToBlock.getRange(4, 4, 1, 1).setBackground("orange");
          sheetToBlock.getRange(4, 4, 1, 1).setValue("No traveling in AIP due to " + currentBlockedReason);
          sheetToBlock.getRange(4, 4, 1, 1).setFontSize(40)
          sheetToBlock.getRange(4, 4, 1, 1).setHorizontalAlignment("center");
          sheetToBlock.getRange(4, 4, 1, 1).setVerticalAlignment("middle");
          break
        }
        catch{
          console.log("Tab " + dayToBlock + " in " + sheetObjects[index].startDate + " - " + sheetObjects[index].endDate + " was not found." )
        }
      }
    }
  }
  
  console.log("Block out day program terminated")
}
