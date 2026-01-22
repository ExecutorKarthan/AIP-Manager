function massSheetUpdate() {
  class AIPSheets{
    constructor(startDate, endDate, url){
      this.startDate = startDate;
      this.endDate = endDate;
      this.url = url;
    }
  }

  class Student{
    constructor(name, grade, aipTeacher){
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
  studentNameSource = studentIndex.getRange(4,6, lastRow, 1);

  //Create an array to hold the objects
  var objArray = []

  //Build objects and fill them with their data
  for(var x = 0; x < (lastRow - 3); x++){
    //var nickName = sourceSheet.getRange(x+4, 4, 1, 1).getValues()[0][0];
    var lastName = studentIndex.getRange(x+4, 2, 1, 1).getValues()[0][0];
    var firstName = studentIndex.getRange(x+4, 1, 1, 1).getValues()[0][0];
    var processedName = lastName + ", " + firstName;  
    //Old code prior to having prefed names as default first names
    /*if(nickName == ""){
      var processedName = lastName + ", " + firstName;  
    }
    else{
      var processedName = lastName + ", " + nickName;
    }*/
    objArray.push(new Student(processedName, gradeSource.getValues()[x][0], aipTeacherSource.getValues()[x][0]))
    //console.log("Here is the student object with its data: " + objArray[x].name + "\n" + objArray[x].grade + "\n" + objArray[x].aipTeacher)
  }
  console.log("Student objects have been created and populated.")

  for(var sheet = 0; sheet < sheetObjects.length; sheet++){
    var weekSheet = SpreadsheetApp.openByUrl(sheetObjects[sheet].url).getSheets();  
    initialFormatAndUpdateSheets(weekSheet, studentIndex, listOfEditors, objArray);
  }
  blockOutDays()
}
