function sheetBuilder(folderID, abCalendarURL, listOfEditors) {
  class Week{
    constructor(weekStartDate, weekEndDate, daysList){
      this.weekStartDate = weekStartDate;
      this.weekEndDate = weekEndDate;
      this.daysList = daysList;
    }
  }

  function protectSheet(listOfEditors, protectedSheet){
    var protection = protectedSheet.protect();
    var me = Session.getEffectiveUser();
    protection.addEditor(me);
    protection.removeEditors(protection.getEditors());
    if (protection.canDomainEdit()) {
      protection.setDomainEdit(false);
    }
    for(var editor = 0; editor < listOfEditors.length; editor++){
      protection.addEditor(listOfEditors[editor]);
    }
  }

//Create a function to create a string from a list
  function listToString(listToProcess, subjectsPerDay){
    var processedString ="";
    for(var subject = 0; subject < subjectsPerDay; subject++){
      processedString = processedString + listToProcess[subject];
    }
    return processedString
  }

  //Create a function to process the date
  function makeDate(dayValue, currentDateData){
    var processedDate = "";
    var month = currentDateData.getMonth()+1;
    var year = currentDateData.getFullYear(); 
    processedDate = month.toString() + "/" + dayValue + "/" + year.toString();
    return processedDate;
  }

  //Create a function that labels which subjects are in which days
  function subjectLabels(weekObject, subjectsPerDay, subjectList, directionsSheet){
    var dayPositions = {"Mon": 2, "Tues": 3, "Wed": 4, "Thurs": 5, "Fri": 6}
    var posibleDays = ["Mon", "Tues", "Wed", "Thurs", "Fri"];
    var missingDayList = [];
    var presentDayList = [];
    var start = 0;
    var end = subjectsPerDay;
    for(var day = 0; day < posibleDays.length; day++){
      var daysInObject = weekObject.daysList; 
      var missingDay = weekObject.daysList.findIndex((element) => element == posibleDays[day]);
      if( missingDay == -1){
        missingDayList.push(posibleDays[day]);
      }
      else{
        presentDayList.push(posibleDays[day]);
      }
    }
    for(var day = 0; day < presentDayList.length; day++){
      var currentPos = dayPositions[presentDayList[day]]
      var processedString = listToString(subjectList.slice(start, end), subjectsPerDay);
      directionsSheet.getRange(2, dayPositions[presentDayList[day]], 1, 1).setValue(processedString);
      start = end;
      end = start + subjectsPerDay 
      //Get the values to actually convince it to write to the stupid sheet
      var values = directionsSheet.getRange(2,dayPositions[presentDayList[day]],1,1).getValue()
    } 
    for(var day = 0; day < missingDayList.length; day++){
      var currentPos = dayPositions[missingDayList[day]]
      directionsSheet.getRange(2, dayPositions[missingDayList[day]], 1, 1).setValue(subjectList[12]);
      //Get the values to actually convince it to write to the stupid sheet
      var values = directionsSheet.getRange(2,dayPositions[missingDayList[day]],1,1).getValue()
    }
  }
  
  //Create a function to generate each sheet
  function makeSheet(weekObject, count){
    var targetFolder = DriveApp.getFolderById(folderID);
    var newSheet = SpreadsheetApp.create(count + " - AIP Sheet - " + weekObject.weekStartDate + " - " + weekObject.weekEndDate);
    var sourceSheet = SpreadsheetApp.openById("1jHUZFJigUKu4_K-emQdp91JkGEhMH7chjiR4ql5u8-Q").getSheetByName("Directions");
    sourceSheet.copyTo(newSheet);
    SpreadsheetApp.setActiveSpreadsheet(newSheet)

    //Remove stand in sheet
    var sheetToRemove = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1")
    SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheetToRemove);

    //Relabel the directions
    newSheet.renameActiveSheet("Directions");

    //create new sheets
    for(var tab = 0; tab < weekObject.daysList.length; tab ++){
      newSheet.insertSheet(weekObject.daysList[tab]);
    }
    
    var subjectList = ["Social Studies \n", "Drama \n", "FACS/Business \n", "Math \n", "Industrial Tech \n", "Art \n", "Comm Arts \n", "World Language \n", "FACS/Business \n", "Science \n", "Music \n", "PE \n", "No AIP"];
    var directionsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Directions");
    directionsSheet.activate();
    var subjectsPerDay = 12 / weekObject.daysList.length;
   
    //Label the directions page
    subjectLabels(weekObject, subjectsPerDay, subjectList, directionsSheet);

    // Gets the drive File
    var driveFile = DriveApp.getFileById(newSheet.getId()); 

    // Create a copy of the new sheet in the shared folder
    var newSheetURL = driveFile.makeCopy(newSheet.getName(), targetFolder).getUrl();

    //protect the directions page of the new sheet
    var sheetToProtect = SpreadsheetApp.openByUrl(newSheetURL).getSheetByName("Directions");
    protectSheet(listOfEditors, sheetToProtect);

    //Deletes the original
    driveFile.setTrashed(true); 

   //Open the index sheet
    var sheetIndex = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1OE_bEE2AGaTTnkACDo52vZmw8uwcZDSffpMjMq8_Xv8/edit#gid=0").getSheetByName("Sheet Index");
    var row = 1
    var bottomRow = sheetIndex.getRange(row, 1, 1, 1);
    while(bottomRow.getValue() != ""){
      row = row + 1; 
      bottomRow = sheetIndex.getRange(row, 1, 1, 1);
    }
    sheetIndex.getRange(row, 1, 1, 1).setValue(weekObject.weekStartDate);
    sheetIndex.getRange(row, 2, 1, 1).setValue(weekObject.weekEndDate);
    sheetIndex.getRange(row, 3, 1, 1).setValue(newSheetURL.toString());
    sheetIndex.getRange(row, 1, 1, 1).getValue();
    sheetIndex.getRange(row, 2, 1, 1).getValue();
    sheetIndex.getRange(row, 3, 1, 1).getValue();
  }

  //Create an arrayList to store each week object for the school year
  var weekObjectList = [];
  
  //Create a variables to store the current month and days
  var weekStartDate = "";
  var weekEndDate = "";
  var daysList = [];

  //Create variable to denote the first day counted
  var startDay = 0;

  //Create a variable to count blanks - used to fix weeks broken between months
  var blankCount = 0;

  //Create a variable to count "No Schools"
  var noSchoolCount = 0;

  //Create Lists to match days and months to their values
  var dayNames = ["Mon", "Tues", "Wed", "Thurs", "Fri"];

  //Open the A/B Calendar source sheet
  var abCalendar = SpreadsheetApp.openByUrl(abCalendarURL).getSheetByName("Sheet1");
  var maxRows = abCalendar.getLastRow();
  var maxColumns = abCalendar.getLastColumn();
  var sheetData = abCalendar.getRange(1, 1, maxRows, maxColumns).getValues();

  //Loop through the sheet to make the week Objects
  for(var row = 0; row < maxRows; row++){
    if (row > 48){
      test = "Target Location"
    }
    for(var column = 0; column < maxColumns; column++){
      var cellValue = sheetData[row][column];
      var type = typeof(cellValue);
      var valueTest = (type == "string" && cellValue.indexOf(" No School") != -1) || (type == "string" && cellValue.indexOf(" Break") != -1)
       if(valueTest){
        noSchoolCount = noSchoolCount +1;
        blankCount = 0;
        continue;
      }
      if((type == "string" && cellValue.indexOf("Calendar") == -1) && (type == "string" && cellValue.indexOf("Early") == -1) && (type == "string" && cellValue.indexOf("ERD") == -1) && ((type == "string" && cellValue.indexOf(" A") != -1) || (type == "string" && cellValue.indexOf(" B") != -1) || (type = "string" && cellValue.indexOf("Finals") != -1))){
        if(startDay == 0){
          dayNumber = cellValue.substring(0, cellValue.indexOf(" "));
          weekStartDate = makeDate(dayNumber, currentDateData);
        }
        else{
          if(cellValue.indexOf("Finals") != -1){
            dayNumber = cellValue.substring(0, cellValue.indexOf(" "));
            weekEndDate = makeDate(dayNumber, currentDateData);
          }
          else{
            dayNumber = cellValue.substring(0, cellValue.indexOf(" "));
            weekEndDate = makeDate(dayNumber, currentDateData);
          }
        }
        daysList.push(dayNames[column]);
        startDay = startDay +1 
        blankCount = 0;
        noSchoolCount = 0;
      }
      else if(cellValue == ""){
        blankCount = blankCount +1; 
        continue;
      }
      else if(typeof(cellValue) == "object"){
        var currentDateData = cellValue;
        continue;
      }
      else{
        continue;
      }
    }
    if(blankCount > 0 && noSchoolCount < 5 && weekStartDate != "" && weekEndDate != "" && daysList.length > 0){
      weekObjectList.push(new Week(weekStartDate, weekEndDate, daysList));
      daysList = [];
      startDay = 0
    }
    else{
      continue;
    }
  }

  //Loop through the array of week objects to make all of the sheets
  var count = 1
  for(var week = 0; week < weekObjectList.length; week++){
    makeSheet(weekObjectList[week], count);
    count++
  }  
}
