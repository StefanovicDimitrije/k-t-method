var table;
var counterP = 0; // Unique id number for each parameter
var counterA = 0; // Unique id number for each alternative

function start(){	// ## Generate the table var so that it is not written over and over in the script
	table = document.getElementById('tabela');
}

function addParam(){ // ## Adds a new parameter to the table

	var row = table.insertRow(table.rows.length - 1); // Insert the row above results row

	var colNo = table.rows[0].cells.length; //Determine the number of cells in a column

	let paramName = document.getElementById('paraInput').value; // Get the new param name
	
	for (let i = 0; i < colNo; i++){ // Fill each cell in the row

		let cell = row.insertCell(-1);

		if(i == 0){	// The first row is supposed to write the name of the parameter and a button to remove it
			cell.innerHTML = `${paramName} <button class="btn" onClick="deleteParam(${counterP})" id="${counterP}"><i class="ri-delete-bin-fill"></i></button>`;
		} else {
			cell.innerHTML = genNoInput();		//All the others have a number input for parameter weight and alternative parameter value
		}
		
	}

	counterP ++; // Each parameter has a uniqe number
	updateOptions(); // Updates the options on the dropdown menu for graph generation

}

function deleteParam(counterno){ // ## Removes the specified parameter based on its unique number in the table

	for (let i = 1; i < table.rows.length; i++){
		if (table.rows[i].cells[0].childNodes[1].id == counterno){
			table.deleteRow(i);
			break;
		}
	}

	updateOptions(); // Updates the options on the dropdown menu for graph generation
}

function addAlt(){
	
	let altName = document.getElementById('altInput').value;
	
	for (let i = 0; i <  table.rows.length; i++) {
		
		let cell = table.rows[i].insertCell(-1);
		
		if (i == 0){
			cell.innerHTML = `${altName} <button class="btn" onClick="deleteAlt(${counterA})" id="${counterA}"><i class="ri-delete-bin-fill"></i></button>`;
		} else if (i != table.rows.length-1){
			cell.innerHTML=genNoInput();
		}
	}

	counterA ++;
}

function deleteAlt(counterno){ // ## Removes the specified alternative based on its unique number in the table

	var j = 0;

	for (let i = 2; i < table.rows[0].cells.length; i++){ // Loop through the cell of the first row to find the column of the alternative
		if (table.rows[0].cells[i].childNodes[1].id == counterno){
			j=i;
			break; // If the specific column in which the alternative is, is found, the loop exits and the number j is saved
		}
	}

	for(let i =0;i<table.rows.length;i++){ // By the number j, each cell in that column of each row is removed
		table.rows[i].deleteCell(j);					 // By that, all the data about the alternative is removed
	}

}

function genNoInput(){

	return `<input type="number" max="10" min="0" value="5" class="numberInput"></input>`
}

function tableToMatrix(){ // ## Turns the table values for param weight and alternatives into a matrix

	var rows = table.rows.length;
	var cells = table.rows[0].cells.length;

	var mat = [];

	for(let i = 1; i < rows-1; i++){
		let arr = [];
		for(let j = 1; j < cells; j++){
			arr.push(table.rows[i].cells[j].childNodes[0].value);
		}
		mat.push(arr);
	}

	return mat;
}

function result(mat){ // ## Calculates the final values of all alts based on the points system and the param weight and the maximum result out of them
	
	let result = [];
	let max = -1;

	for (let j = 1; j < mat[0].length;j++){ // For each column (alternatives)
		let sum = 0;
		for (let i = 0; i < mat.length;i++){ // For each cell in column (value for params for each alt)
			let no = mat[i][0]*mat[i][j];	// The cell that the for loop got to times the weight of the param in question
			sum += no; // Increase the sum (final result) of the alt by the number for the param that we got to
		}

	  if (sum > max) { // Check if you need a new maximum number
			max = sum;
		}

		result.push(sum); // And finally push the sum for the alt (column we just went through) into the array
	}

	return {result,max} // Finally return the array of all the results plus the max value

}

