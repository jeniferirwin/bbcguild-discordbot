function doGet(request){
  var params = request.parameter;
  
  if(params == null){ /* give the user a listb of all the parameters and their descriptions? 🤔 */
    return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.JSON);
  }

  let member = params.member;
  let memberDetails = getMemberDetails(member.toLowerCase());

  if (memberDetails){
    return ContentService.createTextOutput(JSON.stringify(memberDetails))
    .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({error: 'member not found'}))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

function getMemberDetails(member){
  let allUsers = getAllUsers();

  if (member === "all"){ // get a list of everyone
    return Object.values(allUsers);
  } else if (member in allUsers){
    return allUsers[member]
  }

  return [];
}

function getAllUsers() {
  var bleakRockSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Bleakrock");
  var blackBriarSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Blackbriar");

  let bleakRockValue = bleakRockSheet.getRange('!A6:T505').getValues();
  let blackBriarValue = blackBriarSheet.getRange('!A6:T505').getValues();

  let bleakRockLastUpdate = bleakRockSheet.getRange("M3").getValue();
  let blackBriarLastUpdate = blackBriarSheet.getRange("M3").getValue();

  let blackBriarWeeeklyCost = blackBriarSheet.getRange("T3").getValue();
  let bleakRockWeeklyCost = bleakRockSheet.getRange("T3").getValue();

  let blackSheetTitle = blackBriarSheet.getRange("M1").getValue();
  let bleakSheetTitle = bleakRockSheet.getRange("M1").getValue();

  let blackHeader1 = blackBriarSheet.getRange("O5").getValue();
  let blackHeader2 = blackBriarSheet.getRange("P5").getValue();
  let blackHeader3 = blackBriarSheet.getRange("Q5").getValue();
  let blackHeader4 = blackBriarSheet.getRange("R5").getValue();
  let blackHeader5 = blackBriarSheet.getRange("S5").getValue();

  let bleakHeader1 = bleakRockSheet.getRange("O5").getValue();
  let bleakHeader2 = bleakRockSheet.getRange("P5").getValue();
  let bleakHeader3 = bleakRockSheet.getRange("Q5").getValue();
  let bleakHeader4 = bleakRockSheet.getRange("R5").getValue();
  let bleakHeader5 = bleakRockSheet.getRange("S5").getValue();

  blackBriarValue.map((x) => { 
    x.splice(0, 0, ...[blackSheetTitle, blackBriarWeeeklyCost, new Date(blackBriarLastUpdate).getTime()/1000,
    blackHeader1, blackHeader2, blackHeader3, blackHeader4, blackHeader5])
  });

  bleakRockValue.map((x) => {
    x.splice(0, 0, ...[bleakSheetTitle, bleakRockWeeklyCost, new Date(bleakRockLastUpdate).getTime()/1000,
    bleakHeader1, bleakHeader2, bleakHeader3, bleakHeader4, bleakHeader5])
  });

  /* merge the lists */
  let allValues = bleakRockValue.concat(blackBriarValue);


  /* Map list to values with an object */
  var guildObj = {}

  allValues.map((x) => {
    let [ sheet_title, weekly_cost, timeupdated, header1, header2, header3, header4, header5, rank, member, monthly_share, sales_tax, purchase_tax, raffle_tix, bank_misc, auctions, total_gold ] = x

    if (member){ // empty row
      member = member.replace("@", "").toLowerCase();

      let entry = { sheet_title, weekly_cost, timeupdated, header1, header2, header3, header4, header5, rank, member, monthly_share, sales_tax, purchase_tax, raffle_tix, bank_misc, auctions, total_gold };

      if (member in guildObj) {
        guildObj[member].push(entry);
      } else {
        guildObj[member] = [entry];
      }

    }
  });
  
  return guildObj;
}
