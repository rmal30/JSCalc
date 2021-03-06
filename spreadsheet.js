var reader = new XMLHttpRequest();
var rows = new Array(), cells = new Array();
var html_table;
var cell_id, ci;
var db, new_db, formula_db, full_db;
var num_col, num_row;
var letters = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var letters2 = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
var boxes = document.createElement("div");
var formula = new Array();
var file_data = new Array();
var drag_id="";
document.documentElement.appendChild(boxes);
boxes.id = "cells";
window.onload = function() { document.getElementById("filename").focus();}

function addrow(){
    for(var c = 0; c < num_col; c++){
        var box = document.createElement("div");
        box.id = 'cell' + (num_row*num_col+c).toString();
        box.value = "";
        boxes.appendChild(box);
    }
    num_row++;
}

function remrow(){num_row--;}
function addcol(){
    for(var r = num_row-1; r>=1; r--){  
        for(var c = num_col-1; c>=0; c--){
            document.getElementById('cell' + ((r*num_col)+c).toString()).id = "cell" + ((r*num_col)+r+c).toString()
        }
    }
        
    for(var r = 1; r <= num_row; r++){
        var box = document.createElement("div");
        box.id = 'cell' + ((r*num_col+1) -2 + r).toString();
        box.value = "";
        boxes.appendChild(box);
    }
    num_col++;  
}

function remcol(){
    for(var r = 1; r <= num_row; r++){ 
        document.getElementById('cell' + ((r*num_col)-1).toString()).id = "-1";
    }
    for(var r = 1; r<num_row; r++){     
        for(var c = 0; c<num_col-1; c++){
            document.getElementById('cell' + ((r*num_col)+c).toString()).id = "cell" + ((r*num_col)+c-r).toString();
        }
    }
    num_col--;
}

function change(){
    var diff_rows = parseInt(document.getElementById('numrows').value) - num_row;
    var diff_cols = parseInt(document.getElementById('numcols').value) - num_col;

    for(var r = 0; r<Math.abs(diff_rows); r++){ 
        if(diff_rows>0){
            addrow();
        }else{
            remrow();
        }
    }
    for(var c = 0; c<Math.abs(diff_cols); c++){ 
        if(diff_cols>0){
            addcol();
        }else{
            remcol();
        }
    }
    update();
}

function move(e){
    try{
        var activeElementId = document.activeElement.id;
        var activeCellId = parseInt(activeElementId.substring(4, activeElementId.length));
        var newId = activeCellId;
        switch (e.keyCode){
            case 13: update(); break;
            case 37: newId-=1; break;
            case 38: newId-=num_col; break;
            case 39: newId+=1; break;
            case 40: newId+=num_col; break;    
        }
        if(newId !== activeCellId){
            document.getElementById("cell" + newId).focus();
        }
    }catch(err){}
}

function openlocal(){
    var file = document.getElementById("localfile").files[0];
    var convert = new FileReader(file);
    html_table = "";
    cell_id=0;
    convert.onload = function(e) {
        create(file.name, e.target.result, "\n");
        console.log(cells);
        update();
    };   
    convert.readAsText(file)    
}


function recover(file){
    html_table = "";
    cell_id=0;
    var cookie = document.cookie + ";"
    index = cookie.search(file)
    db = cookie.substring(index+file.length+1, index+file.length+1 + cookie.substring(index+file.length+1, cookie.length).indexOf(";"))
    if(cookie!=";" && index!=-1){
        create(file, db, "#");
        update();
        document.cookie = file + "=; expires=" + "Thu, 18 Dec 2000 12:00:00 GMT";
    }
}

function open(file){
    reader.open('get', 'http://localhost:8000/' + file + "?" + Math.random(), true);
    reader.onreadystatechange = function(){
        if(reader.status==404){
            window.location.reload();
        }else{
            html_table = "";
            cell_id=0;
            console.log(reader.response); 
            create(file, reader.response, "\n");
            console.log(cells);
            update(); 
        }                      
    }                                       
    reader.send(null);
}

