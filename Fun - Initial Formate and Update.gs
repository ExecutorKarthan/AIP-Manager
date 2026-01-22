function initialFormatAndUpdateSheets(weekSheet, sourceSheet, listOfEditors, listOfStudentObjects) {
//Create a function to handle the formatting
  function formatSheet(sheetTab){
      //Add Headers
      sheetTab.getRange(1, 1).setValue("Student Name");
      sheetTab.getRange(1, 2).setValue("Student Grade");
      sheetTab.getRange(1, 3).setValue("AIP teacher");
      sheetTab.getRange(1, 4).setValue("Priority A Teacher");
      sheetTab.getRange(1, 5).setValue("Priority B Teacher");
      sheetTab.getRange(1, 6).setValue("Priority C Teacher");
      sheetTab.getRange(1, 7).setValue("Additional Teacher");
      sheetTab.getRange(1, 8).setValue("Absent?");
      sheetTab.getRange(1, 9).setValue("Sent?");
      sheetTab.getRange(1, 10).setValue("Notes");
      if(sheetTab.getName() == "Mon"){
        sheetTab.getRange(2, 4, 1, 1).setValue("=Directions!B2");  
        sheetTab.getRange(2, 5, 1, 1).setValue("=Directions!B2");  
        sheetTab.getRange(2, 6, 1, 1).setValue("=Directions!B2");  
        sheetTab.getRange(2, 7, 1, 1).setValue("Other Requests");  
      }
      if(sheetTab.getName() == "Tues"){
        sheetTab.getRange(2, 4, 1, 1).setValue("=Directions!C2");  
        sheetTab.getRange(2, 5, 1, 1).setValue("=Directions!C2");  
        sheetTab.getRange(2, 6, 1, 1).setValue("=Directions!C2");  
        sheetTab.getRange(2, 7, 1, 1).setValue("Other Requests");
      }
      if(sheetTab.getName() == "Wed"){
        sheetTab.getRange(2, 4, 1, 1).setValue("=Directions!D2");  
        sheetTab.getRange(2, 5, 1, 1).setValue("=Directions!D2");  
        sheetTab.getRange(2, 6, 1, 1).setValue("=Directions!D2");  
        sheetTab.getRange(2, 7, 1, 1).setValue("Other Requests");
      }
      if(sheetTab.getName() == "Thurs"){
        sheetTab.getRange(2, 4, 1, 1).setValue("=Directions!E2");  
        sheetTab.getRange(2, 5, 1, 1).setValue("=Directions!E2");  
        sheetTab.getRange(2, 6, 1, 1).setValue("=Directions!E2");  
        sheetTab.getRange(2, 7, 1, 1).setValue("Other Requests");
      }
      if(sheetTab.getName() == "Fri"){
        sheetTab.getRange(2, 4, 1, 1).setValue("=Directions!F2");  
        sheetTab.getRange(2, 5, 1, 1).setValue("=Directions!F2");  
        sheetTab.getRange(2, 6, 1, 1).setValue("=Directions!F2");  
        sheetTab.getRange(2, 7, 1, 1).setValue("Other Requests");
      }

      //Add # of requests calculation
      sheetTab.getRange(2, 10).setValue("=CONCAT(\"# of Requests Today: \", (COUNTA(D5:G10000)))");
    
      // Define last rows and columns for ease of use
      var tabLastRow = sheetTab.getLastRow()
      var tabLastColumn = sheetTab.getLastColumn()

      //Add check boxes
      sheetTab.getRange(4, 8, tabLastRow-3, 2).insertCheckboxes()

      //Add conditional formatting
      nameRange = sheetTab.getRange(4, 1, tabLastRow, 1)
      absentRule = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied("= H4 = TRUE").setBackground('Magenta').setRanges([nameRange]).build()
      sentRule = SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied("= I4 = TRUE").setBackground('#b7e1cd').setRanges([nameRange]).build()
      rules = sheetTab.getConditionalFormatRules()
      rules.push(absentRule)
      rules.push(sentRule)
      sheetTab.setConditionalFormatRules(rules)
      console.log("Conditional formatting completed.")

      //Format the sheet's color scheme
      sheetTab.getRange(1,1,1,tabLastColumn).setBackground('#4dd0e1')
      sheetTab.getRange(2,1,tabLastRow+50,tabLastColumn).setBackground("white")
      for (var x = 3; x < tabLastRow + 50; x = x + 2){
        sheetTab.getRange(x,1, 1, tabLastColumn).setBackground('#e0f7fa')
      }

      //Freeze cells for ease of viewing
      sheetTab.setFrozenColumns(3);
      sheetTab.setFrozenRows(3);

      //Protect the sheet while keeping some cells editible
      var protection = sheetTab.protect()
      var me = Session.getEffectiveUser();
      protection.addEditor(me);
      protection.removeEditors(protection.getEditors());
      if (protection.canDomainEdit()) {
        protection.setDomainEdit(false);
      }
      var editableCells = sheetTab.getRange("D4:J1000");
      protection.setUnprotectedRanges([editableCells]);
      for(var editor = 0; editor < listOfEditors.length; editor++){
        protection.addEditor(listOfEditors[editor]);
      }

      //Correct for justification
      sheetTab.getRange(1, 1, 2, 10).setHorizontalAlignment("Center");
      sheetTab.getRange(4, 2, 1000, 1).setHorizontalAlignment("Left");

      //Adjust Font size
      sheetTab.getRange(1, 1, 1000, 10).setFontSize(9);

      //Resize the all columns to fit their text
      sheetTab.autoResizeColumns(1,7);
      sheetTab.autoResizeColumn(10);

      //Adjust text to wrap
      sheetTab.getRange(1, 1, 1000, 10).setWrap(true);

      //Adjust column width to fit correctly
      for( var column = 1; column < 7; column++){
        var cellWidth = sheetTab.getColumnWidth(column);
        if(column == 3){
          cellWidth =  cellWidth - 10*(cellWidth/100);
        }
        else{
          cellWidth =  cellWidth - 35*(cellWidth/100);
        }
        sheetTab.setColumnWidth(column, cellWidth);
      }

      console.log("Text formatting completed.")
  }

  //create an array to store the objects
  var objArray = listOfStudentObjects
  
  //Determine how many sheets there are
  numOfSheets = weekSheet.length

for(var tab = 1; tab < numOfSheets; tab ++){
    //Assumes the new sheet is completely blank - for formatting a brand new sheet
    if(weekSheet[tab].getRange(1,1,10,10).isBlank()){
      console.log("Blank Sheet Detected");
      //Copy over all student data
      for(var objNum = 0; objNum < objArray.length; objNum++){
        var changeArray = [[objArray[objNum].name, objArray[objNum].grade, objArray[objNum].aipTeacher]];
        var rowToFill = weekSheet[tab].getRange(4+objNum, 1, 1, 3);
        rowToFill.setValues(changeArray);
      }
      formatSheet(weekSheet[tab]);
    }
    //Assumes sheet has preexisting data in it to process
    else{
      //console.log("Filled Sheet Detected");
      // Define last rows and columns for ease of use
      tabLastRow = weekSheet[tab].getLastRow()
      tabLastColumn = weekSheet[tab].getLastColumn()
    
      //Get all the data from the target sheet
      var targetRangeData = weekSheet[tab].getRange(1, 1, tabLastRow, 7).getValues();
      
      //Create a map of the target data, making it an ID
      var targetRangeNameColumn = weekSheet[tab].getRange(4, 1, tabLastRow, 1).getValues();
      var targetRangeGradeColumn = weekSheet[tab].getRange(4, 2, tabLastRow, 1).getValues();
      var targetRangeAIPColumn = weekSheet[tab].getRange(4, 3, tabLastRow, 1).getValues();
      const targetRangeNameToRow = new Map(); 
      targetRangeNameColumn.forEach((value, index ) => {
        targetRangeNameToRow.set(value[0]+targetRangeGradeColumn[index]+targetRangeAIPColumn[index], index + 4); 
        }
      )

      //check each student name on the target sheet against the student objects in the array. Update the object if they match
      for(var arrayValue = 0; arrayValue < objArray.length; arrayValue++){
        if(targetRangeNameToRow.get(objArray[arrayValue].id) == undefined){
          continue;
        }
        var correspondingRow = targetRangeNameToRow.get(objArray[arrayValue].id)-1;
        objArray[arrayValue].firstTeacher = targetRangeData[correspondingRow][3];
        objArray[arrayValue].secondTeacher = targetRangeData[correspondingRow][4];
        objArray[arrayValue].thirdTeacher = targetRangeData[correspondingRow][5];
        objArray[arrayValue].otherTeacher = targetRangeData[correspondingRow][6];    
        }
      
      //Clear out old data
      weekSheet[tab].getRange(1, 1, 1000, 10).clear();
      weekSheet[tab].getRange(1, 8, 1000, 2).removeCheckboxes()
      console.log("Old Data has been deleted")
    
      //Copy over all student data
      for(var objNum = 0; objNum < objArray.length; objNum++){
        var changeArray = [[objArray[objNum].name, objArray[objNum].grade, objArray[objNum].aipTeacher, objArray[objNum].firstTeacher, objArray[objNum].secondTeacher, objArray[objNum].thirdTeacher, objArray[objNum].otherTeacher]];
        var rowToFill = weekSheet[tab].getRange(4+objNum, 1, 1, 7);
        rowToFill.setValues(changeArray);
      }
      console.log("Student Data has been copied over")
      formatSheet(weekSheet[tab]);
    }
  }
}