function displayRes({result,max}){ // Displays the results calculated in the above function into the table on the app

	for (let i = 2; i < table.rows[0].cells.length;i++){ // For the length of the row (iterate through) but only after we've passed the 'parameter' and 'weight' cell
		let cell = table.rows[table.rows.length-1].cells[i]; // Define the cell in the the results row
		cell.innerHTML = result[i-2];	// Set the value (because the counter starts at 2, we reset it back)
		if (cell.innerHTML == max ) { // And if the value is the maximum, make it green
			cell.setAttribute("style","background-color:green");
		} else { // Else, if it is not, set it to be regular (this is in case the user presses the button several time and a new maximum result alt will be found, the old need to be no longer green)
			cell.setAttribute("style","");
		}
	}
}

function updateOptions(){ // This function updates the options that you choose for the generation of the graph for the sensibility of parameter weight

 	var group = document.getElementById("inputGroup");

 	var options = "";

	for (let i = 1; i < table.rows.length-1; i++){ // Generates the buttons on the dropdown menu
		options += `<li><button class="dropdown-item" onclick="graph3(senseParam(${i-1}))">${table.rows[i].cells[0].childNodes[0].data}</button></li>`
	}

	group.innerHTML = options;
}

function senseParam(row){

	var mat = tableToMatrix(); // Make a matrix of the table so that the weight of the param can easily be manipulated in the scope of the func

	var graphData = []; // Create an array that will contain the data acceptable for the graph function

	for(let i = 0; i < mat[0].length-1; i++){
		graphData.push({name:table.rows[0].cells[i+2].childNodes[0].data,points:[]}); // Enter an object for each alt with its name
	}

	for(let i =0; i < 11; i++){ // Generate result for the weight of the param from 0 to 10
		
		let matdeep = [...mat];

		matdeep[row][0]=i.toString();
		
		let result1 = result(matdeep).result;
		
		for(let j = 0; j < result1.length;j++){ // And then push the result for each alt in its object and the weight of the appropriate param that was chosen
			graphData[j].points.push([i,result1[j]]);
		}
	
	}
	console.log(graphData);
	return graphData;
}

// Graphs were made using JSCharting library, and the examples shown on their site

function graph1(){

	var ys = result(tableToMatrix()).result;
	var points1 = [];

	for (let i = 2; i < table.rows[0].cells.length;i++){
		points1.push({name:table.rows[0].cells[i].childNodes[0].data,y:ys[i-2]});
	}

  var chart = JSC.chart('chartDiv1', {
    debug: true,
    defaultSeries_type: 'columnSolid',
    title_label_text: 'Alternative values',
    yAxis: {
      defaultTick_enabled: true,
      scale_range_padding: 0.15,
    },
    legend_visible: false,
    toolbar_visible: false,
  	  series: [
         {
           name: 'Alternatives',
           color: '#E04728',
           points: points1
         },
      				],
  });

}

function graph2(){

	var points1 = [];

	for (let i = 1; i < table.rows.length-1;i++){

		points1.push({
			name:table.rows[i].cells[0].childNodes[0].data,
			y:parseInt(table.rows[i].cells[1].childNodes[0].value)
		});

	}

	var chart = JSC.chart('chartDiv2', {
    debug: true,
    legend: {
    position: 'inside left bottom',
    template: '{%percentOfTotal:n1}% %icon %name',
    		    },
    title_position: 'center',
    defaultSeries_type: 'pieDonut',
    defaultPoint_label_text: '<b>%name</b>',
    title_label_text: 'Parametri',    
      series: [
        {
          name: 'Parameter weight',
          points: points1,
        },
      				],
  });

}

function graph3(series1){

	document.getElementById('chartDiv3').innerHTML='';

	var chart = JSC.chart('chartDiv3', {
        debug: true,
        type: '',
        legend_visible: false,
        xAxis: {
          crosshair_enabled: true,
          scale: { type: '' },
        },
        yAxis: { orientation: 'left', formatString: '' },
        defaultSeries: {
          firstPoint_label_text: '<b>%seriesName</b>',
          defaultPoint_marker: {
            type: 'circle',
            size: 8,
            fill: 'white',
            outline: { width: 2, color: 'currentColor' },
          },
        },
        title_label_text: "",
        series: series1,
      });
}