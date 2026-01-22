function removeDuplicate(knownNames, studentIndex) {
  var nameCount = 0;
  knownNames.forEach((outerVal, outerIndex)=>{
    knownNames.forEach((innerVal, innerIndex)=>{
        if(outerVal[0] == innerVal[0] && nameCount == 1){
          var emptyList = [["", "", "", "", ""]]
          studentIndex.getRange(innerIndex+1, 1, 1, 5).setValues(emptyList);
        }
        if(outerVal[0] == innerVal[0] && nameCount == 0){
          nameCount = 1; 
        }
      }
    )
    nameCount = 0;
    knownNames = studentIndex.getRange(1, 5, lastRow, 5).getValues();
    }
  )
  return knownNames;
}
