# AIP-Manager
These are a series of scripts written in Google Apps Scripts to manager the a series of Google Sheets that help teachers track where students go to during our Academic Intervention Period (AIP). Each script has its own job, depending on what the script is. Many of these scripts will need a source file to run, since that file will be a repository for all the data needed. The source file will need a tab for each of the following:
-Sheet index to track the start date, end date, and URL to each current or upcoming week
-Archive index to track the start date, end date, and URL to each past sheet
-Student index that stores student data entries of last name, first name, grade, prefered names, AIP teacher and a joining of "last name, prefered name
-Sheet editors to list all the people that have the rights to edit the sheet

***DailyUpdater***
This script will go through each tab in a sheet for a given week. It will add students from the form teachers can use to add students. It will then update who can edit the sheet, then it will find the sheet to update. This sheet location requires several comparisons of time, specifically taking a current day and comparing it to the start/end day of the entries in the sheeet index. If the current day is between the start and end dates, then the sheet is called as a parameter to the updating function and the loop is terminated. If a sheet is found that occured before the current date, that sheet is archive (copied inot a new folder and the original is deleted)

***Initial build***
Script that will create the files for the AIP sheets, then load their data into the source index.

***Mass Sheet Update***
Script will perfom an update on each sheet in the Source index, this bringing current and future sheets up-to-date with student entries.

***Blockout Days***
Script wil apply a placeholder in the AIP sheet to prevent teachers from requesting students on that day so school-wide AIP activities can be coordinated.

***Format and update sheets***
This script will actually do the updating of student records. It starts by checking for duplicate entries and removes them from the source sheet. It will then sort the the sheet, then a series of student objects that will link a student name to their associated data. Once the array of objects is complete, it will then check each tab for data. If the tab is blank, the function adds the data to the sheet. If the sheet already has data, the function creates a map that catelogues the current names in the sheet to their locations. The funciton then goes through the map, comparing which source names are in the current name map. If the name is found, it will update which teachers have requested the student. If not, it will just continue. After the name map has been updated, the function clears the sheet and copies over the data in the map.

***Sheet Builder***
Constructs a Google Spreadsheet for each week of school, designating tabs for each day we have homeroom and thus AIP. Each tab contains each students' name, grade, homeroom teacher and columns for other teachers to request said student for homeroom. 

***Request Highlighter**
Time-scripted function that will go through a given AIP tab and highlight the names of requested students.

***Initial Format and Update***
Script that will set up and format each sheet according to specificied guidelines.

***Spirit Format and Update***
Script that handles tracking spirit day counts for spirit weeks.

***Set Timer***
Script to set timers for when Google executes certain scripts.

***Delete Timer***
Script to clear timers.

***AddStudent*** (May not be in use due to adding feature of Daily Updater)
Script that takes the requst to add a student from the Google request form and adds them to the source list

