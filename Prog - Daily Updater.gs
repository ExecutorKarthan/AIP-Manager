function dailyUpdater() {
  class AIPSheets{
    constructor(startDate, endDate, url){
      this.startDate = startDate;
      this.endDate = endDate;
      this.url = url;
    }
  }

  class Student{
    constructor(name, grade, aipTeacher, notes){
      this.name = name;
      this.grade = grade;
      this.aipTeacher = aipTeacher;
      this.id = name+grade+aipTeacher;
    }
    defFirstTeacher(firstTeacher){
      this.firstTeacher = firstTeacher;
    }
    defSecondTeacher(secondTeacher){
      this.secondTeacher = secondTeacher;
    }
    defThirdTeacher(thirdTeacher){
      this.thirdTeacher = thirdTeacher;
    }
    defOtherTeacher(otherTeacher){
      this.otherTeacher = otherTeacher;
    }
    defNotes(notes){
      this.otherNotes = notes;
    }
  }

  //Function to properly format names
  function nameProcessor(fullString){
    var firstLetter = fullString.slice(0,1).toUpperCase();
    var restLetters = fullString.slice(1).toLowerCase();
    var correctedName = firstLetter+restLetters;
    return correctedName
  }
  
  try{
    //Open the source sheets and get their information
    var sourceSheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1OE_bEE2AGaTTnkACDo52vZmw8uwcZDSffpMjMq8_Xv8/edit#gid=0");
    var studentIndex = sourceSheet.getSheetByName("Student Index");
    var archiveIndex = sourceSheet.getSheetByName("Archive Index");
    var sheetIndex = sourceSheet.getSheetByName("Sheet Index");
    var teacherIndex = sourceSheet.getSheetByName("Teacher Index");
    var sheetEditors = sourceSheet.getSheetByName("Sheet Editors");
    var spiritDates = sourceSheet.getSheetByName("Spirit Weeks");
  
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

//Create student objects to use
  // Define last rows and columns for ease of use
    var lastRow = studentIndex.getLastRow()
    var lastColumn = studentIndex.getLastColumn()

  
  //Sort the source sheet for accuracy and formating
    studentIndex.getRange(1,1,lastRow, lastColumn).sort([{column: 4, ascending: true},{column: 2, ascending:true}])
    var blankTest = studentIndex.getRange(1,1, 3, 1).getValues()
    while (blankTest != ''){
      studentIndex.insertRowBefore(1)
      blankTest = studentIndex.getRange(1,1,3, 1).getValues()[2]
    }

  //Define the ranges that need to be copied into variables
    gradeSource = studentIndex.getRange(4,3, lastRow, 1);
    aipTeacherSource = studentIndex.getRange(4,4, lastRow, 1);

  //create an array to store the objects
  var studentArray = []

  //Build objects and fill them with their data
  for(var x = 0; x < (lastRow - 3); x++){
    //var nickName = sourceSheet.getRange(x+4, 4, 1, 1).getValues()[0][0];
    var lastName = studentIndex.getRange(x+4, 2, 1, 1).getValues()[0][0];
    var firstName = studentIndex.getRange(x+4, 1, 1, 1).getValues()[0][0];
    var processedName = lastName + ", " + firstName;  
    studentArray.push(new Student(processedName, gradeSource.getValues()[x][0], aipTeacherSource.getValues()[x][0]))
    //console.log("Here is the student object with its data: " + studentArray[x].name + "\n" + studentArray[x].grade + "\n" + studentArray[x].aipTeacher)
  }
  console.log("Student objects have been created and populated.")

  //Extract dates that should be blocked out and store them in a list
    var spiritDateRow = spiritDates.getLastRow()-1;
    var spiritDateData = spiritDates.getRange(2, 1, spiritDateRow, 1).getValues();
    var processedSpiritDates = []
    spiritDateData.forEach(value =>{
      var originalDate = new Date(Date.parse(value [0]))
      var date =  new Date(Date.parse(value [0]))
      var spiritWeekStart = new Date(date.setDate(date.getDate() - date.getDay()))
      var spiritWeekEnd = new Date(date.setDate(date.getDate() + 6))
      processedSpiritDates.push([spiritWeekStart, spiritWeekEnd])
    })
    
    //Establish a time for right now
    const now = new Date();

    //time adjustment for testing
    //now.setDate(now.getDate()+5)

    //Create a time to represent the follow week's first day
    const nextFirstDay = sheetObjects[1].startDate; 

    //loop through the list looking for the right sheet to edit
    for(var sheet = 0; sheet < sheetObjects.length; sheet++){
      //Create a date range to test. If the value is after the start(+) but before the end (-), then it is the right sheet
      var startComp = sheetObjects[sheet].startDate;
      var endComp = sheetObjects[sheet].endDate;
      if((now - startComp >-1) && ((now - endComp < 0) || (now - endComp < 86400000 && now - endComp > -1))){
        var spiritWeek = false;
        processedSpiritDates.forEach((value) =>{
          if (now > value[0] && now < value[1]){
            spiritWeek = true;
          }
        })
        var targetSpreadsheet = SpreadsheetApp.openByUrl(sheetObjects[sheet].url)
        var weekSheet = targetSpreadsheet.getSheets();
        if(spiritWeek){
          spiritFormatAndUpdateSheets(weekSheet, studentIndex, listOfEditors, studentArray);
        }
        else{
          formatAndUpdateSheets(weekSheet, studentIndex, listOfEditors, studentArray);
        }
        break
      }
      
      //If it is an earlier sheet (+ for both start and end values) archive the earlier sheet
      if((now - startComp >-1) && (now - endComp >-1 ) && ((now.getDay >= 5) || (now.getDay == 0) || now - nextFirstDay > 0)){
        console.log("Archival Sheet. The current date is " + Utilities.formatDate(now, "CT", "MM-dd-yyyy") + "\n" + "The current start day is " + startComp)
        //protect the old sheet from editing
        var weekSpreadsheet = SpreadsheetApp.openByUrl(sheetObjects[sheet].url);
        var weekSheet = weekSpreadsheet.getSheets();
        for(var protSheet = 0; protSheet < weekSheet.length; protSheet++){
          var singleSheet = weekSheet[protSheet].getName();
          var fullRange = weekSheet[protSheet].getRange("A1:J1000");
          var protection = fullRange.protect().setDescription("Archived sheet - protected for historical purposes")
          var me = Session.getEffectiveUser();
          protection.addEditor(me);
          protection.removeEditors(protection.getEditors());
          if (protection.canDomainEdit()) {
            protection.setDomainEdit(false);
          }
          console.log("Protect sheets")
        }
  
        //Move the old sheet to the archived folder
        // Gets the drive File
        var driveFile = DriveApp.getFileById(weekSpreadsheet.getId()); 

        // Create a copy of the old sheet and puts the copy in the shared folder
        var targetFolder = DriveApp.getFolderById("1NJjlMlTJGyc7ooucMnoEBOFPS1ub4CuF");
        var archiveSheetURL = driveFile.makeCopy(weekSpreadsheet.getName(), targetFolder).getUrl();
        console.log("Archival copy created and moved")

        //Update the record in the Source File
        var sourceEntry = sheetIndex.getRange("A2:B2").getValues();
        var lastRowArchive = archiveIndex.getLastRow();
        var archiveImportLocation = archiveIndex.getRange(lastRowArchive+1,1, 1, 2).setValues(sourceEntry);
        var updateURL = archiveIndex.getRange(lastRowArchive+1,3, 1, 1).setValue(archiveSheetURL);
        var deleteOldEntry = sheetIndex.deleteRow(2);

        //Deletes the original AIP file that was already copied and archived
        driveFile.setTrashed(true); 
        console.log("Original AIP Sheet file deleted")
        
      }
      else{
        console.log("No current or archival sheet ready. The current date is " + Utilities.formatDate(now, "CT", "MM-dd-yyyy") + "\n" + "The current start day is " + startComp);
      }
    }
}
  catch{
    console.error(Error)
    MailApp.sendEmail("jmessina@stcharlessd.org", "GAS Error", console.error(Error))
      deleteTimers()
      now = new Date();
      var min = Math.floor(now.getMinutes() + 5);
      var hour = Math.floor(now.getHours());
        if(min > 59){
          min = min - 59;
          hour = hour +1;
        }
      while(hour < 4){
        ScriptApp.newTrigger("dailyUpdater").timeBased().atHour(hour).nearMinute(min).everyDays(1).create();
      }
    }
}