function create(file, db, split_char){
    rows = db.trim().split(split_char);
    num_row = rows.length;
    num_col = rows[0].split(",").length;
    draw();
    for(var i=0; i<num_row; i++){
        cells[i] = rows[i].split(",");
        html_table = html_table + "<tr>" + "\n";
        html_table = html_table + "<td><div style = \"resize:vertical; overflow:auto;\" id = row"+ i +"><b>" + (i+1).toString() + "</b></div></td>"
        for(var j=0; j<num_col; j++){ 
            html_table = html_table + "<td>" + "<textarea rows=\"1\" size = \"5\" style = \"border:0px;  width:60px;\" id = cell" + cell_id.toString() +">" + cells[i][j] + "</textarea>" + "</td>" + "\n";
            cell_id++;
        }
        html_table = html_table + "</tr>" + "\n" + "\n";
    }
    document.getElementById('name').innerHTML = "<b>" + file + "</b>";
    document.getElementById("table").innerHTML = html_table;
    document.getElementById("tools").style.display="block";
}

function download(file){
    update();
    console.log(full_db);
    console.log("Downloading file");
    var download = document.createElement('a');
    download.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(full_db));
    download.setAttribute('download', document.getElementById('filename').value + ".csv");
    download.click();
}

function draw(){
    html_table = ""
    cell_id = 0;
    html_table = html_table + "<tr>" + "\n";
    html_table = html_table + "<td></td>"
    for(var k=0; k<27; k++){
        for(var l=0; l<26; l++){
            if(num_col>k*26+l){
                html_table = html_table + "<td><div style = \"resize:horizontal; overflow:auto;\" id = col" +((k*27)+l).toString()+"><b>" + letters[k] + letters2[l] + "</b></div></td>"
            }
        }
    }
    html_table = html_table + "</tr>" + "\n" + "\n";
}

function evaluate(expression, id){
    formula[id] = expression.toString();
    console.log(formula[id]);
    expression = expression.substring(1,expression.length);
    for(var k=Math.floor(num_col/26)+ 1; k>=0; k--){
        for(var l=0; l<26; l++){
            for(var m=num_row; m>=0; m--){
                try{
                    expression = expression.split(letters[k] + letters2[l] + (m+1).toString()).join(document.getElementById('cell' + ((k*26)+l+(m*num_col)).toString()).value);
                    expression = expression.split((letters[k] + letters2[l] + (m+1).toString()).toLowerCase()).join(document.getElementById('cell' + ((k*26)+l+(m*num_col)).toString()).value);
                }catch(err){}
            }
        }
    } 
    console.log(expression.toString())
        try{
                eval(expression.toString())
                return eval(expression.toString());
        }catch(err){
                try{
                        if(eval("Math." + expression.toString().toLowerCase())!==undefined){
                                return eval("Math." + expression.toString().toLowerCase())
                        }else{return expression.toString();}
                }catch(err2){
                        return expression.toString();
                }
        }
}

