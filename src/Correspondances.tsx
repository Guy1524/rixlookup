import csv from 'jquery-csv'

export interface Correspondance {
  st: string;
  ii: string;
  page: number;
}

const csvText: string = await (await fetch( "/indices.csv" )).text();

function readIndices() {
  const corArray: string[][] = csv.toArrays(csvText);

  const rows: Correspondance[] = [];
  
  corArray.forEach(row => {
    rows.push({"st": row[0], "ii":row[1], "page":parseInt(row[2])});
  });

  return rows;
}

let Correspondances: Correspondance[] = readIndices();

export default Correspondances