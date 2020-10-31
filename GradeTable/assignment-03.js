// 0: percentage, 1: lettergrade, 2: 4.0 scale
var toggleValue = 0
var gradeTitle = ['Average [%]', 'Average [Letter]', 'Average [4.0]']
var numberOfCurrentAssignments = 5

var addedRowColList = []

$(document).ready(function () {
    
    // WORKS -- turns background of unsubmitted assignments to yellow and returns the number of unsubmitted assignments
    unsubmittedAssignments()

    // WORKS -- once we create new rows and columns we need to create listeners for them
    updateListeners()

    // WORKS -- check if there are existing cookies, and if so does  the user want to use them or start over using a blank table 
    checkCookie()


    // WORKS -- used recreate a table from a previous session  
    function setTableAccordingToCookie(){
        let assignmentDelta = parseInt(getCookie('numOfAssignments')) - 5
        numberOfCurrentAssignments = parseInt(getCookie('numOfAssignments'))

        // first set the right amount of assignments
        if(numberOfCurrentAssignments > 5){
            for(let newAss=0; newAss<assignmentDelta; newAss++){
                addAssignment()
            }
        }

        //unsubmittedAssignments()
        //updateListeners()

        let tableBody = document.getElementsByTagName('tbody')[0]
        console.log(`tableBody = \n\n${ tableBody }`)
        let rowList = tableBody.getElementsByTagName('tr')
        console.log(`rowList = \n\n${ rowList }`)

        let cArr = document.cookie.split(';')
        let numberOfStudents = cArr.length - 1

        let studentDelta = numberOfStudents - 10
        if(numberOfStudents > 10){
            for(let i=0; i<studentDelta; i++){
                addStudent()
            }
        }

        for(let i=0; i<numberOfStudents; i++){
            console.log(`loop iteration ${i}`)

            console.log(`student[${i}]\n\n${getCookie(`student${i}`).split(':')}`)
            
            let student = getCookie(`student${i}`).split(':')
            console.log(`BEFORE rowList[i] = \n\n${ rowList[i] }`)

            rowList[i].getElementsByClassName('name-col')[0].textContent = student[0] // set student name
            rowList[i].getElementsByClassName('id-col')[0].textContent = student[1]   // set student id

            console.log(`PASSED ${student}`)

            for(let ass=0; ass<student.length-3; ass++){
                //let assignment = student[ass+2]
                rowList[i].getElementsByClassName('assignment-col')[ass].textContent = student[ass+2] // set assignments

            }
            let finalGrade = student[student.length-1] // final grade
            let cell = rowList[i].getElementsByClassName('assignment-col')[0] // arbitrary cell of the row
            rowList[i].getElementsByClassName('grade-col')[0].textContent = gradeTransition(student[student.length-1], cell)
        }

        unsubmittedAssignments()
        updateListeners()

    }

    // WORKS -- creates a cookie assosiated with the current table
    function setCookieAccordingToTable(){
        let tbody = document.getElementsByTagName('tbody')[0]
        let rowList = tbody.getElementsByTagName('tr')

        setCookie('numOfAssignments', numberOfCurrentAssignments, 90)

        for(let row=0; row<rowList.length; row++){
            let student = rowList[row]
            let studentName = student.getElementsByClassName('name-col')[0].textContent
            let studentID   = student.getElementsByClassName('id-col')[0].textContent

            let cookieValue = `${studentName}:${studentID}`

            for(let ass=0; ass<numberOfCurrentAssignments; ass++){
                let grade = student.getElementsByClassName('assignment-col')[ass].textContent
                cookieValue += `:${grade}`
            }
            let finalGrade = student.getElementsByClassName('grade-col')[0].textContent
            cookieValue += `:${finalGrade}`
            console.log('cookieValue:\n\n'+cookieValue)
            setCookie(`student${row}`, cookieValue, 90)
        }
    }

    // WORKS -- (WITH PERMISION) taken from https://www.w3schools.com/js/js_cookies.asp 
    function setCookie(cname, cvalue, exdays) {
        let d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
    
    // WORKS -- (WITH PERMISION) taken from https://www.w3schools.com/js/js_cookies.asp
    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for(let i = 0; i < ca.length; i++) {
            let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }   

    // WORKS -- (WITH PERMISION) taken from https://www.w3schools.com/js/js_cookies.asp
    function checkCookie() {
        let cookie = getCookie("numOfAssignments")
        if (cookie != '') {
            console.log('function checkCookie():\n-cookie found')
            // ask user if they want to continue previous table
            let ans = prompt("Continue from previous table (yes, no/cancel)?", "yes")
            if(ans === 'yes'){
                // TODO: SET numberOfAssignments correctly
                setTableAccordingToCookie()
            }else{
                console.log('function checkCookie():\n-deleted cookie\n-creating new cookies for blank table')
                deleteAllCookies()
                setCookieAccordingToTable()
            }
        } else {
            console.log('function checkCookie():\n-no cookie found\n-creating cookie')
            setCookieAccordingToTable()            
        }
    }

    // WORKS 
    function deleteAllCookies() {
        var c = document.cookie.split("; ");
        for (i in c) 
         document.cookie =/^[^=]+/.exec(c[i])[0]+"=;expires=Thu, 01 Jan 1970 00:00:00 GMT";    
    }

    // WORKS -- once we create new rows and columns we need to create listeners for them
    function updateListeners(){

        // WORKS -- set cookie to new state of table
        $('.assignment-col, .name-col, .id-col').on('keyup', function(){
            setTimeout(function(){
                setCookieAccordingToTable()
                console.log('\n\n'+document.cookie+'\n\n')
            }, 0.1)
        });

        // WORKS  -- this function is to support the continusly updating grade while an assignment of that row is being edited
        $('.assignment-col').on('keyup', function(){
            let avg = getRowAverage(this)
            this.parentElement.getElementsByClassName('grade-col')[0].textContent = gradeTransition(avg, this) // TODO: soon this will be gradeTransition(percentToGrade(avg)) or even better gradeTransition(avg)
        });

        // WORKS  -- this function is to support changing of the grade display 
        $('.grade-col').on('click', function(){
            toggleValue++
            $('.grade-col').each(function(){
                if(this.parentElement.parentElement.tagName !== 'THEAD'){
                    if(this.textContent !== '-'){
                        this.textContent = gradeTransition(this.textContent, this)
                    }
                }else{
                document.getElementsByClassName('grade-col-thead')[0].textContent = gradeTitle[toggleValue % 3]
                }
            })   
        });

        // WORKS 
        $('.assignment-col, .name-col, .id-col').on('focus', function(){
            if(this.textContent === '-'){
                this.textContent = ''
            }
        });

        // WORKS  -- add '-' to assignment cells if left empty
        $('.assignment-col').on('blur', function(){
            if(this.textContent === '' || isNaN(this.textContent)){
                this.textContent = "-"
                this.style.backgroundColor = 'yellow'
            }
        });

        // WORKS  -- add '-' to name/id cells if left empty
        $('.name-col, .id-col').on('blur', function(){
            if(this.textContent === ''){
                this.textContent = "-"
            }
        });


        // WORKS 
        $('.name-col, .id-col').on('blur', function(){
            $(this).attr('contentEditable', 'flase')
        });
    } // END OF updatelisteners()

    // WORKS -- turns background of unsubmitted assignments to yellow and returns the number of unsubmitted assignments
    function unsubmittedAssignments(){
        let unsubmittedAssignmentsCount = 0
        $('tr').each(function(){
            let assignmentCells = this.getElementsByClassName('assignment-col')
            if(assignmentCells.length > 0){
                for(let index=0; index<assignmentCells.length; index++){
                    if(assignmentCells[index].textContent === '-'){
                        unsubmittedAssignmentsCount++
                        assignmentCells[index].style.backgroundColor = 'yellow'
                    }else{
                        assignmentCells[index].style.backgroundColor = ''
                    }
                }
            }
        })
        document.getElementsByClassName('btn-col')[0].textContent = 'Add Assignment ' +  (numberOfCurrentAssignments + 1)
        document.getElementsByClassName('unsubmittedAssignments')[0].textContent = 'Unsubmitted Assignments: ' + unsubmittedAssignmentsCount
        return unsubmittedAssignmentsCount
    }

    // WORKS -- returns average of assignments of a single row specifyed by the 'cell' argument
    //          it also makes sure the valuse in each assignment cell is between 0 and 100 inclusive
    function getRowAverage(cell){
        let sum = 0
        let assinments = 0
        let grades = cell.parentElement.getElementsByClassName('assignment-col')
        for(let i=0; i<grades.length; i++){
            let numStr = grades[i].textContent
            if(!isNaN(numStr) && (parseInt(numStr)) >= 0 && (parseInt(numStr) <= 100)){
                sum += parseInt(numStr)
                assinments++
            }else{
                grades[i].textContent = '-'
                grades[i].blur()
            }
        }
        let mean = Math.round(sum/assinments)
        if(mean <= 60){
            cell.parentElement.getElementsByClassName('grade-col')[0].style.backgroundColor = 'red'
            cell.parentElement.getElementsByClassName('grade-col')[0].style.color = 'white'
        }else{
            cell.parentElement.getElementsByClassName('grade-col')[0].style.backgroundColor = ''
            cell.parentElement.getElementsByClassName('grade-col')[0].style.color = ''
        }
        if(!isNaN(mean)){
            return mean
        }
        return '-'     
    }

    // WORKS -- takes a grade display and returns the next grade to be display according to the toggleValue
    function gradeTransition(grade, cell){

         // turn a yellow '-' cell white and deprecate Unsubmitted Assignments we do 
         // this every time an assignment is edited
        unsubmittedAssignments()

         // 4.0 scale to percentage
         if(toggleValue % 3 === 0){
            return getRowAverage(cell)
        }
        // percentage to letter
        else if(toggleValue % 3 === 1){
            if(93 <= grade && grade <= 100){ return 'A' }
            if(90 <= grade && grade <= 92) { return 'A-'}
            if(87 <= grade && grade <= 89) { return 'B+'}
            if(83 <= grade && grade <= 86) { return 'B' }
            if(80 <= grade && grade <= 82) { return 'B-'}
            if(77 <= grade && grade <= 79) { return 'C+'}
            if(73 <= grade && grade <= 76) { return 'C' }
            if(70 <= grade && grade <= 72) { return 'C-'}
            if(67 <= grade && grade <= 69) { return 'D+'}
            if(63 <= grade && grade <= 66) { return 'D' }
            if(60 <= grade && grade <= 62) { return 'D-'}
            if(60 >= grade )               { return 'F' }
        }
        // letter to 4.0 scale
        else{
            if(grade === 'A')   { return '4.0' }
            if(grade === 'A-')  { return '3.7' }
            if(grade === 'B+')  { return '3.3' }
            if(grade === 'B')   { return '3.0' }
            if(grade === 'B-')  { return '2.7' }
            if(grade === 'C+')  { return '2.3' }
            if(grade === 'C')   { return '2.0' }
            if(grade === 'C-')  { return '1.7' }
            if(grade === 'D+')  { return '1.3' }
            if(grade === 'D')   { return '1.0' }
            if(grade === 'D-')  { return '0.7' }
            if(grade === 'F')   { return '0.0' }
        }
    }

    // WORKS -- does what it says on the tin
    function addAssignment(){
        let rowList = document.getElementsByTagName('tr')

        let numberOfCurrentAssignments = document.getElementsByTagName('tbody')[0].getElementsByTagName('tr')[0].getElementsByClassName('assignment-col').length
        numberOfCurrentAssignments = parseInt(numberOfCurrentAssignments)

        for(let row=0; row<rowList.length; row++){
            let assignmentCellsList = rowList[row].getElementsByClassName('assignment-col')
            // true for the first row
            
            if(assignmentCellsList.length === 0){
                rowList[row].insertCell(2+numberOfCurrentAssignments-1)
                rowList[row].getElementsByTagName('td')[2+numberOfCurrentAssignments-1].textContent = 'Assignment ' + numberOfCurrentAssignments
            }else{
                rowList[row].insertCell(2+numberOfCurrentAssignments-1)
                rowList[row].getElementsByTagName('td')[2+numberOfCurrentAssignments-1].classList.add('assignment-col')
                rowList[row].getElementsByTagName('td')[2+numberOfCurrentAssignments-1].setAttribute("contenteditable", true);
                rowList[row].getElementsByTagName('td')[2+numberOfCurrentAssignments-1].textContent = '-'
            }
        }
    }

    // WORKS -- does what it says on the tin
    function addStudent(){
        let html  = '<tr>'
        html      += '<td class="name-col" contenteditable="true">-</td>'
        html      += '<td class="id-col" contenteditable="true">-</td>'
        for(let i=0;i<numberOfCurrentAssignments; i++){ html += '<td class="assignment-col" contenteditable="true">-</td>' }
        html      += '<td class="grade-col">-</td>'
        html      += '</tr>'          
        $('table').find('tbody').append(html) 
    }

    function removeRow(){
        let numberOfRows = document.getElementsByTagName('tr').length
        document.getElementsByTagName("table")[0].deleteRow(numberOfRows-1);
        setCookieAccordingToTable()
    }

    function removeCol(){
        // remember to deprecate numberOfAssignments
        let rowList = document.getElementsByTagName('tr')

        // for(row in rowList){
        //     rowList[row].deleteCell(numberOfAssignments+1)
        // }

        for(let row=0; row<rowList.length; row++){
            let rowLength = rowList[row].getElementsByTagName('td').length
            rowList[row].deleteCell(rowLength-2)
        }

        numberOfCurrentAssignments--

        updateListeners()
        unsubmittedAssignments()

        setCookieAccordingToTable()
    }

    // WORKS -- adds a new row/student to the table and calls updateListeners() to set 
    //          listeners for required functionality
    $('.btn-row').on('click', function(){
        addedRowColList.push('r')
        addStudent()

        unsubmittedAssignments()
        updateListeners()
    });

    // WORKS -- adds a new assignment/col
    $('.btn-col').on('click', function(){
        addedRowColList.push('c')
        numberOfCurrentAssignments++  
        addAssignment()

        unsubmittedAssignments()
        updateListeners()        
    });

    // -- revert back to previous state using cookies
    $('.btn-revertBack').on('click', function(){

       if(addedRowColList.length > 0){
           let poped = addedRowColList.pop()
            if(poped === 'r'){
                removeRow()
            }else{
                removeCol()
            }

            unsubmittedAssignments()
            
            updateListeners()   

            setCookieAccordingToTable()
        }

    });

});