function update(){
        draw();
        var cellStyle = "rows=\"1\" type = \"text\" style = \"border:0px; width:60px;\""; 
        var cellId;
        for(var i=0; i<num_row; i++){
            html_table = html_table + "<tr>" + "\n";
            html_table = html_table + "<td><div style = \"resize:vertical; overflow:auto;\" id = row"+ i +"><b>" + (i+1).toString() + "</b></div></td>"
            for(var j=0; j<num_col; j++){ 
                cellId = i*num_col+j;
                try{
                    if(document.getElementById("cell" + cellId).value[0]=="="){
                        html_table += "<td>" + "<textarea " + cellStyle + " id = cell" + cellId +">" + evaluate(document.getElementById("cell" + cellId).value, cellId) +"</textarea>" + "</td>" + "\n";
                    }else if(eval(document.getElementById("cell" + cellId).value)!==undefined){
                        html_table += "<td>" + "<textarea " + cellStyle + " id = cell" + cellId +">" + eval(document.getElementById("cell" + cellId).value, cellId) +"</textarea>" + "</td>" + "\n";
                    } else {
                        html_table += "<td>" + "<textarea " + cellStyle + " id = cell" + cellId +">" + document.getElementById("cell" + cellId).value +"</textarea>" + "</td>" + "\n";
                    }
                }catch(err){
                    html_table += "<td>" + "<textarea " + cellStyle + " id = cell" + cellId +">" + document.getElementById("cell" + cellId).value +"</textarea>" + "</td>" + "\n";
                }
                cell_id++;
            }
            html_table = html_table + "</tr>" + "\n" + "\n";
        }
        document.getElementById("table").innerHTML = html_table;
        document.getElementById("cells").innerHTML = "";
        document.getElementById("cellref").value = "";
        new_db="";
        formula_db="";
        full_db = "";
        for(ci=0; ci<cell_id; ci++){
                formula_db = formula_db + formula[ci] + ",";
                new_db = new_db + document.getElementById("cell" + ci.toString()).innerHTML.toString() + ",";
                if(typeof formula[ci] =="undefined"){full_db = full_db + document.getElementById("cell" + ci.toString()).innerHTML.toString() + ",";}
                else{full_db = full_db+formula[ci]+",";}
                
                if((ci+1)%num_col==0){
                        new_db = new_db.substring(0, new_db.length-1);
                        new_db = new_db + "\n";
                        formula_db =  formula_db.substring(0, formula_db.length-1);
                        formula_db = formula_db + "\n";
                        full_db =  full_db.substring(0, full_db.length-1);
                        full_db=full_db+"\n";
        }
        }
        
        document.cookie = document.getElementById('filename').value + ".csv"+ "=" + new_db.split('\n').join('#').substring(0, new_db.length-1) + "; " + "expires=Thu, 18 Dec 2020 12:00:00 GMT";
        for(ci=0; ci<cell_id; ci++){check(ci)}
        document.getElementById('numcols').value = num_col;
        document.getElementById('numrows').value = num_row;
        }
        
function check(ci){
    document.getElementById('cell' + ci.toString()).addEventListener('click', 
        function(){             
            try{
                document.getElementById("cellref").value = letters[Math.floor((ci%num_col)/27)] + letters2[(ci%num_col)%27] + (Math.floor(ci/num_col)+1).toString();
                if(formula[ci].toString()[0]=='='){
                    document.getElementById("cell" + ci).value = formula[ci];   
                }
            }catch(err){}
        }
    );
        
    document.getElementById('cell' + ci.toString()).addEventListener('mousemove', 
        function(){
            var cell;
            for(var c = 0; c<num_col; c++){
                cell = document.getElementById('cell' + ((Math.floor((ci)/num_col)*num_col) + c).toString());
                cell.style.height = document.getElementById('cell' + ci.toString()).style.height;
            }
            for(var r = 0; r<num_row; r++){
                cell = document.getElementById('cell' + (((ci)%num_col) + r*num_col).toString());
                cell.style.width = document.getElementById('cell' + ci.toString()).style.width;
            }
        });
                                
}

document.getElementById('cellref').addEventListener('change', function(){
    try{
        cellref = document.getElementById("cellref").value.toString();
        if(letters.indexOf(cellref[0].toUpperCase())==-1 || letters2.indexOf(cellref[1].toUpperCase())==-1){ throw "";}
            document.getElementById('cell' + (letters.indexOf(cellref[0].toUpperCase())*26 + letters2.indexOf(cellref[1].toUpperCase()) + (parseInt(cellref.substring(2,cellref.length))-1)*num_col).toString()).focus();
    }catch(err){ 
            document.getElementById('cell' + (letters2.indexOf(cellref[0].toUpperCase()) + ((parseInt(cellref.substring(1,cellref.length))-1)*num_col)).toString()).focus();
    }
});
        
document.getElementById('of').addEventListener('click', function(){open(document.getElementById('filename').value + ".csv")});
document.getElementById('rf').addEventListener('click', function(){recover(document.getElementById('filename').value + ".csv")});
document.getElementById('cf').addEventListener('click', function(){open("new.csv"); document.getElementById('filename').value = "new"; document.getElementById('name').value = "new.csv"});
document.getElementById('df').addEventListener('click', function(){download(document.getElementById('filename').value + ".csv")});
document.getElementById('uf').addEventListener('click', function(){openlocal(document.getElementById("local-file"))})